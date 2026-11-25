import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline"
    | "avocado"
    | "sage"
    | "lightblue"
    | "yellow";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#015CA9] text-white",
    secondary: "bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]",
    success: "bg-[#dcf4a2] text-[#2e470b] border border-[#c1e672]",
    warning: "bg-[#FAE193] text-[#5e4300] border border-[#eed072]",
    destructive: "bg-[#ffdad6] text-[#ba1a1a] border border-[#f5b8b2]",
    outline: "text-[#1F2B46] border border-[#DDE6DA] bg-white",
    avocado: "bg-[#DFEEA9] text-[#34440c] border border-[#cae486]",
    sage: "bg-[#A3C8B4]/30 text-[#173e2d] border border-[#A3C8B4]",
    lightblue: "bg-[#E1F2FD] text-[#004689] border border-[#b9dcf7]",
    yellow: "bg-[#FAE193] text-[#5f4604] border border-[#ebd07a]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
