'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AdminRole } from '@/generated/prisma';

interface Stats {
  totalApplications: number;
  pendingApplications: number;
  approvedToday: number;
  rejectedToday: number;
  approvalRate: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.adminRole || session.user.adminRole === AdminRole.NONE) {
        router.push('/dashboard');
        return;
      }

      // Fetch stats and recent applications
      Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/applications?limit=5').then(r => r.json()),
      ])
        .then(([statsData, applicationsData]) => {
          setStats(statsData);
          setRecentApplications(applicationsData.applications || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session || session.user?.adminRole === AdminRole.NONE) {
    return null;
  }

  const adminRole = session.user.adminRole;
  const isSuperAdmin = adminRole === AdminRole.SUPER_ADMIN;
  const isActivationAdmin = adminRole === AdminRole.ACTIVATION_ADMIN || isSuperAdmin;
  const isGeneralAdmin = adminRole === AdminRole.GENERAL_ADMIN || isSuperAdmin;

  const menuItems = [
    {
      title: 'إدارة الطلبات',
      href: '/admin/applications',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      show: isActivationAdmin,
      color: 'blue',
    },
    {
      title: 'بنك الأسئلة',
      href: '/admin/questions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      show: isGeneralAdmin,
      color: 'green',
    },
    {
      title: 'سجل النشاط',
      href: '/admin/logs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      show: isSuperAdmin,
      color: 'yellow',
    },
    {
      title: 'الإعدادات',
      href: '/admin/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      show: isSuperAdmin,
      color: 'purple',
    },
  ];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">لوحة التحكم</span>
          </h1>
          <p className="text-gray-400">مرحباً، {session.user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{stats?.totalApplications || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">قيد المراجعة</p>
                <p className="text-2xl font-bold">{stats?.pendingApplications || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">مقبول اليوم</p>
                <p className="text-2xl font-bold">{stats?.approvedToday || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">مرفوض اليوم</p>
                <p className="text-2xl font-bold">{stats?.rejectedToday || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">الوصول السريع</h2>
              <div className="space-y-3">
                {menuItems
                  .filter(item => item.show)
                  .map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/20 flex items-center justify-center text-${item.color}-400`}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>
          </div>

          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">آخر الطلبات</h2>
                <Link href="/admin/applications">
                  <Button variant="ghost" size="sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>
              
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  لا توجد طلبات حالياً
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((app: any) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                          {app.user?.avatar ? (
                            <img
                              src={`https://cdn.discordapp.com/avatars/${app.user.discordId}/${app.user.avatar}.png`}
                              alt=""
                              className="w-full h-full rounded-lg"
                            />
                          ) : (
                            <span className="text-gray-400">{app.characterName?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{app.characterName}</p>
                          <p className="text-sm text-gray-400">{app.user?.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {app.isPriority && (
                          <Badge variant="info" className="text-xs">أولوية</Badge>
                        )}
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
