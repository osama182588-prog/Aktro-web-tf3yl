import "next-auth"
import { ActivationStatus } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId: string
      discordUsername: string
      discordAvatar?: string | null
      name?: string | null
      email?: string | null
      image?: string | null
      activationStatus: ActivationStatus
      isHighAdmin: boolean
      isActivationAdmin: boolean
      isGeneralAdmin: boolean
      hasPriority: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string
  }
}
