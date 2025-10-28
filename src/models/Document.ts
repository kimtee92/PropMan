import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  url: string;
  fileType: string;
  fileSize?: number;
  uploadedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Document URL is required'],
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Indexes
DocumentSchema.index({ propertyId: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ uploadedBy: 1 });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);