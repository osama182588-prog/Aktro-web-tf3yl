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
        },
      },
    })

    if (!user) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    const latestRequest = user.activationRequests[0]

    if (!latestRequest) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    // Determine if user can resubmit
    const canResubmit =
      latestRequest.status === "REJECTED" ||
      latestRequest.status === "EDIT_REQUESTED"

    return NextResponse.json({
      success: true,
      data: {
        status: latestRequest.status,
        canResubmit,
      },
    })
  } catch (error) {
    console.error("Error fetching status:", error)
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
