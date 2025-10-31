import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  _id: mongoose.Types.ObjectId;
  portfolioId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land' | 'mixed';
  status: 'active' | 'pending' | 'sold' | 'archived';
  imageUrl?: string;
  fields: mongoose.Types.ObjectId[];
  documents: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: [true, 'Portfolio ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'land', 'mixed'],
    default: 'residential',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'archived'],
    default: 'active',
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  fields: [{
    type: Schema.Types.ObjectId,
    ref: 'DynamicField',
  }],
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'Document',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
PropertySchema.index({ portfolioId: 1 });
PropertySchema.index({ name: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ createdBy: 1 });

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);