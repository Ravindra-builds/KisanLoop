"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#214E34] text-white hover:bg-[#163624] shadow-xs active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-xs",
        outline:
          "border border-[#d2ded5] dark:border-white/10 bg-transparent hover:bg-emerald-50/50 dark:hover:bg-zinc-800 text-[#141e17] dark:text-zinc-100",
        secondary:
          "bg-[#ebf7eb] text-[#1b4332] dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-[#d8edd8] dark:hover:bg-emerald-900/60",
        ghost: "hover:bg-[#ebf7eb]/60 dark:hover:bg-zinc-800 text-[#141e17] dark:text-zinc-100",
        link: "text-[#214E34] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-[11px]",
        lg: "h-11 rounded-xl px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
