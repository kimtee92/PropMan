import mongoose, { Schema, Document } from 'mongoose';

export interface IApprovalRequest extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'field' | 'document' | 'property';
  refId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  portfolioId: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete';
  submittedBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  originalData?: any;
  proposedData?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRequestSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['field', 'document', 'property'],
    required: true,
  },
  refId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true,
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  comments: {
    type: String,
    trim: true,
  },
  originalData: {
    type: Schema.Types.Mixed,
  },
  proposedData: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
ApprovalRequestSchema.index({ status: 1 });
ApprovalRequestSchema.index({ type: 1 });
ApprovalRequestSchema.index({ submittedBy: 1 });
ApprovalRequestSchema.index({ portfolioId: 1 });

export default mongoose.models.ApprovalRequest || mongoose.model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);