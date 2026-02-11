"use client";

// لوحة التحكم الإدارية - Admin Dashboard
// ======================================

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatRelativeTime } from "@/lib/utils";

interface Stats {
  totalApplications: number;
  pendingApplications: number;
  reviewingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  todayApplications: number;
  approvalRate: number;
}

interface RecentApplication {
  id: string;
  realName: string;
  status: string;
  isPriority: boolean;
  createdAt: string;
  user: {
    username: string;
    avatar?: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const user = session?.user as { isAdmin?: boolean };
      if (!user?.isAdmin) {
        router.push("/dashboard");
      } else {
        fetchDashboardData();
      }
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, applicationsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/applications?limit=5"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setRecentApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  const user = session?.user as { isAdmin?: boolean; adminRole?: string };
  if (!user?.isAdmin) return null;

  const statCards = [
    { label: "إجمالي الطلبات", value: stats?.totalApplications || 0, icon: FileText, color: "text-blue-400" },
    { label: "قيد الانتظار", value: stats?.pendingApplications || 0, icon: Clock, color: "text-yellow-400" },
    { label: "قيد المراجعة", value: stats?.reviewingApplications || 0, icon: AlertCircle, color: "text-purple-400" },
    { label: "مقبولة", value: stats?.approvedApplications || 0, icon: CheckCircle, color: "text-green-400" },
    { label: "مرفوضة", value: stats?.rejectedApplications || 0, icon: XCircle, color: "text-red-400" },
    { label: "اليوم", value: stats?.todayApplications || 0, icon: BarChart3, color: "text-cyan-400" },
  ];

  const menuItems = [
    { href: "/admin/applications", label: "إدارة الطلبات", icon: FileText, description: "مراجعة وإدارة طلبات التفعيل" },
    { href: "/admin/questions", label: "بنك الأسئلة", icon: HelpCircle, description: "إضافة وتعديل أسئلة الاختبار" },
    { href: "/admin/users", label: "المستخدمين", icon: Users, description: "إدارة المستخدمين والصلاحيات" },
    { href: "/admin/settings", label: "الإعدادات", icon: Settings, description: "إعدادات النظام والتصميم" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
            لوحة التحكم
          </h1>
          <p className="text-gray-400 mt-1">مرحباً، {session?.user?.name}</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="text-center py-6" hover={false}>
            <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Approval Rate */}
      {stats && (
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">نسبة القبول</h3>
              <p className="text-gray-400 text-sm">نسبة الطلبات المقبولة من إجمالي الطلبات المراجعة</p>
            </div>
            <div className="text-4xl font-bold text-green-400">
              {stats.approvalRate}%
            </div>
          </div>
          <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${stats.approvalRate}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">الوصول السريع</h2>
          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <Card className="h-full cursor-pointer group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-white">{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">آخر الطلبات</h2>
            <Link href="/admin/applications">
              <Button variant="ghost" size="sm">عرض الكل</Button>
            </Link>
          </div>
          <Card>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد طلبات حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <Link key={app.id} href={`/admin/applications/${app.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        {app.user.avatar ? (
                          <img 
                            src={app.user.avatar} 
                            alt="" 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{app.realName}</div>
                          <div className="text-sm text-gray-400">
                            {formatRelativeTime(app.createdAt)}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
