'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AdminRole } from '@/generated/prisma';

interface Question {
  id: string;
  text: string;
  order: number;
  isActive: boolean;
}

export default function QuestionsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', order: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      if (!session?.user?.adminRole || 
          (session.user.adminRole !== AdminRole.SUPER_ADMIN && 
           session.user.adminRole !== AdminRole.GENERAL_ADMIN)) {
        router.push('/admin');
        return;
      }
      fetchQuestions();
    }
  }, [session, authStatus, router]);

  const handleAdd = async () => {
    if (!newQuestion.text.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });

      if (res.ok) {
        setNewQuestion({ text: '', order: 0 });
        setShowAddForm(false);
        fetchQuestions();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingQuestion) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuestion),
      });

      if (res.ok) {
        setEditingQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (question: Question) => {
    try {
      await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: question.id, isActive: !question.isActive }),
      });
      fetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
      fetchQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">بنك الأسئلة</span>
            </h1>
            <p className="text-gray-400">إدارة أسئلة اختبار التفعيل</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              العودة
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              إضافة سؤال
            </Button>
          </div>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">إضافة سؤال جديد</h3>
            <div className="space-y-4">
              <Textarea
                label="نص السؤال"
                placeholder="اكتب السؤال هنا..."
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              />
              <Input
                label="الترتيب"
                type="number"
                value={newQuestion.order.toString()}
                onChange={(e) => setNewQuestion({ ...newQuestion, order: parseInt(e.target.value) || 0 })}
              />
              <div className="flex gap-3">
                <Button onClick={handleAdd} isLoading={isSubmitting}>
                  إضافة
                </Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Edit Question Form */}
        {editingQuestion && (
          <Card className="p-6 mb-6 border-blue-500/50">
            <h3 className="text-lg font-bold mb-4">تعديل السؤال</h3>
            <div className="space-y-4">
              <Textarea
                label="نص السؤال"
                value={editingQuestion.text}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
              />
              <Input
                label="الترتيب"
                type="number"
                value={editingQuestion.order.toString()}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, order: parseInt(e.target.value) || 0 })}
              />
              <div className="flex gap-3">
                <Button onClick={handleUpdate} isLoading={isSubmitting}>
                  حفظ
                </Button>
                <Button variant="ghost" onClick={() => setEditingQuestion(null)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-700/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400">لا توجد أسئلة. أضف سؤالك الأول!</p>
            </Card>
          ) : (
            questions.map((question, index) => (
              <Card 
                key={question.id} 
                className={`p-6 ${!question.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className={`text-sm ${question.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                        {question.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </div>
                    <p className="text-gray-200">{question.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(question)}
                      className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                      title={question.isActive ? 'تعطيل' : 'تفعيل'}
                    >
                      {question.isActive ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                      title="تعديل"
                    >
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-500/20 transition-colors"
                      title="حذف"
                    >
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
