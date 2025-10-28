import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import Property from '@/models/Property';
import DynamicField from '@/models/DynamicField';
import ApprovalRequest from '@/models/ApprovalRequest';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { fieldName, fieldType, dataType, value, frequency, description } = await req.json();

    // Validate required fields
    if (!fieldName || !fieldType || !dataType || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get portfolio and property
    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const property = await Property.findById(params.propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = portfolio.owner?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    const isManager = portfolio.managers?.some(
      (m: any) => m.toString() === session.user.id
    ) || false;

    if (!isOwner && !isAdmin && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create the field data
    const fieldData = {
      portfolioId: params.id,
      propertyId: params.propertyId,
      name: fieldName,
      category: fieldType,
      type: dataType,
      value,
      frequency: frequency || 'one-time',
      createdBy: session.user.id,
      status: (isOwner || isAdmin) ? 'approved' : 'pending',
    };

    // If user is owner or admin, create field directly
    if (isOwner || isAdmin) {
      const field = await DynamicField.create(fieldData);
      
      // Create audit log
      await createAuditLog({
        userId: session.user.id,
        action: 'Created field',
        targetType: 'field',
        targetId: field._id.toString(),
        changes: {
          after: fieldData,
        },
      });
      
      return NextResponse.json({ field }, { status: 201 });
    }

    // If user is manager, create field with pending status and approval request
    const field = await DynamicField.create(fieldData);
    
    // Create audit log for field creation request
    await createAuditLog({
      userId: session.user.id,
      action: 'Requested field creation',
      targetType: 'field',
      targetId: field._id.toString(),
      changes: {
        after: fieldData,
      },
    });
    
    const approvalRequest = await ApprovalRequest.create({
      type: 'field',
      refId: field._id,
      propertyId: params.propertyId,
      portfolioId: params.id,
      action: 'create',
      submittedBy: session.user.id,
      status: 'pending',
      proposedData: fieldData,
    });

    return NextResponse.json(
      {
        message: 'Field addition pending approval',
        approvalRequest,
        field,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error adding field:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
