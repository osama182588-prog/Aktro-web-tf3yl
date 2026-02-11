'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatDateTime } from '@/lib/utils'
import { 
  User, 
  Clock, 
  FileText, 
  AlertCircle, 
  RefreshCw,
  Star,
} from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUESTED'
  isPriority: boolean
  adminNotes: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  reviewedAt: string | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/applications/me')
        if (response.ok) {
          const data = await response.json()
          setApplication(data.application)
        } else if (response.status !== 404) {
          throw new Error('حدث خطأ في تحميل البيانات')
        }
      } catch {
        setError('حدث خطأ في تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchApplication()
    }
  }, [session])

  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    )
  }

  const renderStatusContent = () => {
    if (!application) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-500/10 flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            لم تقم بالتقديم بعد
          </h3>
          <p className="text-gray-400 mb-6">
            ابدأ رحلتك معنا بالتقديم على التفعيل
          </p>
          <Link href="/activation">
            <Button>
              <FileText className="w-4 h-4" />
              تقديم طلب التفعيل
            </Button>
          </Link>
        </motion.div>
      )
    }

    const statusIcons = {
      PENDING: Clock,
      UNDER_REVIEW: RefreshCw,
      APPROVED: Star,
      REJECTED: AlertCircle,
      MODIFICATION_REQUESTED: FileText,
    }

    const StatusIcon = statusIcons[application.status]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Status Card */}
        <Card glass className="border-blue-500/20">
          <CardContent className="py-8 text-center">
            <motion.div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                application.status === 'APPROVED'
                  ? 'bg-green-500/20'
                  : application.status === 'REJECTED'
                  ? 'bg-red-500/20'
                  : application.status === 'UNDER_REVIEW'
                  ? 'bg-yellow-500/20'
                  : 'bg-blue-500/20'
              }`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <StatusIcon className={`w-10 h-10 ${
                application.status === 'APPROVED'
                  ? 'text-green-400'
                  : application.status === 'REJECTED'
                  ? 'text-red-400'
                  : application.status === 'UNDER_REVIEW'
                  ? 'text-yellow-400'
                  : 'text-blue-400'
              }`} />
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <StatusBadge status={application.status} />
              {application.isPriority && (
                <Badge variant="priority" pulse>
                  أولوية
                </Badge>
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {application.status === 'APPROVED' && 'تهانينا! تم قبول طلبك'}
              {application.status === 'REJECTED' && 'للأسف، تم رفض طلبك'}
              {application.status === 'UNDER_REVIEW' && 'طلبك قيد المراجعة'}
              {application.status === 'PENDING' && 'في انتظار المراجعة'}
              {application.status === 'MODIFICATION_REQUESTED' && 'مطلوب تعديل على طلبك'}
            </h3>

            <p className="text-gray-400">
              {application.status === 'APPROVED' && 'يمكنك الآن الانضمام للسيرفر والبدء في اللعب'}
              {application.status === 'REJECTED' && 'يمكنك إعادة التقديم مرة أخرى'}
              {application.status === 'UNDER_REVIEW' && 'فريق الإدارة يراجع طلبك حالياً'}
              {application.status === 'PENDING' && 'سيتم مراجعة طلبك قريباً'}
              {application.status === 'MODIFICATION_REQUESTED' && 'يرجى مراجعة الملاحظات وإعادة التقديم'}
            </p>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        {(application.adminNotes || application.rejectionReason) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                ملاحظات الإدارة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-wrap">
                {application.rejectionReason || application.adminNotes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              سجل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div>
                  <p className="text-white font-medium">تاريخ التقديم</p>
                  <p className="text-gray-400 text-sm">
                    {formatDateTime(application.createdAt)}
                  </p>
                </div>
              </div>
              
              {application.reviewedAt && (
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="text-white font-medium">تاريخ المراجعة</p>
                    <p className="text-gray-400 text-sm">
                      {formatDateTime(application.reviewedAt)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <div>
                  <p className="text-white font-medium">آخر تحديث</p>
                  <p className="text-gray-400 text-sm">
                    {formatDateTime(application.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {(application.status === 'REJECTED' || application.status === 'MODIFICATION_REQUESTED') && (
          <div className="text-center">
            <Link href="/activation">
              <Button>
                <RefreshCw className="w-4 h-4" />
                إعادة التقديم
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 pt-32 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || ''}
                  className="w-16 h-16 rounded-2xl border-2 border-blue-500/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  مرحباً، {session?.user?.name}
                </h1>
                <p className="text-gray-400">
                  لوحة التحكم الخاصة بك
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <Card className="border-red-500/30 mb-6">
              <CardContent className="py-6 text-center text-red-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                {error}
              </CardContent>
            </Card>
          )}

          {/* Content */}
          {renderStatusContent()}
        </div>
      </main>

      <Footer />
    </div>
  )
}
