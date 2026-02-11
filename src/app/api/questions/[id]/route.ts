// API: تحديث وحذف سؤال محدد
// =========================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// تحديث سؤال
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { isAdmin?: boolean; adminRole?: string };
    if (!user.isAdmin || (user.adminRole !== "SUPER_ADMIN" && user.adminRole !== "GENERAL_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { question, isActive, order } = body;

    const updateData: Record<string, unknown> = {};
    
    if (question !== undefined) {
      if (question.trim().length < 10) {
        return NextResponse.json(
          { error: "السؤال يجب أن يكون 10 أحرف على الأقل" },
          { status: 400 }
        );
      }
      updateData.question = question.trim();
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    if (order !== undefined) {
      updateData.order = order;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// حذف سؤال
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { isAdmin?: boolean; adminRole?: string };
    if (!user.isAdmin || (user.adminRole !== "SUPER_ADMIN" && user.adminRole !== "GENERAL_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
