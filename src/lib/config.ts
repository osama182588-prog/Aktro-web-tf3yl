// Environment configuration with type safety
// جميع المتغيرات تُدار عبر ملف .env

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  
  // Discord OAuth
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID!,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET!,
  
  // Discord Bot
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN!,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID!,
  
  // Discord Roles
  DISCORD_ROLE_SUPER_ADMIN: process.env.DISCORD_ROLE_SUPER_ADMIN!,
  DISCORD_ROLE_ACTIVATION_ADMIN: process.env.DISCORD_ROLE_ACTIVATION_ADMIN!,
  DISCORD_ROLE_GENERAL_ADMIN: process.env.DISCORD_ROLE_GENERAL_ADMIN!,
  DISCORD_ROLE_PRIORITY: process.env.DISCORD_ROLE_PRIORITY!,
  DISCORD_ROLE_ACTIVATED: process.env.DISCORD_ROLE_ACTIVATED!,
  
  // Discord Channels
  DISCORD_CHANNEL_ADMIN_NOTIFICATIONS: process.env.DISCORD_CHANNEL_ADMIN_NOTIFICATIONS!,
  DISCORD_CHANNEL_LOGS: process.env.DISCORD_CHANNEL_LOGS!,
  DISCORD_CHANNEL_ACTIVATION_DASHBOARD: process.env.DISCORD_CHANNEL_ACTIVATION_DASHBOARD!,
  
  // Application Settings
  QUESTIONS_PER_TEST: parseInt(process.env.QUESTIONS_PER_TEST || '5'),
  MIN_ACCOUNT_AGE_DAYS: parseInt(process.env.MIN_ACCOUNT_AGE_DAYS || '7'),
  WAIT_TIME_HOURS: parseInt(process.env.WAIT_TIME_HOURS || '24'),
  
  // Security
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',
  ALT_DETECTION_ENABLED: process.env.ALT_DETECTION_ENABLED !== 'false',
}

// Role permission levels
export const ADMIN_ROLES = {
  SUPER_ADMIN: env.DISCORD_ROLE_SUPER_ADMIN,
  ACTIVATION_ADMIN: env.DISCORD_ROLE_ACTIVATION_ADMIN,
  GENERAL_ADMIN: env.DISCORD_ROLE_GENERAL_ADMIN,
}

// Permission checks
export function hasAdminRole(userRoles: string[]): boolean {
  return userRoles.some(role => 
    Object.values(ADMIN_ROLES).includes(role)
  )
}

export function hasSuperAdminRole(userRoles: string[]): boolean {
  return userRoles.includes(ADMIN_ROLES.SUPER_ADMIN)
}

export function hasActivationAdminRole(userRoles: string[]): boolean {
  return userRoles.includes(ADMIN_ROLES.SUPER_ADMIN) || 
         userRoles.includes(ADMIN_ROLES.ACTIVATION_ADMIN)
}

export function hasGeneralAdminRole(userRoles: string[]): boolean {
  return userRoles.includes(ADMIN_ROLES.SUPER_ADMIN) || 
         userRoles.includes(ADMIN_ROLES.GENERAL_ADMIN)
}

export function hasPriorityRole(userRoles: string[]): boolean {
  return userRoles.includes(env.DISCORD_ROLE_PRIORITY)
}
