import React from 'react';
import { Users, Folder, ChartPie as PieChart } from '@phosphor-icons/react';

interface OrganizerStatsProps {
  totalProfiles: number;
  totalGroups: number;
  organizationRate: number;
}

export const OrganizerStats: React.FC<OrganizerStatsProps> = ({
  totalProfiles,
  totalGroups,
  organizationRate,
}) => {
  const stats = [
    {
      label: 'Total Profiles',
      value: totalProfiles,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Groups Created',
      value: totalGroups,
      icon: Folder,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Profiles Organized',
      value: `${organizationRate}%`,
      icon: PieChart,
      color: organizationRate >= 70 ? 'text-green-500' : organizationRate >= 40 ? 'text-yellow-500' : 'text-red-500',
      bgColor: organizationRate >= 70 ? 'bg-green-500/10' : organizationRate >= 40 ? 'bg-yellow-500/10' : 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
