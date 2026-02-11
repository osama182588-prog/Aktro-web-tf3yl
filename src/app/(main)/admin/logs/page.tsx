"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Activity,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatDateAr } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  details: string | null;
  adminId: string;
  admin: {
    username: string;
    avatar: string | null;
  };
  targetId: string | null;
  target: {
    username: string;
  } | null;
  createdAt: string;
}

// بيانات تجريبية
const mockLogs: LogEntry[] = [
  {
    id: "1",
    action: "ACTIVATION_APPROVE",
    details: "قبول طلب تفعيل - محمد الأحمد",
    adminId: "admin1",
    admin: { username: "Admin1", avatar: null },
    targetId: "user1",
    target: { username: "Player1" },
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    action: "QUESTION_CREATED",
    details: "إضافة سؤال جديد: ما هو الرول بلاي؟",
    adminId: "admin1",
    admin: { username: "Admin1", avatar: null },
    targetId: null,
    target: null,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "3",
    action: "ACTIVATION_REJECT",
    details: "رفض طلب تفعيل - خالد السعيد",
    adminId: "admin2",
    admin: { username: "Admin2", avatar: null },
    targetId: "user2",
    target: { username: "Player2" },
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

const actionLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'ACTIVATION_APPROVE': { label: 'قبول تفعيل', icon: CheckCircle, color: 'text-green-400' },
  'ACTIVATION_REJECT': { label: 'رفض تفعيل', icon: XCircle, color: 'text-red-400' },
  'ACTIVATION_REQUEST_MODIFICATION': { label: 'طلب تعديل', icon: Edit, color: 'text-orange-400' },
  'ACTIVATION_SUBMITTED': { label: 'تقديم طلب', icon: Plus, color: 'text-blue-400' },
  'QUESTION_CREATED': { label: 'إضافة سؤال', icon: Plus, color: 'text-green-400' },
  'QUESTION_UPDATED': { label: 'تحديث سؤال', icon: Edit, color: 'text-yellow-400' },
  'QUESTION_DELETED': { label: 'حذف سؤال', icon: Trash2, color: 'text-red-400' }
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    // هنا يتم جلب السجلات من API
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter, page]);

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سجل النشاط</h1>
          <p className="text-gray-400">جميع العمليات الإدارية المسجلة</p>
        </div>
        <button
          onClick={fetchLogs}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* الفلاتر */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* البحث */}
          <div className="flex-grow relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث في السجلات..."
              className="input-field pr-10"
            />
          </div>

          {/* فلتر الإجراء */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">جميع الإجراءات</option>
            <option value="ACTIVATION_APPROVE">قبول تفعيل</option>
            <option value="ACTIVATION_REJECT">رفض تفعيل</option>
            <option value="QUESTION_CREATED">إضافة سؤال</option>
            <option value="QUESTION_UPDATED">تحديث سؤال</option>
            <option value="QUESTION_DELETED">حذف سؤال</option>
          </select>
        </div>
      </div>

      {/* السجلات */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد سجلات</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {logs.map((log, index) => {
                const actionInfo = actionLabels[log.action] || { 
                  label: log.action, 
                  icon: Activity, 
                  color: 'text-gray-400' 
                };
                const ActionIcon = actionInfo.icon;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* أيقونة الإجراء */}
                      <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center ${actionInfo.color}`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>

                      {/* المحتوى */}
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                          {log.target && (
                            <span className="text-gray-400">
                              → {log.target.username}
                            </span>
                          )}
                        </div>
                        {log.details && (
                          <p className="text-sm text-gray-400">{log.details}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{log.admin.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDateAr(log.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* التصفح */}
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <div className="text-sm text-gray-400">
                صفحة {page} من {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
