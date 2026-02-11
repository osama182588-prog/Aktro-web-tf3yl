import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isAdmin, hasRole } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');

    const where: Record<string, unknown> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (priority === 'true') {
      where.isPriority = true;
    }

    if (search) {
      where.OR = [
        { characterName: { contains: search, mode: 'insensitive' } },
        { realName: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.activationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              discordId: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [
          { isPriority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.activationRequest.count({ where })
    ]);

    return NextResponse.json({
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    // التحقق من صلاحية التفعيل
    const canReview = user && (
      hasRole(user.roles, process.env.DISCORD_ROLE_SENIOR_ADMIN) ||
      hasRole(user.roles, process.env.DISCORD_ROLE_ACTIVATION_ADMIN)
    );

    if (!canReview) {
      return NextResponse.json({ error: "ليس لديك صلاحية مراجعة الطلبات" }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action, adminNotes, publicNotes, qualityRating } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    // جلب الطلب
    const activationRequest = await prisma.activationRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!activationRequest) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // منع الإداري من مراجعة طلبه الشخصي
    if (activationRequest.userId === session.user.id) {
      return NextResponse.json({ error: "لا يمكنك مراجعة طلبك الشخصي" }, { status: 403 });
    }

    // تحديد الحالة الجديدة
    let newStatus: 'ACTIVATED' | 'REJECTED' | 'MODIFICATION_REQUESTED';
    switch (action) {
      case 'approve':
        newStatus = 'ACTIVATED';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        break;
      case 'request_modification':
        newStatus = 'MODIFICATION_REQUESTED';
        break;
      default:
        return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
    }

    // تحديث الطلب
    const updatedRequest = await prisma.activationRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        adminNotes: adminNotes || activationRequest.adminNotes,
        publicNotes: publicNotes || activationRequest.publicNotes,
        qualityRating: qualityRating || activationRequest.qualityRating,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    });

    // تسجيل العملية
    await prisma.adminLog.create({
      data: {
        action: `ACTIVATION_${action.toUpperCase()}`,
        details: `${action === 'approve' ? 'قبول' : action === 'reject' ? 'رفض' : 'طلب تعديل'} طلب تفعيل - ${activationRequest.characterName}`,
        adminId: session.user.id,
        targetId: activationRequest.userId
      }
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
