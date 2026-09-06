import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#214E34] text-white shadow-xs",
        secondary:
          "border-[#d2ded5] dark:border-emerald-800 bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-300",
        destructive:
          "border-transparent bg-red-500 text-white shadow-xs",
        outline: "text-foreground border-[#d2ded5] dark:border-white/10",
        emerald:
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300",
        amber:
          "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
