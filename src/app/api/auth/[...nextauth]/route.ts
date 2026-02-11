import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import prisma from '@/lib/prisma';
import { AdminRole } from '@/generated/prisma';

// Role ID mappings from environment variables
const ROLE_MAPPINGS = {
  SUPER_ADMIN: process.env.DISCORD_SUPER_ADMIN_ROLE_ID,
  ACTIVATION_ADMIN: process.env.DISCORD_ACTIVATION_ADMIN_ROLE_ID,
  GENERAL_ADMIN: process.env.DISCORD_GENERAL_ADMIN_ROLE_ID,
  PRIORITY: process.env.DISCORD_PRIORITY_ROLE_ID,
};

function determineAdminRole(roles: string[]): AdminRole {
  if (roles.includes(ROLE_MAPPINGS.SUPER_ADMIN || '')) return AdminRole.SUPER_ADMIN;
  if (roles.includes(ROLE_MAPPINGS.ACTIVATION_ADMIN || '')) return AdminRole.ACTIVATION_ADMIN;
  if (roles.includes(ROLE_MAPPINGS.GENERAL_ADMIN || '')) return AdminRole.GENERAL_ADMIN;
  return AdminRole.NONE;
}

function hasPriority(roles: string[]): boolean {
  return roles.includes(ROLE_MAPPINGS.PRIORITY || '');
}

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'identify email guilds.members.read',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as { id: string; username: string; discriminator?: string; avatar?: string };
        
        // Fetch guild member roles
        let guildRoles: string[] = [];
        try {
          const guildId = process.env.DISCORD_GUILD_ID;
          if (guildId && account.access_token) {
            const response = await fetch(
              `https://discord.com/api/users/@me/guilds/${guildId}/member`,
              {
                headers: {
                  Authorization: `Bearer ${account.access_token}`,
                },
              }
            );
            if (response.ok) {
              const memberData = await response.json();
              guildRoles = memberData.roles || [];
            }
          }
        } catch (error) {
          console.error('Failed to fetch guild roles:', error);
        }

        const adminRole = determineAdminRole(guildRoles);
        const isPriority = hasPriority(guildRoles);

        // Upsert user in database
        await prisma.user.upsert({
          where: { discordId: discordProfile.id },
          update: {
            username: discordProfile.username,
            discriminator: discordProfile.discriminator,
            avatar: discordProfile.avatar,
            email: user.email,
            roles: guildRoles,
            adminRole,
            isPriority,
            lastLogin: new Date(),
          },
          create: {
            discordId: discordProfile.id,
            username: discordProfile.username,
            discriminator: discordProfile.discriminator,
            avatar: discordProfile.avatar,
            email: user.email,
            roles: guildRoles,
            adminRole,
            isPriority,
            lastLogin: new Date(),
          },
        });

        return true;
      }
      return false;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as { id: string };
        const dbUser = await prisma.user.findUnique({
          where: { discordId: discordProfile.id },
        });

        if (dbUser) {
          token.discordId = dbUser.discordId;
          token.roles = dbUser.roles;
          token.adminRole = dbUser.adminRole;
          token.isPriority = dbUser.isPriority;
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.discordId) {
        const dbUser = await prisma.user.findUnique({
          where: { discordId: token.discordId as string },
        });

        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            discordId: dbUser.discordId,
            roles: dbUser.roles,
            adminRole: dbUser.adminRole,
            isPriority: dbUser.isPriority,
          };
        }
      }
      return session;
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
});

export { handler as GET, handler as POST };
