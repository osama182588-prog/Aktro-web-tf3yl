import { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "./prisma"
import { config } from "./config"

// Discord role IDs from unified config
const HIGH_ADMIN_ROLE = config.bot.roles.highAdmin
const ACTIVATION_ADMIN_ROLE = config.bot.roles.activationAdmin
const GENERAL_ADMIN_ROLE = config.bot.roles.generalAdmin
const PRIORITY_ROLE = config.bot.roles.priority

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: config.discord.clientId,
      clientSecret: config.discord.clientSecret,
      authorization: {
        params: {
          scope: "identify email guilds guilds.members.read",
        },
      },
    }),
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

        try {
          // Update or create user in database
          await prisma.user.upsert({
            where: { discordId: discordProfile.id },
            update: {
              discordUsername: discordProfile.username,
              discordAvatar: discordProfile.avatar,
              email: discordProfile.email,
              lastLoginAt: new Date(),
              loginCount: { increment: 1 },
            },
            create: {
              discordId: discordProfile.id,
              discordUsername: discordProfile.username,
              discordAvatar: discordProfile.avatar,
              email: discordProfile.email,
              lastLoginAt: new Date(),
              loginCount: 1,
            },
          })
        } catch (error) {
          console.error("Error syncing user:", error)
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordProfile = profile as { id: string }
        token.discordId = discordProfile.id
        token.accessToken = account.access_token

        // Fetch user roles from Discord
        try {
          const guildId = config.bot.guildId
          if (guildId && account.access_token) {
            const response = await fetch(
              `https://discord.com/api/users/@me/guilds/${guildId}/member`,
              {
                headers: {
                  Authorization: `Bearer ${account.access_token}`,
                },
              }
            )
            if (response.ok) {
              const memberData = await response.json()
              const roles = memberData.roles || []

              token.isHighAdmin = roles.includes(HIGH_ADMIN_ROLE)
              token.isActivationAdmin = roles.includes(ACTIVATION_ADMIN_ROLE)
              token.isGeneralAdmin = roles.includes(GENERAL_ADMIN_ROLE)
              token.hasPriority = roles.includes(PRIORITY_ROLE)

              // Update user roles in database
              await prisma.user.update({
                where: { discordId: discordProfile.id },
                data: {
                  isHighAdmin: roles.includes(HIGH_ADMIN_ROLE),
                  isActivationAdmin: roles.includes(ACTIVATION_ADMIN_ROLE),
                  isGeneralAdmin: roles.includes(GENERAL_ADMIN_ROLE),
                  hasPriority: roles.includes(PRIORITY_ROLE),
                },
              })
            }
          }
        } catch (error) {
          console.error("Error fetching Discord roles:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.discordId = token.discordId as string
        session.user.isHighAdmin = token.isHighAdmin as boolean
        session.user.isActivationAdmin = token.isActivationAdmin as boolean
        session.user.isGeneralAdmin = token.isGeneralAdmin as boolean
        session.user.hasPriority = token.hasPriority as boolean
        session.user.isAdmin =
          (token.isHighAdmin as boolean) ||
          (token.isActivationAdmin as boolean) ||
          (token.isGeneralAdmin as boolean)
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: config.auth.sessionMaxAge,
  },
}
