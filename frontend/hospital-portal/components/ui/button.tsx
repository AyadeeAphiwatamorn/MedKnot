import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "avocado"
    | "sage"
    | "lightblue";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015CA9] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-[#015CA9] text-white hover:bg-[#00478a] shadow-sm hover:shadow",
      secondary:
        "bg-[#E1F2FD] text-[#015CA9] hover:bg-[#cbe7fb] border border-[#b2d9f7]",
      outline:
        "border border-[#C5D2C0] bg-white text-[#1F2B46] hover:bg-[#E6EDE2] hover:border-[#AEBEAA] shadow-[0_2px_6px_rgba(31,43,70,0.08)]",
      ghost:
        "text-[#424751] hover:bg-[#E1E9DC] hover:text-[#1F2B46]",
      destructive:
        "bg-[#ba1a1a] text-white hover:bg-[#93000a] shadow-sm",
      avocado:
        "bg-[#DFEEA9] text-[#2d3a08] hover:bg-[#d1e998] border border-[#c5dd80] font-semibold",
      sage:
        "bg-[#A3C8B4] text-[#133022] hover:bg-[#8eb8a0] border border-[#8cb79f]",
      lightblue:
        "bg-[#E1F2FD] text-[#003e7a] hover:bg-[#cde7fc] border border-[#b9def9]",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
