import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, Globe, Clock, Languages, Trophy, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DirectoryProfile } from './types';

interface ProfileCardProps {
  profile: DirectoryProfile;
  searchQuery?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, searchQuery }) => {
  const navigate = useNavigate();

  const fullName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.email;

  const pitchWinRatio = profile.pitches_participated && profile.pitches_participated > 0
    ? Math.round((profile.pitches_won || 0) / profile.pitches_participated * 100)
    : null;

  const highlightText = (text: string) => {
    if (!searchQuery || !text) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-primary font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className="glass-card rounded-xl p-5 cursor-pointer group transition-all duration-300 hover:border-primary/50 hover:shadow-primary hover:-translate-y-2 relative overflow-hidden"
      onClick={() => navigate(`/profile/${profile.user_id}`)}
    >
      {/* Quick contact icons on hover */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full bg-dark-elevated hover:bg-primary/20 transition-colors"
          >
            <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </a>
        )}
        {profile.phone && (
          <a
            href={`tel:${profile.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full bg-dark-elevated hover:bg-primary/20 transition-colors"
          >
            <Phone className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-full border-2 border-dark-border group-hover:border-primary/50 transition-colors flex-shrink-0 overflow-hidden bg-gradient-primary">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-foreground text-2xl font-semibold">
              {profile.first_name?.[0] || profile.email[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
            {highlightText(fullName)}
          </h3>
          
          {(profile.current_position || profile.position) && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {highlightText(profile.current_position || profile.position || '')}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {profile.agency && (
              <span className="truncate">{profile.agency.name}</span>
            )}
            {profile.agency && profile.department && <span>•</span>}
            {profile.department && (
              <span className="truncate">{highlightText(profile.department)}</span>
            )}
          </div>

          {profile.country && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{getFlagEmoji(profile.country.code)}</span>
              <span>{profile.country.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {profile.years_of_experience !== null && (
          <Badge variant="secondary" className="bg-dark-elevated text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            {profile.years_of_experience}y exp
          </Badge>
        )}
        
        {profile.languages_count !== undefined && profile.languages_count > 0 && (
          <Badge variant="secondary" className="bg-dark-elevated text-muted-foreground gap-1">
            <Languages className="h-3 w-3" />
            {profile.languages_count}
          </Badge>
        )}

        {pitchWinRatio !== null && (
          <Badge
            variant="secondary"
            className={cn(
              'gap-1',
              pitchWinRatio >= 60
                ? 'bg-green-500/20 text-green-400'
                : pitchWinRatio >= 30
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            <Trophy className="h-3 w-3" />
            {pitchWinRatio}%
          </Badge>
        )}
      </div>

      {/* Hover overlay with additional info */}
      <div className="absolute inset-0 bg-dark-card/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 pointer-events-none">
        <div className="text-center space-y-2">
          {profile.projects_count !== undefined && profile.projects_count > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{profile.projects_count}</span> Recent Projects
            </p>
          )}
          {profile.awards_count !== undefined && profile.awards_count > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{profile.awards_count}</span> Awards
            </p>
          )}
          {profile.consulting_work && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Available for Consulting
            </Badge>
          )}
        </div>
        <Button className="mt-4 bg-gradient-primary pointer-events-auto">
          View Profile
        </Button>
      </div>
    </div>
  );
};

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
