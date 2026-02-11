"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Loader } from "@/components/ui/Loader"
import { hasSuperAdminRole } from "@/lib/config"
import { 
  Settings, 
  Save, 
  ArrowRight,
  Shield,
  Clock,
  MessageSquare,
  AlertTriangle,
  RefreshCw
} from "lucide-react"

interface SystemSettings {
  questionsPerTest: string
  minAccountAgeDays: string
  waitTimeHours: string
  maintenanceMode: string
  altDetectionEnabled: string
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    questionsPerTest: "5",
    minAccountAgeDays: "7",
    waitTimeHours: "24",
    maintenanceMode: "false",
    altDetectionEnabled: "true",
  })

  useEffect(() => {
    if (status === "authenticated") {
      if (!hasSuperAdminRole(session?.user?.roles || [])) {
        router.push("/admin")
      } else {
        fetchSettings()
      }
    } else if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, session])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          setSettings(prev => ({ ...prev, ...data.data }))
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        alert("تم حفظ الإعدادات بنجاح")
      }
    } catch (err) {
      console.error("Error saving settings:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            إعدادات النظام
          </h1>
          <p className="text-gray-400">
            تحكم في إعدادات المنصة العامة
          </p>
        </div>
        <Button onClick={() => router.push("/admin")} variant="ghost" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          العودة للوحة
        </Button>
      </div>

      {/* Activation Settings */}
      <Card className="mb-6 fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            إعدادات التفعيل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="عدد الأسئلة في الاختبار"
            type="number"
            min="1"
            max="20"
            value={settings.questionsPerTest}
            onChange={(e) => setSettings({ ...settings, questionsPerTest: e.target.value })}
          />
          <Input
            label="الحد الأدنى لعمر حساب Discord (بالأيام)"
            type="number"
            min="0"
            max="365"
            value={settings.minAccountAgeDays}
            onChange={(e) => setSettings({ ...settings, minAccountAgeDays: e.target.value })}
          />
          <Input
            label="وقت الانتظار بين الطلبات (بالساعات)"
            type="number"
            min="0"
            max="168"
            value={settings.waitTimeHours}
            onChange={(e) => setSettings({ ...settings, waitTimeHours: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="mb-6 fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            إعدادات الأمان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-100">كشف الحسابات البديلة</h4>
              <p className="text-gray-400 text-sm">تفعيل نظام كشف الحسابات المتعددة</p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                altDetectionEnabled: settings.altDetectionEnabled === "true" ? "false" : "true"
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.altDetectionEnabled === "true" ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                settings.altDetectionEnabled === "true" ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card className="mb-6 fade-in border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            وضع الصيانة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-100">تفعيل وضع الصيانة</h4>
              <p className="text-gray-400 text-sm">يمنع المستخدمين من تقديم طلبات جديدة</p>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                maintenanceMode: settings.maintenanceMode === "true" ? "false" : "true"
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.maintenanceMode === "true" ? "bg-yellow-500" : "bg-gray-600"
              }`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                settings.maintenanceMode === "true" ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
          {settings.maintenanceMode === "true" && (
            <p className="mt-4 text-yellow-400 text-sm">
              ⚠️ وضع الصيانة مفعل حالياً - لن يتمكن المستخدمون من التقديم
            </p>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end fade-in">
        <Button onClick={handleSave} loading={saving} className="gap-2">
          <Save className="w-4 h-4" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  )
}
