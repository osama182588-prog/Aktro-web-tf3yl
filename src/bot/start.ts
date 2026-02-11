import { createBot } from './index'

// Start the Discord bot
async function main() {
  console.log('🚀 Starting Discord bot...')
  
  const client = await createBot()
  
  if (client) {
    console.log('✅ Discord bot started successfully')
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('🛑 Shutting down bot...')
      client.destroy()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('🛑 Shutting down bot...')
      client.destroy()
      process.exit(0)
    })
  } else {
    console.error('❌ Failed to start bot')
    process.exit(1)
  }
}

main().catch(console.error)
