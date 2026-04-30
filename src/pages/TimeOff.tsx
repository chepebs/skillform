import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleNotch as Loader2, Plus, Check, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';

interface Policy {
  id: string;
  name: string;
  type: string;
  annual_allowance_days: number;
  is_paid: boolean;
  color: string | null;
}

interface Balance {
  id: string;
  policy_id: string;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
}

interface Request {
  id: string;
  user_id: string;
  policy_id: string;
  start_date: string;
  end_date: string;
  day_count: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  decision_notes: string | null;
  created_at: string;
  user_name?: string;
}

const TimeOff: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const isAdmin = role === 'admin';
  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [teamRequests, setTeamRequests] = useState<Request[]>([]);

  // Request dialog
  const [open, setOpen] = useState(false);
  const [policyId, setPolicyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Policy dialog (admin)
  const [policyOpen, setPolicyOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pType, setPType] = useState('vacation');
  const [pDays, setPDays] = useState('20');
  const [pPaid, setPPaid] = useState(true);

  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const days = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
    return days > 0 ? days : 0;
  }, [startDate, endDate]);

  const load = async () => {
    if (!profile?.company_id || !user) return;
    setLoading(true);

    const [{ data: pols }, { data: bals }, { data: mine }] = await Promise.all([
      supabase.from('time_off_policies').select('*').eq('company_id', profile.company_id).eq('is_active', true).order('name'),
      supabase.from('time_off_balances').select('*').eq('user_id', user.id).eq('year', new Date().getFullYear()),
      supabase.from('time_off_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);

    setPolicies((pols ?? []) as Policy[]);
    setBalances((bals ?? []) as Balance[]);
    setMyRequests((mine ?? []) as Request[]);

    if (isManagerOrAdmin) {
      // Get team requests (RLS filters appropriately for managers / admins)
      const { data: team } = await supabase
        .from('time_off_requests')
        .select('*')
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      const userIds = Array.from(new Set((team ?? []).map((r) => r.user_id)));
      const { data: profs } = userIds.length
        ? await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', userIds)
        : { data: [] as any[] };
      const map = new Map((profs ?? []).map((p: any) => [p.user_id, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()]));
      setTeamRequests(((team ?? []) as Request[]).map((r) => ({ ...r, user_name: map.get(r.user_id) || '—' })));
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const submitRequest = async () => {
    if (!user || !profile?.company_id || !policyId || !startDate || !endDate || dayCount <= 0) return;
    setSubmitting(true);
    const { error } = await supabase.from('time_off_requests').insert({
      user_id: user.id,
      company_id: profile.company_id,
      policy_id: policyId,
      start_date: startDate,
      end_date: endDate,
      day_count: dayCount,
      reason: reason.trim() || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(t('modules.timeOff.requestCreated'));
    setOpen(false);
    setPolicyId(''); setStartDate(''); setEndDate(''); setReason('');
    load();
  };

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    const { error } = await supabase
      .from('time_off_requests')
      .update({ status, approver_id: user.id, decision_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(t(`modules.timeOff.${status}`));
    load();
  };

  const cancel = async (id: string) => {
    const { error } = await supabase.from('time_off_requests').update({ status: 'cancelled' }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const createPolicy = async () => {
    if (!user || !profile?.company_id || !pName.trim()) return;
    const { error } = await supabase.from('time_off_policies').insert({
      company_id: profile.company_id,
      name: pName.trim(),
      type: pType,
      annual_allowance_days: Number(pDays) || 0,
      is_paid: pPaid,
      created_by: user.id,
    });
    if (error) return toast.error(error.message);
    toast.success(t('modules.timeOff.policyCreated'));
    setPolicyOpen(false);
    setPName(''); setPType('vacation'); setPDays('20'); setPPaid(true);
    load();
  };

  const policyName = (id: string) => policies.find((p) => p.id === id)?.name ?? '—';

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('modules.timeOff.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.timeOff.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="w-4 h-4 mr-2" />{t('modules.timeOff.newPolicy')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('modules.timeOff.newPolicy')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>{t('modules.timeOff.policyName')}</Label><Input value={pName} onChange={(e) => setPName(e.target.value)} /></div>
                  <div><Label>{t('modules.timeOff.type')}</Label>
                    <Select value={pType} onValueChange={setPType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['vacation', 'sick', 'personal', 'unpaid', 'other'].map((v) => (
                          <SelectItem key={v} value={v}>{t(`modules.timeOff.types.${v}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t('modules.timeOff.annualDays')}</Label><Input type="number" value={pDays} onChange={(e) => setPDays(e.target.value)} /></div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pPaid} onChange={(e) => setPPaid(e.target.checked)} />{t('modules.timeOff.paid')}</label>
                  <Button onClick={createPolicy} className="w-full">{t('common.actions.create')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />{t('modules.timeOff.requestTimeOff')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('modules.timeOff.requestTimeOff')}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>{t('modules.timeOff.policy')}</Label>
                  <Select value={policyId} onValueChange={setPolicyId}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {policies.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{t('common.labels.startDate')}</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                  <div><Label>{t('common.labels.endDate')}</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                </div>
                {dayCount > 0 && <p className="text-sm text-muted-foreground">{t('modules.timeOff.totalDays')}: <strong className="text-foreground">{dayCount}</strong></p>}
                <div><Label>{t('modules.timeOff.reason')}</Label><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
                <Button onClick={submitRequest} disabled={submitting || !policyId || dayCount <= 0} className="w-full">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.timeOff.submit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : (
        <>
          {/* Balances */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {policies.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">{t('modules.timeOff.noPolicies')}</p>
            ) : (
              policies.map((p) => {
                const b = balances.find((x) => x.policy_id === p.id);
                const allocated = b?.allocated_days ?? p.annual_allowance_days;
                const used = b?.used_days ?? 0;
                const pending = b?.pending_days ?? 0;
                const remaining = Math.max(allocated - used - pending, 0);
                return (
                  <div key={p.id} className="border border-border p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{t(`modules.timeOff.types.${p.type}`, { defaultValue: p.type })}</div>
                    <div className="font-semibold mt-1">{p.name}</div>
                    <div className="mt-3 text-3xl font-bold">{remaining}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('modules.timeOff.daysAvailable')}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {t('modules.timeOff.used')}: {used} · {t('modules.timeOff.pending')}: {pending} · {t('modules.timeOff.allocated')}: {allocated}
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <Tabs defaultValue="mine">
            <TabsList>
              <TabsTrigger value="mine">{t('modules.timeOff.myRequests')}</TabsTrigger>
              {isManagerOrAdmin && <TabsTrigger value="team">{t('modules.timeOff.teamRequests')}</TabsTrigger>}
            </TabsList>

            <TabsContent value="mine" className="space-y-2 mt-4">
              {myRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('modules.timeOff.noRequests')}</p>
              ) : myRequests.map((r) => (
                <div key={r.id} className="border border-border p-3 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm font-semibold">{policyName(r.policy_id)}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(r.start_date), 'MMM d')} – {format(parseISO(r.end_date), 'MMM d, yyyy')} · {r.day_count} {t('modules.timeOff.days')}
                    </div>
                  </div>
                  <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 border ${
                    r.status === 'approved' ? 'border-foreground bg-foreground text-background' :
                    r.status === 'rejected' ? 'border-destructive text-destructive' :
                    r.status === 'cancelled' ? 'border-muted-foreground text-muted-foreground' :
                    'border-foreground'
                  }`}>{t(`common.status.${r.status}`, { defaultValue: r.status })}</span>
                  {r.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => cancel(r.id)}>{t('common.actions.cancel')}</Button>}
                </div>
              ))}
            </TabsContent>

            {isManagerOrAdmin && (
              <TabsContent value="team" className="space-y-2 mt-4">
                {teamRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('modules.timeOff.noRequests')}</p>
                ) : teamRequests.map((r) => (
                  <div key={r.id} className="border border-border p-3 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-sm font-semibold">{r.user_name} — {policyName(r.policy_id)}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(r.start_date), 'MMM d')} – {format(parseISO(r.end_date), 'MMM d, yyyy')} · {r.day_count} {t('modules.timeOff.days')}
                      </div>
                      {r.reason && <div className="text-xs text-muted-foreground mt-1">{r.reason}</div>}
                    </div>
                    <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 border ${
                      r.status === 'approved' ? 'border-foreground bg-foreground text-background' :
                      r.status === 'rejected' ? 'border-destructive text-destructive' :
                      r.status === 'cancelled' ? 'border-muted-foreground text-muted-foreground' :
                      'border-foreground'
                    }`}>{t(`common.status.${r.status}`, { defaultValue: r.status })}</span>
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => decide(r.id, 'approved')}><Check className="w-4 h-4 mr-1" />{t('modules.timeOff.approve')}</Button>
                        <Button size="sm" variant="outline" onClick={() => decide(r.id, 'rejected')}><X className="w-4 h-4 mr-1" />{t('modules.timeOff.reject')}</Button>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default TimeOff;
