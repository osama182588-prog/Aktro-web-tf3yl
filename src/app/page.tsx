"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { GlowOrb } from "@/components/layout/Background"
import { Shield, Users, Zap, CheckCircle, ArrowLeft } from "lucide-react"

export default function Home() {
  const { data: session } = useSession()

  const features = [
    {
      icon: Shield,
      title: "نظام تفعيل آمن",
      description: "نظام تفعيل متكامل مع حماية قوية وكشف الحسابات المشبوهة",
    },
    {
      icon: Users,
      title: "إدارة احترافية",
      description: "لوحة تحكم متقدمة للإدارة مع صلاحيات مخصصة لكل رتبة",
    },
    {
      icon: Zap,
      title: "سرعة في المراجعة",
      description: "نظام أولوية للمراجعة السريعة مع إشعارات فورية",
    },
    {
      icon: CheckCircle,
      title: "تجربة سلسة",
      description: "واجهة عصرية سهلة الاستخدام على جميع الأجهزة",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative py-20 text-center">
        <GlowOrb position="top-left" />
        <GlowOrb position="top-right" />
        
        <div className="fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            مرحباً بك في منصة التفعيل
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6 leading-tight">
            <span className="glow-text">Secret CFW</span>
            <br />
            <span className="text-gray-400">منصة تفعيل اللاعبين</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            نظام احترافي لإدارة تفعيل اللاعبين لسيرفر FiveM
            <br />
            بتصميم عصري وتجربة مستخدم متميزة
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {session ? (
              <>
                <Link href="/activation">
                  <Button size="lg" className="gap-2">
                    ابدأ التفعيل
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    لوحتي الشخصية
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/terms">
                  <Button size="lg" className="gap-2">
                    اقرأ الشروط والأحكام
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/activation">
                  <Button variant="outline" size="lg">
                    معرفة المزيد
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">
            لماذا Secret CFW؟
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            نقدم لك أفضل تجربة تفعيل مع ميزات متقدمة وحماية قوية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              hover 
              className={`fade-in fade-in-delay-${index + 1}`}
            >
              <CardContent>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">
            كيف يعمل النظام؟
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            خطوات بسيطة للحصول على التفعيل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "تسجيل الدخول",
              description: "سجل دخولك عبر حساب Discord الخاص بك",
            },
            {
              step: "2",
              title: "تعبئة الطلب",
              description: "املأ نموذج التفعيل والإجابة على أسئلة الاختبار",
            },
            {
              step: "3",
              title: "انتظار المراجعة",
              description: "انتظر مراجعة الإدارة لطلبك والحصول على التفعيل",
            },
          ].map((item, index) => (
            <div key={index} className="relative fade-in">
              <div className="glass-card p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -left-4 transform -translate-y-1/2">
                  <ArrowLeft className="w-8 h-8 text-blue-500/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Card className="text-center bg-gradient-to-r from-blue-900/40 to-gray-900/40 border-blue-500/30">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              جاهز للانضمام؟
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              انضم إلينا اليوم وابدأ رحلتك في عالم Secret CFW
            </p>
            <Link href={session ? "/activation" : "/terms"}>
              <Button size="lg" className="gap-2">
                {session ? "ابدأ التفعيل الآن" : "اقرأ الشروط أولاً"}
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
