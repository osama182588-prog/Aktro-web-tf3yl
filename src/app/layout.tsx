import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Secret CFW - منصة التفعيل",
  description: "منصة تفعيل اللاعبين لسيرفر FiveM - Secret CFW",
  keywords: ["FiveM", "Secret CFW", "GTA", "Roleplay", "تفعيل"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <div className="animated-bg" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
