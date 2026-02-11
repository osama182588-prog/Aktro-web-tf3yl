import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// تنسيق التاريخ بالعربية
export function formatDateAr(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// تنسيق التاريخ النسبي
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days < 7) return `منذ ${days} يوم`
  
  return formatDateAr(date)
}

// ترجمة حالة التفعيل
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'NOT_ACTIVATED': 'غير مفعل',
    'PENDING_REVIEW': 'قيد المراجعة',
    'ACTIVATED': 'مفعل',
    'REJECTED': 'مرفوض',
    'MODIFICATION_REQUESTED': 'طلب تعديل'
  }
  return labels[status] || status
}

// ألوان حالة التفعيل
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'NOT_ACTIVATED': 'text-gray-400',
    'PENDING_REVIEW': 'text-yellow-400',
    'ACTIVATED': 'text-green-400',
    'REJECTED': 'text-red-400',
    'MODIFICATION_REQUESTED': 'text-orange-400'
  }
  return colors[status] || 'text-gray-400'
}

// التحقق من صلاحية الإدارة
export function isAdmin(roles: string[]): boolean {
  const adminRoles = [
    process.env.DISCORD_ROLE_SENIOR_ADMIN,
    process.env.DISCORD_ROLE_ACTIVATION_ADMIN,
    process.env.DISCORD_ROLE_GENERAL_ADMIN
  ].filter(Boolean)
  
  return roles.some(role => adminRoles.includes(role))
}

// التحقق من رتبة محددة
export function hasRole(roles: string[], roleId: string | undefined): boolean {
  if (!roleId) return false
  return roles.includes(roleId)
}

// الحصول على مستوى الصلاحية
export function getAdminLevel(roles: string[]): 'senior' | 'activation' | 'general' | null {
  if (hasRole(roles, process.env.DISCORD_ROLE_SENIOR_ADMIN)) return 'senior'
  if (hasRole(roles, process.env.DISCORD_ROLE_ACTIVATION_ADMIN)) return 'activation'
  if (hasRole(roles, process.env.DISCORD_ROLE_GENERAL_ADMIN)) return 'general'
  return null
}
