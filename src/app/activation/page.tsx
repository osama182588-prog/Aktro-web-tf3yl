'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Question {
  id: string;
  text: string;
}

export default function ActivationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [step, setStep] = useState<'info' | 'questions' | 'submitting' | 'success'>('info');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{status: string} | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    realName: '',
    age: '',
    characterName: '',
    characterStory: '',
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for existing application
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/applications/check')
        .then(res => res.json())
        .then(data => {
          if (data.application) {
            setExistingApplication(data.application);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  // Fetch questions when moving to questions step
  useEffect(() => {
    if (step === 'questions' && questions.length === 0) {
      setIsLoading(true);
      fetch('/api/questions/random')
        .then(res => res.json())
        .then(data => {
          setQuestions(data.questions || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [step, questions.length]);

  const validateInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.realName.trim()) newErrors.realName = 'الاسم الحقيقي مطلوب';
    if (!formData.age || parseInt(formData.age) < 16) newErrors.age = 'يجب أن يكون عمرك 16 سنة أو أكثر';
    if (!formData.characterName.trim()) newErrors.characterName = 'اسم الشخصية مطلوب';
    if (!formData.characterStory.trim() || formData.characterStory.length < 100) {
      newErrors.characterStory = 'يجب أن تكون القصة 100 حرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = () => {
    if (validateInfo()) {
      setStep('questions');
    }
  };

  const handleSubmit = async () => {
    // Validate all answers
    const newErrors: Record<string, string> = {};
    questions.forEach(q => {
      if (!answers[q.id]?.trim()) {
        newErrors[q.id] = 'الإجابة مطلوبة';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep('submitting');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      });

      if (response.ok) {
        setStep('success');
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'حدث خطأ أثناء الإرسال' });
        setStep('questions');
      }
    } catch (error) {
      console.error(error);
      setErrors({ submit: 'حدث خطأ أثناء الإرسال' });
      setStep('questions');
    }
  };

  // Not logged in
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">تسجيل الدخول مطلوب</h2>
            <p className="text-gray-400 mb-6">
              يجب عليك تسجيل الدخول عبر Discord للتقديم على التفعيل
            </p>
            <Button onClick={() => signIn('discord')} size="lg" className="w-full">
              تسجيل الدخول عبر Discord
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Has existing pending application
  if (existingApplication && existingApplication.status === 'PENDING') {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">طلبك قيد المراجعة</h2>
            <p className="text-gray-400 mb-6">
              لديك طلب تفعيل قيد المراجعة حالياً. يرجى انتظار رد الإدارة.
            </p>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              العودة للوحة العضو
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-500/20 flex items-center justify-center animate-pulse-glow">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-400">تم إرسال طلبك بنجاح!</h2>
            <p className="text-gray-400 mb-6">
              سيتم مراجعة طلبك من قبل الإدارة وإشعارك بالنتيجة.
              جاري تحويلك للوحة العضو...
            </p>
            <LoadingSpinner />
          </Card>
        </div>
      </div>
    );
  }

  // Submitting state
  if (step === 'submitting') {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <LoadingSpinner size="lg" className="mb-6" />
            <h2 className="text-2xl font-bold mb-4">جاري إرسال طلبك...</h2>
            <p className="text-gray-400">يرجى الانتظار</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">طلب التفعيل</span>
          </h1>
          <p className="text-gray-400">
            {step === 'info' ? 'أدخل معلوماتك الشخصية' : 'أجب على الأسئلة التالية'}
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-blue-400' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-700'}`}>
                1
              </span>
              <span>المعلومات</span>
            </div>
            <div className="flex-1 h-px bg-gray-700" />
            <div className={`flex items-center gap-2 ${step === 'questions' ? 'text-blue-400' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'questions' ? 'bg-blue-500 text-white' : 'bg-gray-700'}`}>
                2
              </span>
              <span>الاختبار</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto p-6 md:p-8">
          {step === 'info' && (
            <div className="space-y-6">
              <Input
                label="الاسم الحقيقي"
                placeholder="أدخل اسمك الحقيقي"
                value={formData.realName}
                onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                error={errors.realName}
              />
              
              <Input
                label="العمر"
                type="number"
                placeholder="أدخل عمرك"
                min="16"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                error={errors.age}
              />
              
              <Input
                label="اسم الشخصية"
                placeholder="أدخل اسم شخصيتك في اللعبة"
                value={formData.characterName}
                onChange={(e) => setFormData({ ...formData, characterName: e.target.value })}
                error={errors.characterName}
              />
              
              <Textarea
                label="قصة الشخصية"
                placeholder="اكتب قصة شخصيتك بالتفصيل (100 حرف على الأقل)"
                rows={6}
                value={formData.characterStory}
                onChange={(e) => setFormData({ ...formData, characterStory: e.target.value })}
                error={errors.characterStory}
              />
              
              <div className="flex justify-end">
                <Button onClick={handleInfoSubmit} size="lg">
                  التالي
                  <svg className="w-5 h-5 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="py-12 text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-400">جاري تحميل الأسئلة...</p>
                </div>
              ) : (
                <>
                  {questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        السؤال {index + 1}
                      </label>
                      <p className="text-white mb-2">{question.text}</p>
                      <Textarea
                        placeholder="اكتب إجابتك هنا..."
                        value={answers[question.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        error={errors[question.id]}
                      />
                    </div>
                  ))}

                  {errors.submit && (
                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400">
                      {errors.submit}
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <Button variant="ghost" onClick={() => setStep('info')}>
                      السابق
                    </Button>
                    <Button onClick={handleSubmit} size="lg">
                      إرسال الطلب
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
