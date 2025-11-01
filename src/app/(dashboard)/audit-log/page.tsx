'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { FileText, User, Calendar, Filter, X } from 'lucide-react';
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
  
  // Filter states
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
  }, [session, router, filterAction, filterEntity, filterUser, filterDateFrom, filterDateTo]);

  const fetchLogs = async () => {
    try {
      // Check if coming from "Approved Today" card via URL params
      const urlParams = new URLSearchParams(window.location.search);
      const filterToday = urlParams.get('today') === 'true';
      
      // Build query params
      const params = new URLSearchParams();
      if (filterToday) {
        params.append('today', 'true');
      }
      if (filterAction) {
        params.append('action', filterAction);
      }
      if (filterEntity) {
        params.append('entity', filterEntity);
      }
      if (filterUser) {
        params.append('user', filterUser);
      }
      if (filterDateFrom) {
        params.append('dateFrom', filterDateFrom);
      }
      if (filterDateTo) {
        params.append('dateTo', filterDateTo);
      }
      
      const url = `/api/audit-log?${params.toString()}`;
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

  const clearFilters = () => {
    setFilterAction('');
    setFilterEntity('');
    setFilterUser('');
    setFilterDateFrom('');
    setFilterDateTo('');
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

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filterAction">Action</Label>
                <select
                  id="filterAction"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </select>
              </div>

              <div>
                <Label htmlFor="filterEntity">Entity Type</Label>
                <select
                  id="filterEntity"
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="field">Field</option>
                  <option value="document">Document</option>
                  <option value="property">Property</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="approval">Approval</option>
                </select>
              </div>

              <div>
                <Label htmlFor="filterUser">User Name</Label>
                <Input
                  id="filterUser"
                  type="text"
                  placeholder="Search by name..."
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filterDateFrom">Date From</Label>
                <Input
                  id="filterDateFrom"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filterDateTo">Date To</Label>
                <Input
                  id="filterDateTo"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

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
