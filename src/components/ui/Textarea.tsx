"use client";

// مكون منطقة النص - Textarea Component
// =====================================

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-gray-300 text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white",
            "placeholder:text-gray-500 transition-all duration-300 resize-none",
            "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            "hover:border-slate-600 min-h-[120px]",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
