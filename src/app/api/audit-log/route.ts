import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const filterToday = searchParams.get('today') === 'true';
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');
    const user = searchParams.get('user');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let query: any = {};
    
    // Filter for today's approved requests by this user
    if (filterToday) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query = {
        userId: session.user.id,
        action: { $regex: /^Approved/i },
        timestamp: {
          $gte: today,
          $lt: tomorrow
        }
      };
    }

    // Apply action filter (partial match, case-insensitive)
    if (action) {
      query.action = { $regex: new RegExp(action, 'i') };
    }

    // Apply entity type filter
    if (entity) {
      query.targetType = entity;
    }

    // Apply date range filters
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.timestamp.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = toDate;
      }
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);

    // Apply user name filter after population (since it's a populated field)
    let filteredLogs = logs;
    if (user) {
      const userLower = user.toLowerCase();
      filteredLogs = logs.filter((log) => 
        log.userId?.name?.toLowerCase().includes(userLower)
      );
    }

    return NextResponse.json({ logs: filteredLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
