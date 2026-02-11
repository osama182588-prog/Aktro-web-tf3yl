'use client'

import { motion } from 'framer-motion'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const sections = [
  {
    title: 'القواعد العامة',
    icon: Info,
    items: [
      'يجب أن يكون عمرك 16 سنة أو أكثر للتقديم',
      'يجب أن يكون لديك حساب ديسكورد فعال ومؤكد',
      'يجب أن يكون حساب ديسكورد قد مر عليه 7 أيام على الأقل',
      'يجب التحدث باللغة العربية أثناء اللعب',
      'يجب احترام جميع اللاعبين والإدارة',
    ],
  },
  {
    title: 'الممارسات المسموحة',
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    items: [
      'الرول بلاي الجاد والاحترافي',
      'التعاون مع اللاعبين الآخرين',
      'الإبلاغ عن المخالفات للإدارة',
      'استخدام ميكروفون بجودة مقبولة',
      'المشاركة في الأحداث والفعاليات',
    ],
  },
  {
    title: 'الممارسات الممنوعة',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    items: [
      'استخدام أي برامج غش أو هاك',
      'الإساءة أو التنمر على اللاعبين',
      'كسر الرول بلاي (Breaking RP)',
      'استخدام معلومات خارجية (Metagaming)',
      'القتل العشوائي (RDM) أو التخريب (VDM)',
      'الهروب من الرول بلاي (Combat Logging)',
    ],
  },
  {
    title: 'العقوبات',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    items: [
      'الإنذار الأول: تنبيه شفهي',
      'الإنذار الثاني: إيقاف مؤقت (24 ساعة)',
      'الإنذار الثالث: إيقاف (7 أيام)',
      'المخالفات الجسيمة: حظر دائم',
      'يحق للإدارة تعديل العقوبات حسب شدة المخالفة',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              الشروط والأحكام
            </h1>
            <p className="text-gray-400 text-lg">
              يرجى قراءة الشروط والأحكام بعناية قبل التقديم
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${section.bgColor || 'bg-blue-500/10'}`}>
                        <section.icon className={`w-6 h-6 ${section.color || 'text-blue-400'}`} />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <motion.li
                          key={itemIndex}
                          className="flex items-start gap-3 text-gray-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2.5 flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Agreement Notice */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card glass className="border-blue-500/30">
              <CardContent className="py-6">
                <p className="text-gray-300">
                  بالتقديم على التفعيل، أنت توافق على جميع الشروط والأحكام المذكورة أعلاه
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
