import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  targetType: 'property' | 'field' | 'document' | 'portfolio' | 'user';
  targetId: mongoose.Types.ObjectId;
  changes: {
    before?: any;
    after?: any;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
  },
  targetType: {
    type: String,
    enum: ['property', 'field', 'document', 'portfolio', 'user'],
    required: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  changes: {
    before: {
      type: Schema.Types.Mixed,
    },
    after: {
      type: Schema.Types.Mixed,
    },
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: false, // We use custom timestamp field
});

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);