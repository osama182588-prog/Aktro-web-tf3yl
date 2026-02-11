"use client";

import { motion } from "framer-motion";
import { Shield, Heart, ExternalLink } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-auto">
      {/* الخط الفاصل المتوهج */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="glass py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* الشعار والوصف */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-gradient">Secret CFW</h3>
                <p className="text-sm text-gray-400">منصة التفعيل الرسمية</p>
              </div>
            </div>

            {/* الروابط */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                الشروط والأحكام
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>
              <a 
                href="https://discord.gg/secretcfw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-400 transition-colors"
              >
                Discord
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* حقوق النشر */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>صُنع بـ</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.div>
              <span>© {new Date().getFullYear()} Secret CFW</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
