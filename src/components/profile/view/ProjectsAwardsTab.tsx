import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Trophy, Calendar, User, Award } from 'lucide-react';
import type { RecentProject, Award as AwardType } from '@/hooks/useProfileData';

interface ProjectsAwardsTabProps {
  recentProjects: RecentProject[];
  awards: AwardType[];
}

const MONTHS = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const ProjectsAwardsTab: React.FC<ProjectsAwardsTabProps> = ({
  recentProjects,
  awards,
}) => {
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [awardGroupBy, setAwardGroupBy] = useState<'year' | 'type'>('year');

  // Get unique years from projects
  const projectYears = [...new Set(recentProjects.map(p => p.project_year).filter(Boolean))] as number[];
  projectYears.sort((a, b) => b - a);

  const filteredProjects = yearFilter
    ? recentProjects.filter(p => p.project_year === yearFilter)
    : recentProjects;

  // Group awards
  const groupedAwards = awards.reduce((acc, award) => {
    const key = awardGroupBy === 'year'
      ? String(award.award_year || 'Unknown')
      : (award.award_type || 'Other');
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(award);
    return acc;
  }, {} as Record<string, AwardType[]>);

  const sortedGroups = Object.keys(groupedAwards).sort((a, b) => {
    if (awardGroupBy === 'year') {
      return Number(b) - Number(a);
    }
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Recent Projects */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-400" />
            Recent Projects
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={yearFilter === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setYearFilter(null)}
            >
              All Years
            </Button>
            {projectYears.slice(0, 3).map((year) => (
              <Button
                key={year}
                variant={yearFilter === year ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setYearFilter(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent projects listed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all hover:shadow-lg border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-foreground">{project.project_name}</h4>
                    <Badge variant="outline" className="flex-shrink-0">
                      {project.project_month ? MONTHS[project.project_month] : ''} {project.project_year || ''}
                    </Badge>
                  </div>
                  
                  {project.brand && (
                    <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {project.brand}
                    </Badge>
                  )}
                  
                  {project.role_in_project && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <User className="h-4 w-4" />
                      {project.role_in_project}
                    </div>
                  )}
                  
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  
                  {project.key_results && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Key Results</p>
                      <p className="text-sm text-foreground">{project.key_results}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Awards & Recognition */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Awards & Recognition
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Group by:</span>
            <Button
              variant={awardGroupBy === 'year' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setAwardGroupBy('year')}
            >
              Year
            </Button>
            <Button
              variant={awardGroupBy === 'type' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setAwardGroupBy('type')}
            >
              Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {awards.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No awards listed</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedGroups.map((group) => (
                <div key={group}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {group}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedAwards[group].map((award) => (
                      <div
                        key={award.id}
                        className={`p-4 rounded-xl transition-all ${
                          award.won
                            ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20'
                            : 'bg-muted/30 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            award.won
                              ? 'bg-amber-500/20'
                              : 'bg-muted'
                          }`}>
                            <Trophy className={`h-5 w-5 ${
                              award.won ? 'text-amber-400' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-foreground truncate">
                              {award.award_name}
                            </h4>
                            
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {award.award_type && (
                                <Badge variant="outline" className="text-xs">
                                  {award.award_type}
                                </Badge>
                              )}
                              <Badge className={award.won
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-muted text-muted-foreground'
                              }>
                                {award.won ? 'Won' : 'Participated'}
                              </Badge>
                            </div>
                            
                            {award.category && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {award.category}
                              </p>
                            )}
                            
                            {award.award_year && awardGroupBy !== 'year' && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {award.award_year}
                              </div>
                            )}
                            
                            {award.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {award.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
