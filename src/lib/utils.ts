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
    minute: '2-digit'
  }).format(d)
}

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
  
  return formatDate(date)
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'NOT_ACTIVATED': 'غير مفعل',
    'PENDING': 'قيد المراجعة',
    'ACTIVATED': 'مفعل',
    'REJECTED': 'مرفوض'
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'NOT_ACTIVATED': 'bg-gray-500',
    'PENDING': 'bg-yellow-500',
    'ACTIVATED': 'bg-green-500',
    'REJECTED': 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}
