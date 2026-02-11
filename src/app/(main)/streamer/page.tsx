"use client";

import { motion } from "framer-motion";
import { 
  PlayCircle,
  ExternalLink,
  Users,
  Video,
  Star,
  CheckCircle,
  Twitch,
  Youtube
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, LightLines } from "@/components/animations/ParticleBackground";

const benefits = [
  "شارة Streamer مميزة في السيرفر",
  "دعم وتسويق من إدارة السيرفر",
  "أولوية في الدخول للسيرفر",
  "قناة خاصة في Discord",
  "إمكانية تنظيم أحداث خاصة"
];

const requirements = [
  "500 متابع على الأقل في منصة البث",
  "محتوى نظيف ومناسب للجميع",
  "بث منتظم (3 مرات أسبوعياً على الأقل)",
  "أن تكون مفعلاً في السيرفر",
  "الالتزام بقوانين السيرفر أثناء البث"
];

const streamers = [
  { name: "Streamer1", platform: "twitch", followers: "2.5K", avatar: null },
  { name: "Streamer2", platform: "youtube", followers: "5K", avatar: null },
  { name: "Streamer3", platform: "twitch", followers: "1.2K", avatar: null },
];

export default function StreamerPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleBackground />
      <LightLines />
      <Header />
      
      <main className="flex-grow pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4">
          {/* العنوان */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center"
            >
              <PlayCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient">برنامج الستريمرز</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              انضم لبرنامج الستريمرز في Secret CFW واحصل على مميزات حصرية 
              بينما تستمتع ببث تجربة الرول بلاي لجمهورك
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* المميزات */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold">المميزات</h2>
              </div>

              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* المتطلبات */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold">المتطلبات</h2>
              </div>

              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-gray-300">{req}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* الستريمرز الحاليين */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              <span className="text-gradient">ستريمرز Secret CFW</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {streamers.map((streamer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="glass-card p-6 text-center group"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {streamer.platform === 'twitch' ? (
                      <Twitch className="w-10 h-10 text-white" />
                    ) : (
                      <Youtube className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{streamer.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-sm mb-4">
                    <Users className="w-4 h-4" />
                    <span>{streamer.followers} متابع</span>
                  </div>
                  <button className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
                    <span>زيارة القناة</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* التقديم */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <PlayCircle className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold mb-4">هل أنت ستريمر؟</h2>
              <p className="text-gray-400 mb-6">
                إذا كنت ستريمراً وتريد الانضمام لبرنامجنا، تواصل معنا عبر Discord
              </p>
              <button className="btn-primary flex items-center gap-2 mx-auto">
                <span>التقديم الآن</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
