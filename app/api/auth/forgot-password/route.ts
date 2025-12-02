import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { sendOTPEmail } from '@/lib/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST - Send OTP to email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, an OTP code has been sent.',
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await OTP.create({
      email: email.toLowerCase(),
      code: otpCode,
      expiresAt,
      used: false,
    });

    // Send OTP email (will log to console in dev mode if email not configured)
    await sendOTPEmail(email, otpCode);

    return NextResponse.json({
      success: true,
      message: 'OTP code has been sent to your email.',
    });
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

