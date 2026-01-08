// Shared types for the PropMan application

// User types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  portfolios?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserRef {
  _id: string;
  name: string;
  email: string;
}

// Portfolio types
export interface IPortfolio {
  _id: string;
  name: string;
  entity: string;
  description?: string;
  owners: IUserRef[];
  managers: IUserRef[];
  viewers: IUserRef[];
  defaultFields?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Property types
export interface IProperty {
  _id: string;
  portfolioId: string;
  name: string;
  address: string;
  propertyType?: string;
  status: 'active' | 'pending' | 'sold' | 'archived';
  imageUrl?: string;
  fields?: IDynamicField[];
  fieldsData?: IDynamicField[];
  documents?: IDocument[];
  createdBy?: IUserRef;
  updatedBy?: IUserRef;
  createdAt?: Date;
  updatedAt?: Date;
}

// Dynamic Field types
export interface IDynamicField {
  _id: string;
  portfolioId: string;
  propertyId: string;
  name: string;
  category: 'value' | 'revenue' | 'expense' | 'asset';
  type: 'number' | 'text' | 'currency' | 'date';
  frequency: 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'yearly';
  currency?: string;
  value: string | number;
  status: 'approved' | 'pending' | 'rejected';
  createdBy?: IUserRef;
  approvedBy?: IUserRef;
  approvalRequestId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Document types
export interface IDocument {
  _id: string;
  propertyId: string;
  portfolioId: string;
  name: string;
  description?: string;
  url: string;
  fileType: string;
  status: 'approved' | 'pending' | 'rejected';
  createdBy?: IUserRef;
  approvedBy?: IUserRef;
  createdAt?: Date;
  updatedAt?: Date;
}

// Note types
export interface INote {
  _id: string;
  propertyId: string;
  content: string;
  createdBy: IUserRef;
  createdAt?: Date;
  updatedAt?: Date;
}

// Approval Request types
export interface IApprovalRequest {
  _id: string;
  type: 'field' | 'document' | 'property';
  refId: string;
  propertyId: IProperty | { _id: string; name: string; address: string };
  portfolioId: IPortfolio | { _id: string; name: string; entity: string };
  action: 'create' | 'update' | 'delete';
  submittedBy: IUserRef;
  reviewedBy?: IUserRef;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  originalData?: Record<string, unknown>;
  proposedData?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Audit Log types
export interface IAuditLog {
  _id: string;
  userId: IUserRef;
  action: string;
  targetType: 'property' | 'field' | 'document' | 'portfolio' | 'user';
  targetId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// API Response types
export interface ApiError {
  error: string;
}

// Form data types
export interface PropertyFormData {
  name: string;
  address: string;
  propertyType: string;
  status: string;
}

export interface FieldFormData {
  fieldName: string;
  fieldType: 'value' | 'revenue' | 'expense' | 'asset';
  dataType: 'number' | 'text' | 'currency' | 'date';
  value: string;
  frequency: 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'yearly';
}

export interface DocumentFormData {
  name: string;
  description: string;
  file: File | null;
}

export interface PortfolioFormData {
  name: string;
  entity: string;
  description: string;
}
