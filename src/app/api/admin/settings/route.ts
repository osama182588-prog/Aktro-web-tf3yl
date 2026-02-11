import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { hasSuperAdminRole } from "@/lib/config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const isAdmin = session.user.roles ? hasSuperAdminRole(session.user.roles) : false
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      )
    }

    const settings = await prisma.setting.findMany()
    
    const settingsObject: Record<string, string> = {}
    settings.forEach(s => {
      settingsObject[s.key] = s.value
    })

    return NextResponse.json({ success: true, data: settingsObject })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب الإعدادات" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const isAdmin = session.user.roles ? hasSuperAdminRole(session.user.roles) : false
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    }

    // Log action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_SETTINGS",
        targetType: "settings",
        details: JSON.stringify(body),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء حفظ الإعدادات" },
      { status: 500 }
    )
  }
}
