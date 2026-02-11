import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من وضع الصيانة
    const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    if (maintenanceMode) {
      return NextResponse.json({ 
        error: process.env.MAINTENANCE_MESSAGE || "النظام تحت الصيانة" 
      }, { status: 503 });
    }

    // التحقق من وجود طلب سابق قيد المراجعة أو مقبول
    const existingRequest = await prisma.activationRequest.findUnique({
      where: { userId: session.user.id }
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING_REVIEW') {
        return NextResponse.json({ 
          error: "لديك طلب قيد المراجعة بالفعل" 
        }, { status: 400 });
      }
      if (existingRequest.status === 'ACTIVATED') {
        return NextResponse.json({ 
          error: "أنت مفعل بالفعل" 
        }, { status: 400 });
      }
    }

    const body = await request.json();
    const { realName, age, characterName, characterStory, answers } = body;

    // التحقق من صحة البيانات
    if (!realName || !age || !characterName || !characterStory) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const minAge = parseInt(process.env.MIN_AGE || '16');
    if (age < minAge) {
      return NextResponse.json({ 
        error: `يجب أن يكون العمر ${minAge} سنة على الأقل` 
      }, { status: 400 });
    }

    if (characterStory.length < 100) {
      return NextResponse.json({ 
        error: "قصة الشخصية قصيرة جداً" 
      }, { status: 400 });
    }

    // التحقق من رتبة الأولوية
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const priorityRoleId = process.env.DISCORD_ROLE_PRIORITY;
    const isPriority = priorityRoleId ? user?.roles.includes(priorityRoleId) : false;

    // إنشاء أو تحديث الطلب
    const activation = await prisma.activationRequest.upsert({
      where: { userId: session.user.id },
      update: {
        realName,
        age,
        characterName,
        characterStory,
        answers,
        status: 'PENDING_REVIEW',
        isPriority,
        adminNotes: null,
        publicNotes: null,
        reviewedBy: null,
        reviewedAt: null
      },
      create: {
        userId: session.user.id,
        realName,
        age,
        characterName,
        characterStory,
        answers,
        status: 'PENDING_REVIEW',
        isPriority
      }
    });

    // تسجيل العملية
    await prisma.adminLog.create({
      data: {
        action: 'ACTIVATION_SUBMITTED',
        details: `تقديم طلب تفعيل جديد - ${characterName}`,
        adminId: session.user.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      activation: { id: activation.id, status: activation.status }
    });
  } catch (error) {
    console.error("Error submitting activation:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
