"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"

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

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({ text: "", order: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/questions")
    } else if (session && !session.user.isGeneralAdmin && !session.user.isHighAdmin) {
      router.push("/admin")
    } else if (session?.user.isAdmin) {
      fetchQuestions()
    }
  }, [session, status])

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions")
      const data = await res.json()
      if (data.success) {
        setQuestions(data.data)
      }
    } catch (err) {
      console.error("Error fetching questions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = editingQuestion ? "PUT" : "POST"
      const body = editingQuestion
        ? { id: editingQuestion.id, ...formData }
        : formData

      const res = await fetch("/api/questions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.success) {
        setShowForm(false)
        setEditingQuestion(null)
        setFormData({ text: "", order: 0 })
        fetchQuestions()
      } else {
        alert(data.error || "حدث خطأ")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("حدث خطأ في الخادم")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (question: Question) => {
    try {
      const res = await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: question.id,
          isActive: !question.isActive,
        }),
      })

      const data = await res.json()
      if (data.success) {
        fetchQuestions()
      }
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const deleteQuestion = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return

    try {
      const res = await fetch(`/api/questions?id=${id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (data.success) {
        fetchQuestions()
      } else {
        alert(data.error || "حدث خطأ")
      }
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const startEdit = (question: Question) => {
    setEditingQuestion(question)
    setFormData({ text: question.text, order: question.order })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingQuestion(null)
    setFormData({ text: "", order: 0 })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/admin" className="text-gray-400 hover:text-blue-400">
              لوحة التحكم
            </Link>
            <span className="text-gray-600 mx-2">/</span>
            <span className="text-white">بنك الأسئلة</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">بنك الأسئلة</h1>
              <p className="text-gray-400 mt-2">
                إدارة أسئلة اختبار التفعيل
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-glow flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              إضافة سؤال
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-gray-400">لا توجد أسئلة بعد</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`glass-card p-6 ${
                    !question.isActive ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                          {index + 1}
                        </span>
                        {!question.isActive && (
                          <span className="status-inactive text-xs px-2 py-1 rounded">
                            معطل
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300">{question.text}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(question)}
                        className={`p-2 rounded-lg transition-all ${
                          question.isActive
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                        }`}
                        title={question.isActive ? "تعطيل" : "تفعيل"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              question.isActive
                                ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            }
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => startEdit(question)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                        title="تعديل"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      {session?.user.isHighAdmin && (
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          title="حذف"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info */}
          <div className="glass-card p-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">معلومات</h3>
                <p className="text-gray-400 text-sm">
                  عدد الأسئلة الفعالة: {questions.filter((q) => q.isActive).length}
                  <br />
                  عدد الأسئلة في كل اختبار: {process.env.NEXT_PUBLIC_QUIZ_QUESTION_COUNT || 5}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="glass-card w-full max-w-lg">
            <div className="p-6 border-b border-[rgba(59,130,246,0.2)]">
              <h2 className="text-xl font-bold text-white">
                {editingQuestion ? "تعديل السؤال" : "إضافة سؤال جديد"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">نص السؤال</label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, text: e.target.value }))
                  }
                  className="textarea-styled"
                  placeholder="اكتب نص السؤال هنا..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">الترتيب</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input-styled w-32"
                  min="0"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-glow flex-1 flex items-center justify-center gap-2"
                >
                  {saving && <div className="spinner w-5 h-5" />}
                  {editingQuestion ? "حفظ التعديلات" : "إضافة السؤال"}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="flex-1 py-3 px-6 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-700/50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
