import skillformIcon from "@/assets/skillform-icon.svg";

interface SkillFormLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function SkillFormLogo({ className = "", iconClassName = "h-5 w-5", textClassName = "text-base" }: SkillFormLogoProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <img src={skillformIcon} alt="" className={`${iconClassName} dark:invert`} />
      <span className={`font-headline font-bold leading-none ${textClassName}`}>
        <span className="text-primary">Skill</span>
        <span className="text-primary">*</span>
        <span className="text-primary">form</span>
      </span>
    </span>
  );
}
