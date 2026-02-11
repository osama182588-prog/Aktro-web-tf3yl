import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.name || '' }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ application: null });
    }

    // Get latest application
    const application = await prisma.application.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error checking application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
