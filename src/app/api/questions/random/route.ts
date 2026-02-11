import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { shuffleArray } from '@/lib/utils'

// GET /api/questions/random - Get random questions for test
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get site settings for questions per test
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    const questionsPerTest = settings?.questionsPerTest || parseInt(process.env.QUESTIONS_PER_TEST || '5')

    // Get all active questions
    const allQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        question: true,
      },
    })

    // Shuffle and take required number
    const randomQuestions = shuffleArray(allQuestions).slice(0, questionsPerTest)

    return NextResponse.json({ questions: randomQuestions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
