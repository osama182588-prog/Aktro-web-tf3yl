"use client";

// صفحة تسجيل الدخول - Login Page
// ==============================

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 page-transition">
      <Card className="w-full max-w-md text-center py-10" glow>
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <Shield className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3">
          تسجيل الدخول
        </h1>
        <p className="text-gray-400 mb-8">
          قم بتسجيل الدخول عبر Discord للوصول إلى نظام التفعيل
        </p>

        {/* Discord Login Button */}
        <Button
          onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
          size="lg"
          className="w-full justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] from-[#5865F2] to-[#4752C4]"
        >
          <MessageCircle className="w-6 h-6" />
          تسجيل الدخول عبر Discord
        </Button>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-gray-400">
            بتسجيل دخولك، فإنك توافق على{" "}
            <a href="/terms" className="text-blue-400 hover:underline">
              الشروط والأحكام
            </a>{" "}
            الخاصة بنا
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-blue-400 font-semibold mb-1">آمن</div>
            <div className="text-gray-500">حماية بياناتك</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-blue-400 font-semibold mb-1">سريع</div>
            <div className="text-gray-500">تسجيل فوري</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
