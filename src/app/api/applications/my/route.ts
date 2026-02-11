// API: جلب طلب المستخدم الحالي
// ============================

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

    const user = session.user as { id?: string };
    if (!user.id) {
      return NextResponse.json({ error: "معرف المستخدم غير موجود" }, { status: 400 });
    }

    // جلب آخر طلب للمستخدم
    const application = await prisma.application.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        isPriority: true,
        adminNotes: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error fetching user application:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
