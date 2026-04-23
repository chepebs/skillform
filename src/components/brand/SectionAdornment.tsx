import { cn } from "@/lib/utils";
import { BracketTag } from "./BracketTag";

interface SectionAdornmentProps {
  /** Current section number (1-indexed). Will be zero-padded to 2 digits. */
  index: number;
  /** Total sections on the page. Will be zero-padded to 2 digits. */
  total: number;
  /** Right-side label, e.g. "Design Tokens" */
  label: string;
  variant?: "standard" | "accent" | "live";
  className?: string;
  align?: "left" | "center";
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function SectionAdornment({
  index,
  total,
  label,
  variant = "accent",
  className,
  align = "center",
}: SectionAdornmentProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      <span className="section-counter">
        [ {pad(index)} / {pad(total)} ]
      </span>
      <span className="w-[3px] h-[3px] rounded-full bg-border" />
      {variant === "standard" ? (
        <span className="slash-label">{label}</span>
      ) : variant === "live" ? (
        <span className="inline-flex items-center gap-2">
          <span className="pulse-ring" />
          <BracketTag variant="success">{label}</BracketTag>
        </span>
      ) : (
        <BracketTag variant="accent">{label}</BracketTag>
      )}
    </div>
  );
}
