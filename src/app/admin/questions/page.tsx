"use client";

// صفحة إدارة بنك الأسئلة - Questions Management
// =============================================

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  HelpCircle,
  Plus,
  Edit3,
  Trash2,
  Power,
  PowerOff,
  GripVertical,
  Save,
  X
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";

interface Question {
  id: string;
  question: string;
  order: number;
  isActive: boolean;
}

export default function QuestionsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      const user = session?.user as { isAdmin?: boolean };
      if (!user?.isAdmin) {
        router.push("/dashboard");
      } else {
        fetchQuestions();
      }
    }
  }, [authStatus, session, router]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
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

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || newQuestion.trim().length < 10) {
      alert("السؤال يجب أن يكون 10 أحرف على الأقل");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion.trim(),
          order: questions.length,
        }),
      });

      if (res.ok) {
        setNewQuestion("");
        setShowAddForm(false);
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      alert("حدث خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuestion = async (id: string) => {
    if (!editQuestion.trim() || editQuestion.trim().length < 10) {
      alert("السؤال يجب أن يكون 10 أحرف على الأقل");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: editQuestion.trim() }),
      });

      if (res.ok) {
        setEditingId(null);
        setEditQuestion("");
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      alert("حدث خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });

      if (res.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error toggling question:", error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error deleting question:", error);
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

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            بنك الأسئلة
          </h1>
          <p className="text-gray-400 mt-1">إدارة أسئلة اختبار التفعيل</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4" />
          إضافة سؤال
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="text-center py-6" hover={false}>
          <div className="text-2xl font-bold text-white mb-1">{questions.length}</div>
          <div className="text-sm text-gray-400">إجمالي الأسئلة</div>
        </Card>
        <Card className="text-center py-6" hover={false}>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {questions.filter(q => q.isActive).length}
          </div>
          <div className="text-sm text-gray-400">أسئلة نشطة</div>
        </Card>
        <Card className="text-center py-6" hover={false}>
          <div className="text-2xl font-bold text-gray-400 mb-1">
            {questions.filter(q => !q.isActive).length}
          </div>
          <div className="text-sm text-gray-400">أسئلة معطلة</div>
        </Card>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">إضافة سؤال جديد</h2>
          <Textarea
            placeholder="اكتب السؤال هنا (10 أحرف على الأقل)..."
            rows={3}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => { setShowAddForm(false); setNewQuestion(""); }}>
              إلغاء
            </Button>
            <Button onClick={handleAddQuestion} loading={submitting}>
              <Save className="w-4 h-4" />
              حفظ السؤال
            </Button>
          </div>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد أسئلة حالياً</p>
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="mt-4">
              <Plus className="w-4 h-4" />
              إضافة أول سؤال
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 rounded-xl border transition-colors ${
                  question.isActive
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-slate-900/50 border-slate-800 opacity-60"
                }`}
              >
                {editingId === question.id ? (
                  <div>
                    <Textarea
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingId(null); setEditQuestion(""); }}
                      >
                        إلغاء
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateQuestion(question.id)}
                        loading={submitting}
                      >
                        حفظ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <GripVertical className="w-5 h-5 cursor-move" />
                      <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{question.question}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(question.id, question.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          question.isActive
                            ? "text-green-400 hover:bg-green-500/10"
                            : "text-gray-400 hover:bg-slate-700"
                        }`}
                        title={question.isActive ? "تعطيل" : "تفعيل"}
                      >
                        {question.isActive ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(question.id);
                          setEditQuestion(question.question);
                        }}
                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="تعديل"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
