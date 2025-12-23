import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Driver from '@/models/Driver';
import { getSession } from '@/lib/getSession';
import { sendDriverEmail } from '@/lib/email';
import mongoose from 'mongoose';

// POST - Send email to driver(s)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();
    const { driverId, email, subject } = data;

    if (!driverId || !email || !subject) {
      return NextResponse.json(
        { error: 'Driver ID, email, and subject are required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (driver.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Send email with MC number
    await sendDriverEmail(email, subject, driver.mcNo);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}


