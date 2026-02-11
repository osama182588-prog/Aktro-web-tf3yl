// API: إحصائيات لوحة التحكم
// =========================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

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

    // جلب الإحصائيات
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalApplications,
      pendingApplications,
      reviewingApplications,
      approvedApplications,
      rejectedApplications,
      todayApplications,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.application.count({ where: { status: "REVIEWING" } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.application.count({ where: { createdAt: { gte: today } } }),
    ]);

    // حساب نسبة القبول
    const reviewedTotal = approvedApplications + rejectedApplications;
    const approvalRate = reviewedTotal > 0 
      ? Math.round((approvedApplications / reviewedTotal) * 100) 
      : 0;

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      reviewingApplications,
      approvedApplications,
      rejectedApplications,
      todayApplications,
      approvalRate,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
