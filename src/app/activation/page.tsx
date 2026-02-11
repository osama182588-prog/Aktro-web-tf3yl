"use client";

// صفحة التفعيل - Activation Page
// ==============================

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, User, FileText, Send, AlertCircle, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

interface Question {
  id: string;
  question: string;
}

export default function ActivationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    realName: "",
    age: "",
    characterName: "",
    characterStory: "",
    answers: {} as Record<string, string>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      checkExistingApplication();
      fetchQuestions();
    }
  }, [session]);

  const checkExistingApplication = async () => {
    try {
      const res = await fetch("/api/applications/my");
      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          const status = data.application.status;
          if (status === "PENDING" || status === "REVIEWING" || status === "APPROVED") {
            setHasExistingApplication(true);
            setExistingStatus(status);
          }
        }
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions/active");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.realName.trim()) {
      newErrors.realName = "الاسم الحقيقي مطلوب";
    } else if (formData.realName.trim().length < 3) {
      newErrors.realName = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = "العمر مطلوب";
    } else if (isNaN(age) || age < 13 || age > 100) {
      newErrors.age = "يجب أن يكون العمر بين 13 و 100";
    }

    if (!formData.characterName.trim()) {
      newErrors.characterName = "اسم الشخصية مطلوب";
    } else if (formData.characterName.trim().length < 2) {
      newErrors.characterName = "اسم الشخصية يجب أن يكون حرفين على الأقل";
    }

    if (!formData.characterStory.trim()) {
      newErrors.characterStory = "قصة الشخصية مطلوبة";
    } else if (formData.characterStory.trim().length < 100) {
      newErrors.characterStory = "قصة الشخصية يجب أن تكون 100 حرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    questions.forEach((q) => {
      if (!formData.answers[q.id]?.trim()) {
        newErrors[`answer_${q.id}`] = "هذا السؤال مطلوب";
      } else if (formData.answers[q.id].trim().length < 10) {
        newErrors[`answer_${q.id}`] = "الإجابة يجب أن تكون 10 أحرف على الأقل";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName: formData.realName.trim(),
          age: parseInt(formData.age),
          characterName: formData.characterName.trim(),
          characterStory: formData.characterStory.trim(),
          answers: formData.answers,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "حدث خطأ أثناء إرسال الطلب");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!session) return null;

  // عرض رسالة إذا كان هناك طلب موجود
  if (hasExistingApplication) {
    const statusMessages: Record<string, { title: string; description: string; color: string }> = {
      PENDING: {
        title: "لديك طلب قيد الانتظار",
        description: "طلبك موجود بالفعل وينتظر المراجعة",
        color: "text-yellow-400",
      },
      REVIEWING: {
        title: "طلبك قيد المراجعة",
        description: "يتم حالياً مراجعة طلبك من قبل الإدارة",
        color: "text-blue-400",
      },
      APPROVED: {
        title: "أنت مفعل بالفعل!",
        description: "تم قبول طلبك ويمكنك اللعب في السيرفر",
        color: "text-green-400",
      },
    };

    const status = statusMessages[existingStatus || ""] || statusMessages.PENDING;

    return (
      <div className="container mx-auto px-4 py-12 page-transition">
        <Card className="max-w-lg mx-auto text-center py-12" glow>
          <AlertCircle className={`w-16 h-16 mx-auto mb-6 ${status.color}`} />
          <h2 className="text-2xl font-bold text-white mb-4">{status.title}</h2>
          <p className="text-gray-400 mb-8">{status.description}</p>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            العودة للوحة التحكم
          </Button>
        </Card>
      </div>
    );
  }

  // عرض رسالة النجاح
  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 page-transition">
        <Card className="max-w-lg mx-auto text-center py-12" glow>
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">تم إرسال طلبك بنجاح!</h2>
          <p className="text-gray-400 mb-4">
            سيتم مراجعة طلبك وإشعارك بالنتيجة قريباً
          </p>
          <p className="text-sm text-gray-500">جاري تحويلك للوحة التحكم...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 page-transition">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          نموذج التفعيل
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          التقديم على التفعيل
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          أكمل النموذج التالي للتقديم على التفعيل والانضمام لسيرفرنا
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 1 ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-gray-500"}`}>
          <User className="w-4 h-4" />
          <span>المعلومات الشخصية</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-700" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 2 ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-gray-500"}`}>
          <FileText className="w-4 h-4" />
          <span>الأسئلة</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="max-w-2xl mx-auto mb-6 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </Card>
      )}

      {/* Form */}
      <Card className="max-w-2xl mx-auto">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              المعلومات الشخصية
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
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
                min={13}
                max={100}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                error={errors.age}
              />
            </div>

            <Input
              label="اسم الشخصية"
              placeholder="أدخل اسم شخصيتك في اللعبة"
              value={formData.characterName}
              onChange={(e) => setFormData({ ...formData, characterName: e.target.value })}
              error={errors.characterName}
            />

            <Textarea
              label="قصة الشخصية"
              placeholder="اكتب قصة مفصلة لشخصيتك (100 حرف على الأقل)..."
              rows={6}
              value={formData.characterStory}
              onChange={(e) => setFormData({ ...formData, characterStory: e.target.value })}
              error={errors.characterStory}
            />
            <p className="text-xs text-gray-500">
              {formData.characterStory.length} / 100 حرف كحد أدنى
            </p>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext}>
                التالي
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              أسئلة الاختبار
            </h2>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد أسئلة متاحة حالياً</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id}>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {index + 1}. {question.question}
                    </label>
                    <Textarea
                      placeholder="اكتب إجابتك هنا..."
                      rows={4}
                      value={formData.answers[question.id] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          answers: { ...formData.answers, [question.id]: e.target.value },
                        })
                      }
                      error={errors[`answer_${question.id}`]}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                السابق
              </Button>
              <Button onClick={handleSubmit} loading={submitting} disabled={questions.length === 0}>
                <Send className="w-4 h-4" />
                إرسال الطلب
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
