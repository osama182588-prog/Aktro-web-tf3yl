import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { hasActivationAdminRole } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const isAdmin = session.user.roles ? hasActivationAdminRole(session.user.roles) : false
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const priority = searchParams.get("priority")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (status && status !== "all") {
      where.status = status
    }
    
    if (priority === "true") {
      where.priority = true
    }
    
    if (search) {
      where.OR = [
        { realName: { contains: search, mode: "insensitive" } },
        { characterName: { contains: search, mode: "insensitive" } },
        { user: { username: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              discordId: true,
              username: true,
              avatar: true,
            }
          },
          answers: {
            include: { question: true }
          }
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "asc" }
        ],
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      }
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب الطلبات" },
      { status: 500 }
    )
  }
}
