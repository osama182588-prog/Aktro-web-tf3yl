"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar
} from "lucide-react"

interface Stats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  todayRequests: number
  avgReviewTime: string
  approvalRate: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    )
  }

  const statCards = [
    {
      title: "إجمالي الطلبات",
      value: stats?.totalRequests || 0,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "طلبات قيد المراجعة",
      value: stats?.pendingRequests || 0,
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "طلبات مقبولة",
      value: stats?.approvedRequests || 0,
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "طلبات مرفوضة",
      value: stats?.rejectedRequests || 0,
      icon: XCircle,
      color: "text-error"
    },
    {
      title: "طلبات اليوم",
      value: stats?.todayRequests || 0,
      icon: Calendar,
      color: "text-info"
    },
    {
      title: "نسبة القبول",
      value: `${stats?.approvalRate || 0}%`,
      icon: TrendingUp,
      color: "text-success"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h1 className="text-2xl font-bold mb-2">نظرة عامة</h1>
        <p className="text-foreground/60">إحصائيات ومعلومات سريعة عن النظام</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="fade-in delay-300">
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/admin/requests?status=PENDING" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
              <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="font-medium">الطلبات المعلقة</p>
              <Badge variant="warning" className="mt-2">{stats?.pendingRequests || 0}</Badge>
            </a>
            <a href="/admin/questions" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
              <span className="text-2xl block mb-2">❓</span>
              <p className="font-medium">إدارة الأسئلة</p>
            </a>
            <a href="/admin/settings" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
              <span className="text-2xl block mb-2">⚙️</span>
              <p className="font-medium">الإعدادات</p>
            </a>
            <a href="/admin/logs" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center">
              <span className="text-2xl block mb-2">📋</span>
              <p className="font-medium">سجل النشاط</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
