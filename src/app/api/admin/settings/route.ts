// API: إدارة الإعدادات
// ====================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// جلب الإعدادات
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { isAdmin?: boolean; adminRole?: string };
    if (!user.isAdmin || user.adminRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    let settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    // إنشاء الإعدادات الافتراضية إذا لم تكن موجودة
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "settings",
          questionsPerTest: 5,
          maintenanceMode: false,
          minAccountAge: 7,
          primaryColor: "#3B82F6",
          secondaryColor: "#6B7280",
          darkMode: true,
          serverName: "Secret CFW",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// تحديث الإعدادات
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = session.user as { id?: string; isAdmin?: boolean; adminRole?: string };
    if (!user.isAdmin || user.adminRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const {
      questionsPerTest,
      maintenanceMode,
      minAccountAge,
      primaryColor,
      secondaryColor,
      darkMode,
      serverName,
      welcomeMessage,
    } = body;

    const settings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: {
        questionsPerTest: questionsPerTest || 5,
        maintenanceMode: maintenanceMode || false,
        minAccountAge: minAccountAge || 7,
        primaryColor: primaryColor || "#3B82F6",
        secondaryColor: secondaryColor || "#6B7280",
        darkMode: darkMode !== undefined ? darkMode : true,
        serverName: serverName || "Secret CFW",
        welcomeMessage: welcomeMessage || null,
      },
      create: {
        id: "settings",
        questionsPerTest: questionsPerTest || 5,
        maintenanceMode: maintenanceMode || false,
        minAccountAge: minAccountAge || 7,
        primaryColor: primaryColor || "#3B82F6",
        secondaryColor: secondaryColor || "#6B7280",
        darkMode: darkMode !== undefined ? darkMode : true,
        serverName: serverName || "Secret CFW",
        welcomeMessage: welcomeMessage || null,
      },
    });

    // تسجيل العملية
    if (user.id) {
      await prisma.adminLog.create({
        data: {
          adminId: user.id,
          action: "settings_updated",
          targetType: "settings",
          targetId: "settings",
          details: body,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
