import NextAuth, { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "@/lib/prisma"

// Discord OAuth Scopes
const scopes = ['identify', 'email', 'guilds', 'guilds.members.read'].join(' ')

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: scopes } }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'discord') {
        try {
          // جلب رتب المستخدم من Discord
          const guildId = process.env.DISCORD_GUILD_ID
          const accessToken = account.access_token
          
          let roles: string[] = []
          
          if (guildId && accessToken) {
            try {
              const memberRes = await fetch(
                `https://discord.com/api/users/@me/guilds/${guildId}/member`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              )
              
              if (memberRes.ok) {
                const memberData = await memberRes.json()
                roles = memberData.roles || []
              }
            } catch (error) {
              console.error('Error fetching member roles:', error)
            }
          }
          
          // حفظ أو تحديث المستخدم في قاعدة البيانات
          await prisma.user.upsert({
            where: { discordId: account.providerAccountId },
            update: {
              username: user.name || '',
              displayName: user.name,
              email: user.email,
              avatar: user.image,
              roles: roles,
              lastLoginAt: new Date()
            },
            create: {
              discordId: account.providerAccountId,
              username: user.name || '',
              displayName: user.name,
              email: user.email,
              avatar: user.image,
              roles: roles,
              lastLoginAt: new Date()
            }
          })
          
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return true // السماح بتسجيل الدخول حتى في حالة الخطأ
        }
      }
      return true
    },
    
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.discordId = account.providerAccountId
      }
      return token
    },
    
    async session({ session, token }) {
      if (token.discordId) {
        // جلب بيانات المستخدم من قاعدة البيانات
        const dbUser = await prisma.user.findUnique({
          where: { discordId: token.discordId as string },
          include: {
            activationRequest: true
          }
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.discordId = dbUser.discordId
          session.user.roles = dbUser.roles
          session.user.activationStatus = dbUser.activationRequest?.status || 'NOT_ACTIVATED'
        }
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
