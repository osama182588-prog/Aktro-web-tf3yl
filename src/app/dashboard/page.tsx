"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  User, 
  Calendar, 
  Clock, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  Zap,
  Star
} from "lucide-react"
import { formatDate, getStatusLabel } from "@/lib/utils"

interface ActivationRequest {
  id: string
  status: string
  realName: string
  characterName: string
  submittedAt: string
  reviewedAt: string | null
  adminNotes: string | null
  rejectionReason: string | null
  modificationRequest: string | null
  priority: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [request, setRequest] = useState<ActivationRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch("/api/activation/my-request")
        if (res.ok) {
          const data = await res.json()
          setRequest(data.request)
        }
      } catch (error) {
        console.error("Failed to fetch request:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchRequest()
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!session) return null

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
      NOT_ACTIVATED: "default",
      PENDING: "warning",
      ACTIVATED: "success",
      REJECTED: "error"
    }
    return <Badge variant={variants[status] || "default"}>{getStatusLabel(status)}</Badge>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVATED":
        return <CheckCircle className="w-16 h-16 text-success" />
      case "REJECTED":
        return <XCircle className="w-16 h-16 text-error" />
      case "PENDING":
        return (
          <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
            <div className="spinner border-warning border-t-transparent" />
          </div>
        )
      default:
        return <HelpCircle className="w-16 h-16 text-secondary" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* User Info Card */}
        <Card className="mb-8 fade-in">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {session.user.discordAvatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.discordAvatar}.png`}
                    alt={session.user.discordUsername}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-foreground/40" />
                )}
              </div>
              <div className="text-center sm:text-right flex-1">
                <h1 className="text-2xl font-bold mb-1">
                  مرحباً، {session.user.discordUsername}
                </h1>
                <p className="text-foreground/60">
                  هذه لوحتك الشخصية لمتابعة حالة التفعيل
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(session.user.activationStatus)}
                {request?.priority && (
                  <Badge variant="info">
                    <Star className="w-3 h-3 ml-1" />
                    أولوية
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Content */}
        {session.user.activationStatus === "NOT_ACTIVATED" && !request && (
          <Card className="text-center fade-in">
            <CardContent className="py-12">
              <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">لم تقم بالتفعيل بعد</h2>
              <p className="text-foreground/60 mb-6">
                ابدأ عملية التفعيل للانضمام إلى السيرفر
              </p>
              <Link href="/activation">
                <Button size="lg" className="gap-2">
                  <Zap className="w-5 h-5" />
                  ابدأ التفعيل
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {request && (
          <div className="space-y-6">
            {/* Main Status Card */}
            <Card className="text-center fade-in">
              <CardContent className="py-12">
                <div className="mb-4">
                  {getStatusIcon(request.status)}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {request.status === "ACTIVATED" && "تم التفعيل بنجاح!"}
                  {request.status === "PENDING" && "طلبك قيد المراجعة"}
                  {request.status === "REJECTED" && "تم رفض طلبك"}
                </h2>
                <p className="text-foreground/60">
                  {request.status === "ACTIVATED" && "مبروك! يمكنك الآن الدخول إلى السيرفر واللعب"}
                  {request.status === "PENDING" && "سيتم إعلامك عند اتخاذ قرار بشأن طلبك"}
                  {request.status === "REJECTED" && "يمكنك إعادة التقديم بعد تحسين طلبك"}
                </p>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card className="fade-in delay-100">
              <CardHeader>
                <CardTitle>تفاصيل الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-foreground/60">اسم الشخصية</p>
                      <p className="font-medium">{request.characterName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-foreground/60">تاريخ التقديم</p>
                      <p className="font-medium">{formatDate(request.submittedAt)}</p>
                    </div>
                  </div>
                  {request.reviewedAt && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-foreground/60">تاريخ المراجعة</p>
                        <p className="font-medium">{formatDate(request.reviewedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            {(request.adminNotes || request.rejectionReason || request.modificationRequest) && (
              <Card className="fade-in delay-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    ملاحظات الإدارة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.rejectionReason && (
                    <div className="p-4 rounded-lg bg-error/10 border border-error/20">
                      <p className="font-medium text-error mb-1">سبب الرفض:</p>
                      <p className="text-foreground/80">{request.rejectionReason}</p>
                    </div>
                  )}
                  
                  {request.modificationRequest && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="font-medium text-warning mb-1">مطلوب تعديل:</p>
                      <p className="text-foreground/80">{request.modificationRequest}</p>
                    </div>
                  )}
                  
                  {request.adminNotes && (
                    <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                      <p className="font-medium text-info mb-1">ملاحظات:</p>
                      <p className="text-foreground/80">{request.adminNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reapply Button for Rejected */}
            {request.status === "REJECTED" && (
              <div className="text-center fade-in delay-300">
                <Link href="/activation">
                  <Button size="lg" className="gap-2">
                    <Zap className="w-5 h-5" />
                    إعادة التقديم
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
