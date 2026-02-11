"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  User, 
  Calendar, 
  BookOpen, 
  HelpCircle,
  Send,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface Question {
  id: string
  question: string
}

export default function ActivationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    realName: "",
    age: "",
    characterName: "",
    characterStory: "",
    answers: {} as Record<string, string>
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    // Fetch questions from API
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/activation/questions")
        if (res.ok) {
          const data = await res.json()
          setQuestions(data.questions || [])
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error)
      }
    }
    fetchQuestions()
  }, [])

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.realName.trim()) {
      newErrors.realName = "الاسم الحقيقي مطلوب"
    }
    
    const age = parseInt(formData.age)
    if (!formData.age || isNaN(age) || age < 16 || age > 100) {
      newErrors.age = "العمر يجب أن يكون بين 16 و 100"
    }
    
    if (!formData.characterName.trim()) {
      newErrors.characterName = "اسم الشخصية مطلوب"
    } else if (formData.characterName.length < 3) {
      newErrors.characterName = "اسم الشخصية يجب أن يكون 3 أحرف على الأقل"
    }
    
    if (!formData.characterStory.trim()) {
      newErrors.characterStory = "قصة الشخصية مطلوبة"
    } else if (formData.characterStory.length < 100) {
      newErrors.characterStory = "قصة الشخصية يجب أن تكون 100 حرف على الأقل"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
    questions.forEach((q) => {
      if (!formData.answers[q.id]?.trim()) {
        newErrors[`answer_${q.id}`] = "هذا السؤال مطلوب"
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/activation/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName: formData.realName,
          age: parseInt(formData.age),
          characterName: formData.characterName,
          characterStory: formData.characterStory,
          testAnswers: questions.map(q => ({
            questionId: q.id,
            answer: formData.answers[q.id]
          }))
        })
      })

      if (res.ok) {
        router.push("/dashboard?submitted=true")
      } else {
        const data = await res.json()
        setErrors({ submit: data.error || "حدث خطأ أثناء الإرسال" })
      }
    } catch (error) {
      setErrors({ submit: "حدث خطأ في الاتصال" })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  // Check if user is already activated or has pending request
  if (session?.user.activationStatus === "ACTIVATED") {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto text-center fade-in">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">أنت مفعل بالفعل!</h2>
            <p className="text-foreground/60">
              لقد تم تفعيل حسابك بنجاح. استمتع باللعب!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session?.user.activationStatus === "PENDING") {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto text-center fade-in">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <div className="spinner border-warning border-t-transparent" />
            </div>
            <h2 className="text-2xl font-bold mb-2">طلبك قيد المراجعة</h2>
            <p className="text-foreground/60">
              سيتم إعلامك عند اتخاذ قرار بشأن طلبك
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <Badge variant="info" className="mb-4">
            <Zap className="w-4 h-4 ml-1" />
            نموذج التفعيل
          </Badge>
          <h1 className="text-3xl font-bold mb-2">طلب التفعيل</h1>
          <p className="text-foreground/60">
            أكمل المعلومات التالية للتقديم على التفعيل
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8 fade-in">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-foreground/40"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-white" : "bg-muted"}`}>
              1
            </div>
            <span className="hidden sm:inline">المعلومات</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-foreground/40"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-white" : "bg-muted"}`}>
              2
            </div>
            <span className="hidden sm:inline">الاختبار</span>
          </div>
        </div>

        {/* Form */}
        <Card className="fade-in">
          <CardContent className="pt-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="الاسم الحقيقي"
                    id="realName"
                    placeholder="أدخل اسمك الحقيقي"
                    value={formData.realName}
                    onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                    error={errors.realName}
                  />
                  <Input
                    label="العمر"
                    id="age"
                    type="number"
                    min={16}
                    max={100}
                    placeholder="عمرك"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    error={errors.age}
                  />
                </div>
                
                <Input
                  label="اسم الشخصية"
                  id="characterName"
                  placeholder="اسم شخصيتك في اللعبة"
                  value={formData.characterName}
                  onChange={(e) => setFormData({ ...formData, characterName: e.target.value })}
                  error={errors.characterName}
                />
                
                <Textarea
                  label="قصة الشخصية"
                  id="characterStory"
                  placeholder="اكتب قصة مفصلة عن شخصيتك... (100 حرف على الأقل)"
                  value={formData.characterStory}
                  onChange={(e) => setFormData({ ...formData, characterStory: e.target.value })}
                  error={errors.characterStory}
                  className="min-h-[200px]"
                />
                
                <div className="text-sm text-foreground/50 text-left">
                  {formData.characterStory.length} / 100 حرف كحد أدنى
                </div>

                <Button onClick={handleNextStep} className="w-full gap-2">
                  التالي
                  <BookOpen className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-info/10 border border-info/20 mb-6">
                  <p className="text-sm text-foreground/70 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    أجب على الأسئلة التالية بشكل مفصل. لا يوجد إجابات صحيحة أو خاطئة، نريد معرفة فهمك للرول بلاي.
                  </p>
                </div>

                {questions.length > 0 ? (
                  questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        {index + 1}. {question.question}
                      </label>
                      <Textarea
                        placeholder="إجابتك..."
                        value={formData.answers[question.id] || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          answers: { ...formData.answers, [question.id]: e.target.value }
                        })}
                        error={errors[`answer_${question.id}`]}
                        className="min-h-[100px]"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-foreground/60 py-8">
                    لا توجد أسئلة حالياً. يرجى التواصل مع الإدارة.
                  </p>
                )}

                {errors.submit && (
                  <div className="p-4 rounded-lg bg-error/10 border border-error/20 flex items-center gap-2 text-error">
                    <AlertCircle className="w-5 h-5" />
                    {errors.submit}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    loading={loading}
                    className="flex-1 gap-2"
                    disabled={questions.length === 0}
                  >
                    <Send className="w-4 h-4" />
                    إرسال الطلب
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
