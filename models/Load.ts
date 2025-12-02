import mongoose, { Schema, Document } from 'mongoose';

export interface ILoad extends Document {
  userId: mongoose.Types.ObjectId;
  fromLocation: string;
  toLocation: string;
  dimension: string;
  weight: string;
  rate: string;
  pickupTime: Date;
  dropOffTime: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const LoadSchema = new Schema<ILoad>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    fromLocation: {
      type: String,
      required: [true, 'From location is required'],
      trim: true,
    },
    toLocation: {
      type: String,
      required: [true, 'To location is required'],
      trim: true,
    },
    dimension: {
      type: String,
      required: [true, 'Dimension is required'],
      trim: true,
    },
    weight: {
      type: String,
      required: [true, 'Weight is required'],
      trim: true,
    },
    rate: {
      type: String,
      required: [true, 'Rate is required'],
      trim: true,
    },
    pickupTime: {
      type: Date,
      required: [true, 'Pickup time is required'],
    },
    dropOffTime: {
      type: Date,
      required: [true, 'Drop off time is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Load = mongoose.models.Load || mongoose.model<ILoad>('Load', LoadSchema);

export default Load;

