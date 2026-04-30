import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleNotch as Loader2, Plus, FloppyDisk as Save } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { SectionAdornment } from '@/components/brand/SectionAdornment';

export interface ServiceFormValues {
  service_catalog_id: string;
  department_id: string;
  agency_id: string;
  managed_by: string;
  projects_per_month: string;
  projects_per_year: string;
  external_budget_monthly: string;
  external_budget_annual: string;
  description: string;
  typical_duration_days: string;
  typical_duration_hours: string;
  notes: string;
}

const empty: ServiceFormValues = {
  service_catalog_id: '',
  department_id: '',
  agency_id: '',
  managed_by: '',
  projects_per_month: '',
  projects_per_year: '',
  external_budget_monthly: '',
  external_budget_annual: '',
  description: '',
  typical_duration_days: '',
  typical_duration_hours: '',
  notes: '',
};

interface Props {
  mode: 'create' | 'edit';
  serviceId?: string;
  initialValues?: Partial<ServiceFormValues>;
  initialCategoryId?: string | null;
  initialSubcategoryId?: string | null;
}

const ServiceForm: React.FC<Props> = ({ mode, serviceId, initialValues, initialCategoryId, initialSubcategoryId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [categoryId, setCategoryId] = useState<string>(initialCategoryId || '');
  const [subcategoryId, setSubcategoryId] = useState<string>(initialSubcategoryId || '');
  const [form, setForm] = useState<ServiceFormValues>({ ...empty, ...initialValues });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [catalog, setCatalog] = useState<{ id: string; service_name: string; description: string | null }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
  const [managers, setManagers] = useState<{ user_id: string; first_name: string | null; last_name: string | null; current_position: string | null }[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: deps }, { data: ags }, { data: mgrs }, { data: roleUsers }] = await Promise.all([
        supabase.from('service_categories').select('id, name').eq('level', 1).order('sort_order'),
        supabase.from('departments').select('id, name').order('name'),
        supabase.from('agencies').select('id, name').eq('is_active', true).order('name'),
        supabase
          .from('profiles')
          .select('user_id, first_name, last_name, current_position, seniority_level, is_active')
          .eq('is_active', true)
          .order('first_name'),
        supabase.from('user_roles').select('user_id, role').in('role', ['admin', 'manager']),
      ]);
      setCategories(cats || []);
      setDepartments(deps || []);
      setAgencies(ags || []);

      // Eligible managers = seniority director/vp/c-level OR admin/manager role.
      // Fall back to all active employees if none match (so the dropdown is never empty).
      const adminIds = new Set((roleUsers || []).map((r: any) => r.user_id));
      const seniorSet = new Set(['director', 'vp', 'c-level']);
      const all = mgrs || [];
      const eligible = all.filter(
        (m: any) => seniorSet.has(m.seniority_level) || adminIds.has(m.user_id),
      );
      setManagers((eligible.length > 0 ? eligible : all) as any);
    })();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    supabase
      .from('service_categories')
      .select('id, name')
      .eq('parent_id', categoryId)
      .order('sort_order')
      .then(({ data }) => setSubcategories(data || []));
  }, [categoryId]);

  // Load catalog services when subcategory changes
  useEffect(() => {
    if (!subcategoryId) {
      setCatalog([]);
      return;
    }
    supabase
      .from('service_catalog')
      .select('id, service_name, description')
      .eq('subcategory_id', subcategoryId)
      .eq('is_active', true)
      .order('service_name')
      .then(({ data }) => setCatalog(data || []));
  }, [subcategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service_catalog_id) return toast.error(t('services.selectServiceRequired'));
    if (!form.agency_id) return toast.error(t('services.selectAgencyRequired'));
    if (!form.projects_per_month && !form.projects_per_year) return toast.error(t('services.volumeRequired'));

    setLoading(true);
    try {
      const payload: any = {
        service_catalog_id: form.service_catalog_id,
        department_id: form.department_id || null,
        agency_id: form.agency_id,
        managed_by: form.managed_by || null,
        description: form.description || null,
        notes: form.notes || null,
        projects_per_month: form.projects_per_month ? Number(form.projects_per_month) : null,
        projects_per_year: form.projects_per_year ? Number(form.projects_per_year) : null,
        external_budget_monthly: form.external_budget_monthly ? Number(form.external_budget_monthly) : 0,
        external_budget_annual: form.external_budget_annual ? Number(form.external_budget_annual) : 0,
        typical_duration_days: form.typical_duration_days ? Number(form.typical_duration_days) : null,
        typical_duration_hours: form.typical_duration_hours ? Number(form.typical_duration_hours) : null,
      };

      if (mode === 'create') {
        payload.created_by = user!.id;
        const { data, error } = await supabase.from('services').insert(payload).select('id').single();
        if (error) throw error;
        toast.success(t('services.created'));
        navigate(`/services/${data.id}`);
      } else {
        const { error } = await supabase.from('services').update(payload).eq('id', serviceId!);
        if (error) throw error;
        toast.success(t('services.updated'));
        navigate(`/services/${serviceId}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(mode === 'create' ? t('services.createFailed') : t('services.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <SectionAdornment
          index={1}
          total={5}
          label={mode === 'create' ? t('services.createLabel', 'Create Service') : t('services.editLabel', 'Edit Service')}
          align="left"
        />
        <h1 className="text-display-md">
          {mode === 'create' ? t('services.createNew') : t('services.edit')}
        </h1>
        <p className="text-muted-foreground mt-1">{t('services.createDescription')}</p>
      </div>

      {/* Service Selection */}
      <section className="space-y-4 border border-border p-5">
        <h2 className="font-semibold">{t('services.form.serviceSelection')}</h2>
        <div>
          <Label>{t('services.form.category')} *</Label>
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(''); setForm(f => ({ ...f, service_catalog_id: '' })); }}>
            <SelectTrigger><SelectValue placeholder={t('services.form.selectPlaceholder')} /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {subcategories.length > 0 && (
          <div>
            <Label>{t('services.form.subcategory')} *</Label>
            <Select value={subcategoryId} onValueChange={(v) => { setSubcategoryId(v); setForm(f => ({ ...f, service_catalog_id: '' })); }}>
              <SelectTrigger><SelectValue placeholder={t('services.form.selectPlaceholder')} /></SelectTrigger>
              <SelectContent>
                {subcategories.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {catalog.length > 0 && (
          <div>
            <Label>{t('services.form.service')} *</Label>
            <Select value={form.service_catalog_id} onValueChange={(v) => setForm(f => ({ ...f, service_catalog_id: v }))}>
              <SelectTrigger><SelectValue placeholder={t('services.form.selectPlaceholder')} /></SelectTrigger>
              <SelectContent>
                {catalog.map(s => <SelectItem key={s.id} value={s.id}>{s.service_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </section>

      {/* Ownership */}
      <section className="space-y-4 border border-border p-5">
        <h2 className="font-semibold">{t('services.form.ownership')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{t('services.form.agency')} *</Label>
            <Select value={form.agency_id} onValueChange={(v) => setForm(f => ({ ...f, agency_id: v }))}>
              <SelectTrigger><SelectValue placeholder={t('services.form.selectPlaceholder')} /></SelectTrigger>
              <SelectContent>
                {agencies.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('services.form.department')}</Label>
            <Select value={form.department_id} onValueChange={(v) => setForm(f => ({ ...f, department_id: v }))}>
              <SelectTrigger><SelectValue placeholder={t('services.form.selectPlaceholder')} /></SelectTrigger>
              <SelectContent>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>{t('services.form.managedBy')}</Label>
          <Select value={form.managed_by} onValueChange={(v) => setForm(f => ({ ...f, managed_by: v }))}>
            <SelectTrigger><SelectValue placeholder={t('services.form.selectPlaceholder')} /></SelectTrigger>
            <SelectContent>
              {managers.map(m => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {`${m.first_name || ''} ${m.last_name || ''}`.trim()}{m.current_position ? ` — ${m.current_position}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">{t('services.form.managedByHint')}</p>
        </div>
      </section>

      {/* Volume */}
      <section className="space-y-4 border border-border p-5">
        <h2 className="font-semibold">{t('services.form.volume')}</h2>
        <p className="text-sm text-muted-foreground">{t('services.form.volumeDescription')}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{t('services.form.projectsPerMonth')}</Label>
            <Input type="number" step="0.01" min="0" value={form.projects_per_month}
              onChange={e => setForm(f => ({ ...f, projects_per_month: e.target.value }))} placeholder="12.5" />
          </div>
          <div>
            <Label>{t('services.form.projectsPerYear')}</Label>
            <Input type="number" min="0" value={form.projects_per_year}
              onChange={e => setForm(f => ({ ...f, projects_per_year: e.target.value }))} placeholder="150" />
          </div>
        </div>
      </section>

      {/* Budget */}
      <section className="space-y-4 border border-border p-5">
        <h2 className="font-semibold">{t('services.form.externalResources')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{t('services.form.monthlyBudget')}</Label>
            <Input type="number" step="0.01" min="0" value={form.external_budget_monthly}
              onChange={e => setForm(f => ({ ...f, external_budget_monthly: e.target.value }))} placeholder="45000" />
          </div>
          <div>
            <Label>{t('services.form.annualBudget')}</Label>
            <Input type="number" step="0.01" min="0" value={form.external_budget_annual}
              onChange={e => setForm(f => ({ ...f, external_budget_annual: e.target.value }))} placeholder="540000" />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="space-y-4 border border-border p-5">
        <h2 className="font-semibold">{t('services.form.details')}</h2>
        <div>
          <Label>{t('services.form.description')}</Label>
          <Textarea rows={4} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder={t('services.form.descriptionPlaceholder')} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{t('services.form.typicalDurationDays')}</Label>
            <Input type="number" min="0" value={form.typical_duration_days}
              onChange={e => setForm(f => ({ ...f, typical_duration_days: e.target.value }))} placeholder="14" />
            <p className="text-xs text-muted-foreground mt-1">{t('services.form.daysHint')}</p>
          </div>
          <div>
            <Label>{t('services.form.typicalDurationHours')}</Label>
            <Input type="number" step="0.01" min="0" value={form.typical_duration_hours}
              onChange={e => setForm(f => ({ ...f, typical_duration_hours: e.target.value }))} placeholder="80" />
            <p className="text-xs text-muted-foreground mt-1">{t('services.form.hoursHint')}</p>
          </div>
        </div>
        <div>
          <Label>{t('services.form.notes')}</Label>
          <Textarea rows={3} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder={t('services.form.notesPlaceholder')} />
        </div>
      </section>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => navigate(mode === 'create' ? '/services' : `/services/${serviceId}`)}>
          {t('common.buttons.cancel')}
        </Button>
        <Button type="submit" disabled={loading} className="accent-gradient text-white rounded-full px-8 shadow-signal hover:opacity-90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : mode === 'create' ? <Plus className="h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          {mode === 'create' ? t('services.createService') : t('common.buttons.save')}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
