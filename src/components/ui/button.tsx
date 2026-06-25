import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const variants: Record<Variant, string> = {
    primary: "bg-primary text-primary-fg hover:opacity-90",
    outline: "border border-line text-fg hover:bg-canvas",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
