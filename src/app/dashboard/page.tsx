'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';

interface Application {
  id: string;
  status: string;
  isPriority: boolean;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  realName: string;
  characterName: string;
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/applications/me')
        .then(res => res.json())
        .then(data => {
          setApplication(data.application);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    } else if (authStatus !== 'loading') {
      setIsLoading(false);
    }
  }, [session, authStatus]);

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    router.push('/activation');
    return null;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'MODIFICATION_REQUESTED': return 'warning';
      default: return 'warning';
    }
  };

  const renderStatusContent = () => {
    if (!application) {
      return (
        <Card className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-700/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">لم تقدم طلب تفعيل بعد</h3>
          <p className="text-gray-400 mb-6">ابدأ بتقديم طلب التفعيل للانضمام إلى السيرفر</p>
          <Button onClick={() => router.push('/activation')}>
            تقديم طلب التفعيل
          </Button>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Status Card */}
        <Card className={`p-6 ${getStatusColor(application.status)}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                application.status === 'APPROVED' ? 'bg-green-500/20' :
                application.status === 'REJECTED' ? 'bg-red-500/20' :
                application.status === 'MODIFICATION_REQUESTED' ? 'bg-orange-500/20' :
                'bg-yellow-500/20'
              }`}>
                {application.status === 'APPROVED' && (
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {application.status === 'REJECTED' && (
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {application.status === 'MODIFICATION_REQUESTED' && (
                  <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
                {application.status === 'PENDING' && (
                  <svg className="w-7 h-7 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold">حالة التفعيل</h3>
                <Badge variant={getStatusBadgeVariant(application.status)}>
                  {getStatusText(application.status)}
                </Badge>
              </div>
            </div>
            {application.isPriority && (
              <Badge variant="info" className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                أولوية
              </Badge>
            )}
          </div>
        </Card>

        {/* Application Details */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            تفاصيل الطلب
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-800/50">
              <p className="text-gray-400 text-sm mb-1">الاسم الحقيقي</p>
              <p className="font-medium">{application.realName}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50">
              <p className="text-gray-400 text-sm mb-1">اسم الشخصية</p>
              <p className="font-medium">{application.characterName}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50">
              <p className="text-gray-400 text-sm mb-1">تاريخ التقديم</p>
              <p className="font-medium">{formatDate(application.createdAt)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50">
              <p className="text-gray-400 text-sm mb-1">آخر تحديث</p>
              <p className="font-medium">{formatDate(application.updatedAt)}</p>
            </div>
          </div>
        </Card>

        {/* Admin Notes */}
        {(application.adminNotes || application.rejectionReason) && (
          <Card className={`p-6 ${application.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              ملاحظات الإدارة
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">
              {application.rejectionReason || application.adminNotes}
            </p>
          </Card>
        )}

        {/* Actions for rejected/modification */}
        {(application.status === 'REJECTED' || application.status === 'MODIFICATION_REQUESTED') && (
          <div className="flex justify-center">
            <Button onClick={() => router.push('/activation')} size="lg">
              إعادة التقديم
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || ''}
                className="w-16 h-16 rounded-2xl border-2 border-blue-500/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {session.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">مرحباً، {session.user?.name}</h1>
              <p className="text-gray-400">هذه لوحة التحكم الخاصة بك</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          {renderStatusContent()}
        </div>
      </div>
    </div>
  );
}
