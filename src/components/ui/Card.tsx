"use client"

import { cn } from "@/lib/utils"
import { ReactNode, CSSProperties } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  style?: CSSProperties
}

export function Card({ children, className, hover = false, glow = false, style }: CardProps) {
  return (
    <div
      className={cn(
        "glass-card p-6",
        hover && "hover-lift cursor-pointer",
        glow && "glow-blue",
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 pb-4 border-b border-gray-700/50", className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-bold text-gray-100", className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-gray-700/50", className)}>
      {children}
    </div>
  )
}
