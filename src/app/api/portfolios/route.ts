import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { requireAuth, createAuditLog } from '@/lib/server-utils';
import mongoose from 'mongoose';

// GET all portfolios for current user
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    await connectDB();

    let query: any = {};

    // Filter based on role
    if (user.role === 'admin') {
      // Admins see all portfolios
      query = {};
    } else if (user.role === 'manager') {
      // Managers see portfolios they manage
      query = {
        $or: [
          { managers: new mongoose.Types.ObjectId(user.id) },
          { owners: new mongoose.Types.ObjectId(user.id) },
        ],
      };
    } else {
      // Viewers see portfolios they have access to
      query = {
        $or: [
          { viewers: new mongoose.Types.ObjectId(user.id) },
          { managers: new mongoose.Types.ObjectId(user.id) },
          { owners: new mongoose.Types.ObjectId(user.id) },
        ],
      };
    }

    const portfolios = await Portfolio.find(query)
      .populate('owners', 'name email')
      .populate('managers', 'name email')
      .populate('viewers', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ portfolios }, { status: 200 });
  } catch (error: any) {
    console.error('Get portfolios error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch portfolios' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST create new portfolio (admin only)
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create portfolios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, entity, description, owners, managers, viewers } = body;

    if (!name || !entity) {
      return NextResponse.json(
        { error: 'Name and entity are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const portfolio = await Portfolio.create({
      name,
      entity,
      description,
      owners: [user.id, ...(owners || [])],
      managers: managers || [],
      viewers: viewers || [],
      defaultFields: [],
    });

    await createAuditLog({
      userId: user.id,
      action: 'Created portfolio',
      targetType: 'portfolio',
      targetId: portfolio._id.toString(),
      changes: {
        after: {
          name: portfolio.name,
          entity: portfolio.entity,
        },
      },
    });

    const populatedPortfolio = await Portfolio.findById(portfolio._id)
      .populate('owners', 'name email')
      .populate('managers', 'name email')
      .populate('viewers', 'name email');

    return NextResponse.json(
      { portfolio: populatedPortfolio },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create portfolio error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portfolio' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}