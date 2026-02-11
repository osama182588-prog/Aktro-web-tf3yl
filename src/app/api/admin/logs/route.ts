import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logs = await prisma.adminAction.findMany({
      include: {
        admin: {
          select: {
            discordUsername: true,
            discordAvatar: true,
            discordId: true
          }
        },
        target: {
          select: {
            discordUsername: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Failed to fetch logs:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
