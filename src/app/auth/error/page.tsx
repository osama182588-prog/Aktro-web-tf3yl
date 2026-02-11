"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "خطأ في إعدادات النظام",
    AccessDenied: "تم رفض الوصول",
    Verification: "خطأ في التحقق",
    Default: "حدث خطأ غير متوقع",
    OAuthAccountNotLinked: "هذا الحساب مرتبط بطريقة تسجيل دخول أخرى",
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full fade-in border-red-500/30">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            خطأ في تسجيل الدخول
          </h1>
          <p className="text-gray-400 mb-8">
            {errorMessage}
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/auth/signin">
              <Button className="w-full">
                حاول مرة أخرى
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-gray-400">جارٍ التحميل...</div>
    </div>}>
      <ErrorContent />
    </Suspense>
  )
}
