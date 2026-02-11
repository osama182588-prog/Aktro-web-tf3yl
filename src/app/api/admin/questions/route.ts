import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isAdmin, hasRole } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    // التحقق من صلاحية إدارة الأسئلة
    const canManageQuestions = user && (
      hasRole(user.roles, process.env.DISCORD_ROLE_SENIOR_ADMIN) ||
      hasRole(user.roles, process.env.DISCORD_ROLE_GENERAL_ADMIN)
    );

    if (!canManageQuestions) {
      return NextResponse.json({ error: "ليس لديك صلاحية إدارة الأسئلة" }, { status: 403 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "السؤال مطلوب" }, { status: 400 });
    }

    const lastQuestion = await prisma.question.findFirst({
      orderBy: { order: 'desc' }
    });

    const newQuestion = await prisma.question.create({
      data: {
        question: question.trim(),
        order: (lastQuestion?.order || 0) + 1,
        createdBy: session.user.id
      }
    });

    // تسجيل العملية
    await prisma.adminLog.create({
      data: {
        action: 'QUESTION_CREATED',
        details: `إضافة سؤال جديد: ${question.substring(0, 50)}...`,
        adminId: session.user.id
      }
    });

    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const canManageQuestions = user && (
      hasRole(user.roles, process.env.DISCORD_ROLE_SENIOR_ADMIN) ||
      hasRole(user.roles, process.env.DISCORD_ROLE_GENERAL_ADMIN)
    );

    if (!canManageQuestions) {
      return NextResponse.json({ error: "ليس لديك صلاحية إدارة الأسئلة" }, { status: 403 });
    }

    const body = await request.json();
    const { id, question, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف السؤال مطلوب" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (question !== undefined) updateData.question = question;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData
    });

    await prisma.adminLog.create({
      data: {
        action: 'QUESTION_UPDATED',
        details: `تحديث السؤال: ${id}`,
        adminId: session.user.id
      }
    });

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const canManageQuestions = user && (
      hasRole(user.roles, process.env.DISCORD_ROLE_SENIOR_ADMIN) ||
      hasRole(user.roles, process.env.DISCORD_ROLE_GENERAL_ADMIN)
    );

    if (!canManageQuestions) {
      return NextResponse.json({ error: "ليس لديك صلاحية إدارة الأسئلة" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "معرف السؤال مطلوب" }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id }
    });

    await prisma.adminLog.create({
      data: {
        action: 'QUESTION_DELETED',
        details: `حذف السؤال: ${id}`,
        adminId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
