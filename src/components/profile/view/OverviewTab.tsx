import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Buildings as Building, MapPin, GraduationCap, Target, Star, Trophy, ArrowRight } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ProfileData } from '@/hooks/useProfileData';

interface OverviewTabProps {
  profile: ProfileData;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ profile, onNavigateToTab }) => {
  const pitchWinRate = profile.pitches_participated && profile.pitches_participated > 0
    ? Math.round((profile.pitches_won || 0) / profile.pitches_participated * 100)
    : 0;

  const effieWinRate = profile.effie_awards_participated && profile.effie_awards_participated > 0
    ? Math.round((profile.effie_awards_won || 0) / profile.effie_awards_participated * 100)
    : 0;

  const getExperienceLevel = (years: number) => {
    if (years >= 15) return { label: 'Executive', progress: 100 };
    if (years >= 10) return { label: 'Lead', progress: 80 };
    if (years >= 5) return { label: 'Senior', progress: 60 };
    if (years >= 2) return { label: 'Mid-Level', progress: 40 };
    return { label: 'Junior', progress: 20 };
  };

  const experienceLevel = getExperienceLevel(profile.years_of_experience || 0);

  const getRateColor = (rate: number) => {
    if (rate >= 60) return 'hsl(var(--success))';
    if (rate >= 30) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const createDonutData = (value: number) => [
    { name: 'filled', value },
    { name: 'empty', value: 100 - value },
  ];

  return (
    <div className="space-y-6">
      {/* Professional Summary */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Professional Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Position</p>
                <p className="font-medium text-foreground">
                  {profile.current_position || profile.position || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department & Agency</p>
                <p className="font-medium text-foreground">
                  {profile.department || 'No dept'} • {profile.agency?.name || 'No agency'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Academic Degree</p>
                <p className="font-medium text-foreground">
                  {profile.academic_degree || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-chart-6/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-chart-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">
                  {profile.country?.name || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Experience Progress */}
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Career Stage</span>
              <Badge variant="outline">{experienceLevel.label}</Badge>
            </div>
            <Progress value={experienceLevel.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {profile.years_of_experience || 0} years of experience
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pitch Performance */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Pitch Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={createDonutData(pitchWinRate)}
                      innerRadius={40}
                      outerRadius={55}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={getRateColor(pitchWinRate)} />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{pitchWinRate}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {profile.pitches_won || 0} wins out of {profile.pitches_participated || 0} pitches
            </p>
          </CardContent>
        </Card>

        {/* Brand Work */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              Brand Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="flex items-end gap-4">
                <div className="text-center">
                  <div className="w-12 bg-primary/80 rounded-t" style={{ height: `${Math.min((profile.brand_creations || 0) * 10, 60)}px` }} />
                  <p className="text-2xl font-bold mt-2">{profile.brand_creations || 0}</p>
                  <p className="text-xs text-muted-foreground">Creations</p>
                </div>
                <div className="text-center">
                  <div className="w-12 bg-chart-3/80 rounded-t" style={{ height: `${Math.min((profile.brand_refreshes || 0) * 10, 60)}px` }} />
                  <p className="text-2xl font-bold mt-2">{profile.brand_refreshes || 0}</p>
                  <p className="text-xs text-muted-foreground">Refreshes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Effie Awards */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              Effie Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={createDonutData(effieWinRate)}
                      innerRadius={40}
                      outerRadius={55}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={getRateColor(effieWinRate)} />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{effieWinRate}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {profile.effie_awards_won || 0} wins out of {profile.effie_awards_participated || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => onNavigateToTab('projects')}>
              View Recent Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => onNavigateToTab('projects')}>
              View Awards & Recognition
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => onNavigateToTab('skills')}>
              View Skills & Languages
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
