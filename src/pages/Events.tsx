import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarBlank, MapPin, Video, CircleNotch as Loader2, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  is_virtual: boolean;
  meeting_url: string | null;
  cover_image_url: string | null;
  created_by: string;
  rsvp?: 'going' | 'maybe' | 'declined' | null;
  attending_count?: number;
}

const Events: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const canCreate = role === 'manager' || role === 'admin';
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    starts_at: '',
    ends_at: '',
    location: '',
    is_virtual: false,
    meeting_url: '',
  });

  const load = async () => {
    if (!profile?.company_id || !user) return;
    const { data: evs } = await supabase
      .from('events')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('starts_at', { ascending: true });

    const ids = (evs ?? []).map((e) => e.id);
    const { data: rsvps } = ids.length
      ? await supabase.from('event_rsvps').select('event_id, user_id, status').in('event_id', ids)
      : { data: [] as any[] };

    const myRsvp = new Map<string, 'going' | 'maybe' | 'declined'>();
    const counts = new Map<string, number>();
    (rsvps ?? []).forEach((r: any) => {
      if (r.user_id === user.id) myRsvp.set(r.event_id, r.status);
      if (r.status === 'going') counts.set(r.event_id, (counts.get(r.event_id) ?? 0) + 1);
    });

    setEvents(
      (evs ?? []).map((e) => ({
        ...e,
        rsvp: myRsvp.get(e.id) ?? null,
        attending_count: counts.get(e.id) ?? 0,
      })) as EventRow[],
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const submit = async () => {
    if (!user || !profile?.company_id || !form.title || !form.starts_at) return;
    setSubmitting(true);
    const { error } = await supabase.from('events').insert({
      title: form.title,
      description: form.description || null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      location: form.location || null,
      is_virtual: form.is_virtual,
      meeting_url: form.is_virtual ? form.meeting_url || null : null,
      created_by: user.id,
      company_id: profile.company_id,
      visibility: 'company',
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('modules.events.create'));
    setOpen(false);
    setForm({ title: '', description: '', starts_at: '', ends_at: '', location: '', is_virtual: false, meeting_url: '' });
    load();
  };

  const setRsvp = async (eventId: string, status: 'going' | 'maybe' | 'declined') => {
    if (!user) return;
    await supabase
      .from('event_rsvps')
      .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: 'event_id,user_id' });
    load();
  };

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: events.filter((e) => new Date(e.starts_at).getTime() >= now),
      past: events.filter((e) => new Date(e.starts_at).getTime() < now).reverse(),
    };
  }, [events]);

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('modules.events.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.events.subtitle')}</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('modules.events.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('modules.events.create')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t('modules.events.form.eventTitle')}</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('modules.events.form.description')}</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('modules.events.form.startsAt')}</Label>
                    <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('modules.events.form.endsAt')}</Label>
                    <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center justify-between border border-border px-3 py-2">
                  <Label htmlFor="virtual">{t('modules.events.form.isVirtual')}</Label>
                  <Switch id="virtual" checked={form.is_virtual} onCheckedChange={(v) => setForm({ ...form, is_virtual: v })} />
                </div>
                {form.is_virtual ? (
                  <div className="space-y-1.5">
                    <Label>{t('modules.events.form.meetingUrl')}</Label>
                    <Input type="url" value={form.meeting_url} onChange={(e) => setForm({ ...form, meeting_url: e.target.value })} />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label>{t('modules.events.form.location')}</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                )}
                <Button className="w-full" onClick={submit} disabled={submitting || !form.title || !form.starts_at}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.events.create')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : (
        <>
          <Section title={t('modules.events.upcoming')} events={upcoming} setRsvp={setRsvp} />
          <Section title={t('modules.events.past')} events={past} setRsvp={setRsvp} readOnly />
          {events.length === 0 && <p className="text-sm text-muted-foreground">{t('modules.events.noEvents')}</p>}
        </>
      )}
    </div>
  );
};

const Section: React.FC<{
  title: string;
  events: EventRow[];
  setRsvp: (id: string, s: 'going' | 'maybe' | 'declined') => void;
  readOnly?: boolean;
}> = ({ title, events, setRsvp, readOnly }) => {
  const { t } = useTranslation();
  if (events.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{title}</h2>
      <div className="space-y-3">
        {events.map((e) => (
          <article key={e.id} className="border border-border p-4 flex flex-col gap-3 md:flex-row md:items-start">
            <div className="md:w-32 shrink-0">
              <div className="text-xs uppercase text-muted-foreground">{format(new Date(e.starts_at), 'MMM')}</div>
              <div className="text-3xl font-bold text-foreground leading-none">{format(new Date(e.starts_at), 'd')}</div>
              <div className="text-xs text-muted-foreground mt-1">{format(new Date(e.starts_at), 'HH:mm')}</div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="text-base font-semibold text-foreground">{e.title}</h3>
              {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarBlank className="w-3 h-3" /> {format(new Date(e.starts_at), 'PPp')}</span>
                {e.is_virtual && e.meeting_url && (
                  <a href={e.meeting_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                    <Video className="w-3 h-3" /> {e.meeting_url}
                  </a>
                )}
                {!e.is_virtual && e.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</span>
                )}
                <span>{t('modules.events.rsvp.attending', { count: e.attending_count ?? 0 })}</span>
              </div>
              {!readOnly && (
                <div className="flex gap-2 pt-1">
                  {(['going', 'maybe', 'declined'] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={e.rsvp === s ? 'default' : 'outline'}
                      onClick={() => setRsvp(e.id, s)}
                    >
                      {t(`modules.events.rsvp.${s}`)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Events;
