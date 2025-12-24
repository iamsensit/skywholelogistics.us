import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';
import { getSession } from '@/lib/getSession';
import mongoose from 'mongoose';

// GET - Get all sent emails for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const hasReply = searchParams.get('hasReply');

    const query: any = { userId };
    if (driverId) {
      query.driverId = new mongoose.Types.ObjectId(driverId);
    }
    if (hasReply === 'true') {
      query.replyReceived = true;
    }

    const emails = await Email.find(query)
      .sort({ sentAt: -1 })
      .limit(100);

    const emailsData = emails.map(email => ({
      id: email._id.toString(),
      driverId: email.driverId.toString(),
      driverName: email.driverName,
      driverMcNo: email.driverMcNo,
      toEmail: email.toEmail,
      subject: email.subject,
      sentAt: email.sentAt,
      status: email.status,
      errorMessage: email.errorMessage,
      replyReceived: email.replyReceived || false,
      replyAt: email.replyAt,
      replyContent: email.replyContent,
      messageId: email.messageId,
      parentEmailId: email.parentEmailId ? email.parentEmailId.toString() : undefined,
      createdAt: email.createdAt,
    }));

    return NextResponse.json(emailsData);
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

