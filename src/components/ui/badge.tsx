import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-[var(--line)] bg-[var(--card-muted)] text-[var(--foreground)]",
        accent:
          "border-[var(--accent-strong)] bg-[color:color-mix(in_srgb,var(--accent)_22%,white)] text-[var(--accent-foreground)]",
        subtle:
          "border-[var(--line-subtle)] bg-[var(--surface)] text-[var(--muted-foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
