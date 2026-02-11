"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge"
import { Loader } from "@/components/ui/Loader"
import { 
  Shield, 
  User, 
  Calendar, 
  BookOpen,
  Send,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"

interface Question {
  id: string
  text: string
}

interface ExistingApplication {
  id: string
  status: string
  priority: boolean
  createdAt: string
  updatedAt: string
  publicNotes: string | null
}

export default function ActivationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [existingApp, setExistingApp] = useState<ExistingApplication | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    realName: "",
    age: "",
    characterName: "",
    characterStory: "",
    answers: {} as Record<string, string>,
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  const fetchData = async () => {
    try {
      // Fetch questions and existing application
      const [questionsRes, appRes] = await Promise.all([
        fetch("/api/questions/random"),
        fetch("/api/applications/my"),
      ])

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json()
        setQuestions(questionsData.data || [])
      }

      if (appRes.ok) {
        const appData = await appRes.json()
        if (appData.data) {
          setExistingApp(appData.data)
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    // Validation
    if (!formData.realName || !formData.age || !formData.characterName || !formData.characterStory) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      setSubmitting(false)
      return
    }

    const age = parseInt(formData.age)
    if (isNaN(age) || age < 16 || age > 100) {
      setError("يجب أن يكون العمر بين 16 و 100 سنة")
      setSubmitting(false)
      return
    }

    // Check all questions answered
    for (const q of questions) {
      if (!formData.answers[q.id] || formData.answers[q.id].trim().length < 10) {
        setError("يرجى الإجابة على جميع الأسئلة بشكل كافٍ (10 أحرف على الأقل لكل إجابة)")
        setSubmitting(false)
        return
      }
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName: formData.realName,
          age: parseInt(formData.age),
          characterName: formData.characterName,
          characterStory: formData.characterStory,
          answers: Object.entries(formData.answers).map(([questionId, text]) => ({
            questionId,
            text,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء إرسال الطلب")
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى")
      setSubmitting(false)
    }
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Card className="fade-in">
          <CardContent className="py-12">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-100 mb-4">
              تسجيل الدخول مطلوب
            </h1>
            <p className="text-gray-400 mb-8">
              يجب تسجيل الدخول عبر Discord للوصول إلى صفحة التفعيل
            </p>
            <Button onClick={() => signIn("discord")} size="lg">
              تسجيل الدخول بـ Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    )
  }

  // Success
  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Card className="fade-in border-green-500/30">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-100 mb-4">
              تم إرسال طلبك بنجاح!
            </h1>
            <p className="text-gray-400 mb-4">
              سيتم مراجعة طلبك من قبل الإدارة وإشعارك بالنتيجة
            </p>
            <p className="text-gray-500 text-sm">
              جارٍ تحويلك إلى لوحة التحكم...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Has existing pending/approved application
  if (existingApp && (existingApp.status === "PENDING" || existingApp.status === "APPROVED")) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Card className="fade-in">
          <CardContent className="py-12">
            <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-100 mb-4">
              لديك طلب {existingApp.status === "PENDING" ? "قيد المراجعة" : "مفعل بالفعل"}
            </h1>
            <div className="mb-6">
              <StatusBadge status={existingApp.status} size="lg" />
              {existingApp.priority && (
                <div className="mt-3">
                  <PriorityBadge />
                </div>
              )}
            </div>
            <p className="text-gray-400 mb-8">
              {existingApp.status === "PENDING" 
                ? "يرجى انتظار مراجعة الإدارة لطلبك"
                : "أنت مفعل بالفعل، استمتع باللعب!"
              }
            </p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              الذهاب للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show modification request message if rejected/modification
  const showResubmitMessage = existingApp && (existingApp.status === "REJECTED" || existingApp.status === "MODIFICATION")

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-6">
          <Shield className="w-4 h-4" />
          نموذج التفعيل
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
          طلب التفعيل
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          املأ النموذج التالي بعناية للتقديم على التفعيل
        </p>
      </div>

      {/* Resubmit message */}
      {showResubmitMessage && (
        <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5 fade-in">
          <CardContent className="flex items-start gap-4 py-6">
            <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                {existingApp.status === "REJECTED" ? "تم رفض طلبك السابق" : "طُلب منك تعديل طلبك"}
              </h3>
              {existingApp.publicNotes && (
                <p className="text-gray-300 leading-relaxed mb-2">
                  <strong>ملاحظات الإدارة:</strong> {existingApp.publicNotes}
                </p>
              )}
              <p className="text-gray-400 text-sm">
                يمكنك إعادة التقديم الآن. يرجى مراعاة الملاحظات أعلاه.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <Card className="mb-6 fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-400" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="الاسم الحقيقي"
                placeholder="أدخل اسمك الحقيقي"
                value={formData.realName}
                onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                required
              />
              <Input
                label="العمر"
                type="number"
                placeholder="16+"
                min="16"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Character Info */}
        <Card className="mb-6 fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-400" />
              معلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="اسم الشخصية"
              placeholder="أدخل اسم شخصيتك في اللعبة"
              value={formData.characterName}
              onChange={(e) => setFormData({ ...formData, characterName: e.target.value })}
              required
            />
            <Textarea
              label="قصة الشخصية"
              placeholder="اكتب قصة خلفية لشخصيتك (الخلفية، الدوافع، الأهداف...)"
              value={formData.characterStory}
              onChange={(e) => setFormData({ ...formData, characterStory: e.target.value })}
              required
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="mb-6 fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              أسئلة الاختبار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                لا توجد أسئلة متاحة حالياً
              </p>
            ) : (
              questions.map((question, index) => (
                <div key={question.id}>
                  <label className="block text-gray-200 font-medium mb-2">
                    {index + 1}. {question.text}
                  </label>
                  <Textarea
                    placeholder="اكتب إجابتك هنا..."
                    value={formData.answers[question.id] || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      answers: { ...formData.answers, [question.id]: e.target.value }
                    })}
                    required
                    className="min-h-[100px]"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-500/30 bg-red-500/5 fade-in">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="text-center fade-in">
          <Button 
            type="submit" 
            size="lg" 
            className="gap-2"
            loading={submitting}
            disabled={questions.length === 0}
          >
            <Send className="w-5 h-5" />
            إرسال الطلب
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            بإرسال هذا الطلب، أنت توافق على الشروط والأحكام
          </p>
        </div>
      </form>
    </div>
  )
}
