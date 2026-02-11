"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

interface ActivationData {
  id: string
  status: string
  realName: string
  characterName: string
  publicNotes?: string
  createdAt: string
  updatedAt: string
  reviewedAt?: string
}

const statusConfig = {
  NOT_ACTIVATED: {
    label: "غير مفعل",
    color: "gray",
    bgClass: "bg-gray-500/20",
    textClass: "text-gray-400",
    borderClass: "border-gray-500/30",
  },
  PENDING: {
    label: "قيد المراجعة",
    color: "yellow",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-400",
    borderClass: "border-yellow-500/30",
  },
  ACTIVATED: {
    label: "مفعل",
    color: "green",
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
    borderClass: "border-green-500/30",
  },
  REJECTED: {
    label: "مرفوض",
    color: "red",
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    borderClass: "border-red-500/30",
  },
  EDIT_REQUESTED: {
    label: "مطلوب تعديل",
    color: "blue",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
    borderClass: "border-blue-500/30",
  },
}

function DashboardContent() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justSubmitted = searchParams.get("submitted") === "true"

  const [loading, setLoading] = useState(true)
  const [activationData, setActivationData] = useState<ActivationData | null>(null)

  useEffect(() => {
    if (session) {
      fetchActivationData()
    }
  }, [session])

  const fetchActivationData = async () => {
    try {
      const res = await fetch("/api/activation/my")
      const data = await res.json()
      if (data.success && data.data) {
        setActivationData(data.data)
      }
    } catch (err) {
      console.error("Error fetching activation data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="spinner" />
        </div>
        <Footer />
      </div>
    )
  }

  // Not logged in
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-white mb-3">
              تسجيل الدخول مطلوب
            </h2>
            <p className="text-gray-400 mb-6">
              يجب تسجيل الدخول لعرض لوحة التحكم
            </p>
            <Link href="/login?callbackUrl=/dashboard" className="btn-glow inline-block">
              تسجيل الدخول
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currentStatus = activationData
    ? statusConfig[activationData.status as keyof typeof statusConfig]
    : statusConfig.NOT_ACTIVATED

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Success Message */}
          {justSubmitted && (
            <div className="glass-card p-6 mb-8 border-green-500/30 bg-green-500/10 fade-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-400"
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
                </div>
                <div>
                  <h3 className="font-bold text-green-400 mb-1">
                    تم إرسال طلبك بنجاح!
                  </h3>
                  <p className="text-gray-400 text-sm">
                    سيتم مراجعة طلبك من قبل الإدارة في أقرب وقت.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Header */}
          <div className="glass-card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl border-4 border-blue-500/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-400">
                      {session.user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                {session.user.hasPriority && (
                  <div className="absolute -top-2 -right-2 priority-badge">
                    ⭐ أولوية
                  </div>
                )}
              </div>

              <div className="text-center md:text-right flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                  مرحباً، {session.user.name}
                </h1>
                <p className="text-gray-400">
                  هذه لوحة التحكم الخاصة بك لمتابعة حالة التفعيل
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`status-badge ${currentStatus.bgClass} ${currentStatus.textClass} ${currentStatus.borderClass}`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {currentStatus.label}
              </div>
            </div>
          </div>

          {/* No Request */}
          {!activationData && (
            <div className="glass-card p-12 text-center fade-in">
              <div className="w-20 h-20 rounded-2xl bg-gray-500/20 flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                لم تقدم طلب تفعيل بعد
              </h2>
              <p className="text-gray-400 mb-6">
                للانضمام للسيرفر، يجب عليك تقديم طلب تفعيل أولاً
              </p>
              <Link href="/activation" className="btn-glow inline-block">
                تقديم طلب التفعيل
              </Link>
            </div>
          )}

          {/* Request Details */}
          {activationData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Info */}
              <div className="glass-card p-6 fade-in">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  معلومات الطلب
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-500 text-sm">الاسم الحقيقي</span>
                    <p className="text-white">{activationData.realName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">اسم الشخصية</span>
                    <p className="text-white">{activationData.characterName}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card p-6 fade-in">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  التواريخ
                </h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-500 text-sm">تاريخ التقديم</span>
                    <p className="text-white">
                      {new Date(activationData.createdAt).toLocaleDateString(
                        "ar-SA",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">آخر تحديث</span>
                    <p className="text-white">
                      {new Date(activationData.updatedAt).toLocaleDateString(
                        "ar-SA",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  {activationData.reviewedAt && (
                    <div>
                      <span className="text-gray-500 text-sm">تاريخ المراجعة</span>
                      <p className="text-white">
                        {new Date(activationData.reviewedAt).toLocaleDateString(
                          "ar-SA",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {activationData.publicNotes && (
                <div className="glass-card p-6 md:col-span-2 fade-in">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    ملاحظات الإدارة
                  </h2>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {activationData.publicNotes}
                  </p>
                </div>
              )}

              {/* Action Buttons based on Status */}
              {(activationData.status === "REJECTED" ||
                activationData.status === "EDIT_REQUESTED") && (
                <div className="glass-card p-6 md:col-span-2 text-center fade-in">
                  <p className="text-gray-400 mb-4">
                    {activationData.status === "REJECTED"
                      ? "يمكنك إعادة التقديم بعد تحسين طلبك"
                      : "يرجى تعديل طلبك وإعادة الإرسال"}
                  </p>
                  <Link href="/activation" className="btn-glow inline-block">
                    إعادة التقديم
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
