import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, registrationCode } = body;

    if (!name || !email || !password || !registrationCode) {
      return NextResponse.json(
        { error: 'Name, email, password, and registration code are required' },
        { status: 400 }
      );
    }

    // Check registration code
    // Get environment variable - Next.js reads from .env.local at build/start time
    const envCode = process.env.REGISTRATION_CODE;
    const validRegistrationCode = envCode ? envCode.trim() : 'SKYWHOLE2024';
    const providedCode = (registrationCode || '').trim();
    
    // Debug logging to help troubleshoot
    console.log('=== Registration Code Check ===');
    console.log('Provided code:', providedCode);
    console.log('Expected code:', validRegistrationCode);
    console.log('Env var exists:', !!envCode);
    console.log('Env var value:', envCode || 'NOT SET (using default)');
    console.log('Match:', providedCode === validRegistrationCode);
    console.log('================================');
    
    if (providedCode !== validRegistrationCode) {
      return NextResponse.json(
        { error: 'Invalid registration code. Please contact your administrator.' },
        { status: 403 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (not verified yet)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
    });

    await user.save();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save verification OTP
    await OTP.create({
      email: email.toLowerCase(),
      code: otpCode,
      expiresAt,
      used: false,
    });

    // Send verification email
    await sendVerificationEmail(email, otpCode);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please check your email for verification code.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

