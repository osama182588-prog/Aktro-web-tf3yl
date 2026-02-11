import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { shuffleArray } from '@/lib/utils';

export async function GET() {
  try {
    // Get system settings for questions per exam
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
    });

    const questionsPerExam = settings?.questionsPerExam || 5;

    // Get all active questions
    const allQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        text: true,
      },
    });

    // Shuffle and take required number
    const shuffledQuestions = shuffleArray(allQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, questionsPerExam);

    return NextResponse.json({ questions: selectedQuestions });
  } catch (error) {
    console.error('Error fetching random questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
