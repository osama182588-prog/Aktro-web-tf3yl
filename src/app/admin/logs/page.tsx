'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Input } from '@/components/ui/Input'
import { formatDateTime } from '@/lib/utils'
import {
  Activity,
  User,
  CheckCircle,
  XCircle,
  Edit,
  HelpCircle,
  Settings,
  Search,
} from 'lucide-react'

interface AdminLog {
  id: string
  actionType: string
  admin: {
    username: string
    avatar: string | null
  }
  target?: {
    username: string
  } | null
  details: Record<string, unknown> | null
  createdAt: string
}

const actionIcons: Record<string, typeof CheckCircle> = {
  APPLICATION_APPROVED: CheckCircle,
  APPLICATION_REJECTED: XCircle,
  APPLICATION_MODIFICATION_REQUESTED: Edit,
  QUESTION_CREATED: HelpCircle,
  QUESTION_UPDATED: Edit,
  QUESTION_DELETED: XCircle,
  SETTINGS_UPDATED: Settings,
}

const actionLabels: Record<string, string> = {
  APPLICATION_APPROVED: 'قبول طلب',
  APPLICATION_REJECTED: 'رفض طلب',
  APPLICATION_MODIFICATION_REQUESTED: 'طلب تعديل',
  QUESTION_CREATED: 'إضافة سؤال',
  QUESTION_UPDATED: 'تعديل سؤال',
  QUESTION_DELETED: 'حذف سؤال',
  SETTINGS_UPDATED: 'تحديث الإعدادات',
  MAINTENANCE_TOGGLED: 'تبديل الصيانة',
  ROLE_SYNCED: 'مزامنة الرتب',
  BACKUP_CREATED: 'نسخة احتياطية',
}

const actionColors: Record<string, string> = {
  APPLICATION_APPROVED: 'text-green-400',
  APPLICATION_REJECTED: 'text-red-400',
  APPLICATION_MODIFICATION_REQUESTED: 'text-yellow-400',
  QUESTION_CREATED: 'text-blue-400',
  QUESTION_UPDATED: 'text-purple-400',
  QUESTION_DELETED: 'text-red-400',
  SETTINGS_UPDATED: 'text-gray-400',
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/logs')
        if (response.ok) {
          const data = await response.json()
          setLogs(data.logs || [])
        } else {
          // Mock data
          setLogs([
            {
              id: '1',
              actionType: 'APPLICATION_APPROVED',
              admin: { username: 'admin1', avatar: null },
              target: { username: 'user123' },
              details: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: '2',
              actionType: 'QUESTION_CREATED',
              admin: { username: 'admin2', avatar: null },
              target: null,
              details: { question: 'ما هو الرول بلاي؟' },
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: '3',
              actionType: 'APPLICATION_REJECTED',
              admin: { username: 'admin1', avatar: null },
              target: { username: 'player456' },
              details: { reason: 'عدم استيفاء الشروط' },
              createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
          ])
        }
      } catch {
        console.error('Error fetching logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'all' && log.actionType !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        log.admin.username.toLowerCase().includes(searchLower) ||
        log.target?.username.toLowerCase().includes(searchLower) ||
        actionLabels[log.actionType]?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">سجل النشاط</h1>
        <p className="text-gray-400">عرض جميع العمليات الإدارية</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="البحث في السجل..."
                  className="pr-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilter('APPLICATION_APPROVED')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === 'APPLICATION_APPROVED'
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  قبول
                </button>
                <button
                  onClick={() => setFilter('APPLICATION_REJECTED')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === 'APPLICATION_REJECTED'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  رفض
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              السجل
              <Badge variant="info" className="mr-auto">{filteredLogs.length} سجل</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="جاري تحميل السجل..." />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد سجلات</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredLogs.map((log, index) => {
                  const Icon = actionIcons[log.actionType] || Activity
                  return (
                    <motion.div
                      key={log.id}
                      className="p-4 hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-white/5 ${actionColors[log.actionType] || 'text-gray-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">
                              {actionLabels[log.actionType] || log.actionType}
                            </span>
                            {log.target && (
                              <>
                                <span className="text-gray-500">←</span>
                                <span className="text-gray-300">{log.target.username}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{log.admin.username}</span>
                            <span className="text-gray-600">•</span>
                            <span>{formatDateTime(log.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
