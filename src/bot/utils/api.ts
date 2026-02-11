import prisma from '@/lib/prisma'

interface ApplicationStatus {
  id: string
  status: string
  isPriority: boolean
  adminNotes: string | null
  createdAt: Date
  updatedAt: Date
}

export async function getApplicationStatus(discordId: string): Promise<ApplicationStatus | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { discordId },
    })

    if (!user) return null

    const application = await prisma.application.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        isPriority: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return application
  } catch (error) {
    console.error('Error fetching application status:', error)
    return null
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  action: string,
  adminDiscordId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    })

    if (!application) {
      return { success: false, message: 'الطلب غير موجود' }
    }

    // Prevent self-review
    if (application.user.discordId === adminDiscordId) {
      return { success: false, message: 'لا يمكنك مراجعة طلبك الخاص' }
    }

    let status: 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUESTED'
    let message: string

    switch (action) {
      case 'approve':
        status = 'APPROVED'
        message = 'تم قبول الطلب بنجاح'
        break
      case 'reject':
        status = 'REJECTED'
        message = 'تم رفض الطلب'
        break
      case 'modify':
        status = 'MODIFICATION_REQUESTED'
        message = 'تم طلب تعديل على الطلب'
        break
      default:
        return { success: false, message: 'إجراء غير صالح' }
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedBy: adminDiscordId,
        reviewedAt: new Date(),
      },
    })

    // Log admin action
    const admin = await prisma.user.findUnique({
      where: { discordId: adminDiscordId },
    })

    if (admin) {
      await prisma.adminAction.create({
        data: {
          adminId: admin.id,
          targetId: application.user.id,
          actionType: status === 'APPROVED'
            ? 'APPLICATION_APPROVED'
            : status === 'REJECTED'
            ? 'APPLICATION_REJECTED'
            : 'APPLICATION_MODIFICATION_REQUESTED',
          details: { applicationId, source: 'discord' },
        },
      })
    }

    return { success: true, message }
  } catch (error) {
    console.error('Error updating application status:', error)
    return { success: false, message: 'حدث خطأ أثناء تحديث الحالة' }
  }
}

export async function getUserByDiscordId(discordId: string) {
  try {
    return await prisma.user.findUnique({
      where: { discordId },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}
