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
import {
  CircleNotch as Loader2,
  Plus,
  CheckCircle,
  FileText,
  PencilSimple,
  Archive,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PolicyRow {
  id: string;
  title: string;
  summary: string | null;
  body_md: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  effective_from: string | null;
  requires_acknowledgement: boolean;
  published_at: string | null;
  created_at: string;
}

const Policies: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const isAdmin = role === 'admin';
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [acks, setAcks] = useState<Set<string>>(new Set()); // policy_id|version
  const [coverage, setCoverage] = useState<Record<string, number>>({});
  const [companyMemberCount, setCompanyMemberCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PolicyRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    summary: '',
    body_md: '',
    effective_from: '',
    requires_acknowledgement: true,
  });

  const load = async () => {
    if (!profile?.company_id || !user) return;
    const { data: pols } = await supabase
      .from('policies')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });
    setPolicies((pols ?? []) as PolicyRow[]);

    const { data: myAcks } = await supabase
      .from('policy_acknowledgements')
      .select('policy_id, policy_version')
      .eq('user_id', user.id);
    setAcks(new Set((myAcks ?? []).map((a: any) => `${a.policy_id}|${a.policy_version}`)));

    if (isAdmin && pols && pols.length) {
      const { data: allAcks } = await supabase
        .from('policy_acknowledgements')
        .select('policy_id, user_id, policy_version')
        .in('policy_id', pols.map((p) => p.id));
      const counts: Record<string, number> = {};
      pols.forEach((p) => {
        counts[p.id] = (allAcks ?? []).filter((a: any) => a.policy_id === p.id && a.policy_version === p.version).length;
      });
      setCoverage(counts);

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id);
      setCompanyMemberCount(count ?? 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', summary: '', body_md: '', effective_from: '', requires_acknowledgement: true });
    setOpen(true);
  };
  const openEdit = (p: PolicyRow) => {
    setEditing(p);
    setForm({
      title: p.title,
      summary: p.summary ?? '',
      body_md: p.body_md,
      effective_from: p.effective_from ?? '',
      requires_acknowledgement: p.requires_acknowledgement,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!user || !profile?.company_id || !form.title.trim() || !form.body_md.trim()) return;
    setSubmitting(true);
    if (editing) {
      const { error } = await supabase
        .from('policies')
        .update({
          title: form.title.trim(),
          summary: form.summary.trim() || null,
          body_md: form.body_md,
          effective_from: form.effective_from || null,
          requires_acknowledgement: form.requires_acknowledgement,
          version: editing.version + (editing.status === 'published' ? 1 : 0),
        })
        .eq('id', editing.id);
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.from('policies').insert({
        title: form.title.trim(),
        summary: form.summary.trim() || null,
        body_md: form.body_md,
        effective_from: form.effective_from || null,
        requires_acknowledgement: form.requires_acknowledgement,
        company_id: profile.company_id,
        created_by: user.id,
      });
      if (error) toast.error(error.message);
    }
    setSubmitting(false);
    setOpen(false);
    load();
  };

  const setStatus = async (p: PolicyRow, status: 'draft' | 'published' | 'archived') => {
    const update: any = { status };
    if (status === 'published') update.published_at = new Date().toISOString();
    await supabase.from('policies').update(update).eq('id', p.id);
    load();
  };

  const acknowledge = async (p: PolicyRow) => {
    if (!user) return;
    const { error } = await supabase.from('policy_acknowledgements').insert({
      policy_id: p.id,
      user_id: user.id,
      policy_version: p.version,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(t('modules.policies.acknowledged'));
      load();
    }
  };

  const visiblePolicies = useMemo(
    () => policies.filter((p) => isAdmin || p.status === 'published'),
    [policies, isAdmin],
  );

  return (
    <div className="max-w-4xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('modules.policies.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.policies.subtitle')}</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                {t('modules.policies.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? t('modules.policies.edit') : t('modules.policies.create')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t('modules.policies.form.title')}</Label>
                  <Input
                    value={form.title}
                    maxLength={200}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('modules.policies.form.summary')}</Label>
                  <Textarea
                    rows={2}
                    maxLength={500}
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('modules.policies.form.body')}</Label>
                  <Textarea
                    rows={10}
                    value={form.body_md}
                    onChange={(e) => setForm({ ...form, body_md: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('modules.policies.form.effectiveFrom')}</Label>
                  <Input
                    type="date"
                    value={form.effective_from}
                    onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between border border-border px-3 py-2">
                  <Label htmlFor="ack">{t('modules.policies.form.requiresAcknowledgement')}</Label>
                  <Switch
                    id="ack"
                    checked={form.requires_acknowledgement}
                    onCheckedChange={(v) => setForm({ ...form, requires_acknowledgement: v })}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={submit}
                  disabled={submitting || !form.title.trim() || !form.body_md.trim()}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : visiblePolicies.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('modules.policies.noPolicies')}</p>
      ) : (
        <div className="space-y-3">
          {visiblePolicies.map((p) => {
            const ackKey = `${p.id}|${p.version}`;
            const acked = acks.has(ackKey);
            const ackCount = coverage[p.id] ?? 0;
            return (
              <article key={p.id} className="border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>v{p.version}</span>
                      <span>•</span>
                      <span>{t(`modules.policies.${p.status}` as any)}</span>
                      {p.effective_from && (
                        <>
                          <span>•</span>
                          <span>
                            {t('modules.policies.effectiveFrom')}: {format(new Date(p.effective_from), 'PP')}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-foreground mt-1">{p.title}</h2>
                    {p.summary && <p className="text-sm text-muted-foreground mt-1">{p.summary}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                        <PencilSimple className="w-4 h-4" />
                      </Button>
                      {p.status !== 'published' && (
                        <Button size="sm" variant="outline" onClick={() => setStatus(p, 'published')}>
                          {t('modules.policies.publish')}
                        </Button>
                      )}
                      {p.status === 'published' && (
                        <Button size="sm" variant="outline" onClick={() => setStatus(p, 'archived')}>
                          <Archive className="w-4 h-4 mr-1" />
                          {t('modules.policies.archive')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <pre className="text-sm whitespace-pre-wrap font-sans text-foreground border-t border-border pt-3">
                  {p.body_md}
                </pre>

                {isAdmin && p.status === 'published' && companyMemberCount > 0 && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-3">
                    {t('modules.policies.coverage')}: {ackCount} / {companyMemberCount} (
                    {Math.round((ackCount / companyMemberCount) * 100)}%)
                  </div>
                )}

                {!isAdmin && p.status === 'published' && p.requires_acknowledgement && (
                  <div className="border-t border-border pt-3 flex items-center gap-2">
                    {acked ? (
                      <span className="inline-flex items-center gap-1 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4" weight="duotone" />
                        {t('modules.policies.acknowledged')}
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => acknowledge(p)}>
                        {t('modules.policies.acknowledge')}
                      </Button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Policies;
