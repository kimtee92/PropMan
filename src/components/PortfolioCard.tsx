'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Building, Users, FileText } from 'lucide-react';

interface Portfolio {
  _id: string;
  name: string;
  entity: string;
  description?: string;
  managers?: any[];
  owners?: any[];
  viewers?: any[];
}

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit?: (portfolio: Portfolio) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export function PortfolioCard({ portfolio, onEdit, onDelete, isAdmin }: PortfolioCardProps) {
  // Calculate unique member count
  const allMembers = [
    ...(portfolio.owners || []),
    ...(portfolio.managers || []),
    ...(portfolio.viewers || [])
  ];
  
  // Get unique users by ID
  const uniqueMemberIds = new Set(
    allMembers.map((member: any) => 
      typeof member === 'string' ? member : member._id?.toString() || member.toString()
    )
  );
  const memberCount = uniqueMemberIds.size;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{portfolio.name}</CardTitle>
              <CardDescription>{portfolio.entity}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio.description && (
          <p className="text-sm text-gray-600 mb-4">{portfolio.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/portfolio/${portfolio._id}`}>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            {isAdmin && onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(portfolio)}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}