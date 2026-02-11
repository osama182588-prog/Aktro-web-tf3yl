import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/applications - Get all applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const priority = searchParams.get('priority')

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (priority === 'true') {
      where.isPriority = true
    }

    if (search) {
      where.OR = [
        { realName: { contains: search, mode: 'insensitive' } },
        { characterName: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: [
        { isPriority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            discordId: true,
            avatar: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
