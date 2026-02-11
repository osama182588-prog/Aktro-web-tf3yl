"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge"
import { Loader } from "@/components/ui/Loader"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { 
  User, 
  Calendar, 
  Clock, 
  FileText,
  MessageSquare,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
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
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<Application | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  const fetchData = async () => {
    try {
      const [appRes, notifRes] = await Promise.all([
        fetch("/api/applications/my"),
        fetch("/api/notifications"),
      ])

      if (appRes.ok) {
        const appData = await appRes.json()
        setApplication(appData.data)
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json()
        setNotifications(notifData.data || [])
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Card className="fade-in">
          <CardContent className="py-12">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-100 mb-4">
              تسجيل الدخول مطلوب
            </h1>
            <p className="text-gray-400 mb-8">
              يجب تسجيل الدخول عبر Discord للوصول إلى لوحة التحكم
            </p>
            <Button onClick={() => signIn("discord")} size="lg">
              تسجيل الدخول بـ Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    )
  }

  // Get status icon
  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "APPROVED":
        return <CheckCircle className="w-16 h-16 text-green-400" />
      case "REJECTED":
        return <XCircle className="w-16 h-16 text-red-400" />
      case "PENDING":
        return <Clock className="w-16 h-16 text-yellow-400" />
      case "MODIFICATION":
        return <AlertCircle className="w-16 h-16 text-orange-400" />
      default:
        return <FileText className="w-16 h-16 text-gray-400" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 fade-in">
        <div className="flex items-center gap-4">
          <img
            src={session?.user?.image || "/default-avatar.png"}
            alt={session?.user?.name || "User"}
            className="w-16 h-16 rounded-full ring-4 ring-blue-500/30"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              مرحباً، {session?.user?.name}
            </h1>
            <p className="text-gray-400">
              لوحة التحكم الشخصية
            </p>
          </div>
        </div>
        <Button onClick={fetchData} variant="ghost" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* No Application */}
      {!application && (
        <Card className="fade-in">
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              لم تقدم طلب تفعيل بعد
            </h2>
            <p className="text-gray-400 mb-8">
              ابدأ رحلتك معنا بتقديم طلب التفعيل
            </p>
            <Link href="/activation">
              <Button size="lg" className="gap-2">
                تقديم طلب التفعيل
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Application Status Card */}
      {application && (
        <div className="grid gap-6">
          {/* Status Overview */}
          <Card className="fade-in">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                {getStatusIcon(application.status)}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <StatusBadge status={application.status} size="lg" />
                    {application.priority && <PriorityBadge />}
                  </div>
                  <h2 className="text-xl font-bold text-gray-100 mb-2">
                    حالة طلب التفعيل
                  </h2>
                  <p className="text-gray-400">
                    {application.status === "APPROVED" && "تهانينا! تم قبول طلبك وأنت الآن مفعل"}
                    {application.status === "REJECTED" && "نأسف، تم رفض طلبك. يمكنك إعادة التقديم"}
                    {application.status === "PENDING" && "طلبك قيد المراجعة من قبل الإدارة"}
                    {application.status === "MODIFICATION" && "طُلب منك تعديل طلبك وإعادة التقديم"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  معلومات الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">الاسم الحقيقي</span>
                  <span className="text-gray-100">{application.realName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">العمر</span>
                  <span className="text-gray-100">{application.age} سنة</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">اسم الشخصية</span>
                  <span className="text-gray-100">{application.characterName}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  التواريخ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">تاريخ التقديم</span>
                  <span className="text-gray-100">{formatDate(application.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">آخر تحديث</span>
                  <span className="text-gray-100">{formatRelativeTime(application.updatedAt)}</span>
                </div>
                {application.reviewedAt && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">تاريخ المراجعة</span>
                    <span className="text-gray-100">{formatDate(application.reviewedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Admin Notes */}
          {application.publicNotes && (
            <Card className="fade-in border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  ملاحظات الإدارة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {application.publicNotes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {(application.status === "REJECTED" || application.status === "MODIFICATION") && (
            <Card className="fade-in">
              <CardContent className="py-6 text-center">
                <p className="text-gray-400 mb-4">
                  يمكنك إعادة التقديم وتحسين طلبك
                </p>
                <Link href="/activation">
                  <Button size="lg" className="gap-2">
                    إعادة التقديم
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="mt-8 fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border ${
                    notification.isRead 
                      ? "bg-gray-800/30 border-gray-700/30" 
                      : "bg-blue-500/10 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-100">{notification.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
