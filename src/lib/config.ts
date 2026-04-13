// Unified Configuration Module
// جميع إعدادات النظام مركزية في مكان واحد

export const config = {
  // Application
  app: {
    name: 'Secret CFW',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Discord OAuth (for website login)
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  },

  // Discord Bot
  bot: {
    token: process.env.DISCORD_BOT_TOKEN || '',
    guildId: process.env.DISCORD_GUILD_ID || '',

    // Channels
    channels: {
      activation: process.env.DISCORD_ACTIVATION_CHANNEL_ID || '',
      adminNotifications: process.env.DISCORD_ADMIN_NOTIFICATIONS_CHANNEL_ID || '',
      logs: process.env.DISCORD_LOGS_CHANNEL_ID || '',
    },

    // Roles
    roles: {
      highAdmin: process.env.DISCORD_HIGH_ADMIN_ROLE_ID || '',
      activationAdmin: process.env.DISCORD_ACTIVATION_ADMIN_ROLE_ID || '',
      generalAdmin: process.env.DISCORD_GENERAL_ADMIN_ROLE_ID || '',
      priority: process.env.DISCORD_PRIORITY_ROLE_ID || '',
      activated: process.env.DISCORD_ACTIVATED_ROLE_ID || '',
    },
  },

  // Quiz Settings
  quiz: {
    questionCount: parseInt(process.env.QUIZ_QUESTION_COUNT || '5', 10),
    minAge: 18,
    minStoryLength: 100,
  },

  // Rate Limiting
  rateLimit: {
    maxDailyRequests: parseInt(process.env.MAX_DAILY_REQUESTS || '3', 10),
  },

  // Auth
  auth: {
    secret: process.env.NEXTAUTH_SECRET || '',
    sessionMaxAge: 7 * 24 * 60 * 60, // 7 days
  },
} as const
