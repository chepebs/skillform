import React, { useEffect, useState } from 'react';
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
import { CircleNotch as Loader2, Plus, Check, X, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface Template {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}
interface TemplateTask {
  id: string;
  template_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  default_due_offset_days: number;
}
interface Assignment {
  id: string;
  user_id: string;
  template_id: string | null;
  started_at: string;
  due_at: string | null;
  status: string;
  user_name?: string;
  template_name?: string;
}
interface Task {
  id: string;
  assignment_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  status: 'pending' | 'completed' | 'skipped';
  sort_order: number;
}

const Onboarding: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const isAdmin = role === 'admin';
  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateTasks, setTemplateTasks] = useState<TemplateTask[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  // Template dialog
  const [tplOpen, setTplOpen] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplItems, setTplItems] = useState<{ title: string; offset: number }[]>([{ title: '', offset: 7 }]);

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignTplId, setAssignTplId] = useState('');
  const [colleagues, setColleagues] = useState<Array<{ user_id: string; name: string }>>([]);

  const load = async () => {
    if (!profile?.company_id || !user) return;
    setLoading(true);

    const [{ data: tpls }, { data: tplTasks }, { data: mine }] = await Promise.all([
      supabase.from('onboarding_templates').select('*').eq('company_id', profile.company_id),
      supabase.from('onboarding_template_tasks').select('*').order('sort_order'),
      supabase.from('onboarding_assignments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);

    setTemplates((tpls ?? []) as Template[]);
    setTemplateTasks((tplTasks ?? []) as TemplateTask[]);
    setMyAssignments((mine ?? []) as Assignment[]);

    if (isManagerOrAdmin) {
      const { data: team } = await supabase
        .from('onboarding_assignments')
        .select('*')
        .neq('user_id', user.id)
        .order('created_at', { ascending: false });
      const userIds = Array.from(new Set((team ?? []).map((a: any) => a.user_id)));
      const { data: profs } = userIds.length
        ? await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', userIds)
        : { data: [] as any[] };
      const nameMap = new Map((profs ?? []).map((p: any) => [p.user_id, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()]));
      const tplMap = new Map((tpls ?? []).map((t: any) => [t.id, t.name]));
      setTeamAssignments(((team ?? []) as Assignment[]).map((a) => ({
        ...a,
        user_name: nameMap.get(a.user_id) ?? '—',
        template_name: a.template_id ? tplMap.get(a.template_id) : undefined,
      })));

      const { data: cols } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .eq('company_id', profile.company_id);
      setColleagues((cols ?? []).map((c: any) => ({ user_id: c.user_id, name: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.user_id })));
    }

    // Tasks for assignments visible to me
    const allAssignmentIds = [...(mine ?? []), ...(isManagerOrAdmin ? [] : [])].map((a: any) => a.id);
    const teamIds = isManagerOrAdmin ? (await supabase.from('onboarding_assignments').select('id').neq('user_id', user.id)).data?.map((a: any) => a.id) ?? [] : [];
    const allIds = [...allAssignmentIds, ...teamIds];
    if (allIds.length) {
      const { data: ts } = await supabase.from('onboarding_tasks').select('*').in('assignment_id', allIds).order('sort_order');
      const grouped: Record<string, Task[]> = {};
      (ts ?? []).forEach((task: any) => {
        if (!grouped[task.assignment_id]) grouped[task.assignment_id] = [];
        grouped[task.assignment_id].push(task);
      });
      setTasks(grouped);
    } else {
      setTasks({});
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const createTemplate = async () => {
    if (!user || !profile?.company_id || !tplName.trim()) return;
    const { data: created, error } = await supabase
      .from('onboarding_templates')
      .insert({ company_id: profile.company_id, name: tplName.trim(), description: tplDesc.trim() || null, created_by: user.id })
      .select()
      .single();
    if (error || !created) return toast.error(error?.message ?? 'Error');
    const items = tplItems.filter((i) => i.title.trim()).map((i, idx) => ({
      template_id: created.id,
      title: i.title.trim(),
      sort_order: idx,
      default_due_offset_days: Number(i.offset) || 7,
    }));
    if (items.length) await supabase.from('onboarding_template_tasks').insert(items);
    toast.success(t('modules.onboarding.templateCreated'));
    setTplOpen(false);
    setTplName(''); setTplDesc(''); setTplItems([{ title: '', offset: 7 }]);
    load();
  };

  const assign = async () => {
    if (!user || !profile?.company_id || !assignUserId || !assignTplId) return;
    const tplItemsList = templateTasks.filter((t) => t.template_id === assignTplId);
    const startedAt = new Date();
    const { data: assigned, error } = await supabase
      .from('onboarding_assignments')
      .insert({
        company_id: profile.company_id,
        user_id: assignUserId,
        template_id: assignTplId,
        created_by: user.id,
        started_at: startedAt.toISOString(),
        status: 'in_progress',
      })
      .select()
      .single();
    if (error || !assigned) return toast.error(error?.message ?? 'Error');
    if (tplItemsList.length) {
      await supabase.from('onboarding_tasks').insert(tplItemsList.map((it) => ({
        assignment_id: assigned.id,
        title: it.title,
        description: it.description,
        sort_order: it.sort_order,
        due_at: new Date(startedAt.getTime() + (it.default_due_offset_days || 0) * 86400000).toISOString(),
        status: 'pending',
      })));
    }
    toast.success(t('modules.onboarding.assigned'));
    setAssignOpen(false);
    setAssignUserId(''); setAssignTplId('');
    load();
  };

  const completeTask = async (id: string) => {
    const { error } = await supabase
      .from('onboarding_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const renderAssignment = (a: Assignment) => {
    const ts = tasks[a.id] ?? [];
    const done = ts.filter((x) => x.status === 'completed').length;
    return (
      <div key={a.id} className="border border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-semibold">{a.user_name ? `${a.user_name} — ` : ''}{a.template_name ?? t('modules.onboarding.customPlan')}</div>
            <div className="text-xs text-muted-foreground">
              {t('modules.onboarding.started')}: {format(parseISO(a.started_at), 'MMM d, yyyy')} · {done}/{ts.length} {t('modules.onboarding.completed')}
            </div>
          </div>
          <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 border border-foreground">
            {t(`modules.onboarding.statuses.${a.status}`, { defaultValue: a.status })}
          </span>
        </div>
        {ts.length > 0 && (
          <ul className="space-y-1.5 pt-2 border-t border-border">
            {ts.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => task.status !== 'completed' && completeTask(task.id)}
                  className={`w-5 h-5 border flex items-center justify-center shrink-0 ${
                    task.status === 'completed' ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'
                  }`}
                  aria-label="toggle"
                >
                  {task.status === 'completed' && <Check className="w-3 h-3" />}
                </button>
                <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
                {task.due_at && <span className="ml-auto text-xs text-muted-foreground">{format(parseISO(task.due_at), 'MMM d')}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('modules.onboarding.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.onboarding.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Dialog open={tplOpen} onOpenChange={setTplOpen}>
              <DialogTrigger asChild><Button variant="outline"><Plus className="w-4 h-4 mr-2" />{t('modules.onboarding.newTemplate')}</Button></DialogTrigger>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{t('modules.onboarding.newTemplate')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>{t('modules.onboarding.templateName')}</Label><Input value={tplName} onChange={(e) => setTplName(e.target.value)} /></div>
                  <div><Label>{t('common.labels.description')}</Label><Textarea rows={2} value={tplDesc} onChange={(e) => setTplDesc(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>{t('modules.onboarding.tasks')}</Label>
                    {tplItems.map((it, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input className="flex-1" placeholder={t('modules.onboarding.taskTitle')} value={it.title} onChange={(e) => { const v = [...tplItems]; v[idx].title = e.target.value; setTplItems(v); }} />
                        <Input type="number" className="w-24" value={it.offset} onChange={(e) => { const v = [...tplItems]; v[idx].offset = Number(e.target.value); setTplItems(v); }} />
                        <Button variant="ghost" size="icon" onClick={() => setTplItems(tplItems.filter((_, i) => i !== idx))}><Trash className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setTplItems([...tplItems, { title: '', offset: 7 }])}><Plus className="w-3 h-3 mr-1" />{t('modules.onboarding.addTask')}</Button>
                  </div>
                  <Button onClick={createTemplate} className="w-full" disabled={!tplName.trim()}>{t('common.actions.create')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {isManagerOrAdmin && templates.length > 0 && (
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('modules.onboarding.assign')}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('modules.onboarding.assign')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>{t('modules.onboarding.employee')}</Label>
                    <Select value={assignUserId} onValueChange={setAssignUserId}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{colleagues.map((c) => <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t('modules.onboarding.template')}</Label>
                    <Select value={assignTplId} onValueChange={setAssignTplId}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button onClick={assign} className="w-full" disabled={!assignUserId || !assignTplId}>{t('modules.onboarding.assign')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : (
        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">{t('modules.onboarding.myOnboarding')}</TabsTrigger>
            {isManagerOrAdmin && <TabsTrigger value="team">{t('modules.onboarding.teamOnboarding')}</TabsTrigger>}
            {isAdmin && <TabsTrigger value="templates">{t('modules.onboarding.templates')}</TabsTrigger>}
          </TabsList>
          <TabsContent value="mine" className="space-y-3 mt-4">
            {myAssignments.length === 0 ? <p className="text-sm text-muted-foreground">{t('modules.onboarding.noAssignments')}</p> : myAssignments.map(renderAssignment)}
          </TabsContent>
          {isManagerOrAdmin && (
            <TabsContent value="team" className="space-y-3 mt-4">
              {teamAssignments.length === 0 ? <p className="text-sm text-muted-foreground">{t('modules.onboarding.noAssignments')}</p> : teamAssignments.map(renderAssignment)}
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="templates" className="space-y-3 mt-4">
              {templates.length === 0 ? <p className="text-sm text-muted-foreground">{t('modules.onboarding.noTemplates')}</p> : templates.map((tpl) => (
                <div key={tpl.id} className="border border-border p-4">
                  <div className="font-semibold">{tpl.name}</div>
                  {tpl.description && <p className="text-sm text-muted-foreground mt-1">{tpl.description}</p>}
                  <ul className="mt-2 space-y-1 text-sm">
                    {templateTasks.filter((tt) => tt.template_id === tpl.id).map((tt) => (
                      <li key={tt.id} className="text-muted-foreground">• {tt.title} <span className="text-xs">({tt.default_due_offset_days}d)</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default Onboarding;
