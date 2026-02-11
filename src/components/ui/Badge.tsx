'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'priority'
  className?: string
  pulse?: boolean
}

export function Badge({ children, variant = 'default', className, pulse = false }: BadgeProps) {
  const variants = {
    default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    priority: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border backdrop-blur-sm',
        variants[variant],
        className
      )}
    >
      {pulse && (
        <motion.span
          className={cn(
            'w-2 h-2 rounded-full',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'priority' && 'bg-purple-400',
            variant === 'default' && 'bg-gray-400',
          )}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFICATION_REQUESTED'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'priority'; pulse?: boolean }> = {
    PENDING: { label: 'غير مفعّل', variant: 'default' },
    UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'warning', pulse: true },
    APPROVED: { label: 'مفعّل', variant: 'success' },
    REJECTED: { label: 'مرفوض', variant: 'danger' },
    MODIFICATION_REQUESTED: { label: 'طلب تعديل', variant: 'info' },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} pulse={config.pulse}>
      {config.label}
    </Badge>
  )
}
