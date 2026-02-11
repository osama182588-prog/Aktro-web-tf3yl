import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { question } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Get max order
    const maxOrder = await prisma.question.aggregate({
      _max: { order: true }
    })

    const newQuestion = await prisma.question.create({
      data: {
        question,
        order: (maxOrder._max.order || 0) + 1,
        createdBy: session.user.id
      }
    })

    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: 'MANAGE_QUESTIONS',
        description: 'إضافة سؤال جديد',
        metadata: { questionId: newQuestion.id }
      }
    })

    return NextResponse.json({ question: newQuestion })
  } catch (error) {
    console.error("Failed to create question:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
