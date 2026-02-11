"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { hasAdminRole } from "@/lib/config"
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Shield,
  ChevronDown
} from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const isAdmin = session?.user?.roles ? hasAdminRole(session.user.roles) : false

  const navLinks = [
    { href: "/terms", label: "الشروط والأحكام", icon: FileText },
    { href: "/activation", label: "التفعيل", icon: Shield },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mt-4 rounded-2xl border border-gray-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-100 glow-text hidden sm:block">
                Secret CFW
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {status === "loading" ? (
                <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-800/50 transition-colors"
                  >
                    <img
                      src={session.user.image || "/default-avatar.png"}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full ring-2 ring-blue-500/50"
                    />
                    <span className="hidden sm:block text-gray-200">
                      {session.user.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 glass-card rounded-xl py-2 shadow-xl">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        لوحة التحكم
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:text-red-300 hover:bg-gray-700/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={() => signIn("discord")} size="sm">
                  تسجيل الدخول
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    لوحة التحكم الإدارية
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
