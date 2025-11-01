'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioCard } from '@/components/PortfolioCard';
import { useSession } from 'next-auth/react';
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

export default function PortfoliosPage() {
  const { data: session } = useSession();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    entity: '',
    description: '',
  });

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch('/api/portfolios');
      const data = await res.json();
      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({ name: '', entity: '', description: '' });
        fetchPortfolios();
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Portfolios</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your property portfolios
          </p>
        </div>
        {session?.user?.role === 'admin' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-3 sm:mx-0">
              <form onSubmit={handleCreatePortfolio}>
                <DialogHeader>
                  <DialogTitle>Create New Portfolio</DialogTitle>
                  <DialogDescription>
                    Add a new portfolio to organize your properties.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Portfolio Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Downtown Properties"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="entity">Entity/Owner</Label>
                    <Input
                      id="entity"
                      placeholder="e.g., Family Trust A, ABC Corp"
                      value={formData.entity}
                      onChange={(e) =>
                        setFormData({ ...formData, entity: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of this portfolio"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating} className="w-full sm:w-auto">
                    {creating ? 'Creating...' : 'Create Portfolio'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading portfolios...</p>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios found</h3>
          <p className="text-gray-500 mb-4">
            {session?.user?.role === 'admin'
              ? 'Create your first portfolio to get started'
              : 'No portfolios have been assigned to you yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio: any) => (
            <PortfolioCard
              key={portfolio._id}
              portfolio={portfolio}
              isAdmin={session?.user?.role === 'admin'}
            />
          ))}
        </div>
      )}
    </div>
  );
}