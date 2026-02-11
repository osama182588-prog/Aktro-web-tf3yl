"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

interface Question {
  id: string
  text: string
}

interface FormData {
  realName: string
  age: string
  characterName: string
  characterStory: string
  quizAnswers: { questionId: string; question: string; answer: string }[]
}

export default function ActivationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [existingRequest, setExistingRequest] = useState<{
    status: string
    canResubmit: boolean
  } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    realName: "",
    age: "",
    characterName: "",
    characterStory: "",
    quizAnswers: [],
  })

  // Check if user has existing request
  useEffect(() => {
    if (session) {
      checkExistingRequest()
      fetchQuestions()
    }
  }, [session])

  const checkExistingRequest = async () => {
    try {
      const res = await fetch("/api/activation/status")
      const data = await res.json()
      if (data.success && data.data) {
        setExistingRequest(data.data)
      }
    } catch (err) {
      console.error("Error checking status:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions/random")
      const data = await res.json()
      if (data.success && data.data) {
        setQuestions(data.data)
        setFormData((prev) => ({
          ...prev,
          quizAnswers: data.data.map((q: Question) => ({
            questionId: q.id,
            question: q.text,
            answer: "",
          })),
        }))
      }
    } catch (err) {
      console.error("Error fetching questions:", err)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleQuizAnswerChange = (questionId: string, answer: string) => {
    setFormData((prev) => ({
      ...prev,
      quizAnswers: prev.quizAnswers.map((qa) =>
        qa.questionId === questionId ? { ...qa, answer } : qa
      ),
    }))
  }

  const validateStep1 = () => {
    if (!formData.realName.trim()) {
      setError("يرجى إدخال اسمك الحقيقي")
      return false
    }
    if (!formData.age || parseInt(formData.age) < 18) {
      setError("يجب أن يكون عمرك 18 سنة على الأقل")
      return false
    }
    if (!formData.characterName.trim()) {
      setError("يرجى إدخال اسم الشخصية")
      return false
    }
    if (formData.characterStory.trim().length < 100) {
      setError("يجب أن تكون قصة الشخصية 100 حرف على الأقل")
      return false
    }
    setError("")
    return true
  }

  const validateStep2 = () => {
    const emptyAnswers = formData.quizAnswers.filter(
      (qa) => !qa.answer.trim()
    )
    if (emptyAnswers.length > 0) {
      setError("يرجى الإجابة على جميع الأسئلة")
      return false
    }
    setError("")
    return true
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const prevStep = () => {
    setStep(1)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      })

      const data = await res.json()

      if (data.success) {
        router.push("/dashboard?submitted=true")
      } else {
        setError(data.error || "حدث خطأ أثناء إرسال الطلب")
      }
    } catch (err) {
      setError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.")
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="spinner" />
        </div>
        <Footer />
      </div>
    )
  }

  // Not logged in
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card p-8 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0-6v0m0-4a8 8 0 100 16 8 8 0 000-16z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              تسجيل الدخول مطلوب
            </h2>
            <p className="text-gray-400 mb-6">
              يجب تسجيل الدخول للتقديم على التفعيل
            </p>
            <Link href="/login?callbackUrl=/activation" className="btn-glow inline-block">
              تسجيل الدخول
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Has pending or approved request
  if (existingRequest) {
    const statusMessages = {
      PENDING: {
        title: "طلبك قيد المراجعة",
        description: "تم استلام طلبك وهو الآن قيد المراجعة من قبل الإدارة.",
        color: "yellow",
      },
      ACTIVATED: {
        title: "تم تفعيل حسابك",
        description: "مبروك! حسابك مفعل ويمكنك الانضمام للسيرفر.",
        color: "green",
      },
      REJECTED: {
        title: "تم رفض طلبك",
        description: "للأسف تم رفض طلبك. يمكنك إعادة التقديم.",
        color: "red",
      },
      EDIT_REQUESTED: {
        title: "مطلوب تعديل",
        description: "طلب منك تعديل بعض المعلومات في طلبك.",
        color: "blue",
      },
    }

    const statusConfig =
      statusMessages[existingRequest.status as keyof typeof statusMessages]

    if (!existingRequest.canResubmit) {
      return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="glass-card p-8 text-center max-w-md">
              <div
                className={`w-16 h-16 rounded-2xl bg-${statusConfig.color}-500/20 flex items-center justify-center mx-auto mb-6`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 text-${statusConfig.color}-500`}
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
              <h2 className="text-xl font-bold text-white mb-3">
                {statusConfig.title}
              </h2>
              <p className="text-gray-400 mb-6">{statusConfig.description}</p>
              <Link href="/dashboard" className="btn-glow inline-block">
                عرض التفاصيل
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">طلب التفعيل</h1>
            <p className="text-gray-400">
              أكمل النموذج التالي للتقديم على التفعيل
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  step >= 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 rounded ${
                  step >= 2 ? "bg-blue-500" : "bg-gray-700"
                }`}
              />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  step >= 2
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card p-8">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 fade-in">
                <h2 className="text-xl font-bold text-white mb-6">
                  المعلومات الشخصية
                </h2>

                {/* Real Name */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    الاسم الحقيقي
                  </label>
                  <input
                    type="text"
                    name="realName"
                    value={formData.realName}
                    onChange={handleInputChange}
                    className="input-styled"
                    placeholder="أدخل اسمك الحقيقي"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-gray-300 mb-2">العمر</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="input-styled"
                    placeholder="يجب أن يكون 18 سنة على الأقل"
                    min="18"
                    max="100"
                  />
                </div>

                {/* Character Name */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    اسم الشخصية
                  </label>
                  <input
                    type="text"
                    name="characterName"
                    value={formData.characterName}
                    onChange={handleInputChange}
                    className="input-styled"
                    placeholder="أدخل اسم شخصيتك في اللعبة"
                  />
                </div>

                {/* Character Story */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    قصة الشخصية
                  </label>
                  <textarea
                    name="characterStory"
                    value={formData.characterStory}
                    onChange={handleInputChange}
                    className="textarea-styled min-h-[200px]"
                    placeholder="اكتب قصة شخصيتك بالتفصيل (100 حرف على الأقل)"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    {formData.characterStory.length} / 100 حرف كحد أدنى
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-glow"
                  >
                    التالي - الاختبار
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 fade-in">
                <h2 className="text-xl font-bold text-white mb-6">
                  اختبار المعرفة
                </h2>
                <p className="text-gray-400 mb-6">
                  أجب على الأسئلة التالية بالتفصيل. لا يوجد إجابات صحيحة أو
                  خاطئة، نريد معرفة مدى فهمك للرول بلاي.
                </p>

                {questions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-400">جاري تحميل الأسئلة...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.quizAnswers.map((qa, index) => (
                      <div key={qa.questionId}>
                        <label className="block text-gray-300 mb-2">
                          <span className="text-blue-400">
                            السؤال {index + 1}:
                          </span>{" "}
                          {qa.question}
                        </label>
                        <textarea
                          value={qa.answer}
                          onChange={(e) =>
                            handleQuizAnswerChange(qa.questionId, e.target.value)
                          }
                          className="textarea-styled"
                          placeholder="اكتب إجابتك هنا..."
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="py-3 px-6 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-700/50 transition-all"
                  >
                    السابق
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-glow flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="spinner w-5 h-5" />
                        جاري الإرسال...
                      </>
                    ) : (
                      "إرسال الطلب"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
