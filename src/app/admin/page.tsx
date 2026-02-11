"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Loader } from "@/components/ui/Loader"
import { hasAdminRole } from "@/lib/config"
import Link from "next/link"
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  MessageSquare,
  Settings,
  RefreshCw,
  AlertCircle
} from "lucide-react"

interface Stats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  todayApplications: number
  approvalRate: number
  totalQuestions: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      if (!hasAdminRole(session?.user?.roles || [])) {
        router.push("/")
      } else {
        fetchStats()
      }
    } else if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, session])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data.data)
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    )
  }

  const quickLinks = [
    {
      href: "/admin/applications",
      icon: FileText,
      title: "إدارة الطلبات",
      description: "مراجعة طلبات التفعيل",
      count: stats?.pendingApplications,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      href: "/admin/questions",
      icon: MessageSquare,
      title: "بنك الأسئلة",
      description: "إدارة أسئلة الاختبار",
      count: stats?.totalQuestions,
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: "الإعدادات",
      description: "إعدادات النظام",
      color: "bg-gray-500/20 text-gray-400",
    },
  ]

  const statCards = [
    {
      title: "إجمالي الطلبات",
      value: stats?.totalApplications || 0,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "قيد المراجعة",
      value: stats?.pendingApplications || 0,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      title: "المقبولة",
      value: stats?.approvedApplications || 0,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "المرفوضة",
      value: stats?.rejectedApplications || 0,
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    {
      title: "طلبات اليوم",
      value: stats?.todayApplications || 0,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "نسبة القبول",
      value: `${stats?.approvalRate?.toFixed(1) || 0}%`,
      icon: AlertCircle,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-gray-400">
            مرحباً، {session?.user?.name} - نظرة عامة على النظام
          </p>
        </div>
        <Button onClick={fetchStats} variant="ghost" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <CardContent className="py-4">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.title}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickLinks.map((link, index) => (
          <Link key={index} href={link.href}>
            <Card 
              hover 
              className="h-full fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="py-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-4`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  {link.count !== undefined && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                      {link.count}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-1">
                  {link.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="fade-in">
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            سيتم عرض النشاط الأخير هنا
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
