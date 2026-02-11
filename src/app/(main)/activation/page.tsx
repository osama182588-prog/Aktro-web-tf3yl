'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { AlertCircle, CheckCircle, Send } from 'lucide-react'

interface Question {
  id: string
  question: string
}

export default function ActivationPage() {
  const { status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    realName: '',
    age: '',
    characterName: '',
    characterStory: '',
    answers: {} as Record<string, string>,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/activation')
    }
  }, [status, router])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/questions/random')
        if (response.ok) {
          const data = await response.json()
          setQuestions(data.questions || [])
        }
      } catch {
        setError('حدث خطأ في تحميل الأسئلة')
      } finally {
        setIsLoading(false)
      }
    }

    if (step === 2) {
      fetchQuestions()
    }
  }, [step])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          answers: Object.entries(formData.answers).map(([questionId, answerText]) => ({
            questionId,
            answerText,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateStep1 = () => {
    return (
      formData.realName.trim() !== '' &&
      formData.age !== '' &&
      parseInt(formData.age) >= 16 &&
      formData.characterName.trim() !== '' &&
      formData.characterStory.trim().length >= 50
    )
  }

  const validateStep2 = () => {
    return questions.every((q) => formData.answers[q.id]?.trim().length >= 10)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnimatedBackground />
        <Header />
        <main className="flex-1 pt-32 pb-8 px-4 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              تم إرسال طلبك بنجاح!
            </h2>
            <p className="text-gray-400">
              سيتم مراجعة طلبك من قبل الإدارة وإعلامك بالنتيجة
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 pt-32 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              طلب التفعيل
            </h1>
            <p className="text-gray-400">
              {step === 1 ? 'أدخل معلوماتك الشخصية وقصة شخصيتك' : 'أجب على الأسئلة التالية'}
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500' : 'bg-gray-700'} text-white text-sm`}>
                1
              </span>
              <span className="hidden sm:inline">المعلومات</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-700" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'} text-white text-sm`}>
                2
              </span>
              <span className="hidden sm:inline">الاختبار</span>
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الشخصية</CardTitle>
                  <CardDescription>أدخل معلوماتك وقصة شخصيتك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="الاسم الحقيقي"
                      placeholder="أدخل اسمك الحقيقي"
                      value={formData.realName}
                      onChange={(e) => handleInputChange('realName', e.target.value)}
                    />
                    <Input
                      label="العمر"
                      type="number"
                      placeholder="أدخل عمرك"
                      min={16}
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      error={formData.age && parseInt(formData.age) < 16 ? 'يجب أن يكون عمرك 16 سنة أو أكثر' : undefined}
                    />
                  </div>
                  
                  <Input
                    label="اسم الشخصية"
                    placeholder="اسم شخصيتك في الرول بلاي"
                    value={formData.characterName}
                    onChange={(e) => handleInputChange('characterName', e.target.value)}
                  />
                  
                  <Textarea
                    label="قصة الشخصية"
                    placeholder="اكتب قصة شخصيتك بالتفصيل (50 حرف على الأقل)"
                    value={formData.characterStory}
                    onChange={(e) => handleInputChange('characterStory', e.target.value)}
                    className="min-h-[200px]"
                    error={
                      formData.characterStory && formData.characterStory.length < 50
                        ? `${formData.characterStory.length}/50 حرف (مطلوب 50 حرف على الأقل)`
                        : undefined
                    }
                  />

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!validateStep1()}
                    >
                      التالي
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Questions */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>اختبار التفعيل</CardTitle>
                  <CardDescription>أجب على الأسئلة التالية بوضوح</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="py-12 flex justify-center">
                      <LoadingSpinner text="جاري تحميل الأسئلة..." />
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        لا توجد أسئلة متاحة حالياً. يرجى المحاولة لاحقاً.
                      </p>
                      <Button variant="outline" onClick={() => setStep(1)} className="mt-4">
                        العودة
                      </Button>
                    </div>
                  ) : (
                    <>
                      {questions.map((question, index) => (
                        <div key={question.id}>
                          <Textarea
                            label={`${index + 1}. ${question.question}`}
                            placeholder="اكتب إجابتك هنا (10 أحرف على الأقل)"
                            value={formData.answers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          />
                        </div>
                      ))}

                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setStep(1)}>
                          السابق
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={!validateStep2() || isSubmitting}
                          isLoading={isSubmitting}
                        >
                          <Send className="w-4 h-4" />
                          إرسال الطلب
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
