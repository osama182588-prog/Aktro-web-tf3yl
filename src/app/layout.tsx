import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedBackground from "@/components/layout/AnimatedBackground";

export const metadata: Metadata = {
  title: "Secret CFW | منصة التفعيل",
  description: "منصة تفعيل اللاعبين الاحترافية لسيرفر FiveM - Secret CFW",
  keywords: ["FiveM", "GTA", "roleplay", "تفعيل", "سيرفر"],
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
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          <AnimatedBackground />
          <Header />
          <main className="flex-1 pt-20">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
