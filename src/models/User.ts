import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'viewer';
  portfolios: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'viewer'],
    default: 'viewer',
    required: true,
  },
  portfolios: [{
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
  }],
}, {
  timestamps: true,
});

// Indexes for faster queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);