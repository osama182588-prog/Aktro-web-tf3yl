export const siteConfig = {
  name: process.env.SITE_NAME || "Secret CFW",
  description: "منصة احترافية لإدارة تفعيل اللاعبين",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  
  // Navigation items
  navigation: [
    { name: "الرئيسية", href: "/" },
    { name: "الشروط والأحكام", href: "/terms" },
    { name: "التفعيل", href: "/activation" },
    { name: "التقديم على الوظائف", href: "/jobs" },
    { name: "المتصدرين", href: "/leaderboard" },
    { name: "Streamer", href: "/streamer" },
  ],
  
  // Admin navigation
  adminNavigation: [
    { name: "نظرة عامة", href: "/admin", icon: "LayoutDashboard" },
    { name: "الطلبات", href: "/admin/applications", icon: "FileText" },
    { name: "بنك الأسئلة", href: "/admin/questions", icon: "HelpCircle" },
    { name: "الردود السريعة", href: "/admin/replies", icon: "MessageSquare" },
    { name: "سجل النشاط", href: "/admin/logs", icon: "Activity" },
    { name: "الإعدادات", href: "/admin/settings", icon: "Settings" },
  ],
  
  // Theme colors
  theme: {
    primary: "#3B82F6", // Blue
    secondary: "#6B7280", // Gray
    accent: "#60A5FA",
    background: {
      dark: "#0F172A",
      light: "#F8FAFC",
    },
  },
  
  // Status labels in Arabic
  statusLabels: {
    PENDING: "غير مفعّل",
    UNDER_REVIEW: "قيد المراجعة",
    APPROVED: "مفعّل",
    REJECTED: "مرفوض",
    MODIFICATION_REQUESTED: "طلب تعديل",
  },
  
  // Admin role labels
  adminRoleLabels: {
    high: "إدارة عليا",
    activation: "إدارة التفعيل",
    general: "إدارة عامة",
  },
}

export type SiteConfig = typeof siteConfig
