import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, Clock, Briefcase } from 'lucide-react';
import { formatDistanceStrict, parseISO, differenceInMonths } from 'date-fns';
import type { ProfileData, PreviousPosition, PreviousAgency } from '@/hooks/useProfileData';

interface ExperienceTabProps {
  profile: ProfileData;
  previousPositions: PreviousPosition[];
  previousAgencies: PreviousAgency[];
}

const formatDuration = (startDate: string | null, endDate: string | null): string => {
  if (!startDate) return '';
  
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : new Date();
  const months = differenceInMonths(end, start);
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0 && remainingMonths > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
};

const formatDateRange = (startDate: string | null, endDate: string | null): string => {
  if (!startDate) return '';
  
  const start = parseISO(startDate);
  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  if (!endDate) {
    return `${startStr} - Present`;
  }
  
  const end = parseISO(endDate);
  const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${startStr} - ${endStr}`;
};

export const ExperienceTab: React.FC<ExperienceTabProps> = ({
  profile,
  previousPositions,
  previousAgencies,
}) => {
  // Create timeline with current position at top
  const currentPosition = {
    id: 'current',
    position_title: profile.current_position || profile.position || 'Current Position',
    company: profile.agency?.name || 'Current Company',
    start_date: null,
    end_date: null,
    description: null,
    isCurrent: true,
  };

  const timeline = [currentPosition, ...previousPositions.map(p => ({ ...p, isCurrent: false }))];

  return (
    <div className="space-y-6">
      {/* Career Timeline */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Career Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No work experience listed yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted" />
              
              <div className="space-y-6">
                {timeline.map((position, index) => (
                  <div key={position.id} className="relative pl-12">
                    {/* Timeline node */}
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      position.isCurrent 
                        ? 'bg-primary shadow-lg shadow-primary/30' 
                        : 'bg-muted border-2 border-border'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        position.isCurrent ? 'bg-primary-foreground' : 'bg-muted-foreground'
                      }`} />
                    </div>
                    
                    {/* Content */}
                    <div className={`p-4 rounded-lg transition-all ${
                      position.isCurrent 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {position.position_title}
                          </h3>
                          <p className="text-muted-foreground">{position.company}</p>
                        </div>
                        {position.isCurrent && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      {position.start_date && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDateRange(position.start_date, position.end_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(position.start_date, position.end_date)}
                          </span>
                        </div>
                      )}
                      
                      {position.description && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {position.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agency Experience */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-400" />
            Agency Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previousAgencies.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No previous agency experience listed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previousAgencies.map((agency) => (
                <div
                  key={agency.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {agency.agency_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{agency.role}</p>
                      {agency.start_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateRange(agency.start_date, agency.end_date)}
                        </p>
                      )}
                      {agency.start_date && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {formatDuration(agency.start_date, agency.end_date)}
                        </Badge>
                      )}
                    </div>
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
