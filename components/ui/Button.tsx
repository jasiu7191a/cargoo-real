import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  glow?: boolean;
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", glow = false, size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-wider transition-all active:scale-95 duration-300 cursor-pointer";
    
    const variants = {
      primary: "bg-[#ff5500] text-[#050505] hover:bg-white hover:text-[#050505] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
      outline: "bg-transparent text-white border border-[rgba(255,255,255,0.1)] backdrop-blur-md hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]",
      ghost: "bg-transparent text-white hover:bg-[rgba(255,255,255,0.05)]",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-8 py-3.5 text-sm",
      lg: "px-10 py-5 text-base",
    };

    const glowStyle = glow && variant === "primary" ? "shadow-[0_0_30px_rgba(255,85,0,0.4)]" : "";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], glowStyle, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
