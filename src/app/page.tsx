"use client";

// الصفحة الرئيسية - Home Page
// ===========================

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Shield, Sparkles, Users, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function HomePage() {
  const { data: session } = useSession();

  const features = [
    {
      icon: Shield,
      title: "نظام آمن",
      description: "حماية متقدمة لبياناتك مع تشفير كامل وحماية من الاختراق",
    },
    {
      icon: Sparkles,
      title: "تفعيل سريع",
      description: "عملية تفعيل سلسة وسريعة مع مراجعة احترافية من الإدارة",
    },
    {
      icon: Users,
      title: "مجتمع نشط",
      description: "انضم لمجتمع من اللاعبين المحترفين في سيرفرنا",
    },
    {
      icon: Clock,
      title: "دعم مستمر",
      description: "فريق دعم متواجد على مدار الساعة لمساعدتك",
    },
  ];

  const stats = [
    { value: "1000+", label: "لاعب مفعل" },
    { value: "24/7", label: "دعم متواصل" },
    { value: "99%", label: "نسبة الرضا" },
  ];

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8 slide-up">
              <Sparkles className="w-4 h-4" />
              مرحباً بك في Secret CFW
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 slide-up" style={{ animationDelay: "0.1s" }}>
              منصة{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                التفعيل الرسمية
              </span>
              <br />
              لسيرفر FiveM
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto slide-up" style={{ animationDelay: "0.2s" }}>
              نظام احترافي لإدارة تفعيل اللاعبين يضمن لك تجربة سلسة وآمنة
              للانضمام إلى مجتمعنا
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 slide-up" style={{ animationDelay: "0.3s" }}>
              {session ? (
                <>
                  <Link href="/activation">
                    <Button size="lg" className="min-w-[200px]">
                      <Sparkles className="w-5 h-5" />
                      ابدأ التفعيل
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="min-w-[200px]">
                      لوحتي
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="min-w-[200px]">
                    <Shield className="w-5 h-5" />
                    سجل دخولك الآن
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-gray-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              لماذا <span className="text-blue-400">Secret CFW</span>؟
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              نقدم لك أفضل تجربة للتفعيل والانضمام لسيرفرنا
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              كيف يعمل <span className="text-blue-400">النظام</span>؟
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "سجل دخولك", desc: "قم بتسجيل الدخول عبر حساب Discord الخاص بك" },
                { step: "2", title: "قدم طلبك", desc: "أكمل نموذج التفعيل واجب على الأسئلة" },
                { step: "3", title: "انتظر المراجعة", desc: "سيتم مراجعة طلبك وإشعارك بالنتيجة" },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-l from-blue-500/50 to-transparent -translate-x-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto text-center py-12 bg-gradient-to-br from-blue-500/10 to-slate-800/50" glow>
            <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              جاهز للانضمام؟
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              ابدأ رحلتك معنا الآن وانضم لآلاف اللاعبين في سيرفر Secret CFW
            </p>
            <Link href={session ? "/activation" : "/login"}>
              <Button size="lg">
                {session ? "ابدأ التفعيل الآن" : "سجل دخولك الآن"}
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
