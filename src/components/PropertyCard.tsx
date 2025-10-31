'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Home, MapPin, DollarSign, ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Property {
  _id: string;
  name: string;
  address: string;
  status: 'active' | 'sold' | 'under renovation';
  imageUrl?: string;
  fieldsData?: any[];
}

interface PropertyCardProps {
  property: Property;
  portfolioId: string;
}

export function PropertyCard({ property, portfolioId }: PropertyCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
    'under renovation': 'bg-yellow-100 text-yellow-800',
  };

  const propertyValue = property.fieldsData?.find(
    (f) => f.name === 'Property Value' && f.status === 'approved'
  );

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {property.imageUrl && (
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={property.imageUrl}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      {!property.imageUrl && (
        <div className="relative h-48 w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-blue-300" />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {property.address}
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[property.status]}`}>
            {property.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          {propertyValue && (
            <div className="flex items-center text-lg font-semibold text-gray-900">
              <DollarSign className="h-5 w-5 mr-1 text-green-600" />
              {formatCurrency(propertyValue.value, propertyValue.currency)}
            </div>
          )}
          <Link href={`/portfolio/${portfolioId}/property/${property._id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}