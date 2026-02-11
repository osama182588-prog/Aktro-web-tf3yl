"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { isAdmin } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  Settings, 
  History,
  ChevronLeft
} from "lucide-react"

const adminNavLinks = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/requests", label: "طلبات التفعيل", icon: FileText },
  { href: "/admin/questions", label: "بنك الأسئلة", icon: HelpCircle },
  { href: "/admin/logs", label: "سجل النشاط", icon: History },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user || !isAdmin(session.user)) {
      router.push("/")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!session?.user || !isAdmin(session.user)) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="glass rounded-xl p-4 sticky top-24">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gradient">لوحة التحكم</h2>
              <p className="text-sm text-foreground/60">إدارة النظام</p>
            </div>
            
            <nav className="space-y-1">
              {adminNavLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all",
                      isActive 
                        ? "bg-primary text-white" 
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                    {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
