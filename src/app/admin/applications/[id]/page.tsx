"use client";

// صفحة مراجعة الطلب - Application Review
// ======================================

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowRight,
  User,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Crown,
  MessageSquare
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

interface ApplicationDetail {
  id: string;
  realName: string;
  age: number;
  characterName: string;
  characterStory: string;
  answers: Record<string, string>;
  status: string;
  isPriority: boolean;
  adminNotes: string | null;
  internalNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    discordId: string;
    username: string;
    avatar: string | null;
  };
  reviewedBy: {
    id: string;
    username: string;
  } | null;
}

interface Question {
  id: string;
  question: string;
}

export default function ApplicationReviewPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "modification" | null>(null);
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [qualityRating, setQualityRating] = useState(3);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      const user = session?.user as { isAdmin?: boolean };
      if (!user?.isAdmin) {
        router.push("/dashboard");
      } else {
        fetchData();
      }
    }
  }, [authStatus, session, router, id]);

  const fetchData = async () => {
    try {
      const [appRes, questionsRes] = await Promise.all([
        fetch(`/api/admin/applications/${id}`),
        fetch("/api/questions"),
      ]);

      if (appRes.ok) {
        const data = await appRes.json();
        setApplication(data.application);
        setInternalNotes(data.application.internalNotes || "");
      }

      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!action || !application) return;

    // منع المراجعة الذاتية
    const user = session?.user as { id?: string };
    if (user.id === application.user.id) {
      alert("لا يمكنك مراجعة طلبك الخاص");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: action !== "approve" ? notes : undefined,
          internalNotes,
          qualityRating,
        }),
      });

      if (res.ok) {
        router.push("/admin/applications");
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      alert("حدث خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  const user = session?.user as { isAdmin?: boolean };
  if (authStatus === "loading" || loading || !user?.isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">الطلب غير موجود</h2>
          <Button onClick={() => router.push("/admin/applications")} variant="outline" className="mt-4">
            <ArrowRight className="w-4 h-4" />
            العودة للطلبات
          </Button>
        </Card>
      </div>
    );
  }

  const getQuestionText = (questionId: string): string => {
    const question = questions.find(q => q.id === questionId);
    return question?.question || "سؤال غير معروف";
  };

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={() => router.push("/admin/applications")} variant="ghost" size="sm">
          <ArrowRight className="w-4 h-4" />
          العودة
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            مراجعة طلب التفعيل
            {application.isPriority && <Crown className="w-6 h-6 text-yellow-400" />}
          </h1>
          <p className="text-gray-400">#{application.id.slice(0, 8)}</p>
        </div>
        <StatusBadge status={application.status} size="lg" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Info */}
          <Card>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              معلومات المتقدم
            </h2>
            <div className="flex items-center gap-4 mb-6">
              {application.user.avatar ? (
                <img src={application.user.avatar} alt="" className="w-16 h-16 rounded-xl" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <div className="text-xl font-bold text-white">{application.realName}</div>
                <div className="text-gray-400">@{application.user.username}</div>
                <div className="text-sm text-gray-500">Discord ID: {application.user.discordId}</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50">
                <div className="text-gray-400 text-sm mb-1">العمر</div>
                <div className="text-white font-bold text-lg">{application.age} سنة</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50">
                <div className="text-gray-400 text-sm mb-1">اسم الشخصية</div>
                <div className="text-white font-bold text-lg">{application.characterName}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50">
                <div className="text-gray-400 text-sm mb-1">تاريخ التقديم</div>
                <div className="text-white font-bold">{formatDate(application.createdAt)}</div>
              </div>
            </div>
          </Card>

          {/* Character Story */}
          <Card>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              قصة الشخصية
            </h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {application.characterStory}
            </p>
          </Card>

          {/* Answers */}
          <Card>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              إجابات الأسئلة
            </h2>
            <div className="space-y-6">
              {Object.entries(application.answers).map(([questionId, answer], index) => (
                <div key={questionId}>
                  <div className="text-blue-400 font-medium mb-2">
                    {index + 1}. {getQuestionText(questionId)}
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 text-gray-300">
                    {answer}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {(application.status === "PENDING" || application.status === "REVIEWING") && (
            <Card glow>
              <h2 className="text-lg font-bold text-white mb-4">اتخاذ إجراء</h2>
              
              {/* Quality Rating */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm mb-2">تصنيف جودة الطلب</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setQualityRating(rating)}
                      className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                        qualityRating >= rating
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-gray-400"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="mb-6">
                <Textarea
                  label="ملاحظات داخلية (للإدارة فقط)"
                  placeholder="ملاحظات لن يراها المتقدم..."
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>

              {/* Action Selection */}
              {action && (
                <div className="mb-4">
                  <Textarea
                    label={action === "reject" ? "سبب الرفض" : "ملاحظات التعديل"}
                    placeholder={action === "reject" ? "اشرح سبب الرفض للمتقدم..." : "ما الذي يجب تعديله..."}
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {action ? (
                  <>
                    <Button
                      onClick={handleSubmit}
                      loading={submitting}
                      className="w-full"
                      variant={action === "approve" ? "primary" : action === "reject" ? "danger" : "secondary"}
                    >
                      <Send className="w-4 h-4" />
                      {action === "approve" ? "تأكيد القبول" : action === "reject" ? "تأكيد الرفض" : "إرسال طلب التعديل"}
                    </Button>
                    <Button
                      onClick={() => { setAction(null); setNotes(""); }}
                      variant="ghost"
                      className="w-full"
                    >
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setAction("approve")}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      قبول الطلب
                    </Button>
                    <Button
                      onClick={() => setAction("modification")}
                      variant="secondary"
                      className="w-full"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      طلب تعديل
                    </Button>
                    <Button
                      onClick={() => setAction("reject")}
                      variant="danger"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4" />
                      رفض الطلب
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Application Info */}
          <Card>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              معلومات الطلب
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">تاريخ التقديم</span>
                <span className="text-white">{formatDate(application.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">آخر تحديث</span>
                <span className="text-white">{formatDate(application.updatedAt)}</span>
              </div>
              {application.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">تاريخ المراجعة</span>
                  <span className="text-white">{formatDate(application.reviewedAt)}</span>
                </div>
              )}
              {application.reviewedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-400">المراجع</span>
                  <span className="text-white">@{application.reviewedBy.username}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Previous Notes */}
          {(application.adminNotes || application.rejectionReason) && (
            <Card>
              <h2 className="text-lg font-bold text-white mb-4">ملاحظات سابقة</h2>
              <p className="text-gray-300 text-sm">
                {application.rejectionReason || application.adminNotes}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
