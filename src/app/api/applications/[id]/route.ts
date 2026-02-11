import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { hasActivationAdminRole, hasSuperAdminRole } from "@/lib/config"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        answers: {
          include: { question: true }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود" },
        { status: 404 }
      )
    }

    // Check if user owns application or is admin
    const isAdmin = session.user.roles ? hasActivationAdminRole(session.user.roles) : false
    if (application.userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح بالوصول لهذا الطلب" },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب البيانات" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes, publicNotes, qualityRating } = body

    const application = await prisma.application.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود" },
        { status: 404 }
      )
    }

    // Prevent admin from reviewing their own application
    if (application.userId === session.user.id && !hasSuperAdminRole(session.user.roles || [])) {
      return NextResponse.json(
        { success: false, error: "لا يمكنك مراجعة طلبك الشخصي" },
        { status: 403 }
      )
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: status || undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
        publicNotes: publicNotes !== undefined ? publicNotes : undefined,
        qualityRating: qualityRating !== undefined ? qualityRating : undefined,
        reviewedBy: session.user.discordId,
        reviewedAt: new Date(),
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: `UPDATE_APPLICATION_${status || "NOTES"}`,
        targetId: id,
        targetType: "application",
        details: JSON.stringify({ status, adminNotes, publicNotes, qualityRating }),
      }
    })

    // Create notification for user
    if (status) {
      let notificationTitle = ""
      let notificationMessage = ""
      let notificationType = "info"

      switch (status) {
        case "APPROVED":
          notificationTitle = "تم قبول طلبك!"
          notificationMessage = "تهانينا! تم قبول طلب التفعيل الخاص بك"
          notificationType = "success"
          break
        case "REJECTED":
          notificationTitle = "تم رفض طلبك"
          notificationMessage = publicNotes || "نأسف، تم رفض طلبك. يمكنك إعادة التقديم"
          notificationType = "error"
          break
        case "MODIFICATION":
          notificationTitle = "طلب تعديل"
          notificationMessage = publicNotes || "يرجى تعديل طلبك وإعادة التقديم"
          notificationType = "warning"
          break
      }

      if (notificationTitle) {
        await prisma.notification.create({
          data: {
            userId: application.userId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
          }
        })
      }
    }

    return NextResponse.json({ success: true, data: updatedApplication })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء تحديث الطلب" },
      { status: 500 }
    )
  }
}
