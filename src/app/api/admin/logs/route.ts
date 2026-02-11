import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/logs - Get admin action logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}

    if (type && type !== 'all') {
      where.actionType = type
    }

    const logs = await prisma.adminAction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        admin: {
          select: {
            username: true,
            avatar: true,
          },
        },
        target: {
          select: {
            username: true,
          },
        },
      },
    })

    const total = await prisma.adminAction.count({ where })

    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
