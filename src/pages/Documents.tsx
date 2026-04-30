import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CircleNotch as Loader2, Plus, FileText, DownloadSimple, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DocumentRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  uploaded_by: string;
  visibility: 'personal' | 'department' | 'company';
  department: string | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

const formatSize = (bytes?: number | null) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    visibility: 'personal' as 'personal' | 'department' | 'company',
    file: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!profile?.company_id) return;
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    setDocs((data ?? []) as DocumentRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id]);

  const submit = async () => {
    if (!user || !profile?.company_id || !form.file || !form.name.trim()) return;
    setSubmitting(true);
    try {
      const docId = crypto.randomUUID();
      const filePath = `${user.id}/${docId}/${form.file.name}`;
      const { error: upErr } = await supabase.storage.from('hr-documents').upload(filePath, form.file, {
        upsert: false,
      });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from('documents').insert({
        id: docId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        owner_id: user.id,
        uploaded_by: user.id,
        visibility: form.visibility,
        department: form.visibility === 'department' ? profile.department : null,
        file_path: filePath,
        file_name: form.file.name,
        mime_type: form.file.type || null,
        size_bytes: form.file.size,
        company_id: profile.company_id,
      });
      if (insErr) throw insErr;

      toast.success(t('modules.documents.upload'));
      setOpen(false);
      setForm({ name: '', description: '', visibility: 'personal', file: null });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const download = async (d: DocumentRow) => {
    const { data, error } = await supabase.storage.from('hr-documents').createSignedUrl(d.file_path, 60);
    if (error || !data) return toast.error(error?.message ?? 'Failed');
    window.open(data.signedUrl, '_blank');
  };

  const remove = async (d: DocumentRow) => {
    if (!confirm(t('common.delete') + '?')) return;
    await supabase.storage.from('hr-documents').remove([d.file_path]);
    await supabase.from('documents').delete().eq('id', d.id);
    load();
  };

  const personal = docs.filter((d) => d.owner_id === user?.id);
  const shared = docs.filter((d) => d.visibility !== 'personal' && d.owner_id !== user?.id);
  const managed = docs.filter((d) => d.uploaded_by === user?.id && d.owner_id !== user?.id);

  const Table: React.FC<{ rows: DocumentRow[] }> = ({ rows }) => (
    <div className="border border-border">
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">{t('modules.documents.noDocuments')}</p>
      ) : (
        rows.map((d) => (
          <div key={d.id} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {d.file_name} • {formatSize(d.size_bytes)} • {format(new Date(d.created_at), 'PP')} •{' '}
                <span className="uppercase tracking-wide">{d.visibility}</span>
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => download(d)} title={t('modules.documents.download')}>
              <DownloadSimple className="w-4 h-4" />
            </Button>
            {(d.owner_id === user?.id || d.uploaded_by === user?.id) && (
              <Button size="sm" variant="ghost" onClick={() => remove(d)} title={t('modules.documents.delete')}>
                <Trash className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('modules.documents.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.documents.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('modules.documents.upload')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('modules.documents.upload')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>{t('modules.documents.form.name')}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('modules.documents.form.description')}</Label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={500}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('modules.documents.form.visibility')}</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) => setForm({ ...form, visibility: v as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">{t('modules.documents.form.personal')}</SelectItem>
                    {profile?.department && (
                      <SelectItem value="department">{t('modules.documents.form.department')}</SelectItem>
                    )}
                    <SelectItem value="company">{t('modules.documents.form.company')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('modules.documents.form.file')}</Label>
                <Input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
              </div>
              <Button className="w-full" onClick={submit} disabled={submitting || !form.file || !form.name.trim()}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.documents.upload')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : (
        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">{t('modules.documents.tabs.personal')} ({personal.length})</TabsTrigger>
            <TabsTrigger value="shared">{t('modules.documents.tabs.shared')} ({shared.length})</TabsTrigger>
            {managed.length > 0 && (
              <TabsTrigger value="managed">{t('modules.documents.tabs.managed')} ({managed.length})</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="personal" className="mt-4"><Table rows={personal} /></TabsContent>
          <TabsContent value="shared" className="mt-4"><Table rows={shared} /></TabsContent>
          <TabsContent value="managed" className="mt-4"><Table rows={managed} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Documents;
