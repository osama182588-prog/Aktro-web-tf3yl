'use client'

import { motion } from 'framer-motion'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Twitch, 
  Youtube, 
  ExternalLink,
  Users,
  Eye,
  Gamepad2
} from 'lucide-react'

const streamers = [
  {
    name: 'أحمد الستريمر',
    platform: 'twitch',
    followers: '15.2K',
    status: 'live',
    game: 'GTA V Roleplay',
    avatar: null,
  },
  {
    name: 'خالد يوتيوب',
    platform: 'youtube',
    followers: '25K',
    status: 'offline',
    game: 'GTA V Roleplay',
    avatar: null,
  },
  {
    name: 'سارة جيمنج',
    platform: 'twitch',
    followers: '8.5K',
    status: 'live',
    game: 'GTA V Roleplay',
    avatar: null,
  },
]

const benefits = [
  { icon: Users, title: 'مجتمع داعم', description: 'انضم لمجتمع من الستريمرز المميزين' },
  { icon: Eye, title: 'ظهور مميز', description: 'حصريات وظهور في الأحداث الخاصة' },
  { icon: Gamepad2, title: 'أولوية اللعب', description: 'أولوية في الانضمام للسيرفر' },
]

export default function StreamerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 pt-32 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Twitch className="w-8 h-8 text-purple-400" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <Youtube className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Streamers
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              تعاون معنا كصانع محتوى واحصل على مميزات حصرية
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {benefits.map((benefit, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <benefit.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Featured Streamers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              صناع المحتوى المميزين
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {streamers.map((streamer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card hover className="relative overflow-hidden">
                    {streamer.status === 'live' && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="danger" pulse>
                          🔴 LIVE
                        </Badge>
                      </div>
                    )}
                    <CardContent className="pt-8">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                          {streamer.name.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{streamer.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{streamer.followers} متابع</p>
                        
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {streamer.platform === 'twitch' ? (
                            <Twitch className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Youtube className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-gray-400 text-sm">{streamer.game}</span>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-4 h-4" />
                          زيارة القناة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Card glass className="border-purple-500/30 max-w-2xl mx-auto">
              <CardContent className="py-12">
                <h3 className="text-2xl font-bold text-white mb-4">
                  هل أنت صانع محتوى؟
                </h3>
                <p className="text-gray-400 mb-6">
                  انضم إلى برنامج صناع المحتوى واحصل على مميزات حصرية
                </p>
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400">
                  <Twitch className="w-5 h-5" />
                  التقديم كصانع محتوى
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
