import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      )
    }

    // Check if user already has a pending or approved request
    const existingRequest = await prisma.activationRequest.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['PENDING', 'ACTIVATED'] }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "لديك طلب قائم بالفعل" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { realName, age, characterName, characterStory, testAnswers } = body

    // Validation
    if (!realName || !age || !characterName || !characterStory) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      )
    }

    if (age < 16 || age > 100) {
      return NextResponse.json(
        { error: "العمر يجب أن يكون بين 16 و 100" },
        { status: 400 }
      )
    }

    if (characterStory.length < 100) {
      return NextResponse.json(
        { error: "قصة الشخصية يجب أن تكون 100 حرف على الأقل" },
        { status: 400 }
      )
    }

    // Check for priority (from user's hasPriority flag)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // Create activation request
    const activationRequest = await prisma.activationRequest.create({
      data: {
        userId: session.user.id,
        realName,
        age,
        characterName,
        characterStory,
        testAnswers,
        status: 'PENDING',
        priority: user?.hasPriority || false
      }
    })

    // Update user's activation status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activationStatus: 'PENDING' }
    })

    return NextResponse.json({
      success: true,
      requestId: activationRequest.id
    })
  } catch (error) {
    console.error("Failed to submit activation request:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الطلب" },
      { status: 500 }
    )
  }
}
