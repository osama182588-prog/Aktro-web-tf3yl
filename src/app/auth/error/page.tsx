"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "خطأ في إعدادات النظام",
    AccessDenied: "تم رفض الوصول",
    Verification: "خطأ في التحقق",
    Default: "حدث خطأ غير متوقع"
  }

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md fade-in">
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <CardTitle className="text-2xl">خطأ في المصادقة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-foreground/60">
            {message}
          </p>
          
          <div className="flex flex-col gap-3">
            <Link href="/auth/signin">
              <Button className="w-full">
                إعادة المحاولة
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
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
    <Suspense fallback={
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
