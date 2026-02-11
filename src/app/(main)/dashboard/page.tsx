"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  MessageSquare,
  Edit,
  RefreshCw,
  Star
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, LightLines } from "@/components/animations/ParticleBackground";
import Link from "next/link";
import { formatDateAr, getStatusLabel, getStatusColor } from "@/lib/utils";

interface ActivationData {
  id: string;
  status: string;
  realName: string;
  characterName: string;
  createdAt: string;
  updatedAt: string;
  adminNotes: string | null;
  publicNotes: string | null;
  isPriority: boolean;
  qualityRating: number | null;
}

const statusIcons: Record<string, React.ElementType> = {
  'NOT_ACTIVATED': AlertCircle,
  'PENDING_REVIEW': Clock,
  'ACTIVATED': CheckCircle,
  'REJECTED': XCircle,
  'MODIFICATION_REQUESTED': Edit
};

const statusColors: Record<string, string> = {
  'NOT_ACTIVATED': 'from-gray-500 to-gray-700',
  'PENDING_REVIEW': 'from-yellow-500 to-yellow-700',
  'ACTIVATED': 'from-green-500 to-green-700',
  'REJECTED': 'from-red-500 to-red-700',
  'MODIFICATION_REQUESTED': 'from-orange-500 to-orange-700'
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activationData, setActivationData] = useState<ActivationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchActivationData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchActivationData = async () => {
    try {
      const res = await fetch('/api/activation/status');
      if (res.ok) {
        const data = await res.json();
        setActivationData(data.activation);
      }
    } catch (error) {
      console.error('Error fetching activation data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-20">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h1 className="text-2xl font-bold mb-4">يجب تسجيل الدخول</h1>
            <Link href="/api/auth/signin" className="btn-primary">
              تسجيل الدخول
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStatus = activationData?.status || 'NOT_ACTIVATED';
  const StatusIcon = statusIcons[currentStatus] || AlertCircle;

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleBackground />
      <LightLines />
      <Header />
      
      <main className="flex-grow pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4">
          {/* العنوان */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">مرحباً، {session.user?.name}</h1>
            <p className="text-gray-400">هذه هي لوحتك الشخصية لمتابعة حالة التفعيل</p>
          </motion.div>

          {/* بطاقة الحالة الرئيسية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* أيقونة الحالة */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${statusColors[currentStatus]} flex items-center justify-center`}
              >
                <StatusIcon className="w-12 h-12 text-white" />
              </motion.div>

              {/* معلومات الحالة */}
              <div className="flex-grow text-center md:text-right">
                <div className="text-sm text-gray-400 mb-1">حالة التفعيل</div>
                <h2 className={`text-2xl font-bold ${getStatusColor(currentStatus)}`}>
                  {getStatusLabel(currentStatus)}
                </h2>
                
                {activationData?.isPriority && (
                  <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                    <Star className="w-4 h-4" />
                    <span>طلب ذو أولوية</span>
                  </div>
                )}
              </div>

              {/* أزرار الإجراء */}
              <div className="flex flex-col gap-2">
                {currentStatus === 'NOT_ACTIVATED' && (
                  <Link href="/activation" className="btn-primary flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>ابدأ التفعيل</span>
                  </Link>
                )}
                
                {(currentStatus === 'REJECTED' || currentStatus === 'MODIFICATION_REQUESTED') && (
                  <Link href="/activation" className="btn-primary flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    <span>إعادة التقديم</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* معلومات إضافية */}
          {activationData && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* معلومات الطلب */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  معلومات الطلب
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">الاسم الحقيقي</span>
                    <span className="font-medium">{activationData.realName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">اسم الشخصية</span>
                    <span className="font-medium">{activationData.characterName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">تاريخ التقديم</span>
                    <span className="font-medium">{formatDateAr(activationData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">آخر تحديث</span>
                    <span className="font-medium">{formatDateAr(activationData.updatedAt)}</span>
                  </div>
                </div>
              </motion.div>

              {/* ملاحظات الإدارة */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  ملاحظات الإدارة
                </h3>
                
                {activationData.publicNotes ? (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {activationData.publicNotes}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد ملاحظات بعد</p>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* رسالة للمستخدمين الجدد */}
          {!activationData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 text-center"
            >
              <Shield className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">لم تقم بالتفعيل بعد</h3>
              <p className="text-gray-400 mb-6">
                ابدأ عملية التفعيل الآن للانضمام لسيرفر Secret CFW
              </p>
              <Link href="/activation" className="btn-primary inline-flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>ابدأ التفعيل</span>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
