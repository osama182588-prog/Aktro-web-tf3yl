// API: جلب وتحديث طلب محدد
// ========================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// جلب طلب محدد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { isAdmin?: boolean };
    if (!user.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { id } = await params;

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
        reviewedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// تحديث حالة الطلب
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { id?: string; isAdmin?: boolean; adminRole?: string };
    if (!user.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // التحقق من صلاحية مراجعة الطلبات
    if (user.adminRole !== "SUPER_ADMIN" && user.adminRole !== "ACTIVATION_ADMIN") {
      return NextResponse.json({ error: "ليس لديك صلاحية مراجعة الطلبات" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, notes, internalNotes, qualityRating } = body;

    // جلب الطلب الحالي
    const currentApplication = await prisma.application.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentApplication) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // منع الإداري من مراجعة طلبه الخاص
    if (currentApplication.userId === user.id) {
      return NextResponse.json(
        { error: "لا يمكنك مراجعة طلبك الخاص" },
        { status: 403 }
      );
    }

    // تحديد الحالة الجديدة
    let newStatus: "APPROVED" | "REJECTED" | "MODIFICATION_REQUIRED";
    switch (action) {
      case "approve":
        newStatus = "APPROVED";
        break;
      case "reject":
        newStatus = "REJECTED";
        break;
      case "modification":
        newStatus = "MODIFICATION_REQUIRED";
        break;
      default:
        return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
    }

    // تحديث الطلب
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedById: user.id,
        reviewedAt: new Date(),
        adminNotes: action === "modification" ? notes : undefined,
        rejectionReason: action === "reject" ? notes : undefined,
        internalNotes: internalNotes || undefined,
        qualityRating: qualityRating || undefined,
      },
    });

    // تسجيل العملية في سجل الإدارة
    await prisma.adminLog.create({
      data: {
        adminId: user.id!,
        action: `application_${action}`,
        targetType: "application",
        targetId: id,
        details: {
          previousStatus: currentApplication.status,
          newStatus,
          notes: notes || null,
          qualityRating,
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
