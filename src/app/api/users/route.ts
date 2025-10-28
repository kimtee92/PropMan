import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/server-utils';

// GET all users (for admin/owners to assign roles)
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Only admin and managers can see user list
    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const users = await User.find({}, 'name email role')
      .sort({ name: 1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
