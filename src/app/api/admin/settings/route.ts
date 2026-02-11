import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, hasPermission } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !hasPermission(session.user, 'high')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.siteSetting.findMany()
    
    const settingsObject = settings.reduce((acc, s) => ({
      ...acc,
      [s.key]: s.value
    }), {})

    return NextResponse.json({ settings: settingsObject })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !hasPermission(session.user, 'high')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { 
          value: value as Prisma.InputJsonValue,
          updatedBy: session.user.id 
        },
        create: { 
          key, 
          value: value as Prisma.InputJsonValue,
          updatedBy: session.user.id 
        }
      })
    }

    // Log action
    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: 'UPDATE_SETTINGS',
        description: 'تحديث إعدادات النظام',
        metadata: body as Prisma.InputJsonValue
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
