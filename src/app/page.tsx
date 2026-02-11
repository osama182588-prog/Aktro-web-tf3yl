'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Shield, Users, Zap, CheckCircle } from 'lucide-react'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const features = [
  {
    icon: Shield,
    title: 'نظام تفعيل متقدم',
    description: 'اختبارات احترافية لضمان جودة اللاعبين',
  },
  {
    icon: Users,
    title: 'مجتمع نشط',
    description: 'انضم إلى آلاف اللاعبين في مجتمعنا',
  },
  {
    icon: Zap,
    title: 'مراجعة سريعة',
    description: 'فريق إداري متخصص لمراجعة الطلبات بسرعة',
  },
  {
    icon: CheckCircle,
    title: 'تجربة سلسة',
    description: 'واجهة سهلة الاستخدام ومتوافقة مع جميع الأجهزة',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 pt-32 pb-8">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center px-4">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <motion.div
              className="mb-8 inline-block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 blur-2xl opacity-50" />
                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <span className="text-6xl font-bold text-white">S</span>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white">مرحباً بك في </span>
              <span className="text-gradient">Secret CFW</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              منصة احترافية لإدارة تفعيل اللاعبين وتنظيم المجتمع بأعلى معايير الجودة
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/activation">
                <Button size="lg" className="group">
                  ابدأ التفعيل الآن
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="outline" size="lg">
                  الشروط والأحكام
                </Button>
              </Link>
            </motion.div>

            {/* Status Badge */}
            {session && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link href="/dashboard">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    عرض لوحة التحكم الخاصة بك
                  </span>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/50"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                لماذا <span className="text-gradient">Secret CFW</span>؟
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                نقدم لك أفضل تجربة تفعيل مع مميزات استثنائية
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card hover className="h-full text-center">
                    <CardContent>
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <Card glass className="p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '1000+', label: 'لاعب مفعّل' },
                  { value: '95%', label: 'نسبة الرضا' },
                  { value: '24/7', label: 'دعم متواصل' },
                  { value: '2 ساعة', label: 'متوسط المراجعة' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              هل أنت مستعد للانضمام؟
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              ابدأ رحلتك معنا الآن وكن جزءاً من مجتمعنا المميز
            </p>
            <Link href="/activation">
              <Button size="lg" className="glow">
                ابدأ التفعيل الآن
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
