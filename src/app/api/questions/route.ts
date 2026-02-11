import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { AdminRole } from '@/generated/prisma';

// Helper to check admin permission
async function checkAdminPermission(allowedRoles: AdminRole[]): Promise<{ user: any; error?: NextResponse }> {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: session.user.email },
        { username: session.user.name || '' }
      ]
    }
  });

  if (!user || !allowedRoles.includes(user.adminRole)) {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission([
      AdminRole.SUPER_ADMIN,
      AdminRole.GENERAL_ADMIN,
    ]);

    if (error) return error;

    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Error fetching questions:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await checkAdminPermission([
      AdminRole.SUPER_ADMIN,
      AdminRole.GENERAL_ADMIN,
    ]);

    if (error) return error;

    const body = await request.json();
    const { text, order = 0, isActive = true } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'نص السؤال مطلوب' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        text,
        order,
        isActive,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'QUESTION_CREATE',
        targetType: 'question',
        targetId: question.id,
        details: `إضافة سؤال جديد: ${text.substring(0, 50)}...`,
      },
    });

    return NextResponse.json({ question });
  } catch (err) {
    console.error('Error creating question:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await checkAdminPermission([
      AdminRole.SUPER_ADMIN,
      AdminRole.GENERAL_ADMIN,
    ]);

    if (error) return error;

    const body = await request.json();
    const { id, text, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف السؤال مطلوب' }, { status: 400 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'QUESTION_UPDATE',
        targetType: 'question',
        targetId: question.id,
        details: `تحديث السؤال`,
      },
    });

    return NextResponse.json({ question });
  } catch (err) {
    console.error('Error updating question:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await checkAdminPermission([
      AdminRole.SUPER_ADMIN,
      AdminRole.GENERAL_ADMIN,
    ]);

    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف السؤال مطلوب' }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'QUESTION_DELETE',
        targetType: 'question',
        targetId: id,
        details: `حذف السؤال`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting question:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
