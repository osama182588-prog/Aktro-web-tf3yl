"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"

interface User {
  id: string
  discordId: string
  discordUsername: string
  discordAvatar?: string
}

interface Request {
  id: string
  userId: string
  realName: string
  age: number
  characterName: string
  characterStory: string
  quizAnswers: { questionId: string; question: string; answer: string }[]
  status: string
  hasPriority: boolean
  adminNotes?: string
  publicNotes?: string
  qualityRating?: number
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  user: User
}

const statusConfig: Record<
  string,
  { label: string; bgClass: string; textClass: string }
> = {
  PENDING: {
    label: "قيد المراجعة",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-400",
  },
  ACTIVATED: {
    label: "مفعل",
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
  },
  REJECTED: {
    label: "مرفوض",
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
  },
  EDIT_REQUESTED: {
    label: "مطلوب تعديل",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
  },
}

function RequestsContent() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [publicNotes, setPublicNotes] = useState("")
  const [filter, setFilter] = useState(searchParams.get("status") || "PENDING")
  const [search, setSearch] = useState("")
  const [priorityOnly, setPriorityOnly] = useState(
    searchParams.get("priority") === "true"
  )

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/requests")
    } else if (session && !session.user.isActivationAdmin && !session.user.isHighAdmin) {
      router.push("/admin")
    } else if (session?.user.isAdmin) {
      fetchRequests()
    }
  }, [session, authStatus, filter, priorityOnly])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter && filter !== "all") params.set("status", filter)
      if (priorityOnly) params.set("priority", "true")
      if (search) params.set("search", search)

      const res = await fetch(`/api/admin/requests?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setRequests(data.data.requests)
      }
    } catch (err) {
      console.error("Error fetching requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    if (!selectedRequest) return
    setActionLoading(true)

    try {
      const res = await fetch("/api/admin/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action,
          adminNotes,
          publicNotes,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setSelectedRequest(null)
        setAdminNotes("")
        setPublicNotes("")
        fetchRequests()
      } else {
        alert(data.error || "حدث خطأ")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("حدث خطأ في الخادم")
    } finally {
      setActionLoading(false)
    }
  }

  const openModal = (request: Request) => {
    setSelectedRequest(request)
    setAdminNotes(request.adminNotes || "")
    setPublicNotes(request.publicNotes || "")
    setShowModal(true)
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/admin" className="text-gray-400 hover:text-blue-400">
              لوحة التحكم
            </Link>
            <span className="text-gray-600 mx-2">/</span>
            <span className="text-white">طلبات التفعيل</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white">طلبات التفعيل</h1>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="text"
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRequests()}
                className="input-styled w-48"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-styled w-40"
              >
                <option value="PENDING">قيد المراجعة</option>
                <option value="ACTIVATED">مفعل</option>
                <option value="REJECTED">مرفوض</option>
                <option value="EDIT_REQUESTED">مطلوب تعديل</option>
                <option value="all">الكل</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priorityOnly}
                  onChange={(e) => setPriorityOnly(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-400">الأولوية فقط</span>
              </label>
            </div>
          </div>

          {/* Requests List */}
          <div className="glass-card overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-styled">
                  <thead>
                    <tr>
                      <th>المستخدم</th>
                      <th>الاسم الحقيقي</th>
                      <th>الشخصية</th>
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
                            {request.user.discordAvatar ? (
                              <img
                                src={`https://cdn.discordapp.com/avatars/${request.user.discordId}/${request.user.discordAvatar}.png`}
                                alt=""
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">
                                {request.user.discordUsername.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="text-white">
                                {request.user.discordUsername}
                              </div>
                              {request.hasPriority && (
                                <span className="priority-badge text-xs">
                                  أولوية
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-300">{request.realName}</td>
                        <td className="text-gray-300">{request.characterName}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              statusConfig[request.status]?.bgClass
                            } ${statusConfig[request.status]?.textClass}`}
                          >
                            {statusConfig[request.status]?.label}
                          </span>
                        </td>
                        <td className="text-gray-400 text-sm">
                          {new Date(request.createdAt).toLocaleDateString(
                            "ar-SA"
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => openModal(request)}
                            className="py-2 px-4 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                          >
                            عرض
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[rgba(30,41,59,0.95)] p-6 border-b border-[rgba(59,130,246,0.2)] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">تفاصيل الطلب</h2>
                <p className="text-gray-400 text-sm">
                  {selectedRequest.user.discordUsername}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-500 text-sm">الاسم الحقيقي</label>
                  <p className="text-white">{selectedRequest.realName}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">العمر</label>
                  <p className="text-white">{selectedRequest.age} سنة</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">اسم الشخصية</label>
                  <p className="text-white">{selectedRequest.characterName}</p>
                </div>
              </div>

              {/* Character Story */}
              <div>
                <label className="text-gray-500 text-sm">قصة الشخصية</label>
                <div className="mt-2 p-4 rounded-lg bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {selectedRequest.characterStory}
                  </p>
                </div>
              </div>

              {/* Quiz Answers */}
              <div>
                <label className="text-gray-500 text-sm">إجابات الاختبار</label>
                <div className="mt-2 space-y-4">
                  {selectedRequest.quizAnswers?.map((qa, index) => (
                    <div
                      key={qa.questionId}
                      className="p-4 rounded-lg bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]"
                    >
                      <p className="text-blue-400 text-sm mb-2">
                        السؤال {index + 1}: {qa.question}
                      </p>
                      <p className="text-gray-300">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-gray-500 text-sm">
                  ملاحظات داخلية (للإدارة فقط)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="textarea-styled mt-2"
                  placeholder="ملاحظات داخلية..."
                />
              </div>

              {/* Public Notes */}
              <div>
                <label className="text-gray-500 text-sm">
                  ملاحظات للعضو (ستظهر للعضو)
                </label>
                <textarea
                  value={publicNotes}
                  onChange={(e) => setPublicNotes(e.target.value)}
                  className="textarea-styled mt-2"
                  placeholder="سبب الرفض أو ملاحظات للتعديل..."
                />
              </div>

              {/* Actions */}
              {selectedRequest.status === "PENDING" && (
                <div className="flex flex-wrap gap-4 pt-4 border-t border-[rgba(59,130,246,0.2)]">
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading}
                    className="py-3 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <div className="spinner w-5 h-5" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    قبول
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                    className="py-3 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    رفض
                  </button>
                  <button
                    onClick={() => handleAction("request_edit")}
                    disabled={actionLoading}
                    className="py-3 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    طلب تعديل
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <RequestsContent />
    </Suspense>
  )
}
