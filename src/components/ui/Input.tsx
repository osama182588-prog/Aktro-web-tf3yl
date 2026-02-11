'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              `
              w-full px-4 py-3 rounded-xl
              bg-gray-800/50 backdrop-blur-sm
              border-2 border-gray-700/50
              text-white placeholder-gray-500
              transition-all duration-300
              focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70
              focus:shadow-lg focus:shadow-blue-500/10
              hover:border-gray-600
              disabled:opacity-50 disabled:cursor-not-allowed
              `,
              icon && 'pr-12',
              error && 'border-red-500/50 focus:border-red-500',
              className
            )}
            {...props}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
