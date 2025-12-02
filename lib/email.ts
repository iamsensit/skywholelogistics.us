import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const createTransporter = () => {
  // For production, configure SMTP settings in .env.local
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Gmail (requires app password)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Development: Return null - OTP will be logged to console
  return null;
};

export async function sendEmail(email: string, subject: string, html: string, text: string) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('═══════════════════════════════════════');
      console.log('📧 EMAIL (Development Mode)');
      console.log('To:', email);
      console.log('Subject:', subject);
      console.log('Body:', text);
      console.log('═══════════════════════════════════════');
      return { success: true, messageId: 'dev-mode' };
    }
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@driverapp.com',
      to: email,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    if (process.env.NODE_ENV === 'development' && info.messageId) {
      try {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('Preview URL:', previewUrl);
        }
      } catch (e) {
        // Ignore
      }
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (process.env.NODE_ENV === 'development') {
      console.log('═══════════════════════════════════════');
      console.log('📧 EMAIL (Email failed, but here is the content)');
      console.log('To:', email);
      console.log('Subject:', subject);
      console.log('Body:', text);
      console.log('═══════════════════════════════════════');
      return { success: true, messageId: 'dev-mode-fallback' };
    }
    throw new Error('Failed to send email');
  }
}

export async function sendOTPEmail(email: string, otpCode: string) {
  const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #171717;">Password Recovery</h2>
    <p>You requested a password recovery code for your Driver App account.</p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h1 style="color: #171717; font-size: 32px; letter-spacing: 8px; margin: 0;">${otpCode}</h1>
    </div>
    <p style="color: #666;">This code will expire in 10 minutes.</p>
    <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
  </div>`;
  
  const textContent = `Your password recovery OTP code is: ${otpCode}. This code will expire in 10 minutes.`;
  
  return sendEmail(
    email,
    'Password Recovery OTP - Driver App',
    htmlContent,
    textContent
  );
}

export async function sendVerificationEmail(email: string, otpCode: string) {
  const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #171717;">Email Verification</h2>
    <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h1 style="color: #171717; font-size: 32px; letter-spacing: 8px; margin: 0;">${otpCode}</h1>
    </div>
    <p style="color: #666;">Enter this code on the verification page to verify your email.</p>
    <p style="color: #666;">This code will expire in 10 minutes.</p>
    <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
  </div>`;
  
  const textContent = `Your email verification code is: ${otpCode}. This code will expire in 10 minutes.`;
  
  return sendEmail(
    email,
    'Email Verification - Driver App',
    htmlContent,
    textContent
  );
}

