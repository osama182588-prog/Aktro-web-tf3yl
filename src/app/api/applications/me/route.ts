import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/applications/me - Get current user's latest application
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (!user) {
      return NextResponse.json({ application: null })
    }

    const application = await prisma.application.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        isPriority: true,
        adminNotes: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
      },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
