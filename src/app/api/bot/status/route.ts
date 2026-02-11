import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get('discordId');

  if (!discordId) {
    return NextResponse.json({ error: 'Discord ID required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return NextResponse.json({ application: null });
    }

    const application = await prisma.application.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
