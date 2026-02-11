"use client"

import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md"
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "default", size = "md", children, className }: BadgeProps) {
  const variants = {
    default: "bg-secondary text-foreground",
    success: "bg-success/20 text-success border border-success/30",
    warning: "bg-warning/20 text-warning border border-warning/30",
    error: "bg-error/20 text-error border border-error/30",
    info: "bg-info/20 text-info border border-info/30"
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
