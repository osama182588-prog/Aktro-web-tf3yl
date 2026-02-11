import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all stats in parallel
    const [
      totalApplications,
      pendingApplications,
      approvedToday,
      rejectedToday,
      allApplications,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      }),
      prisma.application.count({
        where: {
          status: 'APPROVED',
          reviewedAt: { gte: today },
        },
      }),
      prisma.application.count({
        where: {
          status: 'REJECTED',
          reviewedAt: { gte: today },
        },
      }),
      prisma.application.findMany({
        where: {
          reviewedAt: { not: null },
        },
        select: {
          createdAt: true,
          reviewedAt: true,
          status: true,
        },
      }),
    ])

    // Calculate average review time
    let totalReviewTime = 0
    let reviewedCount = 0
    let approvedCount = 0

    allApplications.forEach((app) => {
      if (app.reviewedAt) {
        const reviewTime = (app.reviewedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60)
        totalReviewTime += reviewTime
        reviewedCount++
      }
      if (app.status === 'APPROVED') {
        approvedCount++
      }
    })

    const averageReviewTime = reviewedCount > 0 ? Math.round(totalReviewTime / reviewedCount * 10) / 10 : 0
    const approvalRate = reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      approvedToday,
      rejectedToday,
      averageReviewTime,
      approvalRate,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
