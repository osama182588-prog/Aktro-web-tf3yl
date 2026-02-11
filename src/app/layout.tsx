import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/layout/AnimatedBackground";

export const metadata: Metadata = {
  title: "Secret CFW - نظام التفعيل",
  description: "منصة Secret CFW لإدارة تفعيل اللاعبين لسيرفر FiveM",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Tajawal'] antialiased min-h-screen">
        <Providers>
          <AnimatedBackground />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="py-6 border-t border-slate-800/50">
              <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                <p>© 2024 Secret CFW. جميع الحقوق محفوظة.</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
