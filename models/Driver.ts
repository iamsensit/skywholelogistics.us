import mongoose, { Schema, Document } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  mcNo: string;
  phone: string;
  truckType: string;
  dimensions?: {
    height?: string;
    long?: string;
    wide?: string;
    doorClearance?: string;
  };
  equipment: string[];
  haulType: string;
  setupCompanies: string[];
  specialEquipment: string[];
  rpm: string;
  zipCode: string;
  percentage: string;
  // Driver credentials
  cdlNumber?: string;
  cdlExpiration?: Date;
  cdlState?: string;
  licenseNumber?: string;
  licenseExpiration?: Date;
  licenseState?: string;
  // Insurance information
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiration?: Date;
  insuranceCoverage?: string;
  // Additional information
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  yearsOfExperience?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    mcNo: {
      type: String,
      required: [true, 'MC Number is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    truckType: {
      type: String,
      required: [true, 'Truck type is required'],
      trim: true,
    },
    dimensions: {
      height: { type: String, default: '' },
      long: { type: String, default: '' },
      wide: { type: String, default: '' },
      doorClearance: { type: String, default: '' },
    },
    equipment: {
      type: [String],
      default: [],
    },
    haulType: {
      type: String,
      required: [true, 'Haul type is required'],
      enum: ['Long Haul', 'Short Haul'],
    },
    setupCompanies: {
      type: [String],
      default: [],
    },
    specialEquipment: {
      type: [String],
      default: [],
    },
    rpm: {
      type: String,
      required: [true, 'RPM is required'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
    },
    percentage: {
      type: String,
      required: [true, 'Percentage is required'],
      trim: true,
    },
    // Driver credentials
    cdlNumber: { type: String, trim: true },
    cdlExpiration: { type: Date },
    cdlState: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    licenseExpiration: { type: Date },
    licenseState: { type: String, trim: true },
    // Insurance information
    insuranceProvider: { type: String, trim: true },
    insurancePolicyNumber: { type: String, trim: true },
    insuranceExpiration: { type: Date },
    insuranceCoverage: { type: String, trim: true },
    // Additional information
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    yearsOfExperience: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const Driver = mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);

export default Driver;

