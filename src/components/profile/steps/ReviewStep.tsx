import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PencilSimpleLine as Edit2, User, Briefcase, GraduationCap, ChartBar as BarChart3, FolderOpen, Translate as Languages, Medal as Award, Factory } from '@phosphor-icons/react';
import { ProfileFormData } from '../types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ReviewStepProps {
  data: ProfileFormData;
  onEdit: (step: number) => void;
}

const Section: React.FC<{
  title: string;
  icon: React.ElementType;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}> = ({ title, icon: Icon, step, onEdit, children }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 rounded-lg border border-border bg-background/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
          className="text-primary hover:text-primary"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          {t('common.buttons.edit')}
        </Button>
      </div>
      {children}
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className="text-foreground text-sm font-medium">{value || '-'}</span>
  </div>
);

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onEdit }) => {
  const { t } = useTranslation();
  const [industriesMap, setIndustriesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadIndustries = async () => {
      const { data: industries } = await supabase.from('industries').select('id, name');
      if (industries) {
        const map: Record<string, string> = {};
        industries.forEach((i) => { map[i.id] = i.name; });
        setIndustriesMap(map);
      }
    };
    loadIndustries();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('profile.review.title')}</h2>
        <p className="text-muted-foreground">{t('profile.review.subtitle')}</p>
      </div>

      {/* Basic Info */}
      <Section title={t('profile.review.sections.basicInfo')} icon={User} step={1} onEdit={onEdit}>
        <div className="space-y-1">
          <InfoRow label={t('profile.basicInfo.firstName') + ' / ' + t('profile.basicInfo.lastName')} value={`${data.basicInfo.first_name} ${data.basicInfo.last_name}`} />
          <InfoRow label={t('profile.basicInfo.email')} value={data.basicInfo.email} />
          <InfoRow label={t('profile.basicInfo.phone')} value={data.basicInfo.phone} />
          {data.basicInfo.avatar_url && (
            <div className="flex items-center gap-2 pt-2">
              <img src={data.basicInfo.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
              <span className="text-sm text-green-500">{t('profile.counters.photoUploaded')}</span>
            </div>
          )}
        </div>
      </Section>

      {/* Professional Info */}
      <Section title={t('profile.review.sections.professional')} icon={Briefcase} step={2} onEdit={onEdit}>
        <div className="space-y-1">
          <InfoRow label={t('profile.professional.currentPosition')} value={data.professionalInfo.current_position} />
          {data.professionalInfo.previous_positions.length > 0 && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">{t('profile.professional.previousPositions')}:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.professionalInfo.previous_positions.map((pos, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {pos.position_title} — {pos.company}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Education */}
      <Section title={t('profile.review.sections.education')} icon={GraduationCap} step={3} onEdit={onEdit}>
        <div className="space-y-1">
          <InfoRow label={t('profile.education.academicDegree')} value={data.education.academic_degree} />
          <InfoRow label={t('profile.education.yearsOfExperience')} value={data.education.years_of_experience} />
          {data.education.previous_agencies.length > 0 && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">{t('profile.education.previousAgencies')}: {data.education.previous_agencies.length}</span>
            </div>
          )}
        </div>
      </Section>

      {/* Performance */}
      <Section title={t('profile.review.sections.performance')} icon={BarChart3} step={4} onEdit={onEdit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <InfoRow label={t('profile.performance.pitchesWon')} value={data.performance.pitches_won} />
            <InfoRow label={t('profile.performance.pitchesParticipated')} value={data.performance.pitches_participated} />
          </div>
          <div className="space-y-1">
            <InfoRow label={t('profile.performance.effieAwardsWon')} value={data.performance.effie_awards_won} />
            <InfoRow label={t('profile.performance.effieAwardsParticipated')} value={data.performance.effie_awards_participated} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <InfoRow label={t('profile.performance.brandCreations')} value={data.performance.brand_creations} />
          <InfoRow label={t('profile.performance.brandRefreshes')} value={data.performance.brand_refreshes} />
        </div>
      </Section>

      {/* Brands & Projects */}
      <Section title={t('profile.review.sections.projects')} icon={FolderOpen} step={5} onEdit={onEdit}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('profile.projects.brandsManaged')}:</span>
            <span className="text-sm font-medium">{data.brandsProjects.brands_managed.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('profile.projects.recentProjects')}:</span>
            <span className="text-sm font-medium">{data.brandsProjects.recent_projects.length}</span>
          </div>
          {data.brandsProjects.recent_projects.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {data.brandsProjects.recent_projects.map((proj, i) => (
                <Badge key={i} variant="outline" className="text-xs">{proj.project_name}</Badge>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Languages */}
      <Section title={t('profile.review.sections.languages')} icon={Languages} step={6} onEdit={onEdit}>
        <div className="flex flex-wrap gap-2">
          {data.languages.languages.map((lang, i) => (
            <Badge
              key={i}
              className={cn('text-xs', lang.is_native ? 'bg-primary text-primary-foreground' : 'bg-secondary')}
            >
              {lang.language}
              {lang.is_native && ` (${t('profile.counters.native')})`}
            </Badge>
          ))}
        </div>
      </Section>

      {/* Industries */}
      <Section title={t('profile.review.sections.industries')} icon={Factory} step={8} onEdit={onEdit}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('profile.review.sections.industries')}:</span>
            <span className="text-sm font-medium">{data.industries?.industries?.length || 0}</span>
          </div>
          {data.industries?.industries?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.industries.industries.map((ind, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {industriesMap[ind.industry_id] || ind.industry_id}
                  {ind.years_experience > 0 && ` (${t('profile.counters.yearsCount', { n: ind.years_experience })})`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Awards */}
      <Section title={t('profile.review.sections.awards')} icon={Award} step={9} onEdit={onEdit}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('profile.review.sections.awards')}:</span>
            <span className="text-sm font-medium">{data.awards.awards.length}</span>
          </div>
          {data.awards.awards.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.awards.awards.map((award, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {award.award_name} {award.won ? '🏆' : ''}
                </Badge>
              ))}
            </div>
          )}
          {data.awards.consulting_work && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">{t('profile.awards.consultingWork')}</span>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default ReviewStep;
