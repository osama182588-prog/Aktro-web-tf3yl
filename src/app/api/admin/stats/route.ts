import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 403 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      todayRequests,
      priorityPending,
    ] = await Promise.all([
      prisma.activationRequest.count(),
      prisma.activationRequest.count({ where: { status: "PENDING" } }),
      prisma.activationRequest.count({ where: { status: "ACTIVATED" } }),
      prisma.activationRequest.count({ where: { status: "REJECTED" } }),
      prisma.activationRequest.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.activationRequest.count({
        where: { status: "PENDING", hasPriority: true },
      }),
    ])

    // Calculate approval rate
    const totalReviewed = approvedRequests + rejectedRequests
    const approvalRate =
      totalReviewed > 0 ? Math.round((approvedRequests / totalReviewed) * 100) : 0

    // Calculate average review time (in hours)
    const reviewedRequests = await prisma.activationRequest.findMany({
      where: {
        reviewedAt: { not: null },
      },
      select: {
        createdAt: true,
        reviewedAt: true,
      },
      take: 100,
      orderBy: { reviewedAt: "desc" },
    })

    let avgReviewTime = 0
    if (reviewedRequests.length > 0) {
      const totalTime = reviewedRequests.reduce((sum, req) => {
        if (req.reviewedAt) {
          return sum + (req.reviewedAt.getTime() - req.createdAt.getTime())
        }
        return sum
      }, 0)
      avgReviewTime = Math.round(totalTime / reviewedRequests.length / (1000 * 60 * 60)) // Convert to hours
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        todayRequests,
        priorityPending,
        approvalRate,
        avgReviewTime,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
