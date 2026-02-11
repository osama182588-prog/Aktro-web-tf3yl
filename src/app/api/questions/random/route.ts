import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const questionsCount = parseInt(process.env.ACTIVATION_QUESTIONS_COUNT || '5');

    // جلب أسئلة عشوائية نشطة
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        question: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    // خلط الأسئلة وأخذ العدد المطلوب
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, questionsCount);

    return NextResponse.json({ questions: selectedQuestions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
