import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "@phosphor-icons/react";

type Tint = "primary" | "teal" | "neutral";

interface ImagePlaceholderProps {
  /** Description of the suggested image. Shown as the body copy. */
  description: string;
  tint?: Tint;
  /** Tailwind aspect class, e.g. "aspect-[16/7]" or "aspect-[4/3]". */
  aspect?: string;
  className?: string;
  label?: string;
}

const tintRing: Record<Tint, string> = {
  primary: "border-primary/40",
  teal: "border-secondary/40",
  neutral: "border-border",
};

const tintBg: Record<Tint, string> = {
  primary: "from-primary/10 via-transparent to-primary/5",
  teal: "from-secondary/10 via-transparent to-secondary/5",
  neutral: "from-muted/40 via-transparent to-muted/10",
};

const tintIcon: Record<Tint, string> = {
  primary: "text-primary",
  teal: "text-secondary",
  neutral: "text-muted-foreground",
};

export function ImagePlaceholder({
  description,
  tint = "primary",
  aspect = "aspect-[16/9]",
  className,
  label = "Image placeholder",
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-dashed",
        tintRing[tint],
        aspect,
        className,
      )}
    >
      {/* gradient backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          tintBg[tint],
        )}
      />

      {/* SVG grid overlay */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-[0.07] text-foreground"
      >
        <defs>
          <pattern id="placeholder-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#placeholder-grid)" />
      </svg>

      {/* content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <ImageIcon
          weight="duotone"
          size={32}
          className={tintIcon[tint]}
          aria-hidden
        />
        <p className="eyebrow">{label}</p>
        <p className="text-mono max-w-md text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
