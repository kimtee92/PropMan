'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchApprovals();
  }, [session, router]);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals?status=pending');
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedApproval || !action) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: selectedApproval._id,
          action,
          comments,
        }),
      });

      if (res.ok) {
        alert(`Approval ${action}d successfully!`);
        setDialogOpen(false);
        setSelectedApproval(null);
        setComments('');
        setAction(null);
        fetchApprovals();
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action} approval`);
      }
    } catch (error) {
      console.error(`Error ${action}ing approval:`, error);
      alert(`An error occurred while ${action}ing the approval`);
    } finally {
      setProcessing(false);
    }
  };

  const openDialog = (approval: any, actionType: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setAction(actionType);
    setDialogOpen(true);
  };

  const getActionBadge = (actionType: string) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
    };
    return colors[actionType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      field: 'bg-purple-100 text-purple-800',
      document: 'bg-orange-100 text-orange-800',
      property: 'bg-blue-100 text-blue-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading approvals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and approve manager submissions
        </p>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-500 text-center">
              There are no pending approvals at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {approval.type === 'field' && 'Field '}
                        {approval.type === 'document' && 'Document '}
                        {approval.type === 'property' && 'Property '}
                        {approval.action.charAt(0).toUpperCase() + approval.action.slice(1)}
                      </CardTitle>
                      <Badge className={getActionBadge(approval.action)}>
                        {approval.action}
                      </Badge>
                      <Badge className={getTypeBadge(approval.type)}>
                        {approval.type}
                      </Badge>
                    </div>
                    <CardDescription>
                      Submitted by {approval.submittedBy?.name || 'Unknown'} on{' '}
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => openDialog(approval, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDialog(approval, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Portfolio:</span>{' '}
                    {approval.portfolioId?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Property:</span>{' '}
                    {approval.propertyId?.name || 'N/A'}
                  </div>
                  {approval.proposedData && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <p className="font-medium mb-3 text-gray-700">Proposed Data:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(approval.proposedData).map(([key, value]) => {
                          // Skip MongoDB IDs and internal fields
                          if (key === '_id' || key === '__v' || key === 'createdBy' || key === 'portfolioId' || key === 'propertyId') {
                            return null;
                          }
                          
                          // Format key name
                          const formattedKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase());
                          
                          // Format value
                          let formattedValue = value;
                          if (key === 'value' && approval.proposedData.type === 'currency') {
                            formattedValue = `$${parseFloat(value as string).toLocaleString()}`;
                          } else if (key === 'frequency' || key === 'category' || key === 'type' || key === 'status') {
                            formattedValue = String(value).charAt(0).toUpperCase() + String(value).slice(1);
                          } else if (typeof value === 'object' && value !== null) {
                            formattedValue = JSON.stringify(value);
                          }
                          
                          return (
                            <div key={key} className="bg-white p-2 rounded border border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">{formattedKey}</div>
                              <div className="text-sm font-medium text-gray-900">{String(formattedValue)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {approval.originalData && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <p className="font-medium mb-3 text-gray-700">Original Data:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(approval.originalData).map(([key, value]) => {
                          // Skip MongoDB IDs and internal fields
                          if (key === '_id' || key === '__v' || key === 'createdBy' || key === 'portfolioId' || key === 'propertyId') {
                            return null;
                          }
                          
                          // Format key name
                          const formattedKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase());
                          
                          // Format value
                          let formattedValue = value;
                          if (key === 'value' && approval.originalData.type === 'currency') {
                            formattedValue = `$${parseFloat(value as string).toLocaleString()}`;
                          } else if (key === 'frequency' || key === 'category' || key === 'type' || key === 'status') {
                            formattedValue = String(value).charAt(0).toUpperCase() + String(value).slice(1);
                          } else if (typeof value === 'object' && value !== null) {
                            formattedValue = JSON.stringify(value);
                          }
                          
                          return (
                            <div key={key} className="bg-white p-2 rounded border border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">{formattedKey}</div>
                              <div className="text-sm font-medium text-gray-900">{String(formattedValue)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {action} this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments or reasons..."
                value={comments}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setComments('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              className={
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {processing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
