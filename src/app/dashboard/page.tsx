"use client";

// لوحة العضو - User Dashboard
// ===========================

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Sparkles,
  Calendar,
  MessageSquare,
  Crown
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface ApplicationData {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  rejectionReason?: string;
  isPriority: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchApplication();
    }
  }, [session]);

  const fetchApplication = async () => {
    try {
      const res = await fetch("/api/applications/my");
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isPriority?: boolean;
  };

  const renderStatusContent = () => {
    if (!application) {
      // لم يتم التقديم بعد
      return (
        <Card className="text-center py-12" glow>
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">لم تقم بالتقديم بعد</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            قم بتقديم طلب التفعيل الآن للانضمام إلى سيرفرنا والاستمتاع بتجربة لعب مميزة
          </p>
          <Link href="/activation">
            <Button size="lg">
              <Sparkles className="w-5 h-5" />
              ابدأ التفعيل الآن
            </Button>
          </Link>
        </Card>
      );
    }

    const statusContent: Record<string, { icon: typeof CheckCircle; color: string; title: string; description: string }> = {
      PENDING: {
        icon: Clock,
        color: "text-yellow-400",
        title: "طلبك في الانتظار",
        description: "تم استلام طلبك وسيتم مراجعته قريباً",
      },
      REVIEWING: {
        icon: AlertCircle,
        color: "text-blue-400",
        title: "جارِ مراجعة طلبك",
        description: "يقوم فريقنا بمراجعة طلبك حالياً",
      },
      APPROVED: {
        icon: CheckCircle,
        color: "text-green-400",
        title: "تم قبول طلبك!",
        description: "مبروك! تم قبول طلبك ويمكنك الآن اللعب في السيرفر",
      },
      REJECTED: {
        icon: XCircle,
        color: "text-red-400",
        title: "تم رفض طلبك",
        description: "للأسف تم رفض طلبك، يمكنك إعادة التقديم",
      },
      MODIFICATION_REQUIRED: {
        icon: MessageSquare,
        color: "text-orange-400",
        title: "مطلوب تعديل",
        description: "يرجى مراجعة الملاحظات وإعادة التقديم",
      },
    };

    const currentStatus = statusContent[application.status] || statusContent.PENDING;
    const StatusIcon = currentStatus.icon;

    return (
      <div className="space-y-6">
        {/* Status Card */}
        <Card className="text-center py-10" glow>
          <div className={`w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6`}>
            <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{currentStatus.title}</h2>
          <p className="text-gray-400 mb-6">{currentStatus.description}</p>
          <StatusBadge status={application.status} size="lg" />
          
          {application.isPriority && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              <Crown className="w-4 h-4" />
              طلب ذو أولوية
            </div>
          )}
        </Card>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              تواريخ الطلب
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">تاريخ التقديم</div>
                <div className="text-white">{formatDate(application.createdAt)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">آخر تحديث</div>
                <div className="text-white">{formatRelativeTime(application.updatedAt)}</div>
              </div>
            </div>
          </Card>

          {(application.adminNotes || application.rejectionReason) && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                ملاحظات الإدارة
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {application.rejectionReason || application.adminNotes || "لا توجد ملاحظات"}
              </p>
            </Card>
          )}
        </div>

        {/* Action Button for Rejected */}
        {(application.status === "REJECTED" || application.status === "MODIFICATION_REQUIRED") && (
          <Card className="text-center">
            <p className="text-gray-400 mb-4">
              يمكنك إعادة التقديم على التفعيل بعد مراجعة الملاحظات
            </p>
            <Link href="/activation">
              <Button>
                <Sparkles className="w-5 h-5" />
                إعادة التقديم
              </Button>
            </Link>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl border-2 border-blue-500/50"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              مرحباً، {user.name}
            </h1>
            <p className="text-gray-400">لوحة التحكم الخاصة بك</p>
          </div>
        </div>
        
        {user.isPriority && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            <Crown className="w-5 h-5" />
            عضو مميز
          </div>
        )}
      </div>

      {/* Status Content */}
      {renderStatusContent()}
    </div>
  );
}
