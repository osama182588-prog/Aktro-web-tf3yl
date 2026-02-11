"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Save,
  AlertTriangle,
  Shield,
  Clock,
  HelpCircle
} from "lucide-react"

interface Setting {
  key: string
  value: string | number | boolean
  label: string
  description: string
  type: 'text' | 'number' | 'boolean'
}

const defaultSettings: Setting[] = [
  {
    key: 'activation_question_count',
    value: 5,
    label: 'عدد أسئلة الاختبار',
    description: 'عدد الأسئلة التي تظهر في اختبار التفعيل',
    type: 'number'
  },
  {
    key: 'min_story_length',
    value: 100,
    label: 'الحد الأدنى لقصة الشخصية',
    description: 'الحد الأدنى لعدد أحرف قصة الشخصية',
    type: 'number'
  },
  {
    key: 'min_account_age_days',
    value: 7,
    label: 'الحد الأدنى لعمر الحساب',
    description: 'الحد الأدنى لعمر حساب Discord بالأيام',
    type: 'number'
  },
  {
    key: 'maintenance_mode',
    value: false,
    label: 'وضع الصيانة',
    description: 'تفعيل وضع الصيانة لنظام التفعيل',
    type: 'boolean'
  }
]

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Setting[]>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isHighAdmin = session?.user?.isHighAdmin

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(defaultSettings.map(s => ({
            ...s,
            value: data.settings[s.key] ?? s.value
          })))
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    try {
      const settingsObject = settings.reduce((acc, s) => ({
        ...acc,
        [s.key]: s.value
      }), {})

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsObject)
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSaving(false)
    }
  }

  function updateSetting(key: string, value: string | number | boolean) {
    setSettings(settings.map(s => 
      s.key === key ? { ...s, value } : s
    ))
  }

  if (!isHighAdmin) {
    return (
      <div className="space-y-6">
        <Card className="fade-in">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">صلاحيات غير كافية</h2>
            <p className="text-foreground/60">
              هذه الصفحة متاحة للإدارة العليا فقط
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold mb-2">الإعدادات</h1>
          <p className="text-foreground/60">إعدادات النظام العامة</p>
        </div>
        <Button onClick={handleSave} loading={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saved ? "تم الحفظ ✓" : "حفظ التغييرات"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Activation Settings */}
          <Card className="fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                إعدادات التفعيل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.filter(s => ['activation_question_count', 'min_story_length'].includes(s.key)).map(setting => (
                <div key={setting.key} className="space-y-2">
                  <label className="block font-medium">{setting.label}</label>
                  <p className="text-sm text-foreground/60">{setting.description}</p>
                  <Input
                    type="number"
                    value={setting.value as number}
                    onChange={(e) => updateSetting(setting.key, parseInt(e.target.value) || 0)}
                    className="max-w-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="fade-in delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                إعدادات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.filter(s => s.key === 'min_account_age_days').map(setting => (
                <div key={setting.key} className="space-y-2">
                  <label className="block font-medium">{setting.label}</label>
                  <p className="text-sm text-foreground/60">{setting.description}</p>
                  <Input
                    type="number"
                    value={setting.value as number}
                    onChange={(e) => updateSetting(setting.key, parseInt(e.target.value) || 0)}
                    className="max-w-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card className="fade-in delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                وضع الصيانة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {settings.filter(s => s.key === 'maintenance_mode').map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-foreground/60">{setting.description}</p>
                  </div>
                  <Button
                    variant={setting.value ? "danger" : "outline"}
                    onClick={() => updateSetting(setting.key, !setting.value)}
                  >
                    {setting.value ? "مفعل" : "معطل"}
                  </Button>
                </div>
              ))}
              
              {settings.find(s => s.key === 'maintenance_mode')?.value && (
                <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-warning text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    وضع الصيانة مفعل - لن يتمكن الأعضاء من التقديم على التفعيل
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
