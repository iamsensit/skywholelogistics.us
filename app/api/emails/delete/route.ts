import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';
import { getSession } from '@/lib/getSession';
import mongoose from 'mongoose';

// DELETE - Delete all emails for a specific driver
export async function DELETE(request: NextRequest) {
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

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    // Delete all emails for this driver and user
    const result = await Email.deleteMany({
      userId,
      driverId: new mongoose.Types.ObjectId(driverId),
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} email(s) for this driver`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error deleting emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete emails' },
      { status: 500 }
    );
  }
}

