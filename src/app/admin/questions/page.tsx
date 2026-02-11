'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Save,
  X as XIcon,
} from 'lucide-react'

interface Question {
  id: string
  question: string
  isActive: boolean
  order: number
  createdAt: string
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/questions')
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || [])
      } else {
        // Mock data
        setQuestions([
          { id: '1', question: 'ما هو الـ Roleplay؟', isActive: true, order: 1, createdAt: new Date().toISOString() },
          { id: '2', question: 'ما هو الـ Metagaming وكيف تتجنبه؟', isActive: true, order: 2, createdAt: new Date().toISOString() },
          { id: '3', question: 'اشرح مفهوم Breaking Character', isActive: true, order: 3, createdAt: new Date().toISOString() },
          { id: '4', question: 'ما هو الـ RDM وما عقوبته؟', isActive: false, order: 4, createdAt: new Date().toISOString() },
          { id: '5', question: 'كيف تتصرف إذا واجهت مشكلة مع لاعب آخر؟', isActive: true, order: 5, createdAt: new Date().toISOString() },
        ])
      }
    } catch {
      console.error('Error fetching questions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion }),
      })
      
      if (response.ok) {
        await fetchQuestions()
        setNewQuestion('')
        setIsAdding(false)
      } else {
        // Mock add
        setQuestions(prev => [...prev, {
          id: Date.now().toString(),
          question: newQuestion,
          isActive: true,
          order: prev.length + 1,
          createdAt: new Date().toISOString(),
        }])
        setNewQuestion('')
        setIsAdding(false)
      }
    } catch {
      console.error('Error adding question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: editingQuestion.question }),
      })
      
      if (response.ok) {
        await fetchQuestions()
      } else {
        // Mock update
        setQuestions(prev => prev.map(q => 
          q.id === editingQuestion.id ? editingQuestion : q
        ))
      }
      setEditingQuestion(null)
    } catch {
      console.error('Error updating question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (question: Question) => {
    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !question.isActive }),
      })
      
      if (response.ok) {
        await fetchQuestions()
      } else {
        // Mock toggle
        setQuestions(prev => prev.map(q => 
          q.id === question.id ? { ...q, isActive: !q.isActive } : q
        ))
      }
    } catch {
      console.error('Error toggling question')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return
    
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchQuestions()
      } else {
        // Mock delete
        setQuestions(prev => prev.filter(q => q.id !== id))
      }
    } catch {
      console.error('Error deleting question')
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
          <h1 className="text-3xl font-bold text-white mb-2">بنك الأسئلة</h1>
          <p className="text-gray-400">إدارة أسئلة اختبار التفعيل</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
          إضافة سؤال
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <HelpCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{questions.length}</p>
                <p className="text-sm text-gray-400">إجمالي الأسئلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <ToggleRight className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{questions.filter(q => q.isActive).length}</p>
                <p className="text-sm text-gray-400">أسئلة مفعّلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-500/20">
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{questions.filter(q => !q.isActive).length}</p>
                <p className="text-sm text-gray-400">أسئلة معطّلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Question Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-500/30">
            <CardHeader>
              <CardTitle>إضافة سؤال جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="اكتب السؤال هنا..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddQuestion} isLoading={isSubmitting}>
                  <Save className="w-4 h-4" />
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Questions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="جاري تحميل الأسئلة..." />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد أسئلة بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {editingQuestion?.id === question.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editingQuestion.question}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            question: e.target.value
                          })}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditingQuestion(null)}>
                            <XIcon className="w-4 h-4" />
                            إلغاء
                          </Button>
                          <Button size="sm" onClick={handleUpdateQuestion} isLoading={isSubmitting}>
                            <Save className="w-4 h-4" />
                            حفظ
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-white ${!question.isActive ? 'opacity-50' : ''}`}>
                            {question.question}
                          </p>
                        </div>
                        <Badge variant={question.isActive ? 'success' : 'default'}>
                          {question.isActive ? 'مفعّل' : 'معطّل'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(question)}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                          >
                            {question.isActive ? (
                              <ToggleRight className="w-5 h-5 text-green-400" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingQuestion(question)}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
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
