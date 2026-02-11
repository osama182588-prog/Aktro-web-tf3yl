import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, locale: string = 'ar-SA'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string, locale: string = 'ar-SA'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDiscordAvatarUrl(userId: string, avatar: string | null): string {
  if (!avatar) {
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`
}

export function calculateAccountAge(createdAt: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'text-green-500 bg-green-500/10'
    case 'REJECTED':
      return 'text-red-500 bg-red-500/10'
    case 'UNDER_REVIEW':
      return 'text-yellow-500 bg-yellow-500/10'
    case 'MODIFICATION_REQUESTED':
      return 'text-orange-500 bg-orange-500/10'
    default:
      return 'text-gray-500 bg-gray-500/10'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'مفعّل'
    case 'REJECTED':
      return 'مرفوض'
    case 'UNDER_REVIEW':
      return 'قيد المراجعة'
    case 'MODIFICATION_REQUESTED':
      return 'طلب تعديل'
    case 'PENDING':
      return 'غير مفعل'
    default:
      return status
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
