import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Word before the asterisk, e.g. "Skill" */
  prefix: string;
  /** Word after the asterisk, e.g. "form" */
  suffix: string;
  className?: string;
  /** Color class for the surrounding words. Defaults to text-foreground. */
  toneClassName?: string;
}

/**
 * Brand mark with the Signal*form-style asterisk.
 * The * glyph is ALWAYS rendered in text-primary (brand red).
 */
export function BrandMark({
  prefix,
  suffix,
  className,
  toneClassName = "text-foreground",
}: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-headline font-bold leading-none tracking-tight",
        className,
      )}
    >
      <span className={toneClassName}>{prefix}</span>
      <span className="text-primary">*</span>
      <span className={toneClassName}>{suffix}</span>
    </span>
  );
}
