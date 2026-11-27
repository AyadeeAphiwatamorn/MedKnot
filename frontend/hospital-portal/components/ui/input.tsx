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
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cn(
          "flex h-10 w-full rounded-xl border-[1.5px] border-[#AEBEAA] bg-[#F3F7F2] px-3 py-2 text-sm text-[#1F2B46] placeholder:text-[#7C8998] transition-all hover:border-[#8EA389] hover:bg-[#EEF4ED] focus:bg-white focus:outline-none focus:border-[#0055A4] focus:ring-[3px] focus:ring-[#0055A4]/15 disabled:cursor-not-allowed disabled:opacity-60",
          error && "border-[#ba1a1a] hover:border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/15",
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
