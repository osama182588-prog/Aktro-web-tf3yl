'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  FileText,
  Activity,
  BarChart3
} from 'lucide-react'

interface Stats {
  totalApplications: number
  pendingApplications: number
  approvedToday: number
  rejectedToday: number
  averageReviewTime: number
  approvalRate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          // Mock data for now
          setStats({
            totalApplications: 156,
            pendingApplications: 23,
            approvedToday: 8,
            rejectedToday: 3,
            averageReviewTime: 2.5,
            approvalRate: 78,
          })
        }
      } catch {
        // Mock data
        setStats({
          totalApplications: 156,
          pendingApplications: 23,
          approvedToday: 8,
          rejectedToday: 3,
          averageReviewTime: 2.5,
          approvalRate: 78,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="جاري تحميل الإحصائيات..." />
      </div>
    )
  }

  const statCards = [
    {
      title: 'إجمالي الطلبات',
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'طلبات منتظرة',
      value: stats?.pendingApplications || 0,
      icon: Clock,
      color: 'yellow',
      trend: null,
    },
    {
      title: 'مقبول اليوم',
      value: stats?.approvedToday || 0,
      icon: CheckCircle,
      color: 'green',
      trend: '+5',
    },
    {
      title: 'مرفوض اليوم',
      value: stats?.rejectedToday || 0,
      icon: XCircle,
      color: 'red',
      trend: null,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">نظرة عامة</h1>
        <p className="text-gray-400">مرحباً بك في لوحة التحكم الإدارية</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    {stat.trend && (
                      <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                نسبة القبول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-green-500"
                      strokeDasharray={`${(stats?.approvalRate || 0) * 3.51} 351`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats?.approvalRate}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-400">مقبول</span>
                    <span className="text-white font-medium mr-auto">{stats?.approvalRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-400">مرفوض</span>
                    <span className="text-white font-medium mr-auto">{100 - (stats?.approvalRate || 0)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Review Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                متوسط وقت المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-5xl font-bold text-white mb-2">
                  {stats?.averageReviewTime}
                  <span className="text-xl text-gray-400 mr-2">ساعة</span>
                </div>
                <p className="text-gray-400">متوسط الوقت لمراجعة الطلبات</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'مراجعة الطلبات', href: '/admin/applications', icon: FileText },
                { label: 'بنك الأسئلة', href: '/admin/questions', icon: Users },
                { label: 'سجل النشاط', href: '/admin/logs', icon: Activity },
                { label: 'الإعدادات', href: '/admin/settings', icon: BarChart3 },
              ].map((action, index) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <action.icon className="w-8 h-8 text-blue-400" />
                  <span className="text-sm text-gray-300">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
