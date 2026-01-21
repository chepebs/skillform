import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, User, Briefcase, GraduationCap, BarChart3, FolderOpen, Languages, Award, Factory } from 'lucide-react';
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
}> = ({ title, icon: Icon, step, onEdit, children }) => (
  <div className="p-4 rounded-lg border border-dark-border bg-dark-elevated/50">
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
        Edit
      </Button>
    </div>
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className="text-foreground text-sm font-medium">{value || '-'}</span>
  </div>
);

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onEdit }) => {
  const [industriesMap, setIndustriesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadIndustries = async () => {
      const { data: industries } = await supabase.from('industries').select('id, name');
      if (industries) {
        const map: Record<string, string> = {};
        industries.forEach(i => { map[i.id] = i.name; });
        setIndustriesMap(map);
      }
    };
    loadIndustries();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Review Your Profile</h2>
        <p className="text-muted-foreground">Please review your information before submitting</p>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information" icon={User} step={1} onEdit={onEdit}>
        <div className="space-y-1">
          <InfoRow label="Name" value={`${data.basicInfo.first_name} ${data.basicInfo.last_name}`} />
          <InfoRow label="Email" value={data.basicInfo.email} />
          <InfoRow label="Phone" value={data.basicInfo.phone} />
          {data.basicInfo.avatar_url && (
            <div className="flex items-center gap-2 pt-2">
              <img src={data.basicInfo.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
              <span className="text-sm text-green-500">Photo uploaded</span>
            </div>
          )}
        </div>
      </Section>

      {/* Professional Info */}
      <Section title="Professional Information" icon={Briefcase} step={2} onEdit={onEdit}>
        <div className="space-y-1">
          <InfoRow label="Current Position" value={data.professionalInfo.current_position} />
          {data.professionalInfo.previous_positions.length > 0 && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">Previous Positions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.professionalInfo.previous_positions.map((pos, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {pos.position_title} at {pos.company}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Education */}
      <Section title="Education & Experience" icon={GraduationCap} step={3} onEdit={onEdit}>
        <div className="space-y-1">
          <InfoRow label="Academic Degree" value={data.education.academic_degree} />
          <InfoRow label="Years of Experience" value={data.education.years_of_experience} />
          {data.education.previous_agencies.length > 0 && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">Previous Agencies: {data.education.previous_agencies.length}</span>
            </div>
          )}
        </div>
      </Section>

      {/* Performance */}
      <Section title="Performance Metrics" icon={BarChart3} step={4} onEdit={onEdit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <InfoRow label="Pitches Won" value={data.performance.pitches_won} />
            <InfoRow label="Pitches Participated" value={data.performance.pitches_participated} />
          </div>
          <div className="space-y-1">
            <InfoRow label="Effie Won" value={data.performance.effie_awards_won} />
            <InfoRow label="Effie Participated" value={data.performance.effie_awards_participated} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <InfoRow label="Brand Creations" value={data.performance.brand_creations} />
          <InfoRow label="Brand Refreshes" value={data.performance.brand_refreshes} />
        </div>
      </Section>

      {/* Brands & Projects */}
      <Section title="Brands & Projects" icon={FolderOpen} step={5} onEdit={onEdit}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Brands Managed:</span>
            <span className="text-sm font-medium">{data.brandsProjects.brands_managed.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Recent Projects:</span>
            <span className="text-sm font-medium">{data.brandsProjects.recent_projects.length}</span>
          </div>
          {data.brandsProjects.recent_projects.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {data.brandsProjects.recent_projects.map((proj, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {proj.project_name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Languages */}
      <Section title="Languages" icon={Languages} step={6} onEdit={onEdit}>
        <div className="flex flex-wrap gap-2">
          {data.languages.languages.map((lang, i) => (
            <Badge
              key={i}
              className={cn(
                'text-xs',
                lang.is_native ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              )}
            >
              {lang.language}
              {lang.is_native && ' (Native)'}
            </Badge>
          ))}
        </div>
      </Section>

      {/* Industries */}
      <Section title="Industries" icon={Factory} step={8} onEdit={onEdit}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Industries:</span>
            <span className="text-sm font-medium">{data.industries?.industries?.length || 0}</span>
          </div>
          {data.industries?.industries?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.industries.industries.map((ind, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {industriesMap[ind.industry_id] || ind.industry_id}
                  {ind.years_experience > 0 && ` (${ind.years_experience}y)`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Awards */}
      <Section title="Awards & Recognition" icon={Award} step={9} onEdit={onEdit}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Awards:</span>
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
              <span className="text-sm text-muted-foreground">Consulting work added</span>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default ReviewStep;
