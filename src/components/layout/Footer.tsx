'use client'

import { motion } from 'framer-motion'
import { siteConfig } from '@/lib/config'
import { Heart, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative mt-auto">
      <div className="mx-4 mb-4">
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <span className="text-xl font-bold text-white">S</span>
                  </div>
                  <span className="text-xl font-bold text-white">{siteConfig.name}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  منصة احترافية لإدارة تفعيل اللاعبين وتنظيم المجتمع
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">روابط سريعة</h3>
                <ul className="space-y-2">
                  {siteConfig.navigation.slice(0, 4).map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                      >
                        <ExternalLink size={12} />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">تواصل معنا</h3>
                <p className="text-gray-400 text-sm">
                  انضم إلى مجتمعنا على ديسكورد للحصول على أحدث الأخبار والدعم
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30 transition-colors text-sm font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discord
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} {siteConfig.name}. جميع الحقوق محفوظة
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                صنع بـ <Heart className="w-4 h-4 text-red-500 fill-red-500" /> للمجتمع
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
