import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AdminRole, ApplicationStatus } from '@/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, action, adminDiscordId, notes } = body;

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { discordId: adminDiscordId },
    });

    if (!adminUser || 
        (adminUser.adminRole !== AdminRole.SUPER_ADMIN && 
         adminUser.adminRole !== AdminRole.ACTIVATION_ADMIN)) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Prevent self-review
    if (application.userId === adminUser.id) {
      return NextResponse.json({ error: 'لا يمكنك مراجعة طلبك الشخصي' }, { status: 403 });
    }

    let newStatus: ApplicationStatus;

    switch (action) {
      case 'approve':
        newStatus = ApplicationStatus.APPROVED;
        break;
      case 'reject':
        newStatus = ApplicationStatus.REJECTED;
        break;
      case 'modification':
        newStatus = ApplicationStatus.MODIFICATION_REQUESTED;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await prisma.application.update({
      where: { id: applicationId },
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
        targetId: applicationId,
        details: `تمت المراجعة من Discord`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reviewing application:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
