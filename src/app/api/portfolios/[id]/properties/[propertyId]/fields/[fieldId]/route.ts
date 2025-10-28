import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import Property from '@/models/Property';
import DynamicField from '@/models/DynamicField';
import ApprovalRequest from '@/models/ApprovalRequest';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; propertyId: string; fieldId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get portfolio and field
    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const field = await DynamicField.findById(params.fieldId);
    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
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

    // If user is owner or admin, delete field directly
    if (isOwner || isAdmin) {
      await DynamicField.findByIdAndDelete(params.fieldId);
      return NextResponse.json({ message: 'Field deleted successfully' });
    }

    // If user is manager, create approval request
    const approvalRequest = await ApprovalRequest.create({
      type: 'field',
      refId: params.fieldId,
      propertyId: params.propertyId,
      portfolioId: params.id,
      action: 'delete',
      submittedBy: session.user.id,
      status: 'pending',
      originalData: {
        fieldId: params.fieldId,
        fieldName: field.name,
      },
    });

    return NextResponse.json(
      {
        message: 'Field deletion pending approval',
        approvalRequest,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error deleting field:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
