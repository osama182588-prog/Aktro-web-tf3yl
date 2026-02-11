// إعدادات NextAuth للمصادقة عبر Discord
// =====================================

import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/db";
import { AdminRole } from "@prisma/client";

// معرفات الرتب الإدارية من البيئة
const SUPER_ADMIN_ROLE_ID = process.env.SUPER_ADMIN_ROLE_ID || "";
const ACTIVATION_ADMIN_ROLE_ID = process.env.ACTIVATION_ADMIN_ROLE_ID || "";
const GENERAL_ADMIN_ROLE_ID = process.env.GENERAL_ADMIN_ROLE_ID || "";
const PRIORITY_ROLE_ID = process.env.PRIORITY_ROLE_ID || "";

// تحديد صلاحية الإدارة من الرتب
function getAdminRole(roles: string[]): AdminRole {
  if (roles.includes(SUPER_ADMIN_ROLE_ID)) return "SUPER_ADMIN";
  if (roles.includes(ACTIVATION_ADMIN_ROLE_ID)) return "ACTIVATION_ADMIN";
  if (roles.includes(GENERAL_ADMIN_ROLE_ID)) return "GENERAL_ADMIN";
  return "NONE";
}

// جلب رتب المستخدم من Discord
async function fetchDiscordRoles(accessToken: string): Promise<string[]> {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    if (!guildId) return [];

    const response = await fetch(
      `https://discord.com/api/users/@me/guilds/${guildId}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.roles || [];
  } catch {
    return [];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds guilds.members.read",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "discord") return false;

      try {
        const roles = await fetchDiscordRoles(account.access_token!);
        const adminRole = getAdminRole(roles);
        const isPriority = roles.includes(PRIORITY_ROLE_ID);

        // إنشاء أو تحديث المستخدم في قاعدة البيانات
        await prisma.user.upsert({
          where: { discordId: account.providerAccountId },
          update: {
            username: user.name || "Unknown",
            avatar: user.image,
            email: user.email,
            roles: roles,
            adminRole: adminRole,
            isAdmin: adminRole !== "NONE",
            isPriority: isPriority,
          },
          create: {
            discordId: account.providerAccountId,
            username: user.name || "Unknown",
            avatar: user.image,
            email: user.email,
            roles: roles,
            adminRole: adminRole,
            isAdmin: adminRole !== "NONE",
            isPriority: isPriority,
            accountAge: new Date(),
          },
        });

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // السماح بتسجيل الدخول حتى في حالة خطأ قاعدة البيانات
      }
    },

    async jwt({ token, account, user }) {
      if (account && user) {
        token.discordId = account.providerAccountId;
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.discordId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { discordId: token.discordId as string },
          });

          if (dbUser) {
            session.user = {
              ...session.user,
              id: dbUser.id,
              discordId: dbUser.discordId,
              username: dbUser.username,
              avatar: dbUser.avatar,
              roles: dbUser.roles,
              isAdmin: dbUser.isAdmin,
              adminRole: dbUser.adminRole,
              isPriority: dbUser.isPriority,
            } as typeof session.user & {
              id: string;
              discordId: string;
              username: string;
              avatar: string | null;
              roles: string[];
              isAdmin: boolean;
              adminRole: AdminRole;
              isPriority: boolean;
            };
          }
        } catch (error) {
          console.error("Error fetching user in session:", error);
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 أيام
  },
};
