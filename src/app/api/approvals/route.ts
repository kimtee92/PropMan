import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ApprovalRequest from '@/models/ApprovalRequest';
import DynamicField from '@/models/DynamicField';
import Document from '@/models/Document';
import Property from '@/models/Property';
import { requireAuth, requireRole, createAuditLog } from '@/lib/server-utils';
import { deleteFileFromUploadThing } from '@/lib/uploadthing-delete';

// GET all pending approvals (admin only)
export async function GET(request: Request) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const approvals = await ApprovalRequest.find({ status })
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('propertyId', 'name address')
      .populate('portfolioId', 'name entity')
      .sort({ createdAt: -1 });

    return NextResponse.json({ approvals }, { status: 200 });
  } catch (error: any) {
    console.error('Get approvals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch approvals' },
      { status: error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

// POST approve or reject an approval request
export async function POST(request: Request) {
  try {
    const user = await requireRole(['admin']);
    await connectDB();

    const body = await request.json();
    const { approvalId, action, comments } = body;

    if (!approvalId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const approval = await ApprovalRequest.findById(approvalId);
    if (!approval) {
      return NextResponse.json(
        { error: 'Approval request not found' },
        { status: 404 }
      );
    }

    if (approval.status !== 'pending') {
      return NextResponse.json(
        { error: 'This approval has already been processed' },
        { status: 400 }
      );
    }

    // Update approval status
    approval.status = action === 'approve' ? 'approved' : 'rejected';
    approval.reviewedBy = user.id as any;
    approval.comments = comments;
    await approval.save();

    // If approved, apply the changes
    if (action === 'approve') {
      if (approval.type === 'field') {
        const field = await DynamicField.findById(approval.refId);
        if (field) {
          if (approval.action === 'create') {
            field.status = 'approved';
            field.approvedBy = user.id as any;
            await field.save();
          } else if (approval.action === 'update' && approval.proposedData) {
            Object.assign(field, approval.proposedData);
            field.status = 'approved';
            field.approvedBy = user.id as any;
            await field.save();
          } else if (approval.action === 'delete') {
            await DynamicField.findByIdAndDelete(approval.refId);
          }
        }
      } else if (approval.type === 'document') {
        const document = await Document.findById(approval.refId);
        if (document) {
          if (approval.action === 'create') {
            document.status = 'approved';
            document.approvedBy = user.id as any;
            await document.save();
          } else if (approval.action === 'delete') {
            // Delete file from UploadThing before deleting from database
            if (document.url) {
              await deleteFileFromUploadThing(document.url);
            }
            await Document.findByIdAndDelete(approval.refId);
          }
        }
      } else if (approval.type === 'property') {
        const property = await Property.findById(approval.refId);
        if (property && approval.action === 'update' && approval.proposedData) {
          Object.assign(property, approval.proposedData);
          property.updatedBy = user.id as any;
          await property.save();
        }
      }
    } else {
      // If rejected, mark as rejected or delete if it was a creation request
      if (approval.action === 'create') {
        if (approval.type === 'field') {
          await DynamicField.findByIdAndUpdate(approval.refId, { status: 'rejected' });
        } else if (approval.type === 'document') {
          // When rejecting a document creation, delete the uploaded file from UploadThing
          const document = await Document.findById(approval.refId);
          if (document && document.url) {
            await deleteFileFromUploadThing(document.url);
          }
          await Document.findByIdAndUpdate(approval.refId, { status: 'rejected' });
        }
      }
    }

    await createAuditLog({
      userId: user.id,
      action: `${action === 'approve' ? 'Approved' : 'Rejected'} ${approval.type} ${approval.action}`,
      targetType: approval.type as any,
      targetId: approval.refId.toString(),
      changes: {
        before: approval.originalData,
        after: approval.proposedData,
      },
    });

    const updatedApproval = await ApprovalRequest.findById(approvalId)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('propertyId', 'name address')
      .populate('portfolioId', 'name entity');

    return NextResponse.json(
      {
        message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        approval: updatedApproval,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Process approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process approval' },
      { status: 500 }
    );
  }
}