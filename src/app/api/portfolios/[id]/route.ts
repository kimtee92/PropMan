import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import Property from '@/models/Property';
import { requireAuth, createAuditLog } from '@/lib/server-utils';
import mongoose from 'mongoose';

// GET single portfolio
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const portfolio = await Portfolio.findById(params.id)
      .populate('owners', 'name email')
      .populate('managers', 'name email')
      .populate('viewers', 'name email');

    if (!portfolio || portfolio.isDeleted) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check access
    const hasAccess =
      user.role === 'admin' ||
      portfolio.owners.some((o: any) => o._id.toString() === user.id) ||
      portfolio.managers.some((m: any) => m._id.toString() === user.id) ||
      portfolio.viewers.some((v: any) => v._id.toString() === user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ portfolio }, { status: 200 });
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

// PUT update portfolio (admin or owner)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    await connectDB();

    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio || portfolio.isDeleted) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or owner
    const isOwner = portfolio.owners.some((o: any) => o.toString() === user.id);
    if (user.role !== 'admin' && !isOwner) {
      return NextResponse.json(
        { error: 'Only admins or portfolio owners can update portfolios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const oldData = { ...portfolio.toObject() };

    // Convert user IDs to ObjectIds if present
    if (body.owners) {
      body.owners = body.owners.map((id: string) => new mongoose.Types.ObjectId(id));
    }
    if (body.managers) {
      body.managers = body.managers.map((id: string) => new mongoose.Types.ObjectId(id));
    }
    if (body.viewers) {
      body.viewers = body.viewers.map((id: string) => new mongoose.Types.ObjectId(id));
    }

    Object.assign(portfolio, body);
    await portfolio.save();

    await createAuditLog({
      userId: user.id,
      action: 'Updated portfolio',
      targetType: 'portfolio',
      targetId: portfolio._id.toString(),
      changes: {
        before: oldData,
        after: portfolio.toObject(),
      },
    });

    const updatedPortfolio = await Portfolio.findById(portfolio._id)
      .populate('owners', 'name email')
      .populate('managers', 'name email')
      .populate('viewers', 'name email');

    return NextResponse.json({ portfolio: updatedPortfolio }, { status: 200 });
  } catch (error: any) {
    console.error('Update portfolio error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

// DELETE portfolio (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete portfolios' },
        { status: 403 }
      );
    }

    await connectDB();

    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    if (portfolio.isDeleted) {
      return NextResponse.json(
        { error: 'Portfolio is already deleted' },
        { status: 400 }
      );
    }

    // Soft delete the portfolio
    portfolio.isDeleted = true;
    portfolio.deletedAt = new Date();
    portfolio.deletedBy = new mongoose.Types.ObjectId(user.id);
    await portfolio.save();

    await createAuditLog({
      userId: user.id,
      action: 'Deleted portfolio',
      targetType: 'portfolio',
      targetId: portfolio._id.toString(),
      changes: {
        before: { isDeleted: false },
        after: { isDeleted: true, deletedAt: portfolio.deletedAt },
      },
    });

    return NextResponse.json(
      { message: 'Portfolio deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete portfolio error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}