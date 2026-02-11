import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin, hasPermission } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has activation admin permission
    if (!hasPermission(session.user, 'activation') && !hasPermission(session.user, 'high')) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, adminNote, rejectionReason, modificationRequest } = body

    // Get the activation request
    const activationRequest = await prisma.activationRequest.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!activationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Prevent admin from reviewing their own request
    if (activationRequest.userId === session.user.id) {
      return NextResponse.json(
        { error: "لا يمكنك مراجعة طلبك الخاص" },
        { status: 403 }
      )
    }

    let newStatus = activationRequest.status
    const updateData: Record<string, unknown> = {
      adminNotes: adminNote || null,
      reviewedAt: new Date(),
      reviewedBy: session.user.id
    }

    switch (action) {
      case 'approve':
        newStatus = 'ACTIVATED'
        break
      case 'reject':
        newStatus = 'REJECTED'
        updateData.rejectionReason = rejectionReason
        break
      case 'modify':
        updateData.modificationRequest = modificationRequest || adminNote
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    updateData.status = newStatus

    // Update the activation request
    await prisma.activationRequest.update({
      where: { id },
      data: updateData
    })

    // Update user's activation status
    if (action === 'approve' || action === 'reject') {
      await prisma.user.update({
        where: { id: activationRequest.userId },
        data: { activationStatus: newStatus as 'ACTIVATED' | 'REJECTED' }
      })
    }

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        targetId: activationRequest.userId,
        actionType: action === 'approve' ? 'APPROVE_REQUEST' : 
                    action === 'reject' ? 'REJECT_REQUEST' : 'REQUEST_MODIFICATION',
        description: `${action === 'approve' ? 'قبول' : action === 'reject' ? 'رفض' : 'طلب تعديل'} طلب التفعيل`,
        metadata: { requestId: id, note: adminNote, reason: rejectionReason }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to perform action:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
