"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  Settings, 
  Activity,
  Shield,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Home
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/requests", label: "الطلبات", icon: FileText },
  { href: "/admin/questions", label: "بنك الأسئلة", icon: HelpCircle },
  { href: "/admin/logs", label: "سجل النشاط", icon: Activity },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // التحقق من صلاحية الإدارة
  const isAdmin = session?.user?.roles?.some(role => 
    [
      process.env.NEXT_PUBLIC_DISCORD_ROLE_SENIOR_ADMIN,
      process.env.NEXT_PUBLIC_DISCORD_ROLE_ACTIVATION_ADMIN,
      process.env.NEXT_PUBLIC_DISCORD_ROLE_GENERAL_ADMIN
    ].includes(role)
  );

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
    }
  }, [status, isAdmin, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4">غير مصرح لك</h1>
          <p className="text-gray-400 mb-4">ليس لديك صلاحية الوصول لهذه الصفحة</p>
          <Link href="/" className="btn-primary">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Sidebar للكمبيوتر */}
      <aside 
        className={`hidden lg:flex flex-col fixed right-0 top-0 h-full bg-[#1e293b] border-l border-white/10 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* الشعار */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-gradient">لوحة التحكم</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* القائمة */}
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* الأسفل */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white mb-2"
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>الموقع الرئيسي</span>}
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b] border-b border-white/10 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <span className="font-bold">لوحة التحكم</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="lg:hidden fixed inset-0 top-16 bg-[#1e293b] z-40 p-4"
        >
          <nav>
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}

      {/* المحتوى الرئيسي */}
      <main className={`flex-grow transition-all duration-300 ${sidebarOpen ? 'lg:mr-64' : 'lg:mr-20'} mt-16 lg:mt-0`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
