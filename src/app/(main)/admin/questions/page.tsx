"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Plus,
  Edit,
  Trash2,
  XCircle,
  Save,
  HelpCircle,
  Power,
  Loader2,
  AlertTriangle
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newQuestion.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion })
      });

      if (res.ok) {
        fetchQuestions();
        setNewQuestion("");
        setShowNewForm(false);
      }
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Question>) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });

      if (res.ok) {
        fetchQuestions();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchQuestions();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (question: Question) => {
    await handleUpdate(question.id, { isActive: !question.isActive });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">بنك الأسئلة</h1>
          <p className="text-gray-400">إدارة أسئلة اختبار التفعيل</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال</span>
        </button>
      </div>

      {/* نموذج إضافة سؤال جديد */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              إضافة سؤال جديد
            </h3>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="input-field min-h-[100px] mb-4"
              placeholder="اكتب السؤال هنا..."
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={saving || !newQuestion.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>حفظ</span>
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewQuestion("");
                }}
                className="btn-secondary"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* قائمة الأسئلة */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <p className="text-gray-400">لا توجد أسئلة بعد</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="btn-primary mt-4"
            >
              إضافة سؤال
            </button>
          </div>
        ) : (
          questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-4 ${!question.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* الرقم */}
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  {index + 1}
                </div>

                {/* المحتوى */}
                <div className="flex-grow">
                  {editingId === question.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="input-field min-h-[80px]"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(question.id, { question: editValue })}
                          disabled={saving}
                          className="btn-primary flex items-center gap-2"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>حفظ</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300">{question.question}</p>
                  )}
                </div>

                {/* الإجراءات */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* تفعيل/تعطيل */}
                  <button
                    onClick={() => toggleActive(question)}
                    className={`p-2 rounded-lg transition-colors ${
                      question.isActive 
                        ? 'hover:bg-green-500/20 text-green-400' 
                        : 'hover:bg-gray-500/20 text-gray-400'
                    }`}
                    title={question.isActive ? 'تعطيل' : 'تفعيل'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* تعديل */}
                  <button
                    onClick={() => {
                      setEditingId(question.id);
                      setEditValue(question.question);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* حذف */}
                  <button
                    onClick={() => setDeleteConfirm(question.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* شارة الحالة */}
              {!question.isActive && (
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <XCircle className="w-3 h-3" />
                  <span>معطل</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* نافذة تأكيد الحذف */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">تأكيد الحذف</h3>
                  <p className="text-gray-400 text-sm">هل أنت متأكد من حذف هذا السؤال؟</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={saving}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>حذف</span>
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
