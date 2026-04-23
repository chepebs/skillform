interface SkillFormLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

/**
 * Brand mark for Skill*form.
 * Per Signal*form design system: the asterisk is ALWAYS red (text-primary).
 * The "Skill" / "form" text uses foreground so it adapts to light/dark.
 */
export function SkillFormLogo({
  className = "",
  // kept for API compatibility (icon was removed in favor of the wordmark)
  iconClassName: _iconClassName,
  textClassName = "text-base",
}: SkillFormLogoProps) {
  return (
    <span
      className={`inline-flex items-center font-headline font-bold leading-none ${textClassName} ${className}`}
    >
      <span className="text-foreground">Skill</span>
      <span className="text-primary">*</span>
      <span className="text-foreground">form</span>
    </span>
  );
}
