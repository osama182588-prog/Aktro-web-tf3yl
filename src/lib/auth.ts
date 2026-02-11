import { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import prisma from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds guilds.members.read"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordProfile = profile as {
          id: string
          username: string
          avatar?: string
          email?: string
        }

        // Create or update user in database
        await prisma.user.upsert({
          where: { discordId: discordProfile.id },
          update: {
            discordUsername: discordProfile.username,
            discordAvatar: discordProfile.avatar,
            discordEmail: discordProfile.email
          },
          create: {
            discordId: discordProfile.id,
            discordUsername: discordProfile.username,
            discordAvatar: discordProfile.avatar,
            discordEmail: discordProfile.email
          }
        })
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordProfile = profile as { id: string }
        token.discordId = discordProfile.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.discordId) {
        const user = await prisma.user.findUnique({
          where: { discordId: token.discordId as string }
        })
        
        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            discordId: user.discordId,
            discordUsername: user.discordUsername,
            discordAvatar: user.discordAvatar,
            activationStatus: user.activationStatus,
            isHighAdmin: user.isHighAdmin,
            isActivationAdmin: user.isActivationAdmin,
            isGeneralAdmin: user.isGeneralAdmin,
            hasPriority: user.hasPriority
          }
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt"
  }
}

// Helper function to check if user has any admin role
export function isAdmin(user: {
  isHighAdmin?: boolean
  isActivationAdmin?: boolean
  isGeneralAdmin?: boolean
}): boolean {
  return !!(user.isHighAdmin || user.isActivationAdmin || user.isGeneralAdmin)
}

// Helper function to check specific admin permissions
export function hasPermission(
  user: {
    isHighAdmin?: boolean
    isActivationAdmin?: boolean
    isGeneralAdmin?: boolean
  },
  permission: 'high' | 'activation' | 'general'
): boolean {
  if (user.isHighAdmin) return true
  
  switch (permission) {
    case 'high':
      return !!user.isHighAdmin
    case 'activation':
      return !!user.isActivationAdmin
    case 'general':
      return !!user.isGeneralAdmin
    default:
      return false
  }
}
