"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Trophy, 
  Medal,
  Crown,
  Star,
  Clock,
  TrendingUp,
  User
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, LightLines } from "@/components/animations/ParticleBackground";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string | null;
  characterName: string;
  activatedAt: string;
  isPriority: boolean;
}

// بيانات تجريبية
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "Player1", avatar: null, characterName: "محمد الأحمد", activatedAt: "2024-01-15", isPriority: true },
  { rank: 2, username: "Player2", avatar: null, characterName: "أحمد العلي", activatedAt: "2024-01-16", isPriority: false },
  { rank: 3, username: "Player3", avatar: null, characterName: "خالد السعيد", activatedAt: "2024-01-17", isPriority: true },
  { rank: 4, username: "Player4", avatar: null, characterName: "عمر الراشد", activatedAt: "2024-01-18", isPriority: false },
  { rank: 5, username: "Player5", avatar: null, characterName: "سعد الماجد", activatedAt: "2024-01-19", isPriority: false },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-700/20 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-500/20 to-amber-700/20 border-amber-500/30";
    default:
      return "";
  }
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleBackground />
      <LightLines />
      <Header />
      
      <main className="flex-grow pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* العنوان */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient">المتصدرين</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              أحدث اللاعبين المفعلين في سيرفر Secret CFW
            </p>
          </motion.div>

          {/* المنصة - Top 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-end justify-center gap-4 mb-12"
          >
            {/* المركز الثاني */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-400">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <Medal className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <h3 className="font-semibold">{leaderboard[1]?.characterName}</h3>
              <p className="text-sm text-gray-400">{leaderboard[1]?.username}</p>
            </div>

            {/* المركز الأول */}
            <div className="text-center -mt-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center border-4 border-yellow-400 shadow-lg shadow-yellow-500/30"
              >
                <User className="w-12 h-12 text-white" />
              </motion.div>
              <Crown className="w-10 h-10 mx-auto text-yellow-400 mb-1" />
              <h3 className="font-semibold text-lg">{leaderboard[0]?.characterName}</h3>
              <p className="text-sm text-gray-400">{leaderboard[0]?.username}</p>
            </div>

            {/* المركز الثالث */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center border-4 border-amber-600">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <Medal className="w-8 h-8 mx-auto text-amber-600 mb-1" />
              <h3 className="font-semibold">{leaderboard[2]?.characterName}</h3>
              <p className="text-sm text-gray-400">{leaderboard[2]?.username}</p>
            </div>
          </motion.div>

          {/* القائمة الكاملة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                أحدث المفعلين
              </h3>
            </div>

            <div className="divide-y divide-white/5">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${getRankStyle(entry.rank)}`}
                >
                  {/* الترتيب */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* الصورة */}
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  {/* المعلومات */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.characterName}</span>
                      {entry.isPriority && (
                        <Star className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <span className="text-sm text-gray-400">{entry.username}</span>
                  </div>

                  {/* التاريخ */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(entry.activatedAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
