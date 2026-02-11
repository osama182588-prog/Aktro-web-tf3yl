"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[rgba(59,130,246,0.2)] bg-[rgba(15,23,42,0.8)] backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Secret CFW</h3>
            <p className="text-gray-400 text-sm">
              منصة تفعيل اللاعبين لسيرفر FiveM. نهدف لتقديم تجربة رول بلاي احترافية ومميزة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/activation" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                  التفعيل
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                  لوحة التحكم
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">تواصل معنا</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.2)] flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(59,130,246,0.1)] mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Secret CFW. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}
