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
import { CircleNotch as Loader2, Plus, FileArrowDown, Trash, File as FileIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface SharedFile {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  scope: 'company' | 'department';
  department: string | null;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

const formatSize = (bytes?: number | null) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const Files: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, role } = useAuth();
  const canUpload = role === 'admin' || role === 'manager';

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<SharedFile[]>([]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'company' | 'department'>('company');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('shared_files')
      .select('*')
      .order('created_at', { ascending: false });
    const list = (data ?? []) as SharedFile[];
    const ids = Array.from(new Set(list.map((f) => f.uploaded_by)));
    const { data: profs } = ids.length
      ? await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', ids)
      : { data: [] as any[] };
    const nameMap = new Map((profs ?? []).map((p: any) => [p.user_id, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—']));
    setFiles(list.map((f) => ({ ...f, uploader_name: nameMap.get(f.uploaded_by) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.company_id]);

  const submit = async () => {
    if (!user || !profile?.company_id || !file || !name.trim()) return;
    setSubmitting(true);
    try {
      const fileId = crypto.randomUUID();
      const filePath = `${profile.company_id}/${fileId}/${file.name}`;
      const { error: upErr } = await supabase.storage.from('company-files').upload(filePath, file, { upsert: false });
      if (upErr) throw upErr;

      const dept = scope === 'department' ? profile.department : null;
      const { error: insErr } = await supabase.from('shared_files').insert({
        id: fileId,
        company_id: profile.company_id,
        name: name.trim(),
        description: description.trim() || null,
        file_path: filePath,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        scope,
        department: dept,
        uploaded_by: user.id,
      });
      if (insErr) throw insErr;

      toast.success(t('modules.files.uploaded'));
      setOpen(false);
      setName(''); setDescription(''); setScope('company'); setFile(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const download = async (f: SharedFile) => {
    const { data, error } = await supabase.storage.from('company-files').createSignedUrl(f.file_path, 60);
    if (error || !data) return toast.error(error?.message ?? 'Error');
    window.open(data.signedUrl, '_blank');
  };

  const remove = async (f: SharedFile) => {
    await supabase.storage.from('company-files').remove([f.file_path]);
    const { error } = await supabase.from('shared_files').delete().eq('id', f.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('modules.files.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('modules.files.subtitle')}</p>
        </div>
        {canUpload && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />{t('modules.files.upload')}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('modules.files.upload')}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>{t('common.labels.name')}</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>{t('common.labels.description')}</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <div><Label>{t('modules.files.scope')}</Label>
                  <Select value={scope} onValueChange={(v) => setScope(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">{t('modules.files.scopes.company')}</SelectItem>
                      <SelectItem value="department">{t('modules.files.scopes.department')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t('modules.files.file')}</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
                <Button onClick={submit} disabled={submitting || !file || !name.trim()} className="w-full">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('modules.files.upload')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('modules.files.noFiles')}</p>
      ) : (
        <div className="space-y-2">
          {files.map((f) => {
            const canDelete = f.uploaded_by === user?.id || role === 'admin';
            return (
              <div key={f.id} className="border border-border p-3 flex items-center gap-3">
                <FileIcon className="w-6 h-6 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {f.file_name} · {formatSize(f.size_bytes)} · {f.uploader_name} · {format(parseISO(f.created_at), 'MMM d, yyyy')}
                  </div>
                  {f.description && <div className="text-xs text-muted-foreground mt-1 truncate">{f.description}</div>}
                </div>
                <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 border border-foreground hidden sm:inline">
                  {t(`modules.files.scopes.${f.scope}`)}
                </span>
                <Button variant="ghost" size="icon" onClick={() => download(f)}><FileArrowDown className="w-4 h-4" /></Button>
                {canDelete && <Button variant="ghost" size="icon" onClick={() => remove(f)}><Trash className="w-4 h-4" /></Button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Files;
