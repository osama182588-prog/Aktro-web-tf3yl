import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      todayRequests
    ] = await Promise.all([
      prisma.activationRequest.count(),
      prisma.activationRequest.count({ where: { status: 'PENDING' } }),
      prisma.activationRequest.count({ where: { status: 'ACTIVATED' } }),
      prisma.activationRequest.count({ where: { status: 'REJECTED' } }),
      prisma.activationRequest.count({
        where: { submittedAt: { gte: today } }
      })
    ])

    const total = approvedRequests + rejectedRequests
    const approvalRate = total > 0 ? Math.round((approvedRequests / total) * 100) : 0

    return NextResponse.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      todayRequests,
      avgReviewTime: "24 ساعة",
      approvalRate
    })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
