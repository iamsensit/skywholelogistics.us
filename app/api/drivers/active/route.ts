import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Driver from '@/models/Driver';
import { getSession } from '@/lib/getSession';
import mongoose from 'mongoose';

// PATCH - Update driver active status
export async function PATCH(request: NextRequest) {
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
    const { driverId, active } = data;

    if (!driverId || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Driver ID and active status are required' },
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

    driver.active = active;
    await driver.save();

    return NextResponse.json({
      success: true,
      message: `Driver ${active ? 'activated' : 'deactivated'} successfully`,
      driver: {
        id: driver._id.toString(),
        active: driver.active,
      },
    });
  } catch (error: any) {
    console.error('Error updating driver active status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update driver status' },
      { status: 500 }
    );
  }
}

// POST - Bulk update driver active status
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
    const { driverIds, active } = data;

    if (!Array.isArray(driverIds) || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Driver IDs array and active status are required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    // Update all drivers that belong to the user
    const result = await Driver.updateMany(
      {
        _id: { $in: driverIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
        userId: userId,
      },
      { $set: { active } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} driver(s) ${active ? 'activated' : 'deactivated'} successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error bulk updating driver active status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update driver status' },
      { status: 500 }
    );
  }
}


