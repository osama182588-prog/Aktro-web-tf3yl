import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH /api/admin/questions/[id] - Update question
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Check permission
    if (session.user.adminRole !== 'high' && session.user.adminRole !== 'general') {
      return NextResponse.json({ error: 'لا تملك صلاحية تعديل الأسئلة' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { question, isActive, order } = body

    const updateData: Record<string, unknown> = {}
    
    if (question !== undefined) updateData.question = question
    if (isActive !== undefined) updateData.isActive = isActive
    if (order !== undefined) updateData.order = order

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData,
    })

    // Log action
    const adminUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (adminUser) {
      await prisma.adminAction.create({
        data: {
          adminId: adminUser.id,
          actionType: 'QUESTION_UPDATED',
          details: { questionId: id, changes: updateData } as Prisma.InputJsonValue,
        },
      })
    }

    return NextResponse.json({ question: updatedQuestion, message: 'تم تحديث السؤال بنجاح' })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/admin/questions/[id] - Delete question
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Check permission (only high admin)
    if (session.user.adminRole !== 'high') {
      return NextResponse.json({ error: 'لا تملك صلاحية حذف الأسئلة' }, { status: 403 })
    }

    const { id } = await params

    await prisma.question.delete({
      where: { id },
    })

    // Log action
    const adminUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (adminUser) {
      await prisma.adminAction.create({
        data: {
          adminId: adminUser.id,
          actionType: 'QUESTION_DELETED',
          details: { questionId: id },
        },
      })
    }

    return NextResponse.json({ message: 'تم حذف السؤال بنجاح' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
