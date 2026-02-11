"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"
import { Loader } from "@/components/ui/Loader"
import { hasGeneralAdminRole } from "@/lib/config"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  GripVertical
} from "lucide-react"

interface Question {
  id: string
  text: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function AdminQuestionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      if (!hasGeneralAdminRole(session?.user?.roles || [])) {
        router.push("/admin")
      } else {
        fetchQuestions()
      }
    } else if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, session])

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions")
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.data || [])
      }
    } catch (err) {
      console.error("Error fetching questions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || newQuestion.length < 10) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newQuestion.trim(),
          order: questions.length,
        }),
      })

      if (res.ok) {
        setNewQuestion("")
        setShowAddForm(false)
        fetchQuestions()
      }
    } catch (err) {
      console.error("Error adding question:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateQuestion = async (id: string, updates: Partial<Question>) => {
    setSubmitting(true)

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        setEditingId(null)
        fetchQuestions()
      }
    } catch (err) {
      console.error("Error updating question:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchQuestions()
      }
    } catch (err) {
      console.error("Error deleting question:", err)
    }
  }

  const toggleActive = (question: Question) => {
    handleUpdateQuestion(question.id, { isActive: !question.isActive })
  }

  const startEditing = (question: Question) => {
    setEditingId(question.id)
    setEditText(question.text)
  }

  const saveEdit = () => {
    if (editingId && editText.trim().length >= 10) {
      handleUpdateQuestion(editingId, { text: editText.trim() })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            بنك الأسئلة
          </h1>
          <p className="text-gray-400">
            إدارة أسئلة اختبار التفعيل • {questions.filter(q => q.isActive).length} سؤال نشط
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/admin")} variant="ghost" className="gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة سؤال
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="mb-6 border-blue-500/30 fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>إضافة سؤال جديد</span>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="اكتب السؤال هنا (10 أحرف على الأقل)..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleAddQuestion} 
                loading={submitting}
                disabled={newQuestion.length < 10}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ السؤال
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="fade-in">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">لا توجد أسئلة بعد</p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة أول سؤال
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card 
              key={question.id} 
              className={`fade-in transition-all ${!question.isActive && "opacity-60"}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <GripVertical className="w-5 h-5 cursor-grab" />
                    <span className="font-mono text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    {editingId === question.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={saveEdit}
                            loading={submitting}
                            className="gap-1"
                          >
                            <Save className="w-4 h-4" />
                            حفظ
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-200">{question.text}</p>
                    )}
                  </div>

                  {editingId !== question.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(question)}
                        className={question.isActive ? "text-green-400" : "text-gray-500"}
                      >
                        {question.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(question)}
                        className="text-blue-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {questions.length > 0 && (
        <Card className="mt-8 fade-in">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">{questions.length}</p>
                <p className="text-gray-400 text-sm">إجمالي الأسئلة</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {questions.filter(q => q.isActive).length}
                </p>
                <p className="text-gray-400 text-sm">أسئلة نشطة</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">
                  {questions.filter(q => !q.isActive).length}
                </p>
                <p className="text-gray-400 text-sm">أسئلة معطلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
