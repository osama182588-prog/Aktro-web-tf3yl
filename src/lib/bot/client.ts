// Discord Bot Client Singleton
// عميل البوت - يُنشأ مرة واحدة ويُستخدم في كل النظام

import { Client, GatewayIntentBits, Partials } from 'discord.js'

const globalForBot = globalThis as unknown as {
  discordClient: Client | undefined
}

function createClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  })
}

export const client = globalForBot.discordClient ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForBot.discordClient = client
}
