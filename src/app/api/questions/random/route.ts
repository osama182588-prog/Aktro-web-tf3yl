import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.discordId) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    // Get quiz question count from unified config
    const questionCount = config.quiz.questionCount

    // Get all active questions
    const allQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        text: true,
      },
      orderBy: { order: "asc" },
    })

    // If no questions in database, return sample questions
    if (allQuestions.length === 0) {
      const sampleQuestions = [
        { id: "q1", text: "ما هو الرول بلاي؟ وما الفرق بينه وبين اللعب العادي؟" },
        { id: "q2", text: "ما هو FearRP؟ أعطِ مثالاً عليه." },
        { id: "q3", text: "ما هو RDM؟ وكيف يمكن تجنبه؟" },
        { id: "q4", text: "ما هو MetaGaming؟ ولماذا هو مخالفة؟" },
        { id: "q5", text: "كيف تتصرف إذا واجهت مشكلة مع لاعب آخر؟" },
      ]
      
      return NextResponse.json({
        success: true,
        data: sampleQuestions.slice(0, questionCount),
      })
    }

    // Shuffle and select random questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, Math.min(questionCount, allQuestions.length))

    return NextResponse.json({
      success: true,
      data: selectedQuestions,
    })
  } catch (error) {
    console.error("Error fetching random questions:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
