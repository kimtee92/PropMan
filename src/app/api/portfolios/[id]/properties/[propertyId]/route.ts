import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Property from '@/models/Property';
import Portfolio from '@/models/Portfolio';
import DynamicField from '@/models/DynamicField';
import Document from '@/models/Document';
import ApprovalRequest from '@/models/ApprovalRequest';
import { requireAuth, createAuditLog } from '@/lib/server-utils';
import { deleteFileFromUploadThing, deleteFilesFromUploadThing } from '@/lib/uploadthing-delete';

// GET single property
export async function GET(
  request: Request,
  { params }: { params: { id: string; propertyId: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Check portfolio access first
    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this portfolio
    const hasAccess =
      user.role === 'admin' ||
      portfolio.owners.some((o: any) => o.toString() === user.id) ||
      portfolio.managers.some((m: any) => m.toString() === user.id) ||
      portfolio.viewers.some((v: any) => v.toString() === user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const property = await Property.findOne({
      _id: params.propertyId,
      portfolioId: params.id,
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Get all fields for this property
    const fields = await DynamicField.find({
      propertyId: params.propertyId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        property: {
          ...property.toObject(),
          fields,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PUT update property
export async function PUT(
  request: Request,
  { params }: { params: { id: string; propertyId: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Check portfolio access
    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwnerOrAdmin =
      user.role === 'admin' ||
      portfolio.owners.some((o: any) => o.toString() === user.id);
    
    const isManager = portfolio.managers.some((m: any) => m.toString() === user.id);

    if (!isOwnerOrAdmin && !isManager) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this property' },
        { status: 403 }
      );
    }

    const property = await Property.findOne({
      _id: params.propertyId,
      portfolioId: params.id,
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // If manager, create approval request instead of updating directly
    if (isManager && !isOwnerOrAdmin) {
      const existingRequest = await ApprovalRequest.findOne({
        type: 'property',
        refId: params.propertyId,
        action: 'update',
        status: 'pending',
      });

      if (existingRequest) {
        return NextResponse.json(
          { error: 'An approval request for this property is already pending' },
          { status: 400 }
        );
      }

      const approvalRequest = await ApprovalRequest.create({
        type: 'property',
        refId: params.propertyId,
        propertyId: params.propertyId,
        portfolioId: params.id,
        action: 'update',
        submittedBy: user.id,
        status: 'pending',
        originalData: property.toObject(),
        proposedData: body,
      });

      await createAuditLog({
        userId: user.id,
        action: 'Submitted property update for approval',
        targetType: 'property',
        targetId: property._id.toString(),
        changes: {
          before: property.toObject(),
          after: body,
        },
      });

      return NextResponse.json(
        { 
          message: 'Update request submitted for approval',
          approvalRequest 
        },
        { status: 202 }
      );
    }

    // Owner/Admin: Update directly
    const oldData = { ...property.toObject() };

    // If imageUrl is being updated and there's an old image, delete the old one from UploadThing
    if (body.imageUrl && property.imageUrl && body.imageUrl !== property.imageUrl) {
      await deleteFileFromUploadThing(property.imageUrl);
    }

    Object.assign(property, {
      ...body,
      updatedBy: user.id,
    });

    await property.save();

    await createAuditLog({
      userId: user.id,
      action: 'Updated property',
      targetType: 'property',
      targetId: property._id.toString(),
      changes: {
        before: oldData,
        after: property.toObject(),
      },
    });

    return NextResponse.json({ property }, { status: 200 });
  } catch (error: any) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE property
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; propertyId: string } }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Check portfolio access
    const portfolio = await Portfolio.findById(params.id);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwnerOrAdmin =
      user.role === 'admin' ||
      portfolio.owners.some((o: any) => o.toString() === user.id);
    
    const isManager = portfolio.managers.some((m: any) => m.toString() === user.id);

    if (!isOwnerOrAdmin && !isManager) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this property' },
        { status: 403 }
      );
    }

    const property = await Property.findOne({
      _id: params.propertyId,
      portfolioId: params.id,
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // If manager, create approval request instead of deleting directly
    if (isManager && !isOwnerOrAdmin) {
      const existingRequest = await ApprovalRequest.findOne({
        type: 'property',
        refId: params.propertyId,
        action: 'delete',
        status: 'pending',
      });

      if (existingRequest) {
        return NextResponse.json(
          { error: 'A delete request for this property is already pending approval' },
          { status: 400 }
        );
      }

      const approvalRequest = await ApprovalRequest.create({
        type: 'property',
        refId: params.propertyId,
        propertyId: params.propertyId,
        portfolioId: params.id,
        action: 'delete',
        submittedBy: user.id,
        status: 'pending',
        originalData: property.toObject(),
      });

      await createAuditLog({
        userId: user.id,
        action: 'Submitted property deletion for approval',
        targetType: 'property',
        targetId: property._id.toString(),
        changes: {
          before: property.toObject(),
        },
      });

      return NextResponse.json(
        { 
          message: 'Delete request submitted for approval',
          approvalRequest 
        },
        { status: 202 }
      );
    }

    // Owner/Admin: Delete directly
    // Delete related data and files from UploadThing
    
    // Get all documents to delete their files from UploadThing
    const documents = await Document.find({ propertyId: params.propertyId });
    const documentUrls = documents.map(doc => doc.url).filter(url => url);
    
    // Delete document files from UploadThing
    if (documentUrls.length > 0) {
      await deleteFilesFromUploadThing(documentUrls);
    }
    
    // Delete property image from UploadThing if it exists
    if (property.imageUrl) {
      await deleteFileFromUploadThing(property.imageUrl);
    }
    
    // Delete database records
    await DynamicField.deleteMany({ propertyId: params.propertyId });
    await Document.deleteMany({ propertyId: params.propertyId });

    await createAuditLog({
      userId: user.id,
      action: 'Deleted property',
      targetType: 'property',
      targetId: property._id.toString(),
      changes: {
        before: property.toObject(),
      },
    });

    await Property.findByIdAndDelete(params.propertyId);

    return NextResponse.json(
      { message: 'Property deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete property error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
}
