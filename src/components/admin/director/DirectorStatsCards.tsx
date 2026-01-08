import React from 'react';
import { Users, TrendingUp, Briefcase, Award } from 'lucide-react';
import { DirectorStats } from '@/hooks/useDirectorData';

interface DirectorStatsCardsProps {
  stats: DirectorStats;
}

export const DirectorStatsCards: React.FC<DirectorStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Team Size',
      value: stats.teamSize,
      subtext: `${stats.completedProfiles} completed profiles`,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Avg Experience',
      value: `${stats.avgExperience} yrs`,
      subtext: 'Average years of experience',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      subtext: 'Team projects this quarter',
      icon: Briefcase,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Team Performance',
      value: `${stats.avgPitchWinRate}%`,
      subtext: `${stats.totalAwards} total awards`,
      icon: Award,
      color:
        stats.avgPitchWinRate >= 60
          ? 'text-green-500'
          : stats.avgPitchWinRate >= 40
          ? 'text-yellow-500'
          : 'text-red-500',
      bgColor:
        stats.avgPitchWinRate >= 60
          ? 'bg-green-500/10'
          : stats.avgPitchWinRate >= 40
          ? 'bg-yellow-500/10'
          : 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}
            >
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.subtext}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
