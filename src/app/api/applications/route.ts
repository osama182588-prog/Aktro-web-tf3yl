import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { hasPriorityRole } from "@/lib/config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        answers: {
          include: { question: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, data: applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب البيانات" },
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

    const body = await request.json()
    const { realName, age, characterName, characterStory, answers } = body

    // Validation
    if (!realName || !age || !characterName || !characterStory) {
      return NextResponse.json(
        { success: false, error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    if (age < 16 || age > 100) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون العمر بين 16 و 100" },
        { status: 400 }
      )
    }

    // Check for existing pending/approved application
    const existingApp = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "APPROVED"] }
      }
    })

    if (existingApp) {
      return NextResponse.json(
        { success: false, error: "لديك طلب قيد المراجعة أو مفعل بالفعل" },
        { status: 400 }
      )
    }

    // Check priority role
    const isPriority = session.user.roles ? hasPriorityRole(session.user.roles) : false

    // Create application with answers
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        realName,
        age,
        characterName,
        characterStory,
        priority: isPriority,
        status: "PENDING",
        answers: {
          create: answers?.map((a: { questionId: string; text: string }) => ({
            questionId: a.questionId,
            text: a.text,
          })) || []
        }
      },
      include: {
        answers: true
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "تم استلام طلبك",
        message: "تم استلام طلب التفعيل الخاص بك وهو قيد المراجعة",
        type: "info"
      }
    })

    return NextResponse.json({ success: true, data: application }, { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إنشاء الطلب" },
      { status: 500 }
    )
  }
}
