import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من صلاحية الإدارة
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    // جلب الإحصائيات
    const [total, pending, activated, rejected, priority, todayStart] = await Promise.all([
      prisma.activationRequest.count(),
      prisma.activationRequest.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.activationRequest.count({ where: { status: 'ACTIVATED' } }),
      prisma.activationRequest.count({ where: { status: 'REJECTED' } }),
      prisma.activationRequest.count({ where: { isPriority: true, status: 'PENDING_REVIEW' } }),
      new Date(new Date().setHours(0, 0, 0, 0))
    ]);

    const todaySubmissions = await prisma.activationRequest.count({
      where: {
        createdAt: { gte: todayStart }
      }
    });

    // حساب نسبة القبول
    const totalDecided = activated + rejected;
    const acceptanceRate = totalDecided > 0 
      ? Math.round((activated / totalDecided) * 100) 
      : 0;

    // حساب متوسط وقت المراجعة
    const reviewedRequests = await prisma.activationRequest.findMany({
      where: { reviewedAt: { not: null } },
      select: { createdAt: true, reviewedAt: true },
      take: 100
    });

    let avgReviewTime = "N/A";
    if (reviewedRequests.length > 0) {
      const totalHours = reviewedRequests.reduce((acc, req) => {
        if (req.reviewedAt) {
          return acc + (req.reviewedAt.getTime() - req.createdAt.getTime()) / (1000 * 60 * 60);
        }
        return acc;
      }, 0);
      const avgHours = Math.round(totalHours / reviewedRequests.length);
      avgReviewTime = avgHours < 24 ? `${avgHours} ساعة` : `${Math.round(avgHours / 24)} يوم`;
    }

    return NextResponse.json({
      total,
      pending,
      activated,
      rejected,
      priority,
      todaySubmissions,
      acceptanceRate,
      avgReviewTime
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
