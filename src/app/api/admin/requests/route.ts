import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivationStatus } from "@prisma/client"
import { eventBus } from "@/lib/events"

// GET /api/admin/requests - Get all activation requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isActivationAdmin && !session?.user?.isHighAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const priority = searchParams.get("priority")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (priority === "true") {
      where.hasPriority = true
    }

    if (search) {
      where.OR = [
        { realName: { contains: search, mode: "insensitive" } },
        { characterName: { contains: search, mode: "insensitive" } },
        { user: { discordUsername: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [requests, total] = await Promise.all([
      prisma.activationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              discordId: true,
              discordUsername: true,
              discordAvatar: true,
            },
          },
        },
        orderBy: [
          { hasPriority: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activationRequest.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/requests - Update request status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isActivationAdmin && !session?.user?.isHighAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { requestId, action, adminNotes, publicNotes, qualityRating } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, error: "البيانات غير مكتملة" },
        { status: 400 }
      )
    }

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Get request
    const activationRequest = await prisma.activationRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    })

    if (!activationRequest) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود" },
        { status: 404 }
      )
    }

    // Prevent admin from reviewing their own request
    if (activationRequest.userId === adminUser.id) {
      return NextResponse.json(
        { success: false, error: "لا يمكنك مراجعة طلبك الشخصي" },
        { status: 403 }
      )
    }

    // Map action to status
    const statusMap: Record<string, ActivationStatus> = {
      approve: "ACTIVATED",
      reject: "REJECTED",
      request_edit: "EDIT_REQUESTED",
    }

    const newStatus = statusMap[action]
    if (!newStatus) {
      return NextResponse.json(
        { success: false, error: "الإجراء غير صالح" },
        { status: 400 }
      )
    }

    // Update request
    const updatedRequest = await prisma.activationRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: adminUser.id,
        ...(adminNotes !== undefined && { adminNotes }),
        ...(publicNotes !== undefined && { publicNotes }),
        ...(qualityRating !== undefined && { qualityRating }),
      },
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.id,
        targetId: activationRequest.userId,
        action: `REVIEW_REQUEST_${action.toUpperCase()}`,
        details: {
          requestId,
          previousStatus: activationRequest.status,
          newStatus,
        },
      },
    })

    // Sync with bot via event system - updates Discord role and sends notifications
    const eventMap: Record<string, 'activation:approved' | 'activation:rejected' | 'activation:edit_requested'> = {
      approve: 'activation:approved',
      reject: 'activation:rejected',
      request_edit: 'activation:edit_requested',
    }

    const eventName = eventMap[action]
    if (eventName) {
      eventBus.emitEvent(eventName, {
        discordId: activationRequest.user.discordId,
        discordUsername: activationRequest.user.discordUsername,
        reviewedBy: adminUser.discordUsername,
        requestId,
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "تم تحديث الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
