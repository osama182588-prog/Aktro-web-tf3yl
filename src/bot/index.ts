import { Client, GatewayIntentBits, Partials, Events, ActivityType } from 'discord.js'
import { registerCommands } from './commands'
import { setupDashboard } from './utils/dashboard'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
})

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Bot logged in as ${readyClient.user.tag}`)
  
  // Set presence
  readyClient.user.setPresence({
    activities: [{ name: 'Secret CFW | /status', type: ActivityType.Watching }],
    status: 'online',
  })

  // Register slash commands
  await registerCommands(readyClient)

  // Setup dashboard message in designated channel
  const dashboardChannelId = process.env.DISCORD_ACTIVATION_DASHBOARD_CHANNEL_ID
  if (dashboardChannelId) {
    await setupDashboard(readyClient, dashboardChannelId)
  }

  console.log('✅ Bot is ready!')
})

// Error handling
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error)
})

// Export for use in the unified server
export { client }

// Start the bot if running standalone
const token = process.env.DISCORD_BOT_TOKEN
if (token) {
  client.login(token).catch((error) => {
    console.error('Failed to login:', error)
  })
} else {
  console.warn('⚠️ DISCORD_BOT_TOKEN not set, bot will not start')
}
