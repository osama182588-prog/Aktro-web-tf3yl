import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return formatDate(d)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'NOT_SUBMITTED': 'text-gray-400',
    'PENDING': 'text-yellow-400',
    'APPROVED': 'text-green-400',
    'REJECTED': 'text-red-400',
    'MODIFICATION': 'text-orange-400',
  }
  return colors[status] || 'text-gray-400'
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    'NOT_SUBMITTED': 'bg-gray-500/20',
    'PENDING': 'bg-yellow-500/20',
    'APPROVED': 'bg-green-500/20',
    'REJECTED': 'bg-red-500/20',
    'MODIFICATION': 'bg-orange-500/20',
  }
  return colors[status] || 'bg-gray-500/20'
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    'NOT_SUBMITTED': 'غير مقدم',
    'PENDING': 'قيد المراجعة',
    'APPROVED': 'مفعل',
    'REJECTED': 'مرفوض',
    'MODIFICATION': 'طلب تعديل',
  }
  return texts[status] || status
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
