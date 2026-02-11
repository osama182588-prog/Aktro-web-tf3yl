'use client'

import { motion } from 'framer-motion'
import { AnimatedBackground } from '@/components/animations/AnimatedBackground'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Trophy, Medal, Award, Crown } from 'lucide-react'

// Mock data - would come from API
const leaderboardData = [
  { rank: 1, name: 'أحمد محمد', points: 15420, badge: 'legend' },
  { rank: 2, name: 'خالد عبدالله', points: 14850, badge: 'elite' },
  { rank: 3, name: 'سارة أحمد', points: 13200, badge: 'elite' },
  { rank: 4, name: 'محمد علي', points: 12100, badge: 'pro' },
  { rank: 5, name: 'فاطمة حسن', points: 11500, badge: 'pro' },
  { rank: 6, name: 'عمر سعيد', points: 10800, badge: 'pro' },
  { rank: 7, name: 'نورة خالد', points: 9500, badge: 'active' },
  { rank: 8, name: 'يوسف عادل', points: 8900, badge: 'active' },
  { rank: 9, name: 'لينا محمود', points: 8200, badge: 'active' },
  { rank: 10, name: 'كريم أسامة', points: 7600, badge: 'active' },
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />
    default:
      return <span className="text-gray-400 font-bold">{rank}</span>
  }
}

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case 'legend':
      return 'priority'
    case 'elite':
      return 'success'
    case 'pro':
      return 'info'
    default:
      return 'default'
  }
}

const getBadgeLabel = (badge: string) => {
  switch (badge) {
    case 'legend':
      return 'أسطورة'
    case 'elite':
      return 'نخبة'
    case 'pro':
      return 'محترف'
    default:
      return 'نشيط'
  }
}

export default function LeaderboardPage() {
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              المتصدرين
            </h1>
            <p className="text-gray-400 text-lg">
              أفضل اللاعبين في السيرفر
            </p>
          </motion.div>

          {/* Top 3 Podium */}
          <motion.div
            className="grid grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* 2nd Place */}
            <div className="mt-8">
              <Card glass className="text-center py-6 border-gray-400/30">
                <CardContent>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-400/20 flex items-center justify-center">
                    <Medal className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-300 font-bold mb-1">{leaderboardData[1].name}</p>
                  <p className="text-gray-500 text-sm">{leaderboardData[1].points.toLocaleString()} نقطة</p>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div>
              <Card glass className="text-center py-8 border-yellow-500/30 bg-yellow-500/5">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Crown className="w-10 h-10 text-yellow-400" />
                  </div>
                  <p className="text-white font-bold text-lg mb-1">{leaderboardData[0].name}</p>
                  <p className="text-yellow-400 font-bold">{leaderboardData[0].points.toLocaleString()} نقطة</p>
                  <Badge variant="priority" className="mt-2">أسطورة</Badge>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="mt-8">
              <Card glass className="text-center py-6 border-amber-600/30">
                <CardContent>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-600/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-gray-300 font-bold mb-1">{leaderboardData[2].name}</p>
                  <p className="text-gray-500 text-sm">{leaderboardData[2].points.toLocaleString()} نقطة</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Full Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {leaderboardData.map((player, index) => (
                    <motion.div
                      key={player.rank}
                      className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-white/5 to-transparent' : ''
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{player.name}</p>
                        <p className="text-gray-400 text-sm">{player.points.toLocaleString()} نقطة</p>
                      </div>
                      <Badge variant={getBadgeVariant(player.badge)}>
                        {getBadgeLabel(player.badge)}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
