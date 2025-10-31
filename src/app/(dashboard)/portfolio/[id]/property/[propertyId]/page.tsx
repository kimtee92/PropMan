'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, FileText, DollarSign, TrendingUp, Upload, Trash2, Plus, X, ImageIcon, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useUploadThing } from '@/lib/uploadthing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { startUpload } = useUploadThing('propertyDocument', {
    skipPolling: true,
  });
  const { startUpload: startImageUpload } = useUploadThing('propertyImage', {
    skipPolling: true,
  });
  const [property, setProperty] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [fieldFormData, setFieldFormData] = useState({
    fieldName: '',
    fieldType: 'value' as 'value' | 'revenue' | 'expense' | 'asset',
    dataType: 'currency' as 'number' | 'text' | 'currency' | 'date',
    value: '',
    frequency: 'one-time' as 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'yearly',
  });
  const [documentFormData, setDocumentFormData] = useState({
    name: '',
    description: '',
    file: null as File | null,
  });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    propertyType: 'residential',
    status: 'active',
  });

  useEffect(() => {
    if (params.id && params.propertyId) {
      fetchProperty();
      fetchDocuments();
      fetchNotes();
    }
  }, [params.id, params.propertyId]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setProperty(data.property);
        setFields(data.property.fields || []);
        setFormData({
          name: data.property.name,
          address: data.property.address,
          propertyType: data.property.propertyType,
          status: data.property.status,
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok || res.status === 202) {
        setEditOpen(false);
        
        if (res.status === 202) {
          alert('Your update request has been submitted for approval by the portfolio owner.');
        } else {
          alert('Property updated successfully!');
          fetchProperty();
        }
      } else {
        alert(data.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('An error occurred while updating the property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok || res.status === 202) {
        if (res.status === 202) {
          setDeleteOpen(false);
          alert('Your delete request has been submitted for approval by the portfolio owner.');
        } else {
          alert('Property deleted successfully!');
          router.push(`/portfolio/${params.id}`);
        }
      } else {
        alert(data.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('An error occurred while deleting the property');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldFormData),
      });

      const data = await res.json();

      if (res.ok || res.status === 202) {
        setFieldDialogOpen(false);
        setFieldFormData({
          fieldName: '',
          fieldType: 'value',
          dataType: 'currency',
          value: '',
          frequency: 'one-time',
        });

        if (res.status === 202) {
          alert('Your field addition has been submitted for approval.');
        } else {
          alert('Field added successfully!');
          fetchProperty();
        }
      } else {
        alert(data.error || 'Failed to add field');
      }
    } catch (error) {
      console.error('Error adding field:', error);
      alert('An error occurred while adding the field');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFormData.file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    try {
      // First, upload the file to UploadThing with folder structure
      const uploadResult = await startUpload([documentFormData.file], {
        portfolioId: params.id as string,
        propertyId: params.propertyId as string,
      });
      
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('File upload failed');
      }

      const uploadedFile = uploadResult[0];

      // Then save the document metadata to the database
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: documentFormData.name,
          description: documentFormData.description,
          fileUrl: uploadedFile.url,
          fileType: documentFormData.file.type,
          fileSize: documentFormData.file.size,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDocumentDialogOpen(false);
        setDocumentFormData({
          name: '',
          description: '',
          file: null,
        });
        alert('Document uploaded successfully!');
        fetchDocuments();
      } else {
        alert(data.error || 'Failed to save document metadata');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('An error occurred while uploading the document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/fields/${fieldId}`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 202) {
        if (res.status === 202) {
          alert('Your field deletion request has been submitted for approval.');
        } else {
          alert('Field deleted successfully!');
          fetchProperty();
        }
      }
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Document deleted successfully!');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) {
      alert('Please enter a note');
      return;
    }

    setSavingNote(true);

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewNoteContent('');
        fetchNotes();
      } else {
        alert(data.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('An error occurred while adding the note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchNotes();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please select an image');
      return;
    }

    setUploadingImage(true);

    try {
      // Upload image to UploadThing with folder structure
      console.log('Uploading image with params:', {
        portfolioId: params.id,
        propertyId: params.propertyId,
      });
      
      const uploadResult = await startImageUpload(
        [selectedImage], 
        {
          portfolioId: params.id as string,
          propertyId: params.propertyId as string,
        }
      );
      
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('Image upload failed');
      }

      const uploadedImage = uploadResult[0];

      // Update property with image URL
      const res = await fetch(`/api/portfolios/${params.id}/properties/${params.propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedImage.url,
        }),
      });

      if (res.ok) {
        setImageDialogOpen(false);
        setSelectedImage(null);
        alert('Property image updated successfully!');
        fetchProperty();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update property image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('An error occurred while uploading the image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  const canManage = session?.user?.role === 'admin' || session?.user?.role === 'manager';

  // Group fields by type
  const fieldsByType = {
    value: fields.filter((f) => f.category === 'value'),
    revenue: fields.filter((f) => f.category === 'revenue'),
    expense: fields.filter((f) => f.category === 'expense'),
    asset: fields.filter((f) => f.category === 'asset'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Image Banner */}
      {property.imageUrl && (
        <div className="relative h-64 w-full rounded-lg overflow-hidden">
          <Image
            src={property.imageUrl}
            alt={property.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {canManage && (
            <div className="absolute top-4 right-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setImageDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Image
              </Button>
            </div>
          )}
        </div>
      )}
      {!property.imageUrl && canManage && (
        <div className="relative h-64 w-full rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-dashed border-blue-300">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setImageDialogOpen(true)}
          >
            <ImageIcon className="h-5 w-5 mr-2" />
            Upload Property Image
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href={`/portfolio/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{property.address}</p>
          <p className="text-sm text-gray-500 mt-1">
            Type: <span className="font-medium capitalize">{property.propertyType || 'Not specified'}</span>
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Financial Fields by Type */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Values */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Property Values
              </CardTitle>
              {canManage && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setFieldFormData({ ...fieldFormData, fieldType: 'value' });
                    setFieldDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {fieldsByType.value.length === 0 ? (
              <p className="text-sm text-gray-500">No values recorded</p>
            ) : (
              <div className="space-y-3">
                {fieldsByType.value.map((field: any) => (
                  <div key={field._id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{field.name}</p>
                        <p className="text-sm text-gray-500 capitalize mt-1">{field.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${field.value?.toLocaleString() || 0}</p>
                        <p className={`text-xs capitalize ${getApprovalStatusColor(field.status)}`}>
                          {field.status}
                        </p>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mt-1"
                            onClick={() => handleDeleteField(field._id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Assets
              </CardTitle>
              {canManage && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setFieldFormData({ ...fieldFormData, fieldType: 'asset' });
                    setFieldDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {fieldsByType.asset.length === 0 ? (
              <p className="text-sm text-gray-500">No assets recorded</p>
            ) : (
              <div className="space-y-3">
                {fieldsByType.asset.map((field: any) => (
                  <div key={field._id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{field.name}</p>
                        <p className="text-sm text-gray-500 capitalize mt-1">{field.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${field.value?.toLocaleString() || 0}</p>
                        <p className={`text-xs capitalize ${getApprovalStatusColor(field.status)}`}>
                          {field.status}
                        </p>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mt-1"
                            onClick={() => handleDeleteField(field._id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Expenses */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Streams */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Revenue
              </CardTitle>
              {canManage && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setFieldFormData({ ...fieldFormData, fieldType: 'revenue' });
                    setFieldDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {fieldsByType.revenue.length === 0 ? (
              <p className="text-sm text-gray-500">No revenue recorded</p>
            ) : (
              <div className="space-y-3">
                {fieldsByType.revenue.map((field: any) => (
                  <div key={field._id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{field.name}</p>
                        <p className="text-sm text-gray-500 capitalize mt-1">{field.frequency}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(field.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${field.value?.toLocaleString() || 0}</p>
                        <p className={`text-xs capitalize ${getApprovalStatusColor(field.status)}`}>
                          {field.status}
                        </p>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mt-1"
                            onClick={() => handleDeleteField(field._id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                Expenses
              </CardTitle>
              {canManage && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setFieldFormData({ ...fieldFormData, fieldType: 'expense' });
                    setFieldDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {fieldsByType.expense.length === 0 ? (
              <p className="text-sm text-gray-500">No expenses recorded</p>
            ) : (
              <div className="space-y-3">
                {fieldsByType.expense.map((field: any) => (
                  <div key={field._id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{field.name}</p>
                        <p className="text-sm text-gray-500 capitalize mt-1">{field.frequency}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(field.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">${field.value?.toLocaleString() || 0}</p>
                        <p className={`text-xs capitalize ${getApprovalStatusColor(field.status)}`}>
                          {field.status}
                        </p>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mt-1"
                            onClick={() => handleDeleteField(field._id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Property related documents and files</CardDescription>
            </div>
            {canManage && (
              <Button 
                size="sm"
                onClick={() => setDocumentDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    {doc.description && (
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteDocument(doc._id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes & Correspondence Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Notes & Correspondence
              </CardTitle>
              <CardDescription>Property notes and communication history with timestamps</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="mb-6">
            <div className="space-y-2">
              <Label htmlFor="newNote">Add a Note</Label>
              <Textarea
                id="newNote"
                placeholder="Enter your note or correspondence here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={savingNote || !newNoteContent.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {savingNote ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </form>

          {/* Notes List */}
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500">No notes added yet</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note: any) => (
                <div key={note._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900">
                          {note.createdBy?.name || 'Unknown User'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {note.createdBy?.email}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                    {(session?.user?.id === note.createdBy?._id || session?.user?.role === 'admin') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteNote(note._id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
              <DialogDescription>
                Update property information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Property Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-propertyType">Property Type</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, propertyType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="mixed">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the property "{property?.name}" and all its associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Property'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Field Dialog */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {fieldFormData.fieldType.charAt(0).toUpperCase() + fieldFormData.fieldType.slice(1)} Field</DialogTitle>
            <DialogDescription>
              Add a new field to track {fieldFormData.fieldType} information for this property.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                placeholder="e.g., Land Value, Rent Income, etc."
                value={fieldFormData.fieldName}
                onChange={(e) =>
                  setFieldFormData({ ...fieldFormData, fieldName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dataType">Data Type</Label>
              <Select
                value={fieldFormData.dataType}
                onValueChange={(value) =>
                  setFieldFormData({ ...fieldFormData, dataType: value as 'currency' | 'number' | 'text' | 'date' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fieldValue">Value</Label>
              <Input
                id="fieldValue"
                placeholder="Enter value"
                value={fieldFormData.value}
                onChange={(e) =>
                  setFieldFormData({ ...fieldFormData, value: e.target.value })
                }
              />
            </div>
            {(fieldFormData.fieldType === 'revenue' || fieldFormData.fieldType === 'expense') && (
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={fieldFormData.frequency}
                  onValueChange={(value) =>
                    setFieldFormData({ ...fieldFormData, frequency: value as 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'yearly' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFieldDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document or file related to this property.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentFile">File</Label>
              <Input
                id="documentFile"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setDocumentFormData({
                      ...documentFormData,
                      file,
                      name: documentFormData.name || file.name,
                    });
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                placeholder="Enter document name"
                value={documentFormData.name}
                onChange={(e) =>
                  setDocumentFormData({ ...documentFormData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="documentDescription">Description (Optional)</Label>
              <Input
                id="documentDescription"
                placeholder="Add a description..."
                value={documentFormData.description}
                onChange={(e) =>
                  setDocumentFormData({ ...documentFormData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDocumentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={uploading || !documentFormData.file}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Property Image</DialogTitle>
            <DialogDescription>
              Upload an image to display as the property thumbnail and header image.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImageUpload}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="propertyImage">Select Image</Label>
                <Input
                  id="propertyImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file);
                    }
                  }}
                  required
                />
                {selectedImage && (
                  <p className="text-sm text-gray-500">
                    Selected: {selectedImage.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImageDialogOpen(false);
                  setSelectedImage(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploadingImage || !selectedImage}>
                {uploadingImage ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
