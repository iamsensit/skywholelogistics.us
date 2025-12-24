import nodemailer from 'nodemailer';
import { saveToSentFolder } from './imap';

// Create transporter (configure with your email service)
const createTransporter = () => {
  // For production, configure SMTP settings in .env.local
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '465');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // SSL/TLS for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
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

export async function sendEmail(
  email: string, 
  subject: string, 
  html: string, 
  text: string,
  options?: {
    inReplyTo?: string;
    references?: string;
  }
) {
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
    
    const mailOptions: any = {
      from: process.env.FROM_EMAIL || 'noreply@driverapp.com',
      to: email,
      subject,
      html,
      text,
    };

    // Add threading headers for replies
    if (options?.inReplyTo) {
      mailOptions.inReplyTo = options.inReplyTo;
      mailOptions.references = options.references || options.inReplyTo;
    }

    const info = await transporter.sendMail(mailOptions);
    const messageId = info.messageId || `<${Date.now()}-${Math.random().toString(36).substring(7)}@skywholelogistics.us>`;
    console.log('Email sent via SMTP:', messageId);
    
    // Save to IMAP Sent folder (some mail servers don't auto-save)
    // We save manually to ensure emails appear in Sent folder
    try {
      // Construct RFC 2822 formatted email for IMAP
      // Format date with proper timezone offset (RFC 2822 format)
      // Use LOCAL time, not UTC, so it matches when the user actually sent it
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Get timezone offset in minutes and convert to +/-HHMM format
      // getTimezoneOffset returns offset in minutes (negative for ahead of UTC, positive for behind)
      const tzOffset = -now.getTimezoneOffset(); // Invert because we want the offset from UTC
      const tzHours = Math.floor(Math.abs(tzOffset) / 60);
      const tzMinutes = Math.abs(tzOffset) % 60;
      const tzSign = tzOffset >= 0 ? '+' : '-';
      const tzString = `${tzSign}${String(tzHours).padStart(2, '0')}${String(tzMinutes).padStart(2, '0')}`;
      
      // Use LOCAL date/time components
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // RFC 2822 format: "Wed, 24 Dec 2025 15:28:00 -0500" (with local timezone)
      const dateHeader = `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} ${tzString}`;
      
      // Encode subject if it contains non-ASCII characters
      let subjectHeader = mailOptions.subject;
      if (/[^\x00-\x7F]/.test(subjectHeader)) {
        // Contains non-ASCII, encode as UTF-8
        subjectHeader = `=?UTF-8?B?${Buffer.from(subjectHeader, 'utf8').toString('base64')}?=`;
      }
      
      let emailContent = `From: ${mailOptions.from}\r\n` +
        `To: ${mailOptions.to}\r\n` +
        `Subject: ${subjectHeader}\r\n` +
        `Date: ${dateHeader}\r\n` +
        `Message-ID: ${messageId}\r\n` +
        `X-Mailer: SkyWhole Logistics Driver App\r\n`;
      
      // Add threading headers for replies
      if (mailOptions.inReplyTo) {
        emailContent += `In-Reply-To: ${mailOptions.inReplyTo}\r\n`;
      }
      if (mailOptions.references) {
        emailContent += `References: ${mailOptions.references}\r\n`;
      }
      
      // Use base64 encoding for better compatibility
      const htmlBuffer = Buffer.from(mailOptions.html, 'utf8');
      const encodedHtml = htmlBuffer.toString('base64');
      const wrappedHtml = encodedHtml.match(/.{1,76}/g)?.join('\r\n') || encodedHtml;
      
      emailContent += `MIME-Version: 1.0\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n` +
        `Content-Transfer-Encoding: base64\r\n\r\n` +
        wrappedHtml;
      
      console.log('📧 Saving email to Sent folder via IMAP...');
      console.log(`Date header: ${dateHeader}`);
      console.log(`Message-ID: ${messageId}`);
      await saveToSentFolder(emailContent);
      console.log('✅ Email save process completed (check logs above for success/failure)');
    } catch (error: any) {
      console.error('❌ Error saving to Sent folder (non-critical):', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      // Don't throw - email was sent successfully, saving to sent folder is optional
      // But log it so we know if there's an issue
    }
    
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
    
    return { success: true, messageId: messageId };
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

export async function sendDriverEmail(
  email: string, 
  subject: string, 
  mcNo: string,
  options?: {
    inReplyTo?: string;
    references?: string;
  }
) {
  // Simple, clean email template matching the provided format
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Load Inquiry</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#ffffff; color:#000000;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:20px;">
        ${subject ? `
        <!-- Load Info (Big & Bold) -->
        <p style="font-size:22px; font-weight:bold; margin-bottom:15px;">
          ${subject}
        </p>
        ` : ''}
        <p>
          Good Morning!
        </p>
        <p>
          MC: <strong>${mcNo}</strong>
        </p>
        <p>
          <strong>Sky Whole Logistics</strong>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  
  const textContent = `${subject ? `${subject}\n\n` : ''}Good Morning!\n\nMC: ${mcNo}\n\nSky Whole Logistics`;
  
  // Use the load details as the email subject
  return sendEmail(
    email,
    subject || 'Load Inquiry',
    htmlContent,
    textContent,
    options || undefined
  );
}

