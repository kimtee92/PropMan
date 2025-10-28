import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  entity: string;
  description?: string;
  owners: mongoose.Types.ObjectId[];
  managers: mongoose.Types.ObjectId[];
  viewers: mongoose.Types.ObjectId[];
  defaultFields: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Portfolio name is required'],
    trim: true,
  },
  entity: {
    type: String,
    required: [true, 'Entity is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owners: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  viewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  defaultFields: [{
    type: Schema.Types.ObjectId,
    ref: 'FieldTemplate',
  }],
}, {
  timestamps: true,
});

// Indexes
PortfolioSchema.index({ name: 1 });
PortfolioSchema.index({ entity: 1 });
PortfolioSchema.index({ owners: 1 });
PortfolioSchema.index({ managers: 1 });

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);