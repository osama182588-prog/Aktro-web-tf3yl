import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            discordId: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
