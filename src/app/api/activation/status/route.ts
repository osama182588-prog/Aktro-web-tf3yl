import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const activation = await prisma.activationRequest.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        realName: true,
        characterName: true,
        createdAt: true,
        updatedAt: true,
        publicNotes: true,
        isPriority: true,
        qualityRating: true
      }
    });

    return NextResponse.json({ activation });
  } catch (error) {
    console.error("Error fetching activation status:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
