import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.discordId) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
      include: {
        activationRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            realName: true,
            characterName: true,
            publicNotes: true,
            createdAt: true,
            updatedAt: true,
            reviewedAt: true,
            hasPriority: true,
          },
        },
      },
    })

    if (!user || user.activationRequests.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: user.activationRequests[0],
    })
  } catch (error) {
    console.error("Error fetching my activation:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
