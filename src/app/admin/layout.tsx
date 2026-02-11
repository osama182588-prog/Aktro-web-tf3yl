'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { LoadingSpinner } from '@/components/ui/Loading'
import { siteConfig } from '@/lib/config'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  MessageSquare,
  Activity,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronLeft,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const iconMap = {
  LayoutDashboard,
  FileText,
  HelpCircle,
  MessageSquare,
  Activity,
  Settings,
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + pathname)
    } else if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/')
    }
  }, [status, session, router, pathname])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  const adminRoleLabel = siteConfig.adminRoleLabels[session.user.adminRole || 'general']

  return (
    <div className="min-h-screen flex">
      <AnimatedBackground />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed lg:static inset-y-0 right-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-l border-white/10',
          'transform lg:transform-none transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <div>
                  <span className="text-white font-bold block">{siteConfig.name}</span>
                  <span className="text-xs text-gray-400">لوحة التحكم</span>
                </div>
              </Link>
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/5"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {siteConfig.adminNavigation.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <motion.div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    )}
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <ChevronLeft className="w-4 h-4 mr-auto" />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || ''}
                  className="w-10 h-10 rounded-xl"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{session.user?.name}</p>
                <p className="text-xs text-gray-400">{adminRoleLabel}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-white/5"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
            
            <div className="flex items-center gap-4 mr-auto">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                العودة للموقع
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
