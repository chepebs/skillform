import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleNotch as Loader2 } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface Colleague {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
}

/**
 * Editable HR fields card (birth date, start date, manager).
 * - Used inside profile edit screens.
 * - The user can edit their own; admins can edit anyone.
 */
export const HRFieldsCard: React.FC<{ targetUserId?: string }> = ({ targetUserId }) => {
  const { t } = useTranslation();
  const { user, profile, role, refreshProfile } = useAuth();
  const userId = targetUserId ?? user?.id;
  const isSelf = userId === user?.id;
  const canEdit = isSelf || role === 'admin';

  const [birthDate, setBirthDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [managerId, setManagerId] = useState<string>('');
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId || !profile?.company_id) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('birth_date, start_date, manager_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) {
        setBirthDate(data.birth_date ?? '');
        setStartDate(data.start_date ?? '');
        setManagerId(data.manager_id ?? '');
      }
      const { data: cols } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .eq('company_id', profile.company_id)
        .neq('user_id', userId)
        .order('first_name');
      setColleagues(cols ?? []);
      setLoading(false);
    })();
  }, [userId, profile?.company_id]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        birth_date: birthDate || null,
        start_date: startDate || null,
        manager_id: managerId || null,
      })
      .eq('user_id', userId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('modules.hrFields.saved'));
      if (isSelf) refreshProfile();
    }
  };

  return (
    <section className="border border-border p-5 space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">{t('modules.hrFields.title')}</h2>
        <p className="text-xs text-muted-foreground mt-1">{t('modules.hrFields.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>{t('modules.hrFields.birthDate')}</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('modules.hrFields.startDate')}</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('modules.hrFields.manager')}</Label>
            <Select value={managerId || 'none'} onValueChange={(v) => setManagerId(v === 'none' ? '' : v)} disabled={!canEdit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('modules.hrFields.noManager')}</SelectItem>
                {colleagues.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {`${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.user_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.hrFields.save')}
          </Button>
        </div>
      )}
    </section>
  );
};
