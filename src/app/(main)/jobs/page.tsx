'use client'

import { motion } from 'framer-motion'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea, Input } from '@/components/ui/Input'
import { 
  Briefcase, 
  Users, 
  Shield,
  Send
} from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

const positions = [
  {
    id: 'admin',
    title: 'إداري',
    icon: Shield,
    description: 'المساعدة في إدارة السيرفر ومراجعة الطلبات',
    requirements: [
      'خبرة سابقة في الإدارة',
      'تفرغ يومي لا يقل عن 4 ساعات',
      'القدرة على التعامل مع المشاكل',
    ],
  },
  {
    id: 'support',
    title: 'دعم فني',
    icon: Users,
    description: 'مساعدة اللاعبين وحل مشاكلهم التقنية',
    requirements: [
      'معرفة تقنية جيدة',
      'صبر في التعامل مع اللاعبين',
      'قدرة على الشرح والتوضيح',
    ],
  },
  {
    id: 'developer',
    title: 'مطور',
    icon: Briefcase,
    description: 'تطوير سكربتات وأنظمة للسيرفر',
    requirements: [
      'خبرة في Lua أو JavaScript',
      'معرفة بـ FiveM',
      'قدرة على العمل ضمن فريق',
    ],
  },
]

export default function JobsPage() {
  const { data: session } = useSession()
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    experience: '',
    motivation: '',
    availability: '',
  })

  const handleSubmit = async () => {
    if (!selectedPosition) return
    // Implementation would go here
    console.log({ position: selectedPosition, ...formData })
  }

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
              التقديم على الوظائف
            </h1>
            <p className="text-gray-400 text-lg">
              انضم إلى فريقنا وساهم في تطوير المجتمع
            </p>
          </motion.div>

          {/* Positions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {positions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  hover 
                  className={`cursor-pointer h-full transition-all ${
                    selectedPosition === position.id 
                      ? 'border-blue-500/50 bg-blue-500/10' 
                      : ''
                  }`}
                  onClick={() => setSelectedPosition(position.id)}
                >
                  <CardContent className="pt-6">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                      <position.icon className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {position.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {position.description}
                    </p>
                    <ul className="space-y-2">
                      {position.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Application Form */}
          {selectedPosition && session && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    التقديم على وظيفة: {positions.find(p => p.id === selectedPosition)?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Textarea
                    label="الخبرة السابقة"
                    placeholder="اذكر خبراتك السابقة المتعلقة بهذه الوظيفة"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  />
                  
                  <Textarea
                    label="لماذا تريد الانضمام؟"
                    placeholder="اشرح دوافعك للانضمام إلى الفريق"
                    value={formData.motivation}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                  />
                  
                  <Input
                    label="التفرغ اليومي"
                    placeholder="كم ساعة يمكنك التفرغ يومياً؟"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  />

                  <div className="flex justify-end">
                    <Button onClick={handleSubmit}>
                      <Send className="w-4 h-4" />
                      إرسال الطلب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedPosition && !session && (
            <Card className="text-center">
              <CardContent className="py-8">
                <p className="text-gray-400 mb-4">
                  يجب تسجيل الدخول للتقديم على الوظائف
                </p>
                <Button variant="primary" onClick={() => window.location.href = '/login?callbackUrl=/jobs'}>
                  تسجيل الدخول
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
