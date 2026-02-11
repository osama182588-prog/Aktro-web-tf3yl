"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  Shield, 
  Headphones,
  Code,
  Star,
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, LightLines } from "@/components/animations/ParticleBackground";

const jobs = [
  {
    icon: Shield,
    title: "إداري تفعيل",
    description: "مراجعة طلبات التفعيل وتقييم اللاعبين الجدد",
    requirements: ["خبرة في الرول بلاي", "تواجد يومي", "مهارات تواصل ممتازة"],
    available: true
  },
  {
    icon: Users,
    title: "مشرف عام",
    description: "إدارة المجتمع ومتابعة اللاعبين داخل السيرفر",
    requirements: ["خبرة إدارية سابقة", "فهم عميق لقوانين السيرفر", "تواجد مستمر"],
    available: false
  },
  {
    icon: Headphones,
    title: "دعم فني",
    description: "مساعدة اللاعبين في حل المشاكل التقنية",
    requirements: ["خبرة تقنية", "صبر ومهارات تواصل", "معرفة بـ FiveM"],
    available: true
  },
  {
    icon: Code,
    title: "مطور",
    description: "تطوير سكربتات وموارد السيرفر",
    requirements: ["خبرة في Lua/JavaScript", "فهم FiveM Framework", "إبداع وابتكار"],
    available: false
  }
];

export default function JobsPage() {
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient">التقديم على الوظائف</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              انضم لفريق إدارة Secret CFW وكن جزءاً من نجاحنا. 
              نبحث دائماً عن أشخاص متميزين للانضمام لفريقنا.
            </p>
          </motion.div>

          {/* الوظائف */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {jobs.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-6 ${!job.available ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    job.available 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                      : 'bg-gray-700'
                  }`}>
                    <job.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      {job.available ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                          متاح
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                          مغلق
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{job.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2">المتطلبات:</h4>
                  <ul className="space-y-1">
                    {job.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {job.available ? (
                  <button className="btn-primary w-full flex items-center justify-center gap-2">
                    <span>التقديم الآن</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="btn-secondary w-full opacity-50 cursor-not-allowed" disabled>
                    <span>التقديم مغلق حالياً</span>
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* ملاحظة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="glass-card p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold">ملاحظة هامة</h3>
              </div>
              <p className="text-gray-400 text-sm">
                يجب أن تكون مفعلاً في السيرفر للتقديم على أي وظيفة. 
                سيتم مراجعة طلبك والتواصل معك عبر Discord.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
