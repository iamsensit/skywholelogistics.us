import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Driver from '@/models/Driver';
import { getSession } from '@/lib/getSession';
import mongoose from 'mongoose';

// GET - Get all drivers for the logged-in user
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
    
    const drivers = await Driver.find({ userId }).sort({ createdAt: -1 });
    
    const driversData = drivers.map(driver => {
      const driverObj = driver.toObject();
      return {
        id: driver._id.toString(),
        ...driverObj,
        active: Boolean(driver.active),
      };
    });

    return NextResponse.json(driversData);
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// POST - Create or update a driver
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

    // If driverId is provided, update existing driver
    if (data.driverId) {
      const driver = await Driver.findById(data.driverId);
      
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

      // Update driver
      Object.assign(driver, {
        name: data.name,
        mcNo: data.mcNo,
        phone: data.phone,
        truckType: data.truckType,
        dimensions: data.dimensions || {},
        equipment: data.equipment || [],
        haulType: data.haulType,
        setupCompanies: data.setupCompanies || [],
        specialEquipment: data.specialEquipment || [],
        rpm: data.rpm,
        zipCode: data.zipCode,
        percentage: data.percentage,
        cdlNumber: data.cdlNumber,
        cdlExpiration: data.cdlExpiration ? new Date(data.cdlExpiration) : undefined,
        cdlState: data.cdlState,
        licenseNumber: data.licenseNumber,
        licenseExpiration: data.licenseExpiration ? new Date(data.licenseExpiration) : undefined,
        licenseState: data.licenseState,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        insuranceExpiration: data.insuranceExpiration ? new Date(data.insuranceExpiration) : undefined,
        insuranceCoverage: data.insuranceCoverage,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        yearsOfExperience: data.yearsOfExperience,
        active: data.active !== undefined ? Boolean(data.active) : driver.active,
      });

      await driver.save();

      return NextResponse.json({
        success: true,
        message: 'Driver updated successfully',
        driver: {
          id: driver._id.toString(),
          ...driver.toObject(),
        },
      });
    } else {
      // Create new driver
      const driver = new Driver({
        userId,
        name: data.name,
        mcNo: data.mcNo,
        phone: data.phone,
        truckType: data.truckType,
        dimensions: data.dimensions || {},
        equipment: data.equipment || [],
        haulType: data.haulType,
        setupCompanies: data.setupCompanies || [],
        specialEquipment: data.specialEquipment || [],
        rpm: data.rpm,
        zipCode: data.zipCode,
        percentage: data.percentage,
        cdlNumber: data.cdlNumber,
        cdlExpiration: data.cdlExpiration ? new Date(data.cdlExpiration) : undefined,
        cdlState: data.cdlState,
        licenseNumber: data.licenseNumber,
        licenseExpiration: data.licenseExpiration ? new Date(data.licenseExpiration) : undefined,
        licenseState: data.licenseState,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        insuranceExpiration: data.insuranceExpiration ? new Date(data.insuranceExpiration) : undefined,
        insuranceCoverage: data.insuranceCoverage,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        yearsOfExperience: data.yearsOfExperience,
      });

      await driver.save();

      return NextResponse.json({
        success: true,
        message: 'Driver created successfully',
        driver: {
          id: driver._id.toString(),
          ...driver.toObject(),
        },
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error saving driver:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save driver' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a driver
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
    const driverId = searchParams.get('id');

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
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

    await Driver.findByIdAndDelete(driverId);

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting driver:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete driver' },
      { status: 500 }
    );
  }
}

