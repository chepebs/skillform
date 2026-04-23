import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TeamMember } from '@/hooks/useDirectorData';

interface TeamAnalyticsProps {
  teamMembers: TeamMember[];
}

const COLORS = {
  junior: 'hsl(var(--seniority-junior))',
  mid: 'hsl(var(--seniority-mid))',
  senior: 'hsl(var(--seniority-senior))',
  lead: 'hsl(var(--seniority-lead))',
};

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ teamMembers }) => {
  // Experience distribution
  const experienceDistribution = React.useMemo(() => {
    const distribution = { Junior: 0, Mid: 0, Senior: 0, Lead: 0 };
    teamMembers.forEach((m) => {
      const exp = m.years_of_experience || 0;
      if (exp >= 13) distribution.Lead++;
      else if (exp >= 8) distribution.Senior++;
      else if (exp >= 4) distribution.Mid++;
      else distribution.Junior++;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [teamMembers]);

  // Performance by seniority
  const performanceByLevel = React.useMemo(() => {
    const groups: Record<string, { total: number; count: number }> = {
      Junior: { total: 0, count: 0 },
      Mid: { total: 0, count: 0 },
      Senior: { total: 0, count: 0 },
      Lead: { total: 0, count: 0 },
    };

    teamMembers.forEach((m) => {
      const exp = m.years_of_experience || 0;
      const level = exp >= 13 ? 'Lead' : exp >= 8 ? 'Senior' : exp >= 4 ? 'Mid' : 'Junior';
      const participated = m.pitches_participated || 0;
      const won = m.pitches_won || 0;
      if (participated > 0) {
        groups[level].total += (won / participated) * 100;
        groups[level].count++;
      }
    });

    return Object.entries(groups).map(([name, data]) => ({
      name,
      'Pitch Win %': data.count > 0 ? Math.round(data.total / data.count) : 0,
    }));
  }, [teamMembers]);

  // Languages breakdown
  const languagesData = React.useMemo(() => {
    const counts = { '0': 0, '1-2': 0, '3-4': 0, '5+': 0 };
    teamMembers.forEach((m) => {
      const langCount = m.languages_count || 0;
      if (langCount === 0) counts['0']++;
      else if (langCount <= 2) counts['1-2']++;
      else if (langCount <= 4) counts['3-4']++;
      else counts['5+']++;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: `${name} languages`,
      value,
    }));
  }, [teamMembers]);

  const PIE_COLORS = [
    'hsl(var(--seniority-junior))',
    'hsl(var(--seniority-mid))',
    'hsl(var(--seniority-senior))',
    'hsl(var(--seniority-lead))',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Experience Distribution */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Experience Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={experienceDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
            >
              {experienceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Performance by Level */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Pitch Win Rate by Seniority
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceByLevel}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}%`, 'Win Rate']}
            />
            <Bar
              dataKey="Pitch Win %"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Languages Distribution */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Languages Known</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={languagesData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => (value > 0 ? value : '')}
            >
              {languagesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Profile Completion */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Profile Completion</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                {
                  name: 'Complete',
                  value: teamMembers.filter((m) => m.profile_completed).length,
                },
                {
                  name: 'Incomplete',
                  value: teamMembers.filter((m) => !m.profile_completed).length,
                },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
            >
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
