import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/activation - Get user's activation request
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.discordId) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
      include: {
        activationRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    const latestRequest = user.activationRequests[0] || null

    return NextResponse.json({
      success: true,
      data: latestRequest,
    })
  } catch (error) {
    console.error("Error fetching activation:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}

// POST /api/activation - Create new activation request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.discordId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { realName, age, characterName, characterStory, quizAnswers } = body

    // Validation
    if (!realName || !age || !characterName || !characterStory) {
      return NextResponse.json(
        { success: false, error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    if (age < 18) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون عمرك 18 سنة على الأقل" },
        { status: 400 }
      )
    }

    if (characterStory.length < 100) {
      return NextResponse.json(
        { success: false, error: "قصة الشخصية قصيرة جداً" },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Check for existing pending request
    const existingRequest = await prisma.activationRequest.findFirst({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "ACTIVATED"] },
      },
    })

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { success: false, error: "لديك طلب قيد المراجعة بالفعل" },
          { status: 400 }
        )
      }
      if (existingRequest.status === "ACTIVATED") {
        return NextResponse.json(
          { success: false, error: "حسابك مفعل بالفعل" },
          { status: 400 }
        )
      }
    }

    // Check rate limiting (max requests per day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayRequests = await prisma.activationRequest.count({
      where: {
        userId: user.id,
        createdAt: { gte: today },
      },
    })

    const maxDaily = parseInt(process.env.MAX_DAILY_REQUESTS || "3")
    if (todayRequests >= maxDaily) {
      return NextResponse.json(
        { success: false, error: "تجاوزت الحد الأقصى للطلبات اليومية" },
        { status: 429 }
      )
    }

    // Create activation request
    const activationRequest = await prisma.activationRequest.create({
      data: {
        userId: user.id,
        realName,
        age,
        characterName,
        characterStory,
        quizAnswers: quizAnswers || [],
        status: "PENDING",
        hasPriority: user.hasPriority,
      },
    })

    // TODO: Send notification to Discord admin channel

    return NextResponse.json({
      success: true,
      data: activationRequest,
      message: "تم إرسال طلبك بنجاح",
    })
  } catch (error) {
    console.error("Error creating activation:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
