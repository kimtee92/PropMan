import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth, createAuditLog } from '@/lib/server-utils';
import bcrypt from 'bcryptjs';

// GET all users (for admin/owners to assign roles)
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Only admin can see all users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const users = await User.find({}, 'name email role createdAt')
      .sort({ name: 1 });

    // For each user, find which portfolios they have access to
    const Portfolio = (await import('@/models/Portfolio')).default;
    const usersWithPortfolios = await Promise.all(
      users.map(async (user) => {
        const portfolios = await Portfolio.find({
          $or: [
            { owners: user._id },
            { managers: user._id },
            { viewers: user._id },
          ],
        }, 'name');
        
        return {
          ...user.toObject(),
          portfolios: portfolios.map(p => ({ _id: p._id, name: p.name })),
        };
      })
    );

    return NextResponse.json({ users: usersWithPortfolios }, { status: 200 });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST create new user (admin only)
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'viewer',
    });

    await createAuditLog({
      userId: user.id,
      action: 'Created user',
      targetType: 'user',
      targetId: newUser._id.toString(),
      changes: {
        after: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });

    return NextResponse.json(
      {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}