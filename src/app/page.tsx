"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo */}
              <div className="mb-8 inline-flex">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <span className="text-white font-bold text-5xl">S</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Secret CFW
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed">
                منصة التفعيل الرسمية لسيرفر FiveM
                <br />
                <span className="text-gray-500">تجربة رول بلاي احترافية ومميزة</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/activation" className="btn-glow text-lg py-4 px-8">
                  ابدأ التفعيل الآن
                </Link>
                <Link
                  href="/terms"
                  className="py-4 px-8 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  اقرأ الشروط والأحكام
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              لماذا Secret CFW؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card p-8 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">نظام تفعيل آمن</h3>
                <p className="text-gray-400">
                  نظام تفعيل متكامل وآمن يضمن جودة اللاعبين ويمنع الحسابات المزيفة
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-8 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
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
                </div>
                <h3 className="text-xl font-bold text-white mb-3">مراجعة سريعة</h3>
                <p className="text-gray-400">
                  فريق إداري محترف يقوم بمراجعة الطلبات بسرعة وكفاءة
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-8 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">مجتمع متميز</h3>
                <p className="text-gray-400">
                  انضم لمجتمع من اللاعبين المحترفين وعش تجربة رول بلاي فريدة
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 px-4 bg-[rgba(59,130,246,0.05)]">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              خطوات التفعيل
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-bold text-white mb-2">تسجيل الدخول</h3>
                <p className="text-gray-400 text-sm">
                  سجل دخولك باستخدام حساب Discord
                </p>
                <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-gradient-to-l from-blue-500 to-transparent" />
              </div>

              {/* Step 2 */}
              <div className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-bold text-white mb-2">قراءة الشروط</h3>
                <p className="text-gray-400 text-sm">
                  اقرأ وافهم شروط وأحكام السيرفر
                </p>
                <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-blue-500" />
              </div>

              {/* Step 3 */}
              <div className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-bold text-white mb-2">تعبئة النموذج</h3>
                <p className="text-gray-400 text-sm">
                  أكمل نموذج التفعيل واجب عن الأسئلة
                </p>
                <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-blue-500" />
              </div>

              {/* Step 4 */}
              <div className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-bold text-white mb-2">انتظر المراجعة</h3>
                <p className="text-gray-400 text-sm">
                  سيتم مراجعة طلبك من قبل الإدارة
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card stats-card">
                <div className="value">500+</div>
                <div className="label">لاعب مفعل</div>
              </div>
              <div className="glass-card stats-card">
                <div className="value">95%</div>
                <div className="label">نسبة الرضا</div>
              </div>
              <div className="glass-card stats-card">
                <div className="value">24h</div>
                <div className="label">متوسط المراجعة</div>
              </div>
              <div className="glass-card stats-card">
                <div className="value">24/7</div>
                <div className="label">دعم متواصل</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="glass-card p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                جاهز للانضمام؟
              </h2>
              <p className="text-gray-400 mb-8">
                ابدأ رحلتك معنا الآن وكن جزءًا من مجتمع Secret CFW
              </p>
              <Link href="/activation" className="btn-glow text-lg py-4 px-8 inline-block">
                ابدأ التفعيل
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
