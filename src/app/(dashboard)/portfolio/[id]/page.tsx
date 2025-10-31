'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Building2, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { PropertyCard } from '@/components/PropertyCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    propertyType: 'residential',
    status: 'active',
  });

  useEffect(() => {
    if (params.id) {
      fetchPortfolio();
      fetchProperties();
      fetchUsers();
    }
  }, [params.id]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`/api/portfolios/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch(`/api/portfolios/${params.id}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({
          name: '',
          address: '',
          propertyType: 'residential',
          status: 'active',
        });
        fetchProperties();
      }
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Find the selected user to get their role
      const user = users.find((u) => u._id === selectedUser);
      if (!user) {
        alert('User not found');
        setCreating(false);
        return;
      }

      const updatedPortfolio = { ...portfolio };
      
      // Add user to the appropriate array based on their role
      if (user.role === 'admin') {
        // Admins become owners
        if (!updatedPortfolio.owners.find((o: any) => o._id === selectedUser)) {
          updatedPortfolio.owners.push(selectedUser);
        }
      } else if (user.role === 'manager') {
        // Managers go to managers array
        if (!updatedPortfolio.managers.find((m: any) => m._id === selectedUser)) {
          updatedPortfolio.managers.push(selectedUser);
        }
      } else if (user.role === 'viewer') {
        // Viewers go to viewers array
        if (!updatedPortfolio.viewers.find((v: any) => v._id === selectedUser)) {
          updatedPortfolio.viewers.push(selectedUser);
        }
      }

      const res = await fetch(`/api/portfolios/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owners: updatedPortfolio.owners.map((o: any) => o._id || o),
          managers: updatedPortfolio.managers.map((m: any) => m._id || m),
          viewers: updatedPortfolio.viewers.map((v: any) => v._id || v),
        }),
      });

      if (res.ok) {
        setUserDialogOpen(false);
        setSelectedUser('');
        fetchPortfolio();
        alert(`${user.name} added successfully as ${user.role}!`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An error occurred while adding the user');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Portfolio not found</p>
      </div>
    );
  }

  const canManage = session?.user?.role === 'admin' || session?.user?.role === 'manager';
  const isOwner = portfolio?.owners?.some((o: any) => o._id === session?.user?.id) || session?.user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/portfolios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
          <p className="text-gray-600 mt-1">{portfolio.entity}</p>
          {portfolio.description && (
            <p className="text-sm text-gray-500 mt-2">{portfolio.description}</p>
          )}
        </div>
        {isOwner && (
          <Button variant="outline" className="mr-2" onClick={() => setUserDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Users
          </Button>
        )}
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateProperty}>
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>
                    Add a property to this portfolio.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., 123 Main Street"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Full property address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, propertyType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
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
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
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
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Adding...' : 'Add Property'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Managers
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio.managers?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Viewers
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio.viewers?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Properties</h2>
        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No properties yet
              </h3>
              <p className="text-gray-500 mb-4">
                {canManage
                  ? 'Add your first property to get started'
                  : 'No properties have been added to this portfolio yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property: any) => (
              <PropertyCard
                key={property._id}
                property={property}
                portfolioId={params.id as string}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Users Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddUser}>
            <DialogHeader>
              <DialogTitle>Add User to Portfolio</DialogTitle>
              <DialogDescription>
                Users will be assigned based on their existing role (Admin → Owner, Manager → Manager, Viewer → Viewer).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user">Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => {
                        // Don't show users who are already assigned
                        const isManager = portfolio?.managers?.some((m: any) => m._id === u._id);
                        const isViewer = portfolio?.viewers?.some((v: any) => v._id === u._id);
                        const isOwner = portfolio?.owners?.some((o: any) => o._id === u._id);
                        return !isManager && !isViewer && !isOwner;
                      })
                      .map((user: any) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.email}) - <strong>{user.role.toUpperCase()}</strong>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  User will be added with their system role
                </p>
              </div>

              {/* Current Users Display */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2 text-sm">Current Access:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Owners:</span>{' '}
                    {portfolio?.owners?.map((o: any) => o.name).join(', ') || 'None'}
                  </div>
                  <div>
                    <span className="font-medium">Managers:</span>{' '}
                    {portfolio?.managers?.map((m: any) => m.name).join(', ') || 'None'}
                  </div>
                  <div>
                    <span className="font-medium">Viewers:</span>{' '}
                    {portfolio?.viewers?.map((v: any) => v.name).join(', ') || 'None'}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating || !selectedUser}>
                {creating ? 'Adding...' : 'Add User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
