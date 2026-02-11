"use client"

import { cn } from "@/lib/utils"
import { getStatusText, getStatusColor, getStatusBgColor } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        getStatusColor(status),
        getStatusBgColor(status),
        sizes[size],
        className
      )}
    >
      <span className={cn(
        "w-2 h-2 rounded-full mr-2",
        status === "PENDING" && "bg-yellow-400 animate-pulse",
        status === "APPROVED" && "bg-green-400",
        status === "REJECTED" && "bg-red-400",
        status === "MODIFICATION" && "bg-orange-400",
        status === "NOT_SUBMITTED" && "bg-gray-400",
      )} />
      {getStatusText(status)}
    </span>
  )
}

interface PriorityBadgeProps {
  className?: string
}

export function PriorityBadge({ className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        "bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
        "text-yellow-400 border border-yellow-500/30",
        className
      )}
    >
      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      أولوية
    </span>
  )
}
