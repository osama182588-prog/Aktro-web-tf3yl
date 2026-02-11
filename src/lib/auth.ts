import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"

// Environment variables for admin roles
const ADMIN_HIGH_ROLE_ID = process.env.DISCORD_ADMIN_HIGH_ROLE_ID || ""
const ADMIN_ACTIVATION_ROLE_ID = process.env.DISCORD_ADMIN_ACTIVATION_ROLE_ID || ""
const ADMIN_GENERAL_ROLE_ID = process.env.DISCORD_ADMIN_GENERAL_ROLE_ID || ""
const PRIORITY_ROLE_ID = process.env.DISCORD_PRIORITY_ROLE_ID || ""

export type AdminRole = 'high' | 'activation' | 'general' | null
export type UserRole = AdminRole | 'priority' | 'member'

export interface ExtendedUser {
  id: string
  discordId: string
  name: string
  email: string
  image: string
  roles: string[]
  adminRole: AdminRole
  isPriority: boolean
  isAdmin: boolean
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
    accessToken?: string
  }
  interface User {
    discordId?: string
    roles?: string[]
  }
  interface JWT {
    discordId?: string
    roles?: string[]
    accessToken?: string
  }
}

function getAdminRole(roles: string[]): AdminRole {
  if (roles.includes(ADMIN_HIGH_ROLE_ID)) return 'high'
  if (roles.includes(ADMIN_ACTIVATION_ROLE_ID)) return 'activation'
  if (roles.includes(ADMIN_GENERAL_ROLE_ID)) return 'general'
  return null
}

function hasPriorityRole(roles: string[]): boolean {
  return roles.includes(PRIORITY_ROLE_ID)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds.members.read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.discordId = profile.id as string
        
        // Fetch guild member roles
        try {
          const guildId = process.env.DISCORD_GUILD_ID
          if (guildId && account.access_token) {
            const memberResponse = await fetch(
              `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
              {
                headers: {
                  Authorization: `Bearer ${account.access_token}`,
                },
              }
            )
            
            if (memberResponse.ok) {
              const memberData = await memberResponse.json()
              token.roles = memberData.roles || []
            } else {
              token.roles = []
            }
          }
        } catch (error) {
          console.error("Error fetching guild member:", error)
          token.roles = []
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const roles = (token.roles as string[]) || []
        const adminRole = getAdminRole(roles)
        
        // Extend the user object with our custom properties
        const extendedUser = session.user as unknown as ExtendedUser
        extendedUser.discordId = token.discordId as string
        extendedUser.roles = roles
        extendedUser.adminRole = adminRole
        extendedUser.isPriority = hasPriorityRole(roles)
        extendedUser.isAdmin = adminRole !== null
        
        session.accessToken = token.accessToken as string
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
  },
})
