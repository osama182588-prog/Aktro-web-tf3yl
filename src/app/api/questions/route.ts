import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/questions - Get all questions (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 403 }
      )
    }

    const questions = await prisma.question.findMany({
      orderBy: { order: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: questions,
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}

// POST /api/questions - Create new question (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isGeneralAdmin && !session?.user?.isHighAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { text, order } = body

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: "نص السؤال مطلوب" },
        { status: 400 }
      )
    }

    const question = await prisma.question.create({
      data: {
        text: text.trim(),
        order: order || 0,
        createdBy: session.user.discordId,
      },
    })

    // Log admin action
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (user) {
      await prisma.adminLog.create({
        data: {
          adminId: user.id,
          action: "CREATE_QUESTION",
          details: { questionId: question.id, text: question.text },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: question,
    })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}

// PUT /api/questions - Update question (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isGeneralAdmin && !session?.user?.isHighAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, text, order, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "معرف السؤال مطلوب" },
        { status: 400 }
      )
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    // Log admin action
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (user) {
      await prisma.adminLog.create({
        data: {
          adminId: user.id,
          action: "UPDATE_QUESTION",
          details: { questionId: question.id },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: question,
    })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}

// DELETE /api/questions - Delete question (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isHighAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "معرف السؤال مطلوب" },
        { status: 400 }
      )
    }

    await prisma.question.delete({
      where: { id },
    })

    // Log admin action
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (user) {
      await prisma.adminLog.create({
        data: {
          adminId: user.id,
          action: "DELETE_QUESTION",
          details: { questionId: id },
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف السؤال بنجاح",
    })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
