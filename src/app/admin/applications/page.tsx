'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AdminRole } from '@/generated/prisma';
import { formatDate, getStatusText } from '@/lib/utils';

interface Application {
  id: string;
  realName: string;
  age: number;
  characterName: string;
  characterStory: string;
  status: string;
  isPriority: boolean;
  createdAt: string;
  user: {
    id: string;
    discordId: string;
    username: string;
    avatar?: string;
  };
  answers?: {
    id: string;
    answer: string;
    question: {
      id: string;
      text: string;
    };
  }[];
}

export default function AdminApplicationsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/applications?${params}`);
      const data = await res.json();
      setApplications(data.applications || []);
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
           session.user.adminRole !== AdminRole.ACTIVATION_ADMIN)) {
        router.push('/admin');
        return;
      }
      fetchApplications();
    }
  }, [session, authStatus, filter]);

  const handleReview = async (action: 'approve' | 'reject' | 'modification') => {
    if (!selectedApp) return;

    // Prevent admin from reviewing their own application
    if (selectedApp.user.id === session?.user?.id) {
      alert('لا يمكنك مراجعة طلبك الشخصي');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: reviewNotes,
        }),
      });

      if (res.ok) {
        setSelectedApp(null);
        setReviewNotes('');
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">قيد المراجعة</Badge>;
      case 'APPROVED': return <Badge variant="success">مفعل</Badge>;
      case 'REJECTED': return <Badge variant="error">مرفوض</Badge>;
      case 'MODIFICATION_REQUESTED': return <Badge variant="info">طلب تعديل</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">إدارة الطلبات</span>
            </h1>
            <p className="text-gray-400">مراجعة طلبات التفعيل</p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/admin')}>
            العودة
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-1">
            {/* Filters */}
            <Card className="p-4 mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {['PENDING', 'APPROVED', 'REJECTED', 'all'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filter === s
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {s === 'all' ? 'الكل' : getStatusText(s)}
                  </button>
                ))}
              </div>
              <Input
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
              />
            </Card>

            {/* List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {applications.length === 0 ? (
                <Card className="p-6 text-center text-gray-400">
                  لا توجد طلبات
                </Card>
              ) : (
                applications.map((app) => (
                  <Card
                    key={app.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedApp?.id === app.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'hover:bg-gray-700/30'
                    }`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {app.user?.avatar ? (
                          <img
                            src={`https://cdn.discordapp.com/avatars/${app.user.discordId}/${app.user.avatar}.png`}
                            alt=""
                            className="w-8 h-8 rounded-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm">
                            {app.characterName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{app.characterName}</p>
                          <p className="text-xs text-gray-400">{app.user?.username}</p>
                        </div>
                      </div>
                      {app.isPriority && (
                        <Badge variant="info" className="text-xs">أولوية</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-gray-500">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <Card className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    {selectedApp.user?.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${selectedApp.user.discordId}/${selectedApp.user.avatar}.png`}
                        alt=""
                        className="w-16 h-16 rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-700 flex items-center justify-center text-2xl">
                        {selectedApp.characterName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold">{selectedApp.characterName}</h2>
                      <p className="text-gray-400">@{selectedApp.user?.username}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(selectedApp.status)}
                        {selectedApp.isPriority && (
                          <Badge variant="info">أولوية</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-gray-800/50">
                    <p className="text-gray-400 text-sm">الاسم الحقيقي</p>
                    <p className="font-medium">{selectedApp.realName}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50">
                    <p className="text-gray-400 text-sm">العمر</p>
                    <p className="font-medium">{selectedApp.age} سنة</p>
                  </div>
                </div>

                {/* Character Story */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">قصة الشخصية</h3>
                  <div className="p-4 rounded-lg bg-gray-800/50 whitespace-pre-wrap">
                    {selectedApp.characterStory}
                  </div>
                </div>

                {/* Answers */}
                {selectedApp.answers && selectedApp.answers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-3">الإجابات</h3>
                    <div className="space-y-4">
                      {selectedApp.answers.map((answer, index) => (
                        <div key={answer.id} className="p-4 rounded-lg bg-gray-800/50">
                          <p className="text-blue-400 text-sm mb-2">
                            س{index + 1}: {answer.question?.text}
                          </p>
                          <p className="whitespace-pre-wrap">{answer.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Actions */}
                {selectedApp.status === 'PENDING' && (
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="font-bold mb-3">المراجعة</h3>
                    <Textarea
                      label="ملاحظات (اختياري)"
                      placeholder="أضف ملاحظات للمتقدم..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="mb-4"
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleReview('approve')}
                        isLoading={isSubmitting}
                        className="bg-green-600 hover:bg-green-500"
                      >
                        قبول
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleReview('modification')}
                        isLoading={isSubmitting}
                      >
                        طلب تعديل
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleReview('reject')}
                        isLoading={isSubmitting}
                      >
                        رفض
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-700/50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-400">
                  اختر طلباً لعرض التفاصيل
                </h3>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
