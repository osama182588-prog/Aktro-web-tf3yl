import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/questions - Get all questions (admin only)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/admin/questions - Create new question
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Check permission (only high admin and general admin)
    if (session.user.adminRole !== 'high' && session.user.adminRole !== 'general') {
      return NextResponse.json({ error: 'لا تملك صلاحية إضافة أسئلة' }, { status: 403 })
    }

    const body = await request.json()
    const { question } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: 'السؤال مطلوب' }, { status: 400 })
    }

    // Get max order
    const maxOrder = await prisma.question.aggregate({
      _max: { order: true },
    })

    const newQuestion = await prisma.question.create({
      data: {
        question: question.trim(),
        order: (maxOrder._max.order || 0) + 1,
        createdBy: session.user.discordId,
      },
    })

    // Log action
    const adminUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (adminUser) {
      await prisma.adminAction.create({
        data: {
          adminId: adminUser.id,
          actionType: 'QUESTION_CREATED',
          details: { questionId: newQuestion.id },
        },
      })
    }

    return NextResponse.json({ question: newQuestion, message: 'تم إضافة السؤال بنجاح' })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
