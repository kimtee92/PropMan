import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import Property from '@/models/Property';
import Document from '@/models/Document';
import ApprovalRequest from '@/models/ApprovalRequest';
import { createAuditLog } from '@/lib/server-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get portfolio
    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = portfolio.owner?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    const isManager = portfolio.managers?.some(
      (m: any) => m.toString() === session.user.id
    ) || false;
    const isViewer = portfolio.viewers?.some(
      (v: any) => v.toString() === session.user.id
    ) || false;

    if (!isOwner && !isAdmin && !isManager && !isViewer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get documents for this property
    const documents = await Document.find({ propertyId: params.propertyId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { name, description, fileUrl, fileType, fileSize } = await req.json();

    // Validate required fields
    if (!name || !fileUrl) {
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

    // Check permissions (viewers can't upload)
    const isOwner = portfolio.owner?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    const isManager = portfolio.managers?.some(
      (m: any) => m.toString() === session.user.id
    ) || false;

    if (!isOwner && !isAdmin && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine if direct creation or approval needed
    const needsApproval = isManager && !isOwner && !isAdmin;

    // Create document
    const document = await Document.create({
      propertyId: params.propertyId,
      name,
      description: description || '',
      url: fileUrl,
      fileType: fileType || 'application/octet-stream',
      fileSize: fileSize || 0,
      uploadedBy: session.user.id,
      status: needsApproval ? 'pending' : 'approved',
    });

    // If manager, create approval request
    if (needsApproval) {
      await ApprovalRequest.create({
        type: 'document',
        refId: document._id,
        propertyId: params.propertyId,
        portfolioId: params.id,
        action: 'create',
        submittedBy: session.user.id,
        status: 'pending',
        proposedData: document.toObject(),
      });

      await createAuditLog({
        userId: session.user.id,
        action: 'Requested document upload',
        targetType: 'document',
        targetId: document._id.toString(),
        changes: {
          after: { name, fileUrl },
        },
      });

      return NextResponse.json(
        {
          message: 'Document upload pending approval',
          document: await Document.findById(document._id).populate('uploadedBy', 'name email'),
        },
        { status: 202 }
      );
    }

    // Owner/Admin: Create audit log for direct creation
    await createAuditLog({
      userId: session.user.id,
      action: 'Uploaded document',
      targetType: 'document',
      targetId: document._id.toString(),
      changes: {
        after: { name, fileUrl },
      },
    });

    const populatedDoc = await Document.findById(document._id).populate(
      'uploadedBy',
      'name email'
    );

    return NextResponse.json({ document: populatedDoc }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
