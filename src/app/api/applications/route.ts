import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/applications - Get current user's applications
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          include: {
            answers: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ applications: user?.applications || [] })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { realName, age, characterName, characterStory, answers } = body

    // Validation
    if (!realName || !age || !characterName || !characterStory) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    if (age < 16) {
      return NextResponse.json({ error: 'يجب أن يكون عمرك 16 سنة أو أكثر' }, { status: 400 })
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          discordId: session.user.discordId,
          username: session.user.name || 'Unknown',
          email: session.user.email,
          avatar: session.user.image,
          roles: session.user.roles || [],
        },
      })
    }

    // Check for existing pending application
    const existingApp = await prisma.application.findFirst({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    })

    if (existingApp) {
      return NextResponse.json({ error: 'لديك طلب قيد المراجعة بالفعل' }, { status: 400 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        realName,
        age: parseInt(age),
        characterName,
        characterStory,
        isPriority: session.user.isPriority || false,
        status: 'UNDER_REVIEW',
        answers: {
          create: answers.map((answer: { questionId: string; answerText: string }) => ({
            questionId: answer.questionId,
            answerText: answer.answerText,
          })),
        },
      },
    })

    return NextResponse.json({ application, message: 'تم إرسال طلبك بنجاح' })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
