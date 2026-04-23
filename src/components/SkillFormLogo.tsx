import { SkillFormIcon } from "./SkillFormIcon";

interface SkillFormLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  /** Hide the icon glyph and show only the wordmark. */
  hideIcon?: boolean;
}

/**
 * Brand mark for Skill*form.
 *
 * - Custom person-with-sparkle icon (rendered in primary red)
 * - Wordmark "Skill" + red asterisk + "form" in the brand headline font
 *   (asterisk is ALWAYS red per the Signal*form design system).
 */
export function SkillFormLogo({
  className = "",
  iconClassName = "h-4 w-4",
  textClassName = "text-base",
  hideIcon = false,
}: SkillFormLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-headline font-bold leading-none ${textClassName} ${className}`}
    >
      {!hideIcon && (
        <SkillFormIcon className={`text-primary shrink-0 ${iconClassName}`} />
      )}
      <span className="inline-flex items-baseline">
        <span className="text-foreground">Skill</span>
        <span className="text-primary">*</span>
        <span className="text-foreground">form</span>
      </span>
    </span>
  );
}
