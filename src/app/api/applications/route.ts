import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { rateLimit, rateLimitResponse, logIp, checkAltAccount } from '@/lib/security';
import { sendAdminAlert } from '@/lib/discord';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    if (!rateLimit(request)) {
      return rateLimitResponse();
    }

    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
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
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json({ error: 'حسابك محظور. السبب: ' + (user.banReason || 'غير محدد') }, { status: 403 });
    }

    // Check for pending application
    const pendingApplication = await prisma.application.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    });

    if (pendingApplication) {
      return NextResponse.json({ error: 'لديك طلب قيد المراجعة بالفعل' }, { status: 400 });
    }

    // Get system settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
    });

    // Check maintenance mode
    if (settings?.maintenanceMode) {
      return NextResponse.json({ 
        error: settings.maintenanceMessage || 'نظام التفعيل في وضع الصيانة حالياً' 
      }, { status: 503 });
    }

    const body = await request.json();
    const { realName, age, characterName, characterStory, answers } = body;

    // Validation
    if (!realName || !age || !characterName || !characterStory) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (age < 16) {
      return NextResponse.json({ error: 'يجب أن يكون عمرك 16 سنة أو أكثر' }, { status: 400 });
    }

    if (characterStory.length < 100) {
      return NextResponse.json({ error: 'يجب أن تكون قصة الشخصية 100 حرف على الأقل' }, { status: 400 });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'يجب الإجابة على جميع الأسئلة' }, { status: 400 });
    }

    // Get IP and User Agent for security
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log IP for alt detection
    await logIp(user.id, ipAddress, userAgent, prisma);

    // Check for alt accounts
    const isAlt = await checkAltAccount(user.id, ipAddress, prisma);

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        realName,
        age,
        characterName,
        characterStory,
        isPriority: user.isPriority,
        ipAddress,
        userAgent,
        answers: {
          create: answers.map((a: { questionId: string; answer: string }) => ({
            questionId: a.questionId,
            answer: a.answer,
          })),
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'APPLICATION_SUBMIT',
        targetType: 'application',
        targetId: application.id,
        details: isAlt ? 'تم اكتشاف IP مشترك مع حسابات أخرى' : null,
        ipAddress,
      },
    });

    // Send admin alert
    await sendAdminAlert(application.id, 'new');

    return NextResponse.json({ 
      success: true, 
      applicationId: application.id 
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال الطلب' }, { status: 500 });
  }
}

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
      return NextResponse.json({ applications: [] });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
