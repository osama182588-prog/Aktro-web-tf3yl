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
    const { user, error } = await checkAdminPermission([
      AdminRole.SUPER_ADMIN,
      AdminRole.ACTIVATION_ADMIN,
      AdminRole.GENERAL_ADMIN,
    ]);

    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { realName: { contains: search, mode: 'insensitive' } },
        { characterName: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
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
        orderBy: [
          { isPriority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
