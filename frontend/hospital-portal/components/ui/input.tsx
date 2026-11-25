import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] px-3 py-2 text-sm text-[#1F2B46] placeholder:text-[#727783] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#015CA9] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 shadow-inner focus:shadow-sm",
          error && "border-[#ba1a1a] focus:ring-[#ba1a1a]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
