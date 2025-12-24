import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Driver from '@/models/Driver';
import Email from '@/models/Email';
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
    try {
      const result = await sendDriverEmail(email, subject, driver.mcNo);

      // Save email record to database
      const emailRecord = new Email({
        userId,
        driverId: driver._id,
        driverName: driver.name,
        driverMcNo: driver.mcNo,
        toEmail: email,
        subject: subject,
        sentAt: new Date(),
        status: 'sent',
        messageId: result?.messageId || undefined,
      });
      await emailRecord.save();

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        emailId: emailRecord._id.toString(),
      });
    } catch (error: any) {
      // Save failed email record
      const emailRecord = new Email({
        userId,
        driverId: driver._id,
        driverName: driver.name,
        driverMcNo: driver.mcNo,
        toEmail: email,
        subject: subject,
        sentAt: new Date(),
        status: 'failed',
        errorMessage: error.message || 'Failed to send email',
      });
      await emailRecord.save();

      throw error;
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}


