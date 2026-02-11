"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth"
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  FileText, 
  Briefcase, 
  Trophy, 
  Monitor,
  Zap
} from "lucide-react"

const navLinks = [
  { href: "/terms", label: "الشروط والأحكام", icon: FileText },
  { href: "/activation", label: "التفعيل", icon: Zap },
  { href: "/jobs", label: "التقديم على الوظائف", icon: Briefcase },
  { href: "/leaderboard", label: "المتصدرين", icon: Trophy },
  { href: "/streamer", label: "Streamer", icon: Monitor },
]

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userIsAdmin = session?.user ? isAdmin(session.user) : false

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">Secret CFW</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            
            {userIsAdmin && (
              <Link
                href="/admin"
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                لوحة التحكم
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="spinner w-6 h-6" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-foreground/80 hover:text-foreground">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {session.user.discordAvatar ? (
                      <img 
                        src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.discordAvatar}.png`}
                        alt={session.user.discordUsername}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm">{session.user.discordUsername}</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signOut()}
                  className="text-error hover:bg-error/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn("discord")}>
                تسجيل الدخول
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              
              {userIsAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  لوحة التحكم
                </Link>
              )}

              {session && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  لوحتي
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
