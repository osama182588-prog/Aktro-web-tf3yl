import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      )
    }

    const request = await prisma.activationRequest.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        realName: true,
        characterName: true,
        submittedAt: true,
        reviewedAt: true,
        adminNotes: true,
        rejectionReason: true,
        modificationRequest: true,
        priority: true
      }
    })

    return NextResponse.json({ request })
  } catch (error) {
    console.error("Failed to fetch request:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    )
  }
}
