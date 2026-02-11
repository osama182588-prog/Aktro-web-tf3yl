"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Settings,
  Save,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Palette,
  Bell,
  Shield,
  Database,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  questionsCount: number;
  minAge: number;
  minAccountAgeDays: number;
  resubmitCooldownHours: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    maintenanceMessage: "النظام تحت الصيانة، يرجى المحاولة لاحقاً",
    questionsCount: 5,
    minAge: 16,
    minAccountAgeDays: 7,
    resubmitCooldownHours: 24
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // هنا يتم حفظ الإعدادات في قاعدة البيانات
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-gray-400">إعدادات النظام العامة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>تم الحفظ!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ التغييرات</span>
            </>
          )}
        </button>
      </div>

      {/* وضع الصيانة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold">وضع الصيانة</h3>
            <p className="text-sm text-gray-400">عند التفعيل، يتم إيقاف نظام التفعيل مؤقتاً</p>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
            className="p-2"
          >
            {settings.maintenanceMode ? (
              <ToggleRight className="w-10 h-10 text-orange-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-gray-500" />
            )}
          </button>
        </div>

        {settings.maintenanceMode && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">رسالة الصيانة</label>
            <input
              type="text"
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
              className="input-field"
            />
          </div>
        )}
      </motion.div>

      {/* إعدادات التفعيل */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">إعدادات التفعيل</h3>
            <p className="text-sm text-gray-400">تحكم في شروط وإعدادات التفعيل</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">عدد الأسئلة في الاختبار</label>
            <input
              type="number"
              value={settings.questionsCount}
              onChange={(e) => setSettings(s => ({ ...s, questionsCount: parseInt(e.target.value) }))}
              className="input-field"
              min="1"
              max="20"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">الحد الأدنى للعمر</label>
            <input
              type="number"
              value={settings.minAge}
              onChange={(e) => setSettings(s => ({ ...s, minAge: parseInt(e.target.value) }))}
              className="input-field"
              min="13"
              max="25"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">الحد الأدنى لعمر حساب Discord (بالأيام)</label>
            <input
              type="number"
              value={settings.minAccountAgeDays}
              onChange={(e) => setSettings(s => ({ ...s, minAccountAgeDays: parseInt(e.target.value) }))}
              className="input-field"
              min="0"
              max="365"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">مدة الانتظار لإعادة التقديم (بالساعات)</label>
            <input
              type="number"
              value={settings.resubmitCooldownHours}
              onChange={(e) => setSettings(s => ({ ...s, resubmitCooldownHours: parseInt(e.target.value) }))}
              className="input-field"
              min="0"
              max="168"
            />
          </div>
        </div>
      </motion.div>

      {/* إعدادات الإشعارات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">الإشعارات</h3>
            <p className="text-sm text-gray-400">إعدادات الإشعارات والتنبيهات</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-gray-300">إشعارات الطلبات الجديدة</span>
            <ToggleRight className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-gray-300">إشعارات طلبات الأولوية</span>
            <ToggleRight className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-300">إشعارات Discord للأعضاء</span>
            <ToggleRight className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </motion.div>

      {/* النسخ الاحتياطي */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Database className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold">النسخ الاحتياطي</h3>
            <p className="text-sm text-gray-400">إنشاء واستعادة النسخ الاحتياطية</p>
          </div>
          <button className="btn-secondary">إنشاء نسخة احتياطية</button>
        </div>

        <div className="text-center py-8 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد نسخ احتياطية سابقة</p>
        </div>
      </motion.div>
    </div>
  );
}
