import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import Document from '@/models/Document';
import ApprovalRequest from '@/models/ApprovalRequest';
import { deleteFileFromUploadThing } from '@/lib/uploadthing-delete';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; propertyId: string; docId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get portfolio and document
    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const document = await Document.findById(params.docId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
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

    // If user is owner or admin, delete document directly
    if (isOwner || isAdmin) {
      // Delete file from UploadThing before deleting from database
      if (document.url) {
        await deleteFileFromUploadThing(document.url);
      }
      
      await Document.findByIdAndDelete(params.docId);
      return NextResponse.json({ message: 'Document deleted successfully' });
    }

    // If user is manager, create approval request
    const approvalRequest = await ApprovalRequest.create({
      type: 'document',
      refId: params.docId,
      propertyId: params.propertyId,
      portfolioId: params.id,
      action: 'delete',
      submittedBy: session.user.id,
      status: 'pending',
      originalData: {
        documentId: params.docId,
        documentName: document.name,
      },
    });

    return NextResponse.json(
      {
        message: 'Document deletion pending approval',
        approvalRequest,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
