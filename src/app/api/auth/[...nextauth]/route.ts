import NextAuth, { type NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import prisma from "@/lib/prisma"

// Discord OAuth scopes
const scopes = ['identify', 'email', 'guilds.members.read'].join(' ')

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: scopes } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user) return false
      
      try {
        // Get user's roles from Discord guild
        const guildId = process.env.DISCORD_GUILD_ID!
        const accessToken = account.access_token
        
        let roles: string[] = []
        
        if (accessToken) {
          const response = await fetch(
            `https://discord.com/api/users/@me/guilds/${guildId}/member`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )
          
          if (response.ok) {
            const memberData = await response.json()
            roles = memberData.roles || []
          }
        }
        
        // Create or update user in database
        await prisma.user.upsert({
          where: { discordId: account.providerAccountId },
          update: {
            username: user.name || 'Unknown',
            avatar: user.image,
            email: user.email,
            roles: roles,
          },
          create: {
            discordId: account.providerAccountId,
            username: user.name || 'Unknown',
            avatar: user.image,
            email: user.email,
            roles: roles,
          },
        })
        
        return true
      } catch (error) {
        console.error('Error during sign in:', error)
        return true // Still allow sign in even if database update fails
      }
    },
    
    async jwt({ token, account, user }) {
      if (account && user) {
        token.discordId = account.providerAccountId
        token.accessToken = account.access_token
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId as string
        
        // Get user from database with roles
        const dbUser = await prisma.user.findUnique({
          where: { discordId: token.discordId as string },
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.roles = dbUser.roles
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
