// دوال مساعدة للنظام
// ==================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// دمج أنماط Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تنسيق التاريخ بالعربية
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// تنسيق التاريخ النسبي
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return formatDate(date);
}

// ترجمة حالة الطلب
export function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    PENDING: "في الانتظار",
    REVIEWING: "قيد المراجعة",
    APPROVED: "مقبول",
    REJECTED: "مرفوض",
    MODIFICATION_REQUIRED: "يتطلب تعديل",
  };
  return translations[status] || status;
}

// لون حالة الطلب
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    REVIEWING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    MODIFICATION_REQUIRED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return colors[status] || "bg-gray-500/20 text-gray-400";
}

// ترجمة صلاحية الإدارة
export function translateAdminRole(role: string): string {
  const translations: Record<string, string> = {
    NONE: "عضو",
    GENERAL_ADMIN: "إدارة عامة",
    ACTIVATION_ADMIN: "إدارة التفعيل",
    SUPER_ADMIN: "إدارة عليا",
  };
  return translations[role] || role;
}

// خلط المصفوفة عشوائياً
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// التحقق من صحة العمر
export function validateAge(age: number): boolean {
  return age >= 13 && age <= 100;
}

// التحقق من طول النص
export function validateTextLength(text: string, min: number, max: number): boolean {
  const trimmed = text.trim();
  return trimmed.length >= min && trimmed.length <= max;
}

// تنظيف النص
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}
