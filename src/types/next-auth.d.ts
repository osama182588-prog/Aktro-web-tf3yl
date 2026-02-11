import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      discordId: string
      isHighAdmin: boolean
      isActivationAdmin: boolean
      isGeneralAdmin: boolean
      hasPriority: boolean
      isAdmin: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    discordId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    discordId?: string
    accessToken?: string
    isHighAdmin?: boolean
    isActivationAdmin?: boolean
    isGeneralAdmin?: boolean
    hasPriority?: boolean
  }
}
