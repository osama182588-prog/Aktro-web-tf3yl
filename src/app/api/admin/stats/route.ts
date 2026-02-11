import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { AdminRole } from '@/generated/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.name || '' }
        ]
      }
    });

    if (!user || user.adminRole === AdminRole.NONE) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get today's start
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalApplications,
      pendingApplications,
      approvedToday,
      rejectedToday,
      totalApproved,
      totalRejected,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({
        where: {
          status: 'APPROVED',
          reviewedAt: { gte: todayStart },
        },
      }),
      prisma.application.count({
        where: {
          status: 'REJECTED',
          reviewedAt: { gte: todayStart },
        },
      }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
    ]);

    const totalReviewed = totalApproved + totalRejected;
    const approvalRate = totalReviewed > 0 
      ? Math.round((totalApproved / totalReviewed) * 100) 
      : 0;

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      approvedToday,
      rejectedToday,
      approvalRate,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
