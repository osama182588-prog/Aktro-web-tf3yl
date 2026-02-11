"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Shield, 
  Users, 
  Zap, 
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Clock,
  Star
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, LightLines, CursorGlow } from "@/components/animations/ParticleBackground";

const features = [
  {
    icon: Shield,
    title: "نظام تفعيل متقدم",
    description: "نظام تفعيل احترافي يضمن جودة اللاعبين وتنظيم السيرفر"
  },
  {
    icon: Zap,
    title: "سرعة في المراجعة",
    description: "فريق إداري متخصص لمراجعة الطلبات بسرعة وكفاءة"
  },
  {
    icon: Users,
    title: "مجتمع متميز",
    description: "انضم لمجتمع من اللاعبين المحترفين والملتزمين"
  },
  {
    icon: Star,
    title: "تجربة فريدة",
    description: "استمتع بتجربة رول بلاي واقعية ومميزة"
  }
];

const stats = [
  { value: "500+", label: "لاعب مفعل" },
  { value: "95%", label: "نسبة القبول" },
  { value: "24h", label: "متوسط المراجعة" },
  { value: "4.8", label: "تقييم اللاعبين" }
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* الخلفيات المتحركة */}
      <ParticleBackground />
      <LightLines />
      <CursorGlow />
      
      <Header />
      
      <main className="flex-grow pt-24 relative z-10">
        {/* قسم البطل */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* شارة */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">أهلاً بك في Secret CFW</span>
              </motion.div>

              {/* العنوان الرئيسي */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-gradient">ابدأ رحلتك</span>
                <br />
                <span className="text-white">في عالم الرول بلاي</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                منصة التفعيل الرسمية لسيرفر Secret CFW - قم بإكمال التفعيل 
                وانضم لمجتمعنا المميز من اللاعبين المحترفين
              </p>

              {/* أزرار الإجراء */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {session ? (
                  <>
                    <Link href="/activation">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                      >
                        <Shield className="w-5 h-5" />
                        <span>ابدأ التفعيل</span>
                        <ArrowLeft className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    <Link href="/dashboard">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>لوحتي</span>
                      </motion.button>
                    </Link>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/api/auth/signin'}
                    className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                  >
                    <Shield className="w-5 h-5" />
                    <span>سجل الدخول للبدء</span>
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* قسم الإحصائيات */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="stat-card text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* قسم المميزات */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-gradient">لماذا Secret CFW؟</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                نقدم لك تجربة رول بلاي متميزة مع نظام تفعيل احترافي يضمن جودة المجتمع
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-700/30 transition-all"
                  >
                    <feature.icon className="w-8 h-8 text-blue-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* قسم خطوات التفعيل */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-gradient">كيف يعمل التفعيل؟</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {[
                { step: "1", title: "سجل الدخول", desc: "قم بتسجيل الدخول عبر حسابك في Discord" },
                { step: "2", title: "أكمل البيانات", desc: "أدخل معلوماتك الشخصية وقصة شخصيتك" },
                { step: "3", title: "أجب على الأسئلة", desc: "أجب على أسئلة الاختبار الكتابية" },
                { step: "4", title: "انتظر المراجعة", desc: "سيتم مراجعة طلبك من قبل الإدارة" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 mb-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <div className="glass-card flex-grow p-4">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* دعوة للعمل */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto relative overflow-hidden"
            >
              {/* تأثير التوهج */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"
                >
                  <Clock className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  جاهز للانضمام؟
                </h2>
                <p className="text-gray-400 mb-8">
                  ابدأ عملية التفعيل الآن وانضم لعائلة Secret CFW
                </p>
                
                <Link href={session ? "/activation" : "/api/auth/signin"}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary text-lg px-10 py-4"
                  >
                    {session ? "ابدأ التفعيل الآن" : "سجل الدخول للبدء"}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
