import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'منذ لحظات';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    APPROVED: 'bg-green-500/20 text-green-400 border-green-500/50',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/50',
    MODIFICATION_REQUESTED: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    PENDING: 'قيد المراجعة',
    APPROVED: 'مفعل',
    REJECTED: 'مرفوض',
    MODIFICATION_REQUESTED: 'يتطلب تعديل',
  };
  return texts[status] || 'غير معروف';
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
