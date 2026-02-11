import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}
    
    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { characterName: { contains: search, mode: 'insensitive' } },
        { realName: { contains: search, mode: 'insensitive' } },
        { user: { discordUsername: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const requests = await prisma.activationRequest.findMany({
      where,
      include: {
        user: {
          select: {
            discordId: true,
            discordUsername: true,
            discordAvatar: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { submittedAt: 'desc' }
      ]
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Failed to fetch requests:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
