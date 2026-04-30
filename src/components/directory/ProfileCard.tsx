import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Translate as Languages, Trophy, Envelope as Mail, Phone } from '@phosphor-icons/react';
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
  const { t } = useTranslation();

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
      className="glass-card p-5 cursor-pointer group transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 flex flex-row gap-4 items-start"
      onClick={() => navigate(`/profile/${profile.user_id}`)}
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full border-2 border-border group-hover:border-primary/50 transition-colors flex-shrink-0 overflow-hidden bg-primary">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-foreground text-xl font-semibold">
            {profile.first_name?.[0] || profile.email[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-snug break-words">
          {highlightText(fullName)}
        </h3>
        
        {(profile.current_position || profile.position) && (
          <p className="text-sm text-muted-foreground mt-0.5 leading-snug break-words">
            {highlightText(profile.current_position || profile.position || '')}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
          {profile.agency && (
            <span className="break-words">{profile.agency.name}</span>
          )}
          {profile.agency && profile.department && <span>•</span>}
          {profile.department && (
            <span className="break-words">{highlightText(profile.department)}</span>
          )}
        </div>

        {profile.country && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <span>{getFlagEmoji(profile.country.code)}</span>
            <span>{profile.country.name}</span>
          </div>
        )}

        {/* Stats badges inline */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {profile.years_of_experience !== null && (
            <Badge variant="secondary" className="bg-secondary text-muted-foreground gap-1 text-xs px-1.5 py-0">
              <Clock className="h-3 w-3" />
              {profile.years_of_experience}y
            </Badge>
          )}
          
          {profile.languages_count !== undefined && profile.languages_count > 0 && (
            <Badge variant="secondary" className="bg-secondary text-muted-foreground gap-1 text-xs px-1.5 py-0">
              <Languages className="h-3 w-3" />
              {profile.languages_count}
            </Badge>
          )}

          {pitchWinRatio !== null && (
            <Badge
              variant="secondary"
              className={cn(
                'gap-1 text-xs px-1.5 py-0',
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

        {/* Contact & View Profile row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex gap-1.5">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                aria-label={t('directory.card.email')}
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </a>
            )}
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                aria-label={t('directory.card.call')}
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </a>
            )}
          </div>
          
          <Button 
            size="sm" 
            className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs h-7 px-3"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${profile.user_id}`);
            }}
          >
            {t('directory.card.viewProfile')}
          </Button>
        </div>
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