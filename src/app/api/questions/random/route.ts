import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get the number of questions to show from settings, default to 5
    const questionsSetting = await prisma.setting.findUnique({
      where: { key: "questionsPerTest" }
    })
    
    const questionsCount = questionsSetting 
      ? parseInt(questionsSetting.value) 
      : parseInt(process.env.QUESTIONS_PER_TEST || "5")

    // Get all active questions
    const allQuestions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    })

    // Shuffle and pick random questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, questionsCount)

    return NextResponse.json({ 
      success: true, 
      data: selectedQuestions.map(q => ({
        id: q.id,
        text: q.text
      }))
    })
  } catch (error) {
    console.error("Error fetching random questions:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب الأسئلة" },
      { status: 500 }
    )
  }
}
