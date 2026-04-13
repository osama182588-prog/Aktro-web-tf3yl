// Next.js Instrumentation
// يتم تشغيل هذا الملف عند بدء تشغيل الخادم
// يُستخدم لتشغيل البوت مع الموقع كنظام موحد

export async function register() {
  // Only run on the server side (Node.js runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startBot } = await import('./src/lib/bot/index')
    console.log('🚀 Starting unified system (Website + Bot)...')
    await startBot()
  }
}
