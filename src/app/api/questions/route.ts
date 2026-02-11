// API: إدارة بنك الأسئلة
// ======================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// جلب جميع الأسئلة (للإدارة)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { isAdmin?: boolean };
    if (!user.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const questions = await prisma.question.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// إضافة سؤال جديد
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { isAdmin?: boolean; adminRole?: string };
    if (!user.isAdmin || (user.adminRole !== "SUPER_ADMIN" && user.adminRole !== "GENERAL_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const { question, order } = body;

    if (!question || question.trim().length < 10) {
      return NextResponse.json(
        { error: "السؤال يجب أن يكون 10 أحرف على الأقل" },
        { status: 400 }
      );
    }

    const newQuestion = await prisma.question.create({
      data: {
        question: question.trim(),
        order: order || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
