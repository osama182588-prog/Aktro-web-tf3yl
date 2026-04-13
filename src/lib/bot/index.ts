// Bot Entry Point
// نقطة تشغيل البوت - يتم استدعاؤها عند بدء تشغيل النظام

import { client } from './client'
import { config } from '../config'
import { registerEventHandlers } from './events'

let botStarted = false

export async function startBot(): Promise<void> {
  // Prevent double initialization
  if (botStarted || client.isReady()) {
    console.log('🤖 Bot is already running')
    return
  }

  if (!config.bot.token) {
    console.warn('⚠️ DISCORD_BOT_TOKEN is not set - bot will not start')
    return
  }

  try {
    // Register event handlers
    registerEventHandlers()

    // Login to Discord
    await client.login(config.bot.token)
    botStarted = true

    console.log('🤖 Bot started successfully as part of the unified system')
  } catch (error) {
    console.error('❌ Failed to start bot:', error)
  }
}

// Re-export services for use across the system
export { sendAdminNotification, updateMemberRole, logAction, sendUserDM, isBotReady, setupDashboard } from './services'
export { client } from './client'
