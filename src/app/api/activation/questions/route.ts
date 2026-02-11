import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        question: true
      }
    })

    // Get number of questions to show from settings
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'activation_question_count' }
    })
    
    const count = setting?.value ? Number(setting.value) : 5
    
    // Shuffle and take required number of questions
    const shuffled = questions.sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, count)

    return NextResponse.json({ questions: selectedQuestions })
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}
