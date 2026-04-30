import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Heart, CircleNotch as Loader2, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface KudoRow {
  id: string;
  message: string;
  value_tag: string | null;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  from_profile?: { first_name: string | null; last_name: string | null; avatar_url: string | null };
  to_profile?: { first_name: string | null; last_name: string | null; avatar_url: string | null };
}

interface ColleagueOption {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
}

const VALUE_TAGS = ['teamwork', 'innovation', 'leadership', 'excellence', 'impact', 'ownership'] as const;

const Avatar: React.FC<{ url?: string | null; name: string }> = ({ url, name }) =>
  url ? (
    <img src={url} alt={name} className="w-10 h-10 object-cover" />
  ) : (
    <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center text-sm font-semibold">
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );

const Kudos: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [items, setItems] = useState<KudoRow[]>([]);
  const [colleagues, setColleagues] = useState<ColleagueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [toUserId, setToUserId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [valueTag, setValueTag] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!profile?.company_id) return;
    const { data: kudos } = await supabase
      .from('kudos')
      .select('id, message, value_tag, created_at, from_user_id, to_user_id')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .limit(100);

    const userIds = Array.from(new Set((kudos ?? []).flatMap((k) => [k.from_user_id, k.to_user_id])));
    const { data: profiles } = userIds.length
      ? await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', userIds)
      : { data: [] as any[] };

    const profMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    setItems(
      (kudos ?? []).map((k) => ({
        ...k,
        from_profile: profMap.get(k.from_user_id),
        to_profile: profMap.get(k.to_user_id),
      })),
    );
  };

  useEffect(() => {
    (async () => {
      if (!profile?.company_id || !user) return;
      await load();
      const { data: cols } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .eq('company_id', profile.company_id)
        .neq('user_id', user.id)
        .order('first_name');
      setColleagues(cols ?? []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const submit = async () => {
    if (!user || !profile?.company_id || !toUserId || !message.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('kudos').insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      message: message.trim(),
      value_tag: valueTag || null,
      visibility: 'public',
      company_id: profile.company_id,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('modules.kudos.send'));
    setOpen(false);
    setToUserId('');
    setMessage('');
    setValueTag('');
    load();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('modules.kudos.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.kudos.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('modules.kudos.give')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('modules.kudos.give')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('modules.kudos.giveTo')}</Label>
                <Select value={toUserId} onValueChange={setToUserId}>
                  <SelectTrigger><SelectValue placeholder={t('modules.kudos.selectColleague')} /></SelectTrigger>
                  <SelectContent>
                    {colleagues.map((c) => (
                      <SelectItem key={c.user_id} value={c.user_id}>
                        {`${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.user_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('modules.kudos.valueTag')}</Label>
                <Select value={valueTag} onValueChange={setValueTag}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {VALUE_TAGS.map((v) => (
                      <SelectItem key={v} value={v}>{t(`modules.kudos.values.${v}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('modules.kudos.message')}</Label>
                <Textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('modules.kudos.messagePlaceholder')}
                />
              </div>
              <Button onClick={submit} disabled={submitting || !toUserId || !message.trim()} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.kudos.send')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('modules.kudos.noKudos')}</p>
      ) : (
        <div className="space-y-3">
          {items.map((k) => {
            const fromName = `${k.from_profile?.first_name ?? ''} ${k.from_profile?.last_name ?? ''}`.trim() || '—';
            const toName = `${k.to_profile?.first_name ?? ''} ${k.to_profile?.last_name ?? ''}`.trim() || '—';
            return (
              <article key={k.id} className="border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar url={k.from_profile?.avatar_url} name={fromName} />
                  <div className="text-xs text-muted-foreground">
                    <Link to={`/profile/${k.from_user_id}`} className="font-semibold text-foreground hover:underline">{fromName}</Link>
                    <span> → </span>
                    <Link to={`/profile/${k.to_user_id}`} className="font-semibold text-foreground hover:underline">{toName}</Link>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(k.created_at), { addSuffix: true })}
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{k.message}</p>
                {k.value_tag && (
                  <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide border border-foreground px-2 py-0.5">
                    <Heart className="w-3 h-3" weight="duotone" />
                    {t(`modules.kudos.values.${k.value_tag}` as any, { defaultValue: k.value_tag })}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Kudos;
