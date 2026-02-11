"use client"

import { cn } from "@/lib/utils"
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-gray-300 text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-gray-100",
              "placeholder:text-gray-500 transition-all duration-300",
              "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pr-12",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
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
            "w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-gray-100",
            "placeholder:text-gray-500 transition-all duration-300 resize-y min-h-[120px]",
            "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Input, Textarea }
