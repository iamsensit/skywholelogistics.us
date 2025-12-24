import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  userId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  driverName: string;
  driverMcNo: string;
  toEmail: string;
  subject: string;
  sentAt: Date;
  status: 'sent' | 'failed';
  errorMessage?: string;
  replyReceived?: boolean;
  replyAt?: Date;
  replyContent?: string;
  replyMessageId?: string; // Message-ID of the incoming reply (for threading)
  messageId?: string;
  parentEmailId?: mongoose.Types.ObjectId; // Reference to the email this is replying to
  createdAt?: Date;
  updatedAt?: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver ID is required'],
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverMcNo: {
      type: String,
      required: true,
      trim: true,
    },
    toEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    replyReceived: {
      type: Boolean,
      default: false,
    },
    replyAt: {
      type: Date,
    },
    replyContent: {
      type: String,
      trim: true,
    },
    replyMessageId: {
      type: String,
      trim: true,
    },
    messageId: {
      type: String,
      trim: true,
    },
    parentEmailId: {
      type: Schema.Types.ObjectId,
      ref: 'Email',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
EmailSchema.index({ userId: 1, sentAt: -1 });
EmailSchema.index({ driverId: 1 });
EmailSchema.index({ toEmail: 1 });

const Email = mongoose.models.Email || mongoose.model<IEmail>('Email', EmailSchema);

export default Email;

