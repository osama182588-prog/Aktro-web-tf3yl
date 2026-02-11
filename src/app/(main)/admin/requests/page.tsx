"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  User
} from "lucide-react";
import { formatDateAr, getStatusLabel } from "@/lib/utils";

interface RequestUser {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
}

interface ActivationRequest {
  id: string;
  userId: string;
  user: RequestUser;
  realName: string;
  age: number;
  characterName: string;
  characterStory: string;
  answers: Record<string, string>;
  status: string;
  adminNotes: string | null;
  publicNotes: string | null;
  isPriority: boolean;
  qualityRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");
  const [priorityFilter, setPriorityFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ActivationRequest | null>(null);
  const [publicNotes, setPublicNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
        ...(priorityFilter && { priority: 'true' })
      });

      const res = await fetch(`/api/admin/requests?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId: string, action: 'approve' | 'reject' | 'request_modification') => {
    try {
      setActionLoading(requestId);
      
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          publicNotes: publicNotes || undefined,
          adminNotes: adminNotes || undefined
        })
      });

      if (res.ok) {
        fetchRequests();
        setSelectedRequest(null);
        setPublicNotes("");
        setAdminNotes("");
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
        <p className="text-gray-400">مراجعة طلبات التفعيل والتحكم فيها</p>
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
              placeholder="البحث باسم الشخصية أو المستخدم..."
              className="input-field pr-10"
            />
          </div>

          {/* فلتر الحالة */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">جميع الحالات</option>
            <option value="PENDING_REVIEW">قيد المراجعة</option>
            <option value="ACTIVATED">مفعل</option>
            <option value="REJECTED">مرفوض</option>
            <option value="MODIFICATION_REQUESTED">طلب تعديل</option>
          </select>

          {/* فلتر الأولوية */}
          <button
            onClick={() => setPriorityFilter(!priorityFilter)}
            className={`btn-secondary flex items-center gap-2 ${priorityFilter ? 'bg-yellow-500/20 text-yellow-400' : ''}`}
          >
            <Star className="w-4 h-4" />
            <span>الأولوية</span>
          </button>
        </div>
      </div>

      {/* جدول الطلبات */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد طلبات</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>اسم الشخصية</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {request.user.avatar ? (
                            <img
                              src={request.user.avatar}
                              alt={request.user.username}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{request.user.username}</div>
                            <div className="text-xs text-gray-500">{request.realName}</div>
                          </div>
                          {request.isPriority && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </td>
                      <td>{request.characterName}</td>
                      <td>
                        <span className={`status-badge ${
                          request.status === 'PENDING_REVIEW' ? 'status-pending' :
                          request.status === 'ACTIVATED' ? 'status-activated' :
                          request.status === 'REJECTED' ? 'status-rejected' :
                          'status-modification'
                        }`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="text-sm text-gray-400">
                        {formatDateAr(request.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setPublicNotes(request.publicNotes || "");
                              setAdminNotes(request.adminNotes || "");
                            }}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {request.status === 'PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleAction(request.id, 'approve')}
                                disabled={actionLoading === request.id}
                                className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
                                title="قبول"
                              >
                                {actionLoading === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleAction(request.id, 'reject')}
                                disabled={actionLoading === request.id}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                title="رفض"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(request.id, 'request_modification')}
                                disabled={actionLoading === request.id}
                                className="p-2 rounded-lg hover:bg-orange-500/20 text-orange-400 transition-colors"
                                title="طلب تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* نافذة تفاصيل الطلب */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-semibold">تفاصيل الطلب</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* معلومات المستخدم */}
                <div className="flex items-center gap-4">
                  {selectedRequest.user.avatar ? (
                    <img
                      src={selectedRequest.user.avatar}
                      alt={selectedRequest.user.username}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-lg">{selectedRequest.user.username}</div>
                    <div className="text-gray-400">{selectedRequest.realName} - {selectedRequest.age} سنة</div>
                    <div className="text-sm text-gray-500">Discord: {selectedRequest.user.discordId}</div>
                  </div>
                  {selectedRequest.isPriority && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span>أولوية</span>
                    </div>
                  )}
                </div>

                {/* اسم الشخصية */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">اسم الشخصية</h3>
                  <p className="text-lg font-medium">{selectedRequest.characterName}</p>
                </div>

                {/* قصة الشخصية */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">قصة الشخصية</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedRequest.characterStory}
                  </div>
                </div>

                {/* الإجابات */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">إجابات الاختبار</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedRequest.answers).map(([questionId, answer], index) => (
                      <div key={questionId} className="bg-gray-800/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">السؤال {index + 1}</p>
                        <p className="text-gray-300">{answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ملاحظات للمستخدم */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    ملاحظات للمستخدم (تظهر له)
                  </h3>
                  <textarea
                    value={publicNotes}
                    onChange={(e) => setPublicNotes(e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="اكتب ملاحظات تظهر للمستخدم..."
                  />
                </div>

                {/* ملاحظات داخلية */}
                <div>
                  <h3 className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    ملاحظات داخلية (للإدارة فقط)
                  </h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="اكتب ملاحظات داخلية للإدارة..."
                  />
                </div>

                {/* أزرار الإجراءات */}
                {selectedRequest.status === 'PENDING_REVIEW' && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleAction(selectedRequest.id, 'approve')}
                      disabled={actionLoading === selectedRequest.id}
                      className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      {actionLoading === selectedRequest.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>قبول</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedRequest.id, 'reject')}
                      disabled={actionLoading === selectedRequest.id}
                      className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>رفض</span>
                    </button>
                    <button
                      onClick={() => handleAction(selectedRequest.id, 'request_modification')}
                      disabled={actionLoading === selectedRequest.id}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>طلب تعديل</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
