import { cn } from "@/lib/utils";

type Variant = "default" | "accent" | "success" | "warning" | "error";

interface BracketTagProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantClass: Record<Variant, string> = {
  default: "bracket-tag",
  accent: "bracket-tag bracket-tag-accent",
  success: "bracket-tag bracket-tag-success",
  warning: "bracket-tag bracket-tag-warning",
  error: "bracket-tag bracket-tag-error",
};

export function BracketTag({ children, variant = "default", className }: BracketTagProps) {
  return <span className={cn(variantClass[variant], className)}>{children}</span>;
}
