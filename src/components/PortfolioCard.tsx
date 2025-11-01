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
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl truncate">{portfolio.name}</CardTitle>
              <CardDescription className="truncate">{portfolio.entity}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{portfolio.description}</p>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Link href={`/portfolio/${portfolio._id}`} className="flex-1 sm:flex-none">
              <Button size="sm" variant="outline" className="w-full">
                <FileText className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </Link>
            {isAdmin && onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(portfolio)} className="flex-1 sm:flex-none">
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}