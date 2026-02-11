import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (body.question !== undefined) {
      updateData.question = body.question
    }
    
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive
    }
    
    if (body.order !== undefined) {
      updateData.order = body.order
    }

    const question = await prisma.question.update({
      where: { id },
      data: updateData
    })

    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: 'MANAGE_QUESTIONS',
        description: 'تعديل سؤال',
        metadata: { questionId: id, changes: body }
      }
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Failed to update question:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.question.delete({
      where: { id }
    })

    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: 'MANAGE_QUESTIONS',
        description: 'حذف سؤال',
        metadata: { questionId: id }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete question:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
