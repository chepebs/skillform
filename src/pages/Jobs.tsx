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
import { CircleNotch as Loader2, Plus, Briefcase } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface Job {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  seniority: string | null;
  status: 'draft' | 'open' | 'closed';
  deadline: string | null;
  posted_by: string;
  created_at: string;
  applications_count?: number;
  has_applied?: boolean;
}

const Jobs: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [open, setOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState<Job | null>(null);
  const [coverNote, setCoverNote] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('full_time');
  const [seniority, setSeniority] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!profile?.company_id || !user) return;
    setLoading(true);
    const { data } = await supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: false });

    const myApps = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('applicant_id', user.id);
    const appliedSet = new Set((myApps.data ?? []).map((a: any) => a.job_id));

    // Load application counts for jobs the user posted
    const ownedIds = (data ?? []).filter((j: any) => j.posted_by === user.id).map((j: any) => j.id);
    let countsMap = new Map<string, number>();
    if (ownedIds.length) {
      const { data: apps } = await supabase
        .from('job_applications')
        .select('job_id')
        .in('job_id', ownedIds);
      (apps ?? []).forEach((a: any) => countsMap.set(a.job_id, (countsMap.get(a.job_id) ?? 0) + 1));
    }

    setJobs(((data ?? []) as Job[]).map((j) => ({
      ...j,
      has_applied: appliedSet.has(j.id),
      applications_count: countsMap.get(j.id) ?? 0,
    })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id, user?.id]);

  const createJob = async (status: 'draft' | 'open') => {
    if (!user || !profile?.company_id || !title.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('job_postings').insert({
      company_id: profile.company_id,
      posted_by: user.id,
      title: title.trim(),
      description: description.trim() || null,
      department: department.trim() || null,
      location: location.trim() || null,
      employment_type: employmentType,
      seniority: seniority.trim() || null,
      deadline: deadline || null,
      status,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(t('modules.jobs.posted'));
    setOpen(false);
    setTitle(''); setDescription(''); setDepartment(''); setLocation(''); setSeniority(''); setDeadline('');
    load();
  };

  const apply = async () => {
    if (!user || !applyOpen) return;
    const { error } = await supabase.from('job_applications').insert({
      job_id: applyOpen.id,
      applicant_id: user.id,
      company_id: profile?.company_id,
      cover_note: coverNote.trim() || null,
      status: 'submitted',
    });
    if (error) return toast.error(error.message);
    toast.success(t('modules.jobs.applied'));
    setApplyOpen(null);
    setCoverNote('');
    load();
  };

  const closeJob = async (id: string) => {
    const { error } = await supabase.from('job_postings').update({ status: 'closed' }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const publishJob = async (id: string) => {
    const { error } = await supabase.from('job_postings').update({ status: 'open' }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('modules.jobs.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.jobs.subtitle')}</p>
        </div>
        {isManagerOrAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('modules.jobs.create')}</Button></DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{t('modules.jobs.create')}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>{t('modules.jobs.jobTitle')}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label>{t('modules.jobs.description')}</Label><Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{t('common.labels.department')}</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} /></div>
                  <div><Label>{t('common.labels.location')}</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{t('modules.jobs.employmentType')}</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['full_time', 'part_time', 'contract', 'internship'].map((v) => (
                          <SelectItem key={v} value={v}>{t(`modules.jobs.employmentTypes.${v}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t('modules.jobs.seniority')}</Label><Input value={seniority} onChange={(e) => setSeniority(e.target.value)} /></div>
                </div>
                <div><Label>{t('modules.jobs.deadline')}</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={submitting || !title.trim()} onClick={() => createJob('draft')} className="flex-1">{t('modules.jobs.saveDraft')}</Button>
                  <Button disabled={submitting || !title.trim()} onClick={() => createJob('open')} className="flex-1">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.jobs.publish')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('modules.jobs.noJobs')}</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => {
            const isOwner = j.posted_by === user?.id;
            return (
              <article key={j.id} className="border border-border p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold">{j.title}</h2>
                      <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 border ${
                        j.status === 'open' ? 'border-foreground bg-foreground text-background' :
                        j.status === 'closed' ? 'border-muted-foreground text-muted-foreground' :
                        'border-foreground'
                      }`}>{t(`modules.jobs.statuses.${j.status}`)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {[j.department, j.location, j.employment_type && t(`modules.jobs.employmentTypes.${j.employment_type}`), j.seniority].filter(Boolean).join(' · ')}
                    </div>
                    {j.description && <p className="text-sm text-foreground mt-2 whitespace-pre-line line-clamp-3">{j.description}</p>}
                    {j.deadline && <p className="text-xs text-muted-foreground mt-2">{t('modules.jobs.deadline')}: {format(parseISO(j.deadline), 'MMM d, yyyy')}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {!isOwner && j.status === 'open' && (
                    j.has_applied ? (
                      <span className="text-xs text-muted-foreground self-center">✓ {t('modules.jobs.applied')}</span>
                    ) : (
                      <Button size="sm" onClick={() => setApplyOpen(j)}>{t('modules.jobs.apply')}</Button>
                    )
                  )}
                  {isOwner && (
                    <>
                      <span className="text-xs text-muted-foreground self-center mr-auto">
                        {j.applications_count} {t('modules.jobs.applications')}
                      </span>
                      {j.status === 'draft' && <Button size="sm" onClick={() => publishJob(j.id)}>{t('modules.jobs.publish')}</Button>}
                      {j.status === 'open' && <Button size="sm" variant="outline" onClick={() => closeJob(j.id)}>{t('modules.jobs.close')}</Button>}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!applyOpen} onOpenChange={(v) => !v && setApplyOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{applyOpen?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>{t('modules.jobs.coverNote')}</Label><Textarea rows={5} value={coverNote} onChange={(e) => setCoverNote(e.target.value)} placeholder={t('modules.jobs.coverNotePlaceholder')} /></div>
            <Button onClick={apply} className="w-full">{t('modules.jobs.submitApplication')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
