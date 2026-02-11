import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { setupEvents } from './events'
import { setupCommands } from './commands'

export async function createBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
  })

  // Setup event handlers
  setupEvents(client)

  // Setup commands
  await setupCommands(client)

  // Login
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    console.error('DISCORD_BOT_TOKEN is not set')
    return null
  }

  try {
    await client.login(token)
    console.log(`🤖 Bot logged in as ${client.user?.tag}`)
    return client
  } catch (error) {
    console.error('Failed to login bot:', error)
    return null
  }
}

export default createBot
