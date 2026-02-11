import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/applications/[id] - Get single application
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PATCH /api/admin/applications/[id] - Update application status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, note } = body

    // Get the application
    const application = await prisma.application.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Prevent admin from reviewing their own application
    if (application.user.discordId === session.user.discordId) {
      return NextResponse.json({ error: 'لا يمكنك مراجعة طلبك الخاص' }, { status: 403 })
    }

    let status: 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUESTED'
    
    switch (action) {
      case 'approve':
        status = 'APPROVED'
        break
      case 'reject':
        status = 'REJECTED'
        break
      case 'request_modification':
        status = 'MODIFICATION_REQUESTED'
        break
      default:
        return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        adminNotes: note,
        rejectionReason: action === 'reject' ? note : undefined,
        reviewedBy: session.user.discordId,
        reviewedAt: new Date(),
      },
    })

    // Log admin action
    const adminUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (adminUser) {
      await prisma.adminAction.create({
        data: {
          adminId: adminUser.id,
          targetId: application.user.id,
          actionType: status === 'APPROVED' 
            ? 'APPLICATION_APPROVED' 
            : status === 'REJECTED' 
            ? 'APPLICATION_REJECTED' 
            : 'APPLICATION_MODIFICATION_REQUESTED',
          details: { applicationId: id, note },
        },
      })
    }

    return NextResponse.json({ 
      application: updatedApplication,
      message: 'تم تحديث الطلب بنجاح'
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
