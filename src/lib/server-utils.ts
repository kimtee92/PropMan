import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import connectDB from './db';
import AuditLog from '@/models/AuditLog';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden - Insufficient permissions');
  }
  return user;
}

export async function createAuditLog(data: {
  userId: string;
  action: string;
  targetType: 'property' | 'field' | 'document' | 'portfolio' | 'user';
  targetId: string;
  changes?: {
    before?: any;
    after?: any;
  };
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await connectDB();
    await AuditLog.create({
      ...data,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging shouldn't break main functionality
  }
}