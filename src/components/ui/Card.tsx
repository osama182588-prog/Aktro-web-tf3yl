"use client";

// مكون البطاقة - Card Component
// =============================

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered";
  hover?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "glass", hover = true, glow = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-slate-800/80",
      glass: "bg-slate-800/40 backdrop-blur-xl",
      bordered: "bg-transparent border-2 border-slate-700",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-slate-700/50 p-6 transition-all duration-300",
          variants[variant],
          hover && "hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30",
          glow && "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
