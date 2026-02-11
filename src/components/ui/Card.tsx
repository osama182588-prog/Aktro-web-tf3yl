'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className, hover = false, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        `
        relative rounded-2xl
        bg-gray-800/40 backdrop-blur-xl
        border border-gray-700/50
        transition-all duration-500
        `,
        hover && `
          hover:bg-gray-800/60
          hover:border-gray-600/50
          hover:shadow-xl hover:shadow-blue-500/5
          hover:-translate-y-1
        `,
        glow && `
          before:absolute before:inset-0 before:rounded-2xl
          before:bg-gradient-to-r before:from-blue-500/10 before:via-transparent before:to-blue-500/10
          before:animate-pulse before:pointer-events-none
        `,
        className
      )}
    >
      {children}
    </div>
  );
}
