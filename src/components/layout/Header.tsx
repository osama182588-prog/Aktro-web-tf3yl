'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, LogIn, LogOut, Shield } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/config'
import { Button } from '@/components/ui/Button'
import { useSession, signIn, signOut } from 'next-auth/react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isActive = (href: string) => pathname === href

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <motion.nav
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl font-bold text-white">S</span>
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </motion.div>
              <span className="text-xl font-bold text-white hidden sm:block">
                {siteConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {siteConfig.navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.span
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                      isActive(item.href)
                        ? 'text-white bg-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.span>
                </Link>
              ))}
              
              {/* Admin Panel Link - Only for admins */}
              {session?.user?.isAdmin && (
                <Link href="/admin">
                  <motion.span
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2',
                      pathname.startsWith('/admin')
                        ? 'text-white bg-purple-500/20'
                        : 'text-purple-400 hover:text-white hover:bg-purple-500/10'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shield size={16} />
                    لوحة التحكم
                  </motion.span>
                </Link>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {status === 'loading' ? (
                <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ''}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-300">{session.user?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    <LogOut size={18} />
                    خروج
                  </Button>
                </div>
              ) : (
                <Button variant="primary" size="sm" onClick={() => signIn('discord')}>
                  <LogIn size={18} />
                  تسجيل الدخول
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <motion.div
            className={cn('lg:hidden overflow-hidden', isMenuOpen ? 'block' : 'hidden')}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span
                    className={cn(
                      'block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                      isActive(item.href)
                        ? 'text-white bg-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              
              {session?.user?.isAdmin && (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                  <span className="block px-4 py-3 rounded-xl text-sm font-medium text-purple-400 hover:text-white hover:bg-purple-500/10 transition-all duration-300">
                    <Shield className="inline-block w-4 h-4 me-2" />
                    لوحة التحكم
                  </span>
                </Link>
              )}
              
              <div className="pt-4 border-t border-white/10">
                {session ? (
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      {session.user?.image && (
                        <img
                          src={session.user.image}
                          alt={session.user.name || ''}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-sm text-gray-300">{session.user?.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => signOut()}>
                      <LogOut size={18} />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => signIn('discord')}
                  >
                    <LogIn size={18} />
                    تسجيل الدخول بـ Discord
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.nav>
      </div>
    </header>
  )
}
