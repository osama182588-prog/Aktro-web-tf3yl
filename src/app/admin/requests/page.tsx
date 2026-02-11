"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, getStatusLabel } from "@/lib/utils"
import { 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Star,
  ChevronDown,
  X
} from "lucide-react"

interface ActivationRequest {
  id: string
  status: string
  realName: string
  age: number
  characterName: string
  characterStory: string
  testAnswers: { questionId: string; answer: string }[]
  submittedAt: string
  priority: boolean
  user: {
    discordId: string
    discordUsername: string
    discordAvatar: string | null
  }
}

export default function AdminRequestsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ActivationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<ActivationRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [filter])

  async function fetchRequests() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      if (search) params.set("search", search)
      
      const res = await fetch(`/api/admin/requests?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: "approve" | "reject" | "modify", requestId: string) {
    if (action === "reject" && !rejectionReason.trim()) {
      alert("يرجى إدخال سبب الرفض")
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminNote,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
          modificationRequest: action === "modify" ? adminNote : undefined
        })
      })

      if (res.ok) {
        setSelectedRequest(null)
        setAdminNote("")
        setRejectionReason("")
        fetchRequests()
      }
    } catch (error) {
      console.error("Failed to perform action:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
      PENDING: "warning",
      ACTIVATED: "success",
      REJECTED: "error"
    }
    return <Badge variant={variants[status] || "default"}>{getStatusLabel(status)}</Badge>
  }

  const filteredRequests = requests.filter(r => 
    !search || 
    r.characterName.includes(search) || 
    r.user.discordUsername.includes(search) ||
    r.realName.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h1 className="text-2xl font-bold mb-2">طلبات التفعيل</h1>
        <p className="text-foreground/60">إدارة ومراجعة طلبات التفعيل</p>
      </div>

      {/* Filters */}
      <Card className="fade-in">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <Input
                placeholder="بحث بالاسم أو المستخدم..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "PENDING", "ACTIVATED", "REJECTED"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === "all" ? "الكل" : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="fade-in">
          <CardContent className="py-12 text-center">
            <p className="text-foreground/60">لا توجد طلبات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request, index) => (
            <Card 
              key={request.id} 
              className="fade-in cursor-pointer hover:bg-card-hover transition-colors"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedRequest(request)}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {request.user.discordAvatar ? (
                      <img 
                        src={`https://cdn.discordapp.com/avatars/${request.user.discordId}/${request.user.discordAvatar}.png`}
                        alt={request.user.discordUsername}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold">
                        {request.user.discordUsername[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate">{request.characterName}</h3>
                      {request.priority && (
                        <Star className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <p className="text-sm text-foreground/60 truncate">
                      {request.user.discordUsername} • {request.realName}
                    </p>
                  </div>
                  <div className="text-left">
                    {getStatusBadge(request.status)}
                    <p className="text-xs text-foreground/40 mt-1">
                      {formatDate(request.submittedAt)}
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-foreground/40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                تفاصيل الطلب
                {selectedRequest.priority && <Star className="w-5 h-5 text-warning" />}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {selectedRequest.user.discordAvatar ? (
                    <img 
                      src={`https://cdn.discordapp.com/avatars/${selectedRequest.user.discordId}/${selectedRequest.user.discordAvatar}.png`}
                      alt={selectedRequest.user.discordUsername}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {selectedRequest.user.discordUsername[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedRequest.user.discordUsername}</h3>
                  <p className="text-foreground/60">
                    {selectedRequest.realName} • {selectedRequest.age} سنة
                  </p>
                </div>
                <div className="mr-auto">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              {/* Character Info */}
              <div>
                <h4 className="font-bold mb-2">اسم الشخصية</h4>
                <p className="p-3 rounded-lg bg-muted">{selectedRequest.characterName}</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">قصة الشخصية</h4>
                <p className="p-3 rounded-lg bg-muted whitespace-pre-wrap">
                  {selectedRequest.characterStory}
                </p>
              </div>

              {/* Test Answers */}
              <div>
                <h4 className="font-bold mb-2">إجابات الاختبار</h4>
                <div className="space-y-3">
                  {selectedRequest.testAnswers.map((answer, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted">
                      <p className="text-sm text-foreground/60 mb-1">سؤال {i + 1}</p>
                      <p>{answer.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              {selectedRequest.status === "PENDING" && (
                <div className="border-t border-border pt-6 space-y-4">
                  <Textarea
                    label="ملاحظات للعضو"
                    placeholder="أضف ملاحظة للعضو (اختياري)"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                  
                  <Textarea
                    label="سبب الرفض (مطلوب للرفض)"
                    placeholder="في حالة الرفض، اكتب السبب هنا"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1 gap-2"
                      onClick={() => handleAction("approve", selectedRequest.id)}
                      loading={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4" />
                      قبول
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleAction("modify", selectedRequest.id)}
                      loading={actionLoading}
                    >
                      <Edit className="w-4 h-4" />
                      طلب تعديل
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1 gap-2"
                      onClick={() => handleAction("reject", selectedRequest.id)}
                      loading={actionLoading}
                    >
                      <XCircle className="w-4 h-4" />
                      رفض
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
