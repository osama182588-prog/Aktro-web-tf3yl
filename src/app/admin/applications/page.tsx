'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatDateTime } from '@/lib/utils'
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Check,
  X as XIcon,
  Edit,
  Clock,
  Star,
  User,
  MessageSquare,
} from 'lucide-react'

interface Application {
  id: string
  user: {
    id: string
    username: string
    discordId: string
    avatar: string | null
  }
  realName: string
  age: number
  characterName: string
  characterStory: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUESTED'
  isPriority: boolean
  createdAt: string
  answers: { question: { question: string }; answerText: string }[]
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [statusFilter])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)
      
      const response = await fetch(`/api/admin/applications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        // Mock data
        setApplications([
          {
            id: '1',
            user: { id: '1', username: 'ahmed123', discordId: '123', avatar: null },
            realName: 'أحمد محمد',
            age: 22,
            characterName: 'خالد العتيبي',
            characterStory: 'شخصية من الرياض تعمل في مجال التجارة...',
            status: 'UNDER_REVIEW',
            isPriority: true,
            createdAt: new Date().toISOString(),
            answers: [
              { question: { question: 'ما هو الـ Roleplay؟' }, answerText: 'الرول بلاي هو...' }
            ],
          },
          {
            id: '2',
            user: { id: '2', username: 'sara_gamer', discordId: '456', avatar: null },
            realName: 'سارة أحمد',
            age: 20,
            characterName: 'نورة الشمري',
            characterStory: 'فتاة طموحة من جدة...',
            status: 'PENDING',
            isPriority: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            answers: [
              { question: { question: 'ما هو الـ Roleplay؟' }, answerText: 'هو تقمص الشخصيات...' }
            ],
          },
        ])
      }
    } catch {
      console.error('Error fetching applications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: 'approve' | 'reject' | 'request_modification') => {
    if (!selectedApp) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: adminNote }),
      })
      
      if (response.ok) {
        await fetchApplications()
        setSelectedApp(null)
        setAdminNote('')
      }
    } catch {
      console.error('Error performing action')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        app.realName.toLowerCase().includes(query) ||
        app.characterName.toLowerCase().includes(query) ||
        app.user.username.toLowerCase().includes(query)
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
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الطلبات</h1>
          <p className="text-gray-400">مراجعة طلبات التفعيل واتخاذ القرارات</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">{filteredApplications.length} طلب</Badge>
        </div>
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
                  placeholder="البحث بالاسم أو اسم المستخدم..."
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['all', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {status === 'all' ? 'الكل' : 
                     status === 'PENDING' ? 'منتظر' :
                     status === 'UNDER_REVIEW' ? 'قيد المراجعة' :
                     status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applications List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          className="lg:col-span-2 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="جاري تحميل الطلبات..." />
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">لا توجد طلبات</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card
                  hover
                  className={`cursor-pointer ${selectedApp?.id === app.id ? 'border-blue-500/50' : ''}`}
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium truncate">{app.realName}</p>
                          {app.isPriority && (
                            <Badge variant="priority" className="flex-shrink-0">
                              <Star className="w-3 h-3" />
                              أولوية
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {app.characterName} • {app.user.username}
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <StatusBadge status={app.status} />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(app.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Detail Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {selectedApp ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>تفاصيل الطلب</span>
                  <StatusBadge status={selectedApp.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الاسم الحقيقي</p>
                    <p className="text-white">{selectedApp.realName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">العمر</p>
                    <p className="text-white">{selectedApp.age} سنة</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">اسم الشخصية</p>
                    <p className="text-white">{selectedApp.characterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">قصة الشخصية</p>
                    <p className="text-gray-300 text-sm">{selectedApp.characterStory}</p>
                  </div>
                </div>

                {/* Answers */}
                {selectedApp.answers.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-3">إجابات الاختبار</p>
                    {selectedApp.answers.map((answer, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="text-sm text-gray-400 mb-1">{answer.question.question}</p>
                        <p className="text-gray-300 text-sm">{answer.answerText}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Note */}
                {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'REJECTED' && (
                  <div className="pt-4 border-t border-white/10">
                    <Textarea
                      label="ملاحظة للمتقدم"
                      placeholder="اكتب ملاحظتك هنا..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>
                )}

                {/* Actions */}
                {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'REJECTED' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      onClick={() => handleAction('approve')}
                      isLoading={isSubmitting}
                    >
                      <Check className="w-4 h-4" />
                      قبول
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      onClick={() => handleAction('request_modification')}
                      isLoading={isSubmitting}
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      onClick={() => handleAction('reject')}
                      isLoading={isSubmitting}
                    >
                      <XIcon className="w-4 h-4" />
                      رفض
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">اختر طلباً لعرض التفاصيل</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
