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
import { CircleNotch as Loader2, Plus, Trash, ChartBar } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

type QType = 'text' | 'single_choice' | 'multi_choice' | 'rating' | 'yes_no';

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'open' | 'closed';
  is_anonymous: boolean;
  target_scope: 'company' | 'department';
  department: string | null;
  closes_at: string | null;
  created_by: string;
  created_at: string;
}
interface Question {
  id: string;
  survey_id: string;
  prompt: string;
  type: QType;
  options: any;
  is_required: boolean;
  sort_order: number;
}

const QTYPES: QType[] = ['text', 'single_choice', 'multi_choice', 'rating', 'yes_no'];

const Surveys: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cAnon, setCAnon] = useState(false);
  const [cClosesAt, setCClosesAt] = useState('');
  const [cQs, setCQs] = useState<Array<{ prompt: string; type: QType; options: string; required: boolean }>>([
    { prompt: '', type: 'text', options: '', required: false },
  ]);

  // Take dialog
  const [takeOpen, setTakeOpen] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Results dialog
  const [resultsOpen, setResultsOpen] = useState<Survey | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const load = async () => {
    if (!profile?.company_id || !user) return;
    setLoading(true);
    const { data: sv } = await supabase.from('surveys').select('*').order('created_at', { ascending: false });
    const list = (sv ?? []) as Survey[];
    setSurveys(list);

    if (list.length) {
      const ids = list.map((s) => s.id);
      const { data: qs } = await supabase.from('survey_questions').select('*').in('survey_id', ids).order('sort_order');
      const grouped: Record<string, Question[]> = {};
      (qs ?? []).forEach((q: any) => {
        if (!grouped[q.survey_id]) grouped[q.survey_id] = [];
        grouped[q.survey_id].push(q);
      });
      setQuestions(grouped);

      // Which non-anonymous ones I've responded to
      const nonAnon = list.filter((s) => !s.is_anonymous).map((s) => s.id);
      if (nonAnon.length) {
        const { data: mine } = await supabase
          .from('survey_responses')
          .select('survey_id')
          .eq('respondent_id', user.id)
          .in('survey_id', nonAnon);
        setRespondedIds(new Set((mine ?? []).map((r: any) => r.survey_id)));
      } else {
        setRespondedIds(new Set());
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const createSurvey = async (publish: boolean) => {
    if (!user || !profile?.company_id || !cTitle.trim()) return;
    const validQs = cQs.filter((q) => q.prompt.trim());
    if (validQs.length === 0) return toast.error(t('modules.surveys.needQuestion'));

    const { data: created, error } = await supabase
      .from('surveys')
      .insert({
        company_id: profile.company_id,
        title: cTitle.trim(),
        description: cDesc.trim() || null,
        is_anonymous: cAnon,
        target_scope: 'company',
        closes_at: cClosesAt || null,
        status: publish ? 'open' : 'draft',
        created_by: user.id,
      })
      .select()
      .single();
    if (error || !created) return toast.error(error?.message ?? 'Error');

    const insertQs = validQs.map((q, idx) => ({
      survey_id: created.id,
      prompt: q.prompt.trim(),
      type: q.type,
      options:
        q.type === 'single_choice' || q.type === 'multi_choice'
          ? q.options.split('\n').map((s) => s.trim()).filter(Boolean)
          : null,
      is_required: q.required,
      sort_order: idx,
    }));
    if (insertQs.length) {
      const { error: qErr } = await supabase.from('survey_questions').insert(insertQs);
      if (qErr) return toast.error(qErr.message);
    }
    toast.success(t('modules.surveys.created'));
    setCreateOpen(false);
    setCTitle(''); setCDesc(''); setCAnon(false); setCClosesAt('');
    setCQs([{ prompt: '', type: 'text', options: '', required: false }]);
    load();
  };

  const submitResponse = async () => {
    if (!takeOpen || !user || !profile?.company_id) return;
    setSubmitting(true);
    const qs = questions[takeOpen.id] ?? [];
    for (const q of qs) {
      if (q.is_required && (answers[q.id] === undefined || answers[q.id] === '' || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))) {
        setSubmitting(false);
        return toast.error(t('modules.surveys.answerAllRequired'));
      }
    }
    const { data: resp, error } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: takeOpen.id,
        respondent_id: takeOpen.is_anonymous ? null : user.id,
        company_id: profile.company_id,
      })
      .select()
      .single();
    if (error || !resp) {
      setSubmitting(false);
      return toast.error(error?.message ?? 'Error');
    }
    const inserts = qs
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== '')
      .map((q) => ({ response_id: resp.id, question_id: q.id, value: answers[q.id] }));
    if (inserts.length) {
      const { error: aErr } = await supabase.from('survey_answers').insert(inserts);
      if (aErr) {
        setSubmitting(false);
        return toast.error(aErr.message);
      }
    }
    setSubmitting(false);
    toast.success(t('modules.surveys.responseSubmitted'));
    setTakeOpen(null);
    setAnswers({});
    load();
  };

  const openResults = async (s: Survey) => {
    setResultsOpen(s);
    const { data: resps } = await supabase.from('survey_responses').select('id').eq('survey_id', s.id);
    const respIds = (resps ?? []).map((r: any) => r.id);
    if (respIds.length === 0) return setResults([]);
    const { data: ans } = await supabase.from('survey_answers').select('*').in('response_id', respIds);
    setResults(ans ?? []);
  };

  const closeSurvey = async (id: string) => {
    const { error } = await supabase.from('surveys').update({ status: 'closed' }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };
  const publishSurvey = async (id: string) => {
    const { error } = await supabase.from('surveys').update({ status: 'open' }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const renderTakeQuestion = (q: Question) => {
    const v = answers[q.id];
    switch (q.type) {
      case 'text':
        return <Textarea rows={3} value={v ?? ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />;
      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button"
                onClick={() => setAnswers({ ...answers, [q.id]: n })}
                className={`w-9 h-9 border ${v === n ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
                {n}
              </button>
            ))}
          </div>
        );
      case 'yes_no':
        return (
          <div className="flex gap-2">
            {['yes', 'no'].map((o) => (
              <button key={o} type="button"
                onClick={() => setAnswers({ ...answers, [q.id]: o })}
                className={`px-3 py-1.5 border text-sm ${v === o ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
                {t(`common.${o === 'yes' ? 'yes' : 'no'}`, { defaultValue: o })}
              </button>
            ))}
          </div>
        );
      case 'single_choice':
        return (
          <div className="space-y-1.5">
            {(q.options || []).map((opt: string) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input type="radio" checked={v === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} />
                {opt}
              </label>
            ))}
          </div>
        );
      case 'multi_choice':
        const arr: string[] = Array.isArray(v) ? v : [];
        return (
          <div className="space-y-1.5">
            {(q.options || []).map((opt: string) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={arr.includes(opt)}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q.id]: e.target.checked ? [...arr, opt] : arr.filter((x) => x !== opt),
                    })
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        );
    }
  };

  const aggregate = useMemo(() => {
    if (!resultsOpen) return null;
    const qs = questions[resultsOpen.id] ?? [];
    return qs.map((q) => {
      const qAns = results.filter((a) => a.question_id === q.id);
      const counts: Record<string, number> = {};
      const texts: string[] = [];
      let ratingSum = 0, ratingCount = 0;
      qAns.forEach((a) => {
        const val = a.value;
        if (q.type === 'text') texts.push(String(val ?? ''));
        else if (q.type === 'rating') { const n = Number(val); if (!isNaN(n)) { ratingSum += n; ratingCount++; } }
        else if (q.type === 'multi_choice' && Array.isArray(val)) val.forEach((v) => { counts[v] = (counts[v] ?? 0) + 1; });
        else { const k = String(val ?? ''); counts[k] = (counts[k] ?? 0) + 1; }
      });
      return { q, counts, texts, ratingAvg: ratingCount ? (ratingSum / ratingCount).toFixed(2) : null, total: qAns.length };
    });
  }, [resultsOpen, results, questions]);

  const myList = surveys.filter((s) => s.created_by === user?.id || role === 'admin');
  const inboxList = surveys.filter((s) => s.status === 'open' && s.created_by !== user?.id);

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('modules.surveys.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.surveys.subtitle')}</p>
        </div>
        {isManagerOrAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('modules.surveys.create')}</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{t('modules.surveys.create')}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>{t('common.labels.title')}</Label><Input value={cTitle} onChange={(e) => setCTitle(e.target.value)} /></div>
                <div><Label>{t('common.labels.description')}</Label><Textarea rows={2} value={cDesc} onChange={(e) => setCDesc(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={cAnon} onChange={(e) => setCAnon(e.target.checked)} />
                    {t('modules.surveys.anonymous')}
                  </label>
                  <div><Label>{t('modules.surveys.closesAt')}</Label><Input type="datetime-local" value={cClosesAt} onChange={(e) => setCClosesAt(e.target.value)} /></div>
                </div>
                <div className="space-y-2 border-t border-border pt-3">
                  <Label>{t('modules.surveys.questions')}</Label>
                  {cQs.map((q, idx) => (
                    <div key={idx} className="border border-border p-3 space-y-2">
                      <div className="flex gap-2">
                        <Input className="flex-1" placeholder={t('modules.surveys.questionPrompt')} value={q.prompt} onChange={(e) => { const v = [...cQs]; v[idx].prompt = e.target.value; setCQs(v); }} />
                        <Select value={q.type} onValueChange={(val) => { const v = [...cQs]; v[idx].type = val as QType; setCQs(v); }}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>{QTYPES.map((qt) => <SelectItem key={qt} value={qt}>{t(`modules.surveys.qtypes.${qt}`)}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => setCQs(cQs.filter((_, i) => i !== idx))}><Trash className="w-4 h-4" /></Button>
                      </div>
                      {(q.type === 'single_choice' || q.type === 'multi_choice') && (
                        <Textarea rows={3} placeholder={t('modules.surveys.optionsPlaceholder')} value={q.options} onChange={(e) => { const v = [...cQs]; v[idx].options = e.target.value; setCQs(v); }} />
                      )}
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={q.required} onChange={(e) => { const v = [...cQs]; v[idx].required = e.target.checked; setCQs(v); }} />
                        {t('modules.surveys.required')}
                      </label>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setCQs([...cQs, { prompt: '', type: 'text', options: '', required: false }])}>
                    <Plus className="w-3 h-3 mr-1" />{t('modules.surveys.addQuestion')}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" disabled={!cTitle.trim()} onClick={() => createSurvey(false)}>{t('modules.surveys.saveDraft')}</Button>
                  <Button className="flex-1" disabled={!cTitle.trim()} onClick={() => createSurvey(true)}>{t('modules.surveys.publish')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : (
        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox">{t('modules.surveys.inbox')}</TabsTrigger>
            {isManagerOrAdmin && <TabsTrigger value="mine">{t('modules.surveys.mySurveys')}</TabsTrigger>}
          </TabsList>
          <TabsContent value="inbox" className="space-y-3 mt-4">
            {inboxList.length === 0 ? <p className="text-sm text-muted-foreground">{t('modules.surveys.noSurveys')}</p> : inboxList.map((s) => {
              const responded = respondedIds.has(s.id);
              return (
                <article key={s.id} className="border border-border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="font-semibold">{s.title}</h2>
                      {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{(questions[s.id]?.length ?? 0)} {t('modules.surveys.questionsLabel')}</span>
                        {s.is_anonymous && <span className="border border-foreground px-2">{t('modules.surveys.anonymous')}</span>}
                        {s.closes_at && <span>{t('modules.surveys.closes')}: {format(parseISO(s.closes_at), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                    {responded && !s.is_anonymous ? (
                      <span className="text-xs text-muted-foreground">✓ {t('modules.surveys.submitted')}</span>
                    ) : (
                      <Button size="sm" onClick={() => { setTakeOpen(s); setAnswers({}); }}>{t('modules.surveys.respond')}</Button>
                    )}
                  </div>
                </article>
              );
            })}
          </TabsContent>
          {isManagerOrAdmin && (
            <TabsContent value="mine" className="space-y-3 mt-4">
              {myList.length === 0 ? <p className="text-sm text-muted-foreground">{t('modules.surveys.noSurveys')}</p> : myList.map((s) => (
                <article key={s.id} className="border border-border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold">{s.title}</h2>
                        <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 border ${
                          s.status === 'open' ? 'border-foreground bg-foreground text-background' :
                          s.status === 'closed' ? 'border-muted-foreground text-muted-foreground' :
                          'border-foreground'
                        }`}>{t(`modules.surveys.statuses.${s.status}`)}</span>
                        {s.is_anonymous && <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 border border-foreground">{t('modules.surveys.anonymous')}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{(questions[s.id]?.length ?? 0)} {t('modules.surveys.questionsLabel')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openResults(s)}><ChartBar className="w-4 h-4 mr-1" />{t('modules.surveys.results')}</Button>
                      {s.status === 'draft' && <Button size="sm" onClick={() => publishSurvey(s.id)}>{t('modules.surveys.publish')}</Button>}
                      {s.status === 'open' && <Button size="sm" variant="outline" onClick={() => closeSurvey(s.id)}>{t('modules.surveys.close')}</Button>}
                    </div>
                  </div>
                </article>
              ))}
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Take dialog */}
      <Dialog open={!!takeOpen} onOpenChange={(v) => !v && setTakeOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{takeOpen?.title}</DialogTitle></DialogHeader>
          {takeOpen && (
            <div className="space-y-4">
              {takeOpen.description && <p className="text-sm text-muted-foreground">{takeOpen.description}</p>}
              {(questions[takeOpen.id] ?? []).map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <Label>{idx + 1}. {q.prompt}{q.is_required && <span className="text-destructive ml-1">*</span>}</Label>
                  {renderTakeQuestion(q)}
                </div>
              ))}
              <Button onClick={submitResponse} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.surveys.submit')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Results dialog */}
      <Dialog open={!!resultsOpen} onOpenChange={(v) => !v && setResultsOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{resultsOpen?.title} — {t('modules.surveys.results')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {(aggregate ?? []).map(({ q, counts, texts, ratingAvg, total }, idx) => (
              <div key={q.id} className="border border-border p-3 space-y-2">
                <div className="text-sm font-semibold">{idx + 1}. {q.prompt}</div>
                <div className="text-xs text-muted-foreground">{total} {t('modules.surveys.responses')}</div>
                {q.type === 'rating' && ratingAvg && <div className="text-2xl font-bold">{ratingAvg}<span className="text-xs text-muted-foreground ml-2">{t('modules.surveys.avg')}</span></div>}
                {q.type === 'text' && (
                  <ul className="space-y-1 text-sm">
                    {texts.slice(0, 30).map((t, i) => <li key={i} className="border-l-2 border-border pl-2 text-muted-foreground">{t || '—'}</li>)}
                  </ul>
                )}
                {(q.type === 'single_choice' || q.type === 'multi_choice' || q.type === 'yes_no') && (
                  <div className="space-y-1">
                    {Object.entries(counts).map(([k, v]) => {
                      const pct = total ? Math.round((v / total) * 100) : 0;
                      return (
                        <div key={k} className="text-xs">
                          <div className="flex justify-between"><span>{k}</span><span className="text-muted-foreground">{v} ({pct}%)</span></div>
                          <div className="h-1.5 bg-secondary mt-0.5"><div className="h-full bg-foreground" style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Surveys;
