import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth, createAuditLog } from '@/lib/server-utils';
import bcrypt from 'bcryptjs';

// PUT update user
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update users' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    await connectDB();

    const targetUser = await User.findById(params.userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const oldData = {
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
    };

    // Update fields
    if (name) targetUser.name = name;
    if (email) targetUser.email = email;
    if (role) targetUser.role = role;
    if (password) {
      targetUser.passwordHash = await bcrypt.hash(password, 10);
    }

    await targetUser.save();

    await createAuditLog({
      userId: user.id,
      action: 'Updated user',
      targetType: 'user',
      targetId: targetUser._id.toString(),
      changes: {
        before: oldData,
        after: {
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        },
      },
    });

    return NextResponse.json(
      {
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete users' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (user.id === params.userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    await connectDB();

    const targetUser = await User.findById(params.userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await createAuditLog({
      userId: user.id,
      action: 'Deleted user',
      targetType: 'user',
      targetId: targetUser._id.toString(),
      changes: {
        before: {
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        },
      },
    });

    await User.findByIdAndDelete(params.userId);

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
