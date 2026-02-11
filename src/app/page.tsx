'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  const { data: session } = useSession();

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'تفعيل سريع',
      description: 'نظام تفعيل احترافي وسريع للانضمام إلى السيرفر',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: 'إدارة متكاملة',
      description: 'لوحة تحكم متكاملة لإدارة التفعيل والطلبات',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'تكامل Discord',
      description: 'تكامل كامل مع Discord لإشعارات وإدارة الرتب',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'إحصائيات متقدمة',
      description: 'تتبع الطلبات والإحصائيات بشكل مفصل',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Content */}
            <div className="flex-1 text-center lg:text-right">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fadeIn">
                <span className="gradient-text">Secret CFW</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-8 animate-fadeIn animation-delay-150">
                منصة التفعيل الاحترافية لسيرفر FiveM
              </p>
              <p className="text-gray-500 mb-10 max-w-xl mx-auto lg:mx-0 animate-fadeIn animation-delay-300">
                نظام تفعيل متكامل يضمن جودة اللاعبين ويوفر تجربة سلسة للانضمام إلى مجتمعنا
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fadeIn animation-delay-500">
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg">
                        لوحة العضو
                      </Button>
                    </Link>
                    <Link href="/activation">
                      <Button size="lg" variant="outline">
                        التقديم للتفعيل
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/activation">
                      <Button size="lg" className="animate-pulse-glow">
                        ابدأ التفعيل الآن
                      </Button>
                    </Link>
                    <Link href="/terms">
                      <Button size="lg" variant="outline">
                        الشروط والأحكام
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="flex-1 relative">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-blue-400/30 rounded-full blur-3xl animate-pulse" />
                
                {/* Main card */}
                <Card className="relative p-8 animate-float" glow>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <span className="text-4xl font-bold text-white">S</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Secret CFW</h3>
                    <p className="text-gray-400">انضم إلى مجتمعنا اليوم</p>
                    
                    <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        متصل
                      </div>
                      <div className="text-gray-500">|</div>
                      <div className="text-gray-400">500+ عضو</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              مميزات <span className="gradient-text">المنصة</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              نظام متكامل يوفر تجربة احترافية للتفعيل والإدارة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 text-center"
                hover
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10" />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                جاهز للانضمام؟
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                سجل دخول عبر Discord وابدأ رحلتك معنا في Secret CFW
              </p>
              <Link href="/activation">
                <Button size="lg" className="animate-pulse-glow">
                  ابدأ الآن
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
