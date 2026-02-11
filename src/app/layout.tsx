import type { Metadata } from "next";
import { Tajawal, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret CFW | منصة التفعيل",
  description: "منصة احترافية لإدارة تفعيل اللاعبين لسيرفر FiveM",
  keywords: ["FiveM", "Secret CFW", "تفعيل", "سيرفر", "رول بلاي"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${tajawal.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
