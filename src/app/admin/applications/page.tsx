"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge"
import { Loader } from "@/components/ui/Loader"
import { hasActivationAdminRole } from "@/lib/config"
import { formatDate, formatRelativeTime, truncateText } from "@/lib/utils"
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Edit,
  Eye,
  RefreshCw,
  ArrowRight,
  MessageSquare,
  Star
} from "lucide-react"

interface Application {
  id: string
  realName: string
  age: number
  characterName: string
  characterStory: string
  status: string
  priority: boolean
  qualityRating: number | null
  adminNotes: string | null
  publicNotes: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    discordId: string
    username: string
    avatar: string | null
  }
  answers: Array<{
    id: string
    text: string
    question: {
      id: string
      text: string
    }
  }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [publicNotes, setPublicNotes] = useState("")
  const [qualityRating, setQualityRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityOnly, setPriorityOnly] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      if (!hasActivationAdminRole(session?.user?.roles || [])) {
        router.push("/admin")
      } else {
        fetchApplications()
      }
    } else if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, session, statusFilter, priorityOnly])

  const fetchApplications = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        status: statusFilter,
        ...(priorityOnly && { priority: "true" }),
        ...(searchQuery && { search: searchQuery }),
      })
      
      const res = await fetch(`/api/admin/applications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setApplications(data.data.applications)
        setPagination(data.data.pagination)
      }
    } catch (err) {
      console.error("Error fetching applications:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (appStatus: "APPROVED" | "REJECTED" | "MODIFICATION") => {
    if (!selectedApp) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: appStatus,
          adminNotes: reviewNotes,
          publicNotes: publicNotes,
          qualityRating: qualityRating > 0 ? qualityRating : null,
        }),
      })

      if (res.ok) {
        setShowReviewModal(false)
        setSelectedApp(null)
        setReviewNotes("")
        setPublicNotes("")
        setQualityRating(0)
        fetchApplications(pagination?.page || 1)
      }
    } catch (err) {
      console.error("Error reviewing application:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const openReviewModal = (app: Application) => {
    setSelectedApp(app)
    setReviewNotes(app.adminNotes || "")
    setPublicNotes(app.publicNotes || "")
    setQualityRating(app.qualityRating || 0)
    setShowReviewModal(true)
  }

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            إدارة الطلبات
          </h1>
          <p className="text-gray-400">
            مراجعة وإدارة طلبات التفعيل
          </p>
        </div>
        <Button onClick={() => router.push("/admin")} variant="ghost" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          العودة للوحة
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 fade-in">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="بحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchApplications()}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-gray-100"
            >
              <option value="all">جميع الحالات</option>
              <option value="PENDING">قيد المراجعة</option>
              <option value="APPROVED">مقبولة</option>
              <option value="REJECTED">مرفوضة</option>
              <option value="MODIFICATION">طلب تعديل</option>
            </select>
            <Button
              variant={priorityOnly ? "primary" : "secondary"}
              onClick={() => setPriorityOnly(!priorityOnly)}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              أولوية فقط
            </Button>
            <Button onClick={() => fetchApplications()} variant="ghost" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="fade-in">
            <CardContent className="py-12 text-center">
              <Filter className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد طلبات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        ) : (
          applications.map((app, index) => (
            <Card 
              key={app.id} 
              className="fade-in hover:border-blue-500/30 transition-colors"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={app.user.avatar 
                        ? `https://cdn.discordapp.com/avatars/${app.user.discordId}/${app.user.avatar}.png`
                        : "/default-avatar.png"
                      }
                      alt={app.user.username}
                      className="w-12 h-12 rounded-full ring-2 ring-gray-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-100">{app.realName}</h3>
                        {app.priority && <PriorityBadge />}
                      </div>
                      <p className="text-gray-400 text-sm">
                        @{app.user.username} • {app.characterName}
                      </p>
                    </div>
                  </div>

                  {/* Status & Meta */}
                  <div className="flex items-center gap-4">
                    <StatusBadge status={app.status} />
                    <span className="text-gray-500 text-sm">
                      {formatRelativeTime(app.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReviewModal(app)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      عرض
                    </Button>
                    {app.status === "PENDING" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app)
                            handleReview("APPROVED")
                          }}
                          className="text-green-400 hover:text-green-300 gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          قبول
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReviewModal(app)}
                          className="text-red-400 hover:text-red-300 gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Character Story Preview */}
                <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                  <p className="text-gray-400 text-sm">
                    {truncateText(app.characterStory, 200)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="secondary"
            disabled={pagination.page <= 1}
            onClick={() => fetchApplications(pagination.page - 1)}
          >
            السابق
          </Button>
          <span className="flex items-center px-4 text-gray-400">
            صفحة {pagination.page} من {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchApplications(pagination.page + 1)}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>مراجعة طلب: {selectedApp.realName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewModal(false)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
                <img
                  src={selectedApp.user.avatar 
                    ? `https://cdn.discordapp.com/avatars/${selectedApp.user.discordId}/${selectedApp.user.avatar}.png`
                    : "/default-avatar.png"
                  }
                  alt={selectedApp.user.username}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-bold text-gray-100">{selectedApp.realName}</h3>
                  <p className="text-gray-400">@{selectedApp.user.username}</p>
                  <p className="text-gray-500 text-sm">العمر: {selectedApp.age} سنة</p>
                </div>
                <div className="mr-auto">
                  <StatusBadge status={selectedApp.status} size="lg" />
                  {selectedApp.priority && <PriorityBadge className="mt-2" />}
                </div>
              </div>

              {/* Character Story */}
              <div>
                <h4 className="font-medium text-gray-200 mb-2">قصة الشخصية</h4>
                <div className="p-4 bg-gray-800/30 rounded-xl">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedApp.characterStory}</p>
                </div>
              </div>

              {/* Answers */}
              {selectedApp.answers.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-200 mb-2">إجابات الاختبار</h4>
                  <div className="space-y-4">
                    {selectedApp.answers.map((answer, idx) => (
                      <div key={answer.id} className="p-4 bg-gray-800/30 rounded-xl">
                        <p className="text-blue-400 font-medium mb-2">
                          {idx + 1}. {answer.question.text}
                        </p>
                        <p className="text-gray-300">{answer.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Rating */}
              <div>
                <h4 className="font-medium text-gray-200 mb-2">تقييم جودة الطلب</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setQualityRating(rating)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        qualityRating >= rating
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <Textarea
                label="ملاحظات داخلية (للإدارة فقط)"
                placeholder="ملاحظات لن يراها المتقدم..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />

              {/* Public Notes */}
              <Textarea
                label="ملاحظات للمتقدم"
                placeholder="ملاحظات ستظهر للمتقدم..."
                value={publicNotes}
                onChange={(e) => setPublicNotes(e.target.value)}
              />

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                <Button
                  onClick={() => handleReview("APPROVED")}
                  loading={submitting}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  قبول
                </Button>
                <Button
                  onClick={() => handleReview("REJECTED")}
                  loading={submitting}
                  variant="danger"
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </Button>
                <Button
                  onClick={() => handleReview("MODIFICATION")}
                  loading={submitting}
                  variant="secondary"
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  طلب تعديل
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowReviewModal(false)}
                  className="mr-auto"
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
