import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Property from '@/models/Property';
import Portfolio from '@/models/Portfolio';
import DynamicField from '@/models/DynamicField';
import ApprovalRequest from '@/models/ApprovalRequest';
import { requireAuth, createAuditLog } from '@/lib/server-utils';

// GET all properties for a portfolio
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

  // Build query to filter properties based on user role and status
  const propertyQuery: any = { portfolioId: params.id };

    // Non-admins should only see:
    // 1. Approved properties (everyone)
    // 2. Pending properties they created (managers only)
    if (user.role !== 'admin') {
      propertyQuery.$or = [
        { status: { $in: ['active', 'sold', 'archived'] } }, // All approved statuses
        { status: 'pending', createdBy: user.id }, // Their own pending properties
      ];
    }

    const properties = await Property.find(propertyQuery)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    // Populate fields and documents for each property
    const propertiesWithDetails = await Promise.all(
      properties.map(async (property: any) => {
        const fields = await DynamicField.find({
          propertyId: property._id,
          status: user.role === 'admin' ? { $in: ['approved', 'pending', 'rejected'] } : 'approved',
        });

        return {
          ...property.toObject(),
          fieldsData: fields,
        };
      })
    );

    return NextResponse.json({ properties: propertiesWithDetails }, { status: 200 });
  } catch (error: any) {
    console.error('Get properties error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST create new property
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check permissions - only admins and managers can create properties
    const isAdmin = user.role === 'admin';
    const isManager = portfolio.managers?.some((m: any) => m.toString() === user.id);
    const isOwner = portfolio.owners?.some((o: any) => o.toString() === user.id);

    if (!isAdmin && !isManager && !isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to create properties in this portfolio' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, status, propertyType } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }

    // Determine property status based on user role
    const isManagerOnly = isManager && !isAdmin && !isOwner;
    const propertyStatus = isManagerOnly ? 'pending' : (status || 'active');

    // Create property
    const property = await Property.create({
      portfolioId: params.id,
      name,
      address,
      propertyType: propertyType || 'residential',
      status: propertyStatus,
      fields: [],
      documents: [],
      createdBy: user.id,
      updatedBy: user.id,
    });

    // Create default fields (without initial values - let users add them)
    const defaultFields = [
      { name: 'Property Value', category: 'value', type: 'currency', frequency: 'one-time' },
      { name: 'Monthly Rent', category: 'revenue', type: 'currency', frequency: 'monthly' },
      { name: 'Utilities', category: 'expense', type: 'currency', frequency: 'monthly' },
      { name: 'Furniture Asset Value', category: 'asset', type: 'currency', frequency: 'one-time' },
    ];

    const fieldPromises = defaultFields.map((field) =>
      DynamicField.create({
        portfolioId: params.id,
        propertyId: property._id,
        name: field.name,
        category: field.category,
        type: field.type,
        frequency: field.frequency,
        currency: 'AUD',
        value: null, // No default value - users should enter actual values
        status: isManagerOnly ? 'pending' : 'approved',
        createdBy: user.id,
        approvedBy: isManagerOnly ? undefined : user.id,
      })
    );

    const createdFields = await Promise.all(fieldPromises);
    property.fields = createdFields.map((f: any) => f._id);
    await property.save();

    // If created by manager, create approval request
    if (isManagerOnly) {
      await ApprovalRequest.create({
        type: 'property',
        refId: property._id,
        propertyId: property._id,
        portfolioId: params.id,
        action: 'create',
        submittedBy: user.id,
        status: 'pending',
        proposedData: property.toObject(),
      });
    }

    await createAuditLog({
      userId: user.id,
      action: 'Created property',
      targetType: 'property',
      targetId: property._id.toString(),
      changes: {
        after: {
          name: property.name,
          address: property.address,
        },
      },
    });

    const populatedProperty = await Property.findById(property._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json(
      { property: populatedProperty },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}