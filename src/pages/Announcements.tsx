import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CircleNotch as Loader2, Plus, PushPin, Megaphone, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  body: string;
  scope: 'company' | 'department';
  department: string | null;
  pinned: boolean;
  published_at: string;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  author_name?: string;
  read?: boolean;
}

const Announcements: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!profile?.company_id || !user) return;
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(100);

    const list = (data ?? []) as Announcement[];
    const authorIds = Array.from(new Set(list.map((a) => a.created_by)));
    const { data: profs } = authorIds.length
      ? await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', authorIds)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.user_id, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—']));

    // Reads
    const ids = list.map((a) => a.id);
    let readSet = new Set<string>();
    if (ids.length) {
      const { data: reads } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id)
        .in('announcement_id', ids);
      readSet = new Set((reads ?? []).map((r: any) => r.announcement_id));
    }

    setItems(list.map((a) => ({ ...a, author_name: nameMap.get(a.created_by), read: readSet.has(a.id) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const create = async () => {
    if (!user || !profile?.company_id || !title.trim() || !body.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('announcements').insert({
      company_id: profile.company_id,
      title: title.trim(),
      body: body.trim(),
      pinned,
      scope: 'company',
      expires_at: expiresAt || null,
      created_by: user.id,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(t('modules.announcements.posted'));
    setOpen(false);
    setTitle(''); setBody(''); setPinned(false); setExpiresAt('');
    load();
  };

  const markRead = async (id: string) => {
    if (!user) return;
    await supabase.from('announcement_reads').insert({ announcement_id: id, user_id: user.id });
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('modules.announcements.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.announcements.subtitle')}</p>
        </div>
        {isManagerOrAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('modules.announcements.create')}</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>{t('modules.announcements.create')}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>{t('common.labels.title')}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label>{t('modules.announcements.body')}</Label><Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                    {t('modules.announcements.pin')}
                  </label>
                  <div><Label>{t('modules.announcements.expiresAt')}</Label><Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></div>
                </div>
                <Button onClick={create} disabled={submitting || !title.trim() || !body.trim()} className="w-full">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.announcements.post')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('modules.announcements.noAnnouncements')}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const isOwner = a.created_by === user?.id;
            const expired = a.expires_at && parseISO(a.expires_at) < new Date();
            return (
              <article key={a.id}
                className={`border ${a.read ? 'border-border' : 'border-foreground'} p-4 space-y-2`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {a.pinned && <PushPin className="w-4 h-4 mt-1 shrink-0" weight="fill" />}
                    {!a.pinned && <Megaphone className="w-4 h-4 mt-1 shrink-0 text-muted-foreground" />}
                    <div>
                      <h2 className="font-semibold">{a.title}</h2>
                      <div className="text-xs text-muted-foreground">
                        {a.author_name} · {formatDistanceToNow(parseISO(a.published_at), { addSuffix: true })}
                        {expired && <span className="ml-2 text-destructive">({t('modules.announcements.expired')})</span>}
                      </div>
                    </div>
                  </div>
                  {(isOwner || role === 'admin') && (
                    <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash className="w-4 h-4" /></Button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-line text-foreground">{a.body}</p>
                {!a.read && !isOwner && (
                  <Button variant="outline" size="sm" onClick={() => markRead(a.id)}>{t('modules.announcements.markRead')}</Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Announcements;
