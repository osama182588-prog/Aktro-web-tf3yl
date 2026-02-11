// API: إنشاء وجلب الطلبات
// =======================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// إنشاء طلب جديد
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { id?: string; isPriority?: boolean };
    if (!user.id) {
      return NextResponse.json({ error: "معرف المستخدم غير موجود" }, { status: 400 });
    }

    // التحقق من وجود طلب سابق نشط
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["PENDING", "REVIEWING", "APPROVED"],
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "لديك طلب نشط بالفعل" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { realName, age, characterName, characterStory, answers } = body;

    // التحقق من البيانات
    if (!realName || !age || !characterName || !characterStory || !answers) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    if (age < 13 || age > 100) {
      return NextResponse.json(
        { error: "العمر غير صالح" },
        { status: 400 }
      );
    }

    if (characterStory.length < 100) {
      return NextResponse.json(
        { error: "قصة الشخصية يجب أن تكون 100 حرف على الأقل" },
        { status: 400 }
      );
    }

    // إنشاء الطلب
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        realName,
        age,
        characterName,
        characterStory,
        answers,
        isPriority: user.isPriority || false,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// جلب جميع الطلبات (للإدارة فقط)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { isAdmin?: boolean };
    if (!user.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = status ? { status: status as never } : {};

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
              isPriority: true,
            },
          },
        },
        orderBy: [
          { isPriority: "desc" },
          { createdAt: "asc" },
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
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
