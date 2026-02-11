"use client";

import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  User, 
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, LightLines } from "@/components/animations/ParticleBackground";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
}

interface FormData {
  realName: string;
  age: string;
  characterName: string;
  characterStory: string;
  answers: Record<string, string>;
}

const steps = [
  { id: 'info', title: 'المعلومات الشخصية', icon: User },
  { id: 'story', title: 'قصة الشخصية', icon: FileText },
  { id: 'questions', title: 'الاختبار', icon: Shield },
  { id: 'review', title: 'المراجعة', icon: CheckCircle }
];

export default function ActivationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    realName: '',
    age: '',
    characterName: '',
    characterStory: '',
    answers: {}
  });

  useEffect(() => {
    if (status === 'authenticated') {
      checkExistingRequest();
      fetchQuestions();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const checkExistingRequest = async () => {
    try {
      const res = await fetch('/api/activation/status');
      if (res.ok) {
        const data = await res.json();
        if (data.activation) {
          const status = data.activation.status;
          if (status === 'PENDING_REVIEW' || status === 'ACTIVATED') {
            setHasExistingRequest(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions/random');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  };

  const validateStep = (): boolean => {
    setError(null);
    
    switch (currentStep) {
      case 0: // المعلومات الشخصية
        if (!formData.realName.trim()) {
          setError('يرجى إدخال الاسم الحقيقي');
          return false;
        }
        if (!formData.age || parseInt(formData.age) < 16) {
          setError('يجب أن يكون العمر 16 سنة أو أكثر');
          return false;
        }
        if (!formData.characterName.trim()) {
          setError('يرجى إدخال اسم الشخصية');
          return false;
        }
        return true;
        
      case 1: // قصة الشخصية
        if (!formData.characterStory.trim() || formData.characterStory.length < 100) {
          setError('يجب أن تكون قصة الشخصية 100 حرف على الأقل');
          return false;
        }
        return true;
        
      case 2: // الاختبار
        const unanswered = questions.filter(q => !formData.answers[q.id]?.trim());
        if (unanswered.length > 0) {
          setError('يرجى الإجابة على جميع الأسئلة');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch('/api/activation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realName: formData.realName,
          age: parseInt(formData.age),
          characterName: formData.characterName,
          characterStory: formData.characterStory,
          answers: formData.answers
        })
      });
      
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-20">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h1 className="text-2xl font-bold mb-4">يجب تسجيل الدخول</h1>
            <Link href="/api/auth/signin" className="btn-primary">
              تسجيل الدخول
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (hasExistingRequest) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center max-w-md"
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h1 className="text-2xl font-bold mb-4">لديك طلب قائم</h1>
            <p className="text-gray-400 mb-6">
              لديك طلب تفعيل قيد المراجعة أو تم قبوله بالفعل
            </p>
            <Link href="/dashboard" className="btn-primary">
              الذهاب للوحة التحكم
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleBackground />
      <LightLines />
      <Header />
      
      <main className="flex-grow pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* العنوان */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient">التفعيل</span>
            </h1>
            <p className="text-gray-400">أكمل الخطوات التالية للحصول على التفعيل</p>
          </motion.div>

          {/* شريط التقدم */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 mb-8"
          >
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-400' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStep 
                        ? 'bg-green-500' 
                        : index === currentStep 
                          ? 'bg-blue-500' 
                          : 'bg-gray-700'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <step.icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 sm:w-24 h-1 mx-2 rounded ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* محتوى الخطوة */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-6 md:p-8"
            >
              {/* الخطوة 1: المعلومات الشخصية */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">المعلومات الشخصية</h2>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">الاسم الحقيقي</label>
                    <input
                      type="text"
                      value={formData.realName}
                      onChange={(e) => handleInputChange('realName', e.target.value)}
                      className="input-field"
                      placeholder="أدخل اسمك الحقيقي"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">العمر</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="input-field"
                      placeholder="أدخل عمرك"
                      min="16"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">اسم الشخصية</label>
                    <input
                      type="text"
                      value={formData.characterName}
                      onChange={(e) => handleInputChange('characterName', e.target.value)}
                      className="input-field"
                      placeholder="أدخل اسم شخصيتك في اللعبة"
                    />
                  </div>
                </div>
              )}

              {/* الخطوة 2: قصة الشخصية */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">قصة الشخصية</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    اكتب قصة خلفية لشخصيتك. يجب أن تكون القصة واقعية ومفصلة وتوضح خلفية شخصيتك ودوافعها.
                  </p>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      قصة الشخصية (100 حرف على الأقل)
                    </label>
                    <textarea
                      value={formData.characterStory}
                      onChange={(e) => handleInputChange('characterStory', e.target.value)}
                      className="input-field min-h-[200px] resize-y"
                      placeholder="اكتب قصة شخصيتك هنا..."
                    />
                    <div className="text-sm text-gray-500 mt-2">
                      {formData.characterStory.length} حرف
                    </div>
                  </div>
                </div>
              )}

              {/* الخطوة 3: الاختبار */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">اختبار التفعيل</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    أجب على الأسئلة التالية. الإجابات يجب أن تكون كتابية ومفصلة.
                  </p>
                  
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                      <p>لا توجد أسئلة متاحة حالياً</p>
                    </div>
                  ) : (
                    questions.map((question, index) => (
                      <div key={question.id} className="bg-gray-800/50 rounded-lg p-4">
                        <label className="block text-sm text-gray-300 mb-2">
                          {index + 1}. {question.question}
                        </label>
                        <textarea
                          value={formData.answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="input-field min-h-[100px] resize-y"
                          placeholder="أدخل إجابتك هنا..."
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* الخطوة 4: المراجعة */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">مراجعة الطلب</h2>
                  <p className="text-gray-400 text-sm mb-4">
                    راجع معلوماتك قبل الإرسال. بعد الإرسال سيتم مراجعة طلبك من قبل الإدارة.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h3 className="font-medium mb-2">المعلومات الشخصية</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">الاسم الحقيقي:</span>
                          <span className="mr-2">{formData.realName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">العمر:</span>
                          <span className="mr-2">{formData.age}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">اسم الشخصية:</span>
                          <span className="mr-2">{formData.characterName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h3 className="font-medium mb-2">قصة الشخصية</h3>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {formData.characterStory}
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h3 className="font-medium mb-2">الإجابات</h3>
                      <div className="space-y-3">
                        {questions.map((question, index) => (
                          <div key={question.id} className="text-sm">
                            <p className="text-gray-400">{index + 1}. {question.question}</p>
                            <p className="text-gray-300 mt-1">{formData.answers[question.id]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* رسالة الخطأ */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* أزرار التنقل */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`btn-secondary flex items-center gap-2 ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>السابق</span>
                </button>

                {currentStep < steps.length - 1 ? (
                  <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                    <span>التالي</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>إرسال الطلب</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
