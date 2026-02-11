'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center font-medium rounded-xl
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-blue-600 to-blue-500
        hover:from-blue-500 hover:to-blue-400
        text-white shadow-lg shadow-blue-500/25
        focus:ring-blue-500
        hover:shadow-blue-500/40 hover:shadow-xl
        active:scale-[0.98]
      `,
      secondary: `
        bg-gradient-to-r from-gray-600 to-gray-500
        hover:from-gray-500 hover:to-gray-400
        text-white shadow-lg shadow-gray-500/25
        focus:ring-gray-500
        hover:shadow-gray-500/40 hover:shadow-xl
        active:scale-[0.98]
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-500
        hover:from-red-500 hover:to-red-400
        text-white shadow-lg shadow-red-500/25
        focus:ring-red-500
        hover:shadow-red-500/40 hover:shadow-xl
        active:scale-[0.98]
      `,
      ghost: `
        bg-transparent hover:bg-white/5
        text-gray-300 hover:text-white
        focus:ring-gray-500
        active:scale-[0.98]
      `,
      outline: `
        border-2 border-blue-500/50 bg-transparent
        hover:border-blue-400 hover:bg-blue-500/10
        text-blue-400 hover:text-blue-300
        focus:ring-blue-500
        active:scale-[0.98]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-7 py-3.5 text-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
