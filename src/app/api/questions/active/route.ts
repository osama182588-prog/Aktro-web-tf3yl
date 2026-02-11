// API: جلب الأسئلة النشطة للاختبار
// ================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // جلب الإعدادات لمعرفة عدد الأسئلة المطلوب
    let questionsPerTest = 5;
    try {
      const settings = await prisma.settings.findUnique({
        where: { id: "settings" },
      });
      if (settings?.questionsPerTest) {
        questionsPerTest = settings.questionsPerTest;
      }
    } catch {
      // استخدام القيمة الافتراضية
    }

    // جلب الأسئلة النشطة
    const allQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        question: true,
      },
      orderBy: { order: "asc" },
    });

    // خلط الأسئلة واختيار العدد المطلوب
    const shuffledQuestions = shuffleArray(allQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, questionsPerTest);

    return NextResponse.json({ questions: selectedQuestions });
  } catch (error) {
    console.error("Error fetching active questions:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
