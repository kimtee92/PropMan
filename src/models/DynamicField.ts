import mongoose, { Schema, Document } from 'mongoose';

export interface IDynamicField extends Document {
  _id: mongoose.Types.ObjectId;
  portfolioId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  name: string;
  category: 'value' | 'revenue' | 'expense' | 'asset';
  type: 'number' | 'text' | 'currency' | 'date';
  frequency: 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'yearly';
  currency?: string;
  value: any;
  status: 'approved' | 'pending' | 'rejected';
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DynamicFieldSchema: Schema = new Schema({
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['value', 'revenue', 'expense', 'asset'],
    required: true,
  },
  type: {
    type: String,
    enum: ['number', 'text', 'currency', 'date'],
    required: true,
  },
  frequency: {
    type: String,
    enum: ['one-time', 'weekly', 'monthly', 'quarterly', 'annually', 'yearly'],
    default: 'one-time',
  },
  currency: {
    type: String,
    default: 'AUD',
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
DynamicFieldSchema.index({ portfolioId: 1 });
DynamicFieldSchema.index({ propertyId: 1 });
DynamicFieldSchema.index({ status: 1 });
DynamicFieldSchema.index({ category: 1 });

export default mongoose.models.DynamicField || mongoose.model<IDynamicField>('DynamicField', DynamicFieldSchema);