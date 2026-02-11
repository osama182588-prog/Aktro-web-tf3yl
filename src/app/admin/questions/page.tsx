"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  ToggleLeft,
  ToggleRight
} from "lucide-react"

interface Question {
  id: string
  question: string
  isActive: boolean
  order: number
  createdAt: string
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    try {
      const res = await fetch("/api/admin/questions")
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!newQuestion.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion })
      })
      
      if (res.ok) {
        setNewQuestion("")
        setShowAddForm(false)
        fetchQuestions()
      }
    } catch (error) {
      console.error("Failed to add question:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!editingText.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: editingText })
      })
      
      if (res.ok) {
        setEditingId(null)
        setEditingText("")
        fetchQuestions()
      }
    } catch (error) {
      console.error("Failed to update question:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id: string, currentState: boolean) {
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState })
      })
      
      if (res.ok) {
        fetchQuestions()
      }
    } catch (error) {
      console.error("Failed to toggle question:", error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return
    
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        fetchQuestions()
      }
    } catch (error) {
      console.error("Failed to delete question:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold mb-2">بنك الأسئلة</h1>
          <p className="text-foreground/60">إدارة أسئلة اختبار التفعيل</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة سؤال
        </Button>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <Card className="fade-in">
          <CardHeader>
            <CardTitle>إضافة سؤال جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="اكتب السؤال هنا..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-3">
              <Button onClick={handleAdd} loading={saving} className="gap-2">
                <Save className="w-4 h-4" />
                حفظ
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : questions.length === 0 ? (
        <Card className="fade-in">
          <CardContent className="py-12 text-center">
            <p className="text-foreground/60 mb-4">لا توجد أسئلة بعد</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة أول سؤال
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card 
              key={question.id} 
              className={`fade-in ${!question.isActive ? "opacity-60" : ""}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="py-4">
                {editingId === question.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdate(question.id)}
                        loading={saving}
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />
                        حفظ
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingId(null)
                          setEditingText("")
                        }}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground">{question.question}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={question.isActive ? "success" : "default"}>
                          {question.isActive ? "مفعل" : "معطل"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggle(question.id, question.isActive)}
                        title={question.isActive ? "تعطيل" : "تفعيل"}
                      >
                        {question.isActive ? (
                          <ToggleRight className="w-5 h-5 text-success" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-foreground/40" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(question.id)
                          setEditingText(question.question)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(question.id)}
                        className="text-error hover:bg-error/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
