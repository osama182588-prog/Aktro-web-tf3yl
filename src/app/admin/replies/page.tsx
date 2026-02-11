'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Save,
  X as XIcon,
  CheckCircle,
  XCircle,
  Edit2,
} from 'lucide-react'

interface QuickReply {
  id: string
  title: string
  content: string
  category: 'approval' | 'rejection' | 'modification'
  isActive: boolean
}

const categoryLabels = {
  approval: 'قبول',
  rejection: 'رفض',
  modification: 'تعديل',
}

const categoryColors = {
  approval: 'success',
  rejection: 'danger',
  modification: 'warning',
} as const

const categoryIcons = {
  approval: CheckCircle,
  rejection: XCircle,
  modification: Edit2,
}

export default function RepliesPage() {
  const [replies, setReplies] = useState<QuickReply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReply, setNewReply] = useState<{
    title: string
    content: string
    category: 'approval' | 'rejection' | 'modification'
  }>({
    title: '',
    content: '',
    category: 'approval',
  })

  useEffect(() => {
    fetchReplies()
  }, [])

  const fetchReplies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/replies')
      if (response.ok) {
        const data = await response.json()
        setReplies(data.replies || [])
      } else {
        // Mock data
        setReplies([
          {
            id: '1',
            title: 'قبول - استيفاء الشروط',
            content: 'تهانينا! تم قبول طلبك. نرحب بك في مجتمعنا.',
            category: 'approval',
            isActive: true,
          },
          {
            id: '2',
            title: 'رفض - عمر غير مناسب',
            content: 'للأسف، لا يمكننا قبول طلبك حالياً بسبب عدم استيفاء شرط العمر.',
            category: 'rejection',
            isActive: true,
          },
          {
            id: '3',
            title: 'تعديل - قصة قصيرة',
            content: 'يرجى توسيع قصة الشخصية وإضافة المزيد من التفاصيل.',
            category: 'modification',
            isActive: true,
          },
        ])
      }
    } catch {
      console.error('Error fetching replies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReply = async () => {
    if (!newReply.title.trim() || !newReply.content.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReply),
      })

      if (response.ok) {
        await fetchReplies()
      } else {
        // Mock add
        setReplies(prev => [...prev, {
          id: Date.now().toString(),
          ...newReply,
          isActive: true,
        }])
      }
      setNewReply({ title: '', content: '', category: 'approval' })
      setIsAdding(false)
    } catch {
      console.error('Error adding reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateReply = async () => {
    if (!editingReply) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/replies/${editingReply.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReply),
      })

      if (response.ok) {
        await fetchReplies()
      } else {
        setReplies(prev => prev.map(r => r.id === editingReply.id ? editingReply : r))
      }
      setEditingReply(null)
    } catch {
      console.error('Error updating reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReply = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرد؟')) return

    try {
      const response = await fetch(`/api/admin/replies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchReplies()
      } else {
        setReplies(prev => prev.filter(r => r.id !== id))
      }
    } catch {
      console.error('Error deleting reply')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">الردود السريعة</h1>
          <p className="text-gray-400">إدارة قوالب الردود للمراجعة السريعة</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
          إضافة رد
        </Button>
      </motion.div>

      {/* Category Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {(['approval', 'rejection', 'modification'] as const).map((category) => {
          const Icon = categoryIcons[category]
          const count = replies.filter(r => r.category === category).length
          return (
            <Card key={category}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    category === 'approval' ? 'bg-green-500/20' :
                    category === 'rejection' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      category === 'approval' ? 'text-green-400' :
                      category === 'rejection' ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-sm text-gray-400">ردود {categoryLabels[category]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Add Reply Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-500/30">
            <CardHeader>
              <CardTitle>إضافة رد سريع جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="العنوان"
                placeholder="عنوان الرد..."
                value={newReply.title}
                onChange={(e) => setNewReply({ ...newReply, title: e.target.value })}
              />
              <Textarea
                label="المحتوى"
                placeholder="محتوى الرد..."
                value={newReply.content}
                onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">التصنيف</label>
                <div className="flex gap-2">
                  {(['approval', 'rejection', 'modification'] as const).map((category) => (
                    <button
                      key={category}
                      onClick={() => setNewReply({ ...newReply, category })}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        newReply.category === category
                          ? category === 'approval' ? 'bg-green-500/20 text-green-400' :
                            category === 'rejection' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddReply} isLoading={isSubmitting}>
                  <Save className="w-4 h-4" />
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Replies List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              الردود المحفوظة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="جاري تحميل الردود..." />
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد ردود محفوظة</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {replies.map((reply, index) => (
                  <motion.div
                    key={reply.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {editingReply?.id === reply.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingReply.title}
                          onChange={(e) => setEditingReply({
                            ...editingReply,
                            title: e.target.value
                          })}
                        />
                        <Textarea
                          value={editingReply.content}
                          onChange={(e) => setEditingReply({
                            ...editingReply,
                            content: e.target.value
                          })}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditingReply(null)}>
                            <XIcon className="w-4 h-4" />
                            إلغاء
                          </Button>
                          <Button size="sm" onClick={handleUpdateReply} isLoading={isSubmitting}>
                            <Save className="w-4 h-4" />
                            حفظ
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-medium">{reply.title}</p>
                            <Badge variant={categoryColors[reply.category]}>
                              {categoryLabels[reply.category]}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{reply.content}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditingReply(reply)}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
