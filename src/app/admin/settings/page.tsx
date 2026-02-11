"use client";

// صفحة الإعدادات - Settings Page
// ==============================

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Palette,
  Shield,
  HelpCircle,
  Bell,
  Database
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface SettingsData {
  questionsPerTest: number;
  maintenanceMode: boolean;
  minAccountAge: number;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  serverName: string;
  welcomeMessage: string;
}

export default function SettingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData>({
    questionsPerTest: 5,
    maintenanceMode: false,
    minAccountAge: 7,
    primaryColor: "#3B82F6",
    secondaryColor: "#6B7280",
    darkMode: true,
    serverName: "Secret CFW",
    welcomeMessage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      const user = session?.user as { isAdmin?: boolean; adminRole?: string };
      if (!user?.isAdmin || user.adminRole !== "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        fetchSettings();
      }
    }
  }, [authStatus, session, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("تم حفظ الإعدادات بنجاح");
      } else {
        alert("حدث خطأ في حفظ الإعدادات");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  const user = session?.user as { isAdmin?: boolean; adminRole?: string };
  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!user?.isAdmin || user.adminRole !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-400" />
            الإعدادات
          </h1>
          <p className="text-gray-400 mt-1">إعدادات النظام والتصميم</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchSettings} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* إعدادات التفعيل */}
        <Card>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            إعدادات التفعيل
          </h2>
          <div className="space-y-6">
            <Input
              label="عدد الأسئلة في الاختبار"
              type="number"
              min={1}
              max={20}
              value={settings.questionsPerTest}
              onChange={(e) => setSettings({ ...settings, questionsPerTest: parseInt(e.target.value) || 5 })}
            />
            <Input
              label="الحد الأدنى لعمر الحساب (بالأيام)"
              type="number"
              min={0}
              max={365}
              value={settings.minAccountAge}
              onChange={(e) => setSettings({ ...settings, minAccountAge: parseInt(e.target.value) || 0 })}
            />
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">وضع الصيانة (إيقاف التفعيل مؤقتاً)</span>
              </label>
            </div>
          </div>
        </Card>

        {/* إعدادات السيرفر */}
        <Card>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            إعدادات السيرفر
          </h2>
          <div className="space-y-6">
            <Input
              label="اسم السيرفر"
              value={settings.serverName}
              onChange={(e) => setSettings({ ...settings, serverName: e.target.value })}
            />
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                رسالة الترحيب
              </label>
              <textarea
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-600 min-h-[100px] resize-none"
                placeholder="رسالة ترحيبية تظهر للأعضاء..."
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* إعدادات التصميم */}
        <Card>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            إعدادات التصميم
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  اللون الأساسي
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
                  />
                  <span className="text-gray-400">{settings.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  اللون الثانوي
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
                  />
                  <span className="text-gray-400">{settings.secondaryColor}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">الوضع الليلي</span>
              </label>
            </div>
          </div>
        </Card>

        {/* معلومات النظام */}
        <Card>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            معلومات النظام
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-gray-400">إصدار النظام</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-gray-400">Next.js</span>
              <span className="text-white">16.1.6</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-gray-400">Prisma</span>
              <span className="text-white">5.22.0</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Discord.js</span>
              <span className="text-white">14.x</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
