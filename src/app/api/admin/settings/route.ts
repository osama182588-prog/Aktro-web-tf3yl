import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// GET /api/admin/settings - Get site settings
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.siteSettings.create({
        data: { id: 'main' },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Only high admin can update certain settings
    const body = await request.json()
    const {
      siteName,
      maintenanceMode,
      maintenanceMessage,
      questionsPerTest,
      minAccountAgeDays,
      reviewWaitHours,
      primaryColor,
      secondaryColor,
      darkMode,
      logoUrl,
      backgroundUrl,
    } = body

    // Build update data based on permissions
    const updateData: Record<string, unknown> = {}

    // General admin and high admin can update these
    if (session.user.adminRole === 'high' || session.user.adminRole === 'general') {
      if (siteName !== undefined) updateData.siteName = siteName
      if (questionsPerTest !== undefined) updateData.questionsPerTest = questionsPerTest
      if (primaryColor !== undefined) updateData.primaryColor = primaryColor
      if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor
      if (darkMode !== undefined) updateData.darkMode = darkMode
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl
      if (backgroundUrl !== undefined) updateData.backgroundUrl = backgroundUrl
    }

    // Only high admin can update these
    if (session.user.adminRole === 'high') {
      if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode
      if (maintenanceMessage !== undefined) updateData.maintenanceMessage = maintenanceMessage
      if (minAccountAgeDays !== undefined) updateData.minAccountAgeDays = minAccountAgeDays
      if (reviewWaitHours !== undefined) updateData.reviewWaitHours = reviewWaitHours
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: updateData,
      create: {
        id: 'main',
        ...updateData,
      },
    })

    // Log action
    const adminUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    })

    if (adminUser) {
      await prisma.adminAction.create({
        data: {
          adminId: adminUser.id,
          actionType: 'SETTINGS_UPDATED',
          details: { changes: updateData } as Prisma.InputJsonValue,
        },
      })
    }

    return NextResponse.json({ settings, message: 'تم حفظ الإعدادات بنجاح' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
