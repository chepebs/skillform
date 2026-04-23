import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash as Trash2, CircleNotch as Loader2 } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ServiceSkill {
  id: string;
  skill_name: string;
  importance_level: string | null;
  min_proficiency: number | null;
}

interface Props {
  serviceId: string;
  canEdit: boolean;
  onUpdate?: () => void;
}

const ServiceSkillsManager: React.FC<Props> = ({ serviceId, canEdit, onUpdate }) => {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<ServiceSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState({ skill_name: '', importance_level: 'preferred', min_proficiency: '60' });

  useEffect(() => {
    loadSkills();
    loadAvailableSkills();
  }, [serviceId]);

  const loadSkills = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('service_skills')
      .select('*')
      .eq('service_id', serviceId)
      .order('created_at');
    setSkills(data || []);
    setLoading(false);
  };

  const loadAvailableSkills = async () => {
    const { data } = await supabase
      .from('employee_skills')
      .select('skill_name');
    const unique = [...new Set(data?.map(s => s.skill_name) || [])].sort();
    setAvailableSkills(unique);
  };

  const handleAdd = async () => {
    if (!newSkill.skill_name) return;
    const { error } = await supabase.from('service_skills').insert({
      service_id: serviceId,
      skill_name: newSkill.skill_name,
      importance_level: newSkill.importance_level,
      min_proficiency: parseInt(newSkill.min_proficiency) || 60,
    });
    if (error) {
      toast.error(t('services.skills.addFailed'));
      return;
    }
    toast.success(t('services.skills.added'));
    setIsAdding(false);
    setNewSkill({ skill_name: '', importance_level: 'preferred', min_proficiency: '60' });
    loadSkills();
    onUpdate?.();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('service_skills').delete().eq('id', id);
    if (error) {
      toast.error(t('services.skills.deleteFailed'));
      return;
    }
    toast.success(t('services.skills.deleted'));
    loadSkills();
    onUpdate?.();
  };

  const importanceBadgeVariant = (level: string | null) => {
    if (level === 'required') return 'destructive' as const;
    if (level === 'preferred') return 'default' as const;
    return 'secondary' as const;
  };

  if (loading) {
    return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('services.skills.required')}</h3>
        {canEdit && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" /> {t('services.skills.add')}
          </Button>
        )}
      </div>

      {skills.length > 0 ? (
        <div className="space-y-2">
          {skills.map(skill => (
            <div key={skill.id} className="flex items-center justify-between border border-border p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{skill.skill_name}</span>
                <Badge variant={importanceBadgeVariant(skill.importance_level)}>
                  {t(`services.skills.importance.${skill.importance_level || 'preferred'}`)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Min: {skill.min_proficiency ?? 60}%
                </span>
              </div>
              {canEdit && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('services.skills.noSkills')}</p>
      )}

      {isAdding && (
        <div className="border border-border p-4 space-y-3">
          <div>
            <label className="text-sm font-medium">{t('services.skills.selectSkill')}</label>
            <Select value={newSkill.skill_name} onValueChange={v => setNewSkill({ ...newSkill, skill_name: v })}>
              <SelectTrigger><SelectValue placeholder={t('services.form.selectPlaceholder')} /></SelectTrigger>
              <SelectContent>
                {availableSkills.filter(s => !skills.find(sk => sk.skill_name === s)).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t('services.skills.importanceLabel')}</label>
              <Select value={newSkill.importance_level} onValueChange={v => setNewSkill({ ...newSkill, importance_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">{t('services.skills.importance.required')}</SelectItem>
                  <SelectItem value="preferred">{t('services.skills.importance.preferred')}</SelectItem>
                  <SelectItem value="nice-to-have">{t('services.skills.importance.nice-to-have')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t('services.skills.minProficiency')}</label>
              <Input
                type="number" min="0" max="100"
                value={newSkill.min_proficiency}
                onChange={e => setNewSkill({ ...newSkill, min_proficiency: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              {t('common.buttons.cancel')}
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!newSkill.skill_name}>
              <Plus className="h-4 w-4" /> {t('services.skills.add')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSkillsManager;
