import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    // Get the most recent application for the user
    const application = await prisma.application.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        answers: {
          include: { question: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب البيانات" },
      { status: 500 }
    )
  }
}
