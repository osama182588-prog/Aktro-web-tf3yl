"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Activity,
  FileText,
  Star,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  activated: number;
  rejected: number;
  priority: number;
  todaySubmissions: number;
  acceptanceRate: number;
  avgReviewTime: string;
}

interface RecentRequest {
  id: string;
  characterName: string;
  status: string;
  createdAt: string;
  isPriority: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, requestsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/requests?limit=5')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRecentRequests(requestsData.requests || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "إجمالي الطلبات", value: stats?.total || 0, icon: FileText, color: "blue" },
    { label: "قيد المراجعة", value: stats?.pending || 0, icon: Clock, color: "yellow" },
    { label: "مفعلين", value: stats?.activated || 0, icon: CheckCircle, color: "green" },
    { label: "مرفوضين", value: stats?.rejected || 0, icon: XCircle, color: "red" },
    { label: "طلبات اليوم", value: stats?.todaySubmissions || 0, icon: Activity, color: "purple" },
    { label: "طلبات أولوية", value: stats?.priority || 0, icon: Star, color: "orange" },
  ];

  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-700",
    yellow: "from-yellow-500 to-yellow-700",
    green: "from-green-500 to-green-700",
    red: "from-red-500 to-red-700",
    purple: "from-purple-500 to-purple-700",
    orange: "from-orange-500 to-orange-700"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نظرة عامة</h1>
          <p className="text-gray-400">مرحباً في لوحة تحكم Secret CFW</p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[card.color]} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm text-gray-400">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* الإحصائيات الإضافية */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* نسبة القبول */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              نسبة القبول
            </h3>
            <span className="text-2xl font-bold text-green-400">
              {stats?.acceptanceRate || 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats?.acceptanceRate || 0}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
            />
          </div>
        </motion.div>

        {/* متوسط وقت المراجعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              متوسط وقت المراجعة
            </h3>
            <span className="text-2xl font-bold text-blue-400">
              {stats?.avgReviewTime || "N/A"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* آخر الطلبات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            آخر الطلبات
          </h3>
          <a href="/admin/requests" className="text-blue-400 hover:text-blue-300 text-sm">
            عرض الكل
          </a>
        </div>

        {recentRequests.length > 0 ? (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {request.isPriority && (
                    <Star className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="font-medium">{request.characterName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                  <span className={`status-badge ${
                    request.status === 'PENDING_REVIEW' ? 'status-pending' :
                    request.status === 'ACTIVATED' ? 'status-activated' :
                    request.status === 'REJECTED' ? 'status-rejected' :
                    'status-modification'
                  }`}>
                    {request.status === 'PENDING_REVIEW' ? 'قيد المراجعة' :
                     request.status === 'ACTIVATED' ? 'مفعل' :
                     request.status === 'REJECTED' ? 'مرفوض' :
                     'طلب تعديل'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد طلبات بعد</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
