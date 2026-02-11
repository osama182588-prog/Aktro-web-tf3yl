"use client";

// مكون شارة الحالة - StatusBadge Component
// ========================================

import { cn } from "@/lib/utils";
import { translateStatus, getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const statusIcons: Record<string, string> = {
    PENDING: "⏳",
    REVIEWING: "🔍",
    APPROVED: "✅",
    REJECTED: "❌",
    MODIFICATION_REQUIRED: "📝",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-medium",
        getStatusColor(status),
        sizes[size],
        className
      )}
    >
      <span>{statusIcons[status] || "•"}</span>
      {translateStatus(status)}
    </span>
  );
}
