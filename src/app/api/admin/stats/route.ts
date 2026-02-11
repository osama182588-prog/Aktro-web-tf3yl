import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { hasAdminRole } from "@/lib/config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const isAdmin = session.user.roles ? hasAdminRole(session.user.roles) : false
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      )
    }

    // Get today's date start
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all stats in parallel
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      todayApplications,
      totalQuestions,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.application.count({ where: { createdAt: { gte: today } } }),
      prisma.question.count({ where: { isActive: true } }),
    ])

    const approvalRate = totalApplications > 0 
      ? (approvedApplications / totalApplications) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        todayApplications,
        totalQuestions,
        approvalRate,
      }
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب الإحصائيات" },
      { status: 500 }
    )
  }
}
