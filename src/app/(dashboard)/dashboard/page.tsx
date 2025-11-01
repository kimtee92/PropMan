import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import ApprovalRequest from '@/models/ApprovalRequest';
import mongoose from 'mongoose';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch real data
  await connectDB();
  
  // Count portfolios based on user role and access
  let portfolioCount = 0;
  if (session.user.role === 'admin') {
    // Admins see all portfolios
    portfolioCount = await Portfolio.countDocuments();
  } else {
    // Managers and viewers see only portfolios they have access to
    const userId = new mongoose.Types.ObjectId(session.user.id);
    portfolioCount = await Portfolio.countDocuments({
      $or: [
        { owners: userId },
        { managers: userId },
        { viewers: userId },
      ],
    });
  }
  
  const pendingApprovalsCount = session.user.role === 'admin' 
    ? await ApprovalRequest.countDocuments({ status: 'pending' })
    : 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const approvedTodayCount = session.user.role === 'admin'
    ? await ApprovalRequest.countDocuments({
        status: 'approved',
        updatedAt: { $gte: today }
      })
    : 0;

  const stats = [
    {
      title: 'Portfolios',
      value: portfolioCount.toString(),
      description: session.user.role === 'admin' ? 'Total portfolios' : 'Your portfolios',
      icon: Building,
      href: '/portfolios',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ];

  if (session.user.role === 'admin') {
    stats.push(
      {
        title: 'Pending Approvals',
        value: pendingApprovalsCount.toString(),
        description: 'Awaiting review',
        icon: AlertCircle,
        href: '/approvals',
        color: 'text-orange-600',
        bg: 'bg-orange-100',
      },
      {
        title: 'Approved Today',
        value: approvedTodayCount.toString(),
        description: 'Recent approvals',
        icon: CheckCircle,
        href: '/audit-log?today=true',
        color: 'text-purple-600',
        bg: 'bg-purple-100',
      }
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Here's an overview of your property portfolio
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                <Link href={stat.href}>
                  <Button variant="ghost" size="sm" className="mt-3 w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Tips for using PropMan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Create portfolios to group your properties</li>
            <li>• Add properties with custom financial fields</li>
            <li>• Upload documents for each property</li>
            <li>• Track all changes in the audit log</li>
            {session.user.role === 'admin' && (
              <li>• Review and approve manager submissions</li>
            )}
          </ul>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Demo Accounts:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Admin: admin@propman.com / admin123</li>
                <li>• Manager: manager@propman.com / manager123</li>
              </ul>
              <p className="text-xs text-orange-600 mt-2 italic">
                * Only visible in development mode
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}