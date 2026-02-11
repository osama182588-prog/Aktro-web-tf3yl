import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { AdminRole, ApplicationStatus } from '@/generated/prisma';
import { syncUserRoles, sendDiscordNotification, sendAdminAlert } from '@/lib/discord';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.name || '' }
        ]
      }
    });

    if (!adminUser || 
        (adminUser.adminRole !== AdminRole.SUPER_ADMIN && 
         adminUser.adminRole !== AdminRole.ACTIVATION_ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Prevent admin from reviewing their own application
    if (application.userId === adminUser.id) {
      return NextResponse.json({ error: 'لا يمكنك مراجعة طلبك الشخصي' }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body;

    let newStatus: ApplicationStatus;
    let notificationType: 'approval' | 'rejection' | 'modification';

    switch (action) {
      case 'approve':
        newStatus = ApplicationStatus.APPROVED;
        notificationType = 'approval';
        break;
      case 'reject':
        newStatus = ApplicationStatus.REJECTED;
        notificationType = 'rejection';
        break;
      case 'modification':
        newStatus = ApplicationStatus.MODIFICATION_REQUESTED;
        notificationType = 'modification';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update application
    await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
        adminNotes: action === 'modification' ? notes : undefined,
        rejectionReason: action === 'reject' ? notes : undefined,
      },
    });

    // Log activity
    const activityAction = action === 'approve' 
      ? 'APPLICATION_APPROVE' 
      : action === 'reject' 
        ? 'APPLICATION_REJECT' 
        : 'APPLICATION_REQUEST_MODIFICATION';

    await prisma.activityLog.create({
      data: {
        userId: adminUser.id,
        action: activityAction,
        targetType: 'application',
        targetId: id,
        details: notes || undefined,
      },
    });

    // Sync Discord roles if approved
    if (action === 'approve') {
      const activatedRoleId = process.env.DISCORD_ACTIVATED_ROLE_ID;
      if (activatedRoleId) {
        await syncUserRoles(application.user.discordId, 'add', activatedRoleId);
      }
    }

    // Send notification to user
    let message = '';
    if (action === 'approve') {
      message = '🎉 تهانينا! تم قبول طلب تفعيلك. يمكنك الآن الانضمام للسيرفر.';
    } else if (action === 'reject') {
      message = `❌ للأسف، تم رفض طلب تفعيلك.\n${notes ? `السبب: ${notes}` : ''}\n\nيمكنك إعادة التقديم.`;
    } else {
      message = `📝 يرجى تعديل طلبك.\n${notes ? `الملاحظات: ${notes}` : ''}`;
    }
    
    await sendDiscordNotification(application.user.discordId, message, notificationType);

    // Send admin alert
    await sendAdminAlert(id, action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'modification');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reviewing application:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء المراجعة' }, { status: 500 });
  }
}
