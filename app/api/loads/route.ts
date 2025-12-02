import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Load from '@/models/Load';
import { getSession } from '@/lib/getSession';
import mongoose from 'mongoose';

// GET - Get all loads for the logged-in user
export async function GET() {
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
    
    const loads = await Load.find({ userId }).sort({ createdAt: -1 });
    
    const loadsData = loads.map(load => ({
      id: load._id.toString(),
      fromLocation: load.fromLocation,
      toLocation: load.toLocation,
      dimension: load.dimension,
      weight: load.weight,
      rate: load.rate,
      pickupTime: load.pickupTime,
      dropOffTime: load.dropOffTime,
      createdAt: load.createdAt,
      updatedAt: load.updatedAt,
    }));

    return NextResponse.json(loadsData);
  } catch (error: any) {
    console.error('Error fetching loads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch loads' },
      { status: 500 }
    );
  }
}

// POST - Create or update a load
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
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // If loadId is provided, update existing load
    if (data.loadId) {
      const load = await Load.findById(data.loadId);
      
      if (!load) {
        return NextResponse.json(
          { error: 'Load not found' },
          { status: 404 }
        );
      }

      // Verify ownership
      if (load.userId.toString() !== userId.toString()) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Update load
      Object.assign(load, {
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        dimension: data.dimension,
        weight: data.weight,
        rate: data.rate,
        pickupTime: new Date(data.pickupTime),
        dropOffTime: new Date(data.dropOffTime),
      });

      await load.save();

      return NextResponse.json({
        success: true,
        message: 'Load updated successfully',
        load: {
          id: load._id.toString(),
          ...load.toObject(),
        },
      });
    } else {
      // Create new load
      const load = new Load({
        userId,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        dimension: data.dimension,
        weight: data.weight,
        rate: data.rate,
        pickupTime: new Date(data.pickupTime),
        dropOffTime: new Date(data.dropOffTime),
      });

      await load.save();

      return NextResponse.json({
        success: true,
        message: 'Load created successfully',
        load: {
          id: load._id.toString(),
          ...load.toObject(),
        },
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error saving load:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save load' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a load
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const loadId = searchParams.get('id');

    if (!loadId) {
      return NextResponse.json(
        { error: 'Load ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    const load = await Load.findById(loadId);
    
    if (!load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (load.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await Load.findByIdAndDelete(loadId);

    return NextResponse.json({
      success: true,
      message: 'Load deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting load:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete load' },
      { status: 500 }
    );
  }
}

