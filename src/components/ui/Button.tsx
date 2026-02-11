"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5",
      secondary: "bg-gray-700/50 text-gray-100 border border-gray-600 hover:bg-gray-600/50 hover:border-gray-500",
      danger: "bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-500 hover:shadow-lg hover:shadow-red-500/30",
      ghost: "bg-transparent text-gray-300 hover:bg-gray-800/50 hover:text-white",
      outline: "bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10",
    }
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3 text-lg",
    }
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span className="relative z-10">{children}</span>
        {variant === "primary" && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
