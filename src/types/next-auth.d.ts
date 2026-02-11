import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId: string
      roles: string[]
      activationStatus: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    discordId: string
    roles: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string
    discordId?: string
  }
}
