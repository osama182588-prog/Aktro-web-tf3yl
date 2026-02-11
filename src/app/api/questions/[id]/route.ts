import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { hasGeneralAdminRole } from "@/lib/config"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const question = await prisma.question.findUnique({
      where: { id }
    })

    if (!question) {
      return NextResponse.json(
        { success: false, error: "السؤال غير موجود" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: question })
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب السؤال" },
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

    const isAdmin = session.user.roles ? hasGeneralAdminRole(session.user.roles) : false
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { text, isActive, order } = body

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      }
    })

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_QUESTION",
        targetId: id,
        targetType: "question",
        details: JSON.stringify({ text: text?.substring(0, 50), isActive, order }),
      }
    })

    return NextResponse.json({ success: true, data: question })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء تحديث السؤال" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const isAdmin = session.user.roles ? hasGeneralAdminRole(session.user.roles) : false
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.question.delete({
      where: { id }
    })

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "DELETE_QUESTION",
        targetId: id,
        targetType: "question",
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء حذف السؤال" },
      { status: 500 }
    )
  }
}
