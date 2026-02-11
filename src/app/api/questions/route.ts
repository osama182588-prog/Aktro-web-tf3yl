import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { hasGeneralAdminRole } from "@/lib/config"

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    })

    return NextResponse.json({ success: true, data: questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب الأسئلة" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { text, isActive = true, order = 0 } = body

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "نص السؤال مطلوب (10 أحرف على الأقل)" },
        { status: 400 }
      )
    }

    const question = await prisma.question.create({
      data: {
        text: text.trim(),
        isActive,
        order,
      }
    })

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "CREATE_QUESTION",
        targetId: question.id,
        targetType: "question",
        details: JSON.stringify({ text: text.substring(0, 100) }),
      }
    })

    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إنشاء السؤال" },
      { status: 500 }
    )
  }
}
