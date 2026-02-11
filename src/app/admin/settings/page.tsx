'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useSession } from 'next-auth/react'
import {
  Settings,
  Save,
  Palette,
  Bell,
  Shield,
  Database,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from 'lucide-react'

interface SiteSettings {
  siteName: string
  maintenanceMode: boolean
  maintenanceMessage: string
  questionsPerTest: number
  minAccountAgeDays: number
  reviewWaitHours: number
  primaryColor: string
  secondaryColor: string
  darkMode: boolean
  logoUrl: string
  backgroundUrl: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Secret CFW',
    maintenanceMode: false,
    maintenanceMessage: '',
    questionsPerTest: 5,
    minAccountAgeDays: 7,
    reviewWaitHours: 24,
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    darkMode: true,
    logoUrl: '',
    backgroundUrl: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Only high admin can access all settings
  const isHighAdmin = session?.user?.adminRole === 'high'
  const isGeneralAdmin = session?.user?.adminRole === 'general' || isHighAdmin

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setSettings(data.settings)
          }
        }
      } catch {
        console.error('Error fetching settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveMessage(null)

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSaveMessage('تم حفظ الإعدادات بنجاح')
      } else {
        setSaveMessage('حدث خطأ أثناء حفظ الإعدادات')
      }
    } catch {
      setSaveMessage('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="جاري تحميل الإعدادات..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">الإعدادات</h1>
          <p className="text-gray-400">إدارة إعدادات الموقع والنظام</p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="w-4 h-4" />
          حفظ الإعدادات
        </Button>
      </motion.div>

      {/* Save Message */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            saveMessage.includes('بنجاح')
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                الإعدادات العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="اسم الموقع"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                disabled={!isGeneralAdmin}
              />
              <Input
                label="عدد الأسئلة في الاختبار"
                type="number"
                min={1}
                max={20}
                value={settings.questionsPerTest}
                onChange={(e) => setSettings({ ...settings, questionsPerTest: parseInt(e.target.value) })}
                disabled={!isGeneralAdmin}
              />
              <Input
                label="الحد الأدنى لعمر الحساب (أيام)"
                type="number"
                min={0}
                value={settings.minAccountAgeDays}
                onChange={(e) => setSettings({ ...settings, minAccountAgeDays: parseInt(e.target.value) })}
                disabled={!isHighAdmin}
              />
              <Input
                label="وقت الانتظار بين الطلبات (ساعات)"
                type="number"
                min={0}
                value={settings.reviewWaitHours}
                onChange={(e) => setSettings({ ...settings, reviewWaitHours: parseInt(e.target.value) })}
                disabled={!isHighAdmin}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">اللون الرئيسي</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                      disabled={!isGeneralAdmin}
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1"
                      disabled={!isGeneralAdmin}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">اللون الثانوي</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                      disabled={!isGeneralAdmin}
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="flex-1"
                      disabled={!isGeneralAdmin}
                    />
                  </div>
                </div>
              </div>
              <Input
                label="رابط الشعار"
                placeholder="https://..."
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                disabled={!isGeneralAdmin}
              />
              <Input
                label="رابط الخلفية"
                placeholder="https://..."
                value={settings.backgroundUrl}
                onChange={(e) => setSettings({ ...settings, backgroundUrl: e.target.value })}
                disabled={!isGeneralAdmin}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Maintenance Mode */}
        {isHighAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={settings.maintenanceMode ? 'border-yellow-500/30' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${settings.maintenanceMode ? 'text-yellow-400' : 'text-gray-400'}`} />
                  وضع الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white font-medium">تفعيل وضع الصيانة</p>
                    <p className="text-gray-400 text-sm">عند التفعيل، لن يتمكن اللاعبون من التقديم</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className="text-2xl"
                  >
                    {settings.maintenanceMode ? (
                      <ToggleRight className="w-10 h-10 text-yellow-400" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-400" />
                    )}
                  </button>
                </div>
                {settings.maintenanceMode && (
                  <Textarea
                    label="رسالة الصيانة"
                    placeholder="اكتب رسالة تظهر للمستخدمين..."
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Settings */}
        {isHighAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  الأمان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white font-medium">كشف الحسابات البديلة</p>
                      <p className="text-gray-400 text-sm">تحذير عند اكتشاف حسابات مكررة</p>
                    </div>
                    <Badge variant="success">مفعّل</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white font-medium">منع التقديم المتكرر</p>
                      <p className="text-gray-400 text-sm">حماية من التقديم الضار</p>
                    </div>
                    <Badge variant="success">مفعّل</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white font-medium">تسجيل العمليات</p>
                      <p className="text-gray-400 text-sm">تسجيل جميع العمليات الإدارية</p>
                    </div>
                    <Badge variant="success">مفعّل</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
