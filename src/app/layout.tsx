import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, GridBackground } from "@/components/layout/Background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret CFW - منصة التفعيل",
  description: "منصة احترافية لإدارة تفعيل اللاعبين لسيرفر FiveM",
  keywords: ["FiveM", "Secret CFW", "تفعيل", "سيرفر"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased animated-bg min-h-screen flex flex-col`}
      >
        <Providers>
          <ParticleBackground />
          <GridBackground />
          <Header />
          <main className="flex-1 pt-24 pb-8 px-4 relative z-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
