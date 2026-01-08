import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Globe, Star, Trophy, Target } from 'lucide-react';
import type { ProfileData, EmployeeLanguage, BrandManaged, Award } from '@/hooks/useProfileData';

interface QuickStatsBarProps {
  profile: ProfileData;
  languages: EmployeeLanguage[];
  brandsManaged: BrandManaged[];
  awards: Award[];
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({
  profile,
  languages,
  brandsManaged,
  awards,
}) => {
  const awardsWon = awards.filter(a => a.won).length;
  const pitchWinRate = profile.pitches_participated && profile.pitches_participated > 0
    ? Math.round((profile.pitches_won || 0) / profile.pitches_participated * 100)
    : 0;

  const getPitchRateColor = (rate: number) => {
    if (rate >= 60) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    if (rate >= 30) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  const stats = [
    {
      label: 'Years of Experience',
      value: profile.years_of_experience || 0,
      icon: Briefcase,
      color: 'text-blue-400',
    },
    {
      label: 'Languages',
      value: languages.length,
      icon: Globe,
      color: 'text-purple-400',
      extra: languages.slice(0, 3).map(l => l.language).join(', '),
    },
    {
      label: 'Brands Managed',
      value: brandsManaged.length,
      icon: Star,
      color: 'text-yellow-400',
    },
    {
      label: 'Awards Won',
      value: awardsWon,
      icon: Trophy,
      color: 'text-amber-400',
    },
    {
      label: 'Pitch Win Rate',
      value: `${pitchWinRate}%`,
      icon: Target,
      color: 'text-primary',
      badge: true,
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="flex-shrink-0 w-[160px] md:flex-1 p-4 bg-card/50 backdrop-blur-sm border-border/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stat.value}
            </span>
            {stat.badge && (
              <Badge className={getPitchRateColor(pitchWinRate)}>
                {pitchWinRate >= 60 ? 'Excellent' : pitchWinRate >= 30 ? 'Good' : 'Needs Work'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          {stat.extra && (
            <p className="text-xs text-muted-foreground truncate mt-1">{stat.extra}</p>
          )}
        </Card>
      ))}
    </div>
  );
};
