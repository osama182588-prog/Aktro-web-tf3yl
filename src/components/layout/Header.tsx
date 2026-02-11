'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { AdminRole } from '@/generated/prisma';

export default function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.adminRole && session.user.adminRole !== AdminRole.NONE;

  const navLinks = [
    { href: '/terms', label: 'الشروط والأحكام' },
    { href: '/activation', label: 'التفعيل' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50" />
      
      <nav className="relative container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Secret CFW
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                href="/admin"
                className="text-blue-400 hover:text-blue-300 transition-colors relative group"
              >
                لوحة التحكم
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </Link>
            )}

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="w-8 h-8 rounded-full border-2 border-blue-500/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {session.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="hidden lg:inline">{session.user?.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                >
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => signIn('discord')}
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                تسجيل الدخول
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-700/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  لوحة التحكم
                </Link>
              )}

              {session ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    لوحة العضو
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                  >
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => signIn('discord')}
                  className="w-full"
                >
                  تسجيل الدخول عبر Discord
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
