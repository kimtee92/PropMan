'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AuditLogPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingToday, setShowingToday] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    // Check if filtering for today
    const urlParams = new URLSearchParams(window.location.search);
    const filterToday = urlParams.get('today') === 'true';
    setShowingToday(filterToday);
    
    fetchLogs();
  }, [session, router]);

  const fetchLogs = async () => {
    try {
      // Check if coming from "Approved Today" card via URL params
      const urlParams = new URLSearchParams(window.location.search);
      const filterToday = urlParams.get('today') === 'true';
      
      const url = filterToday ? '/api/audit-log?today=true' : '/api/audit-log';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const colors: { [key: string]: string } = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      approve: 'bg-purple-100 text-purple-800',
      reject: 'bg-orange-100 text-orange-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getEntityBadge = (entity: string) => {
    const colors: { [key: string]: string } = {
      field: 'bg-purple-100 text-purple-800',
      document: 'bg-orange-100 text-orange-800',
      property: 'bg-blue-100 text-blue-800',
      portfolio: 'bg-indigo-100 text-indigo-800',
      approval: 'bg-pink-100 text-pink-800',
    };
    return colors[entity] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {showingToday ? 'Approved Today' : 'Audit Log'}
        </h1>
        <p className="text-gray-600 mt-1">
          {showingToday 
            ? 'Requests you approved today' 
            : 'Track all changes and actions in the system'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Showing all system events and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{log.userId?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadge(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEntityBadge(log.targetType)}>
                          {log.targetType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm text-gray-600">
                          {log.changes?.after && (
                            <div className="space-y-1">
                              {log.changes.after.name && (
                                <div><span className="font-medium">Name:</span> {log.changes.after.name}</div>
                              )}
                              {log.changes.after.category && (
                                <div><span className="font-medium">Category:</span> {log.changes.after.category}</div>
                              )}
                              {log.changes.after.value && (
                                <div><span className="font-medium">Value:</span> {log.changes.after.value}</div>
                              )}
                            </div>
                          )}
                          {!log.changes?.after && 'No details available'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
