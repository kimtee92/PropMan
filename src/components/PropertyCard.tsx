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
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg truncate">{property.name}</CardTitle>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${statusColors[property.status]}`}>
            {property.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          {propertyValue && (
            <div className="flex items-center text-base sm:text-lg font-semibold text-gray-900">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-1 text-green-600" />
              <span className="truncate">{formatCurrency(propertyValue.value, propertyValue.currency)}</span>
            </div>
          )}
          <Link href={`/portfolio/${portfolioId}/property/${property._id}`} className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}