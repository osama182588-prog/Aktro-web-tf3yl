'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode, MouseEventHandler } from 'react'

interface ButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: MouseEventHandler<HTMLButtonElement>
}

function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  disabled,
  type = 'button',
  onClick,
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500 shadow-lg shadow-gray-500/20',
    outline: 'border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400',
    ghost: 'text-gray-300 hover:bg-white/5 hover:text-white',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25',
  }
  
  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4',
  }

  return (
    <motion.button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Ripple effect layer */}
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <motion.span
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : null}
        {children}
      </span>
    </motion.button>
  )
}

export { Button }
