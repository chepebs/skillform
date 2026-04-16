import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Plus, Search, Users, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ServiceRow {
  id: string;
  description: string | null;
  projects_per_month: number | null;
  projects_per_year: number | null;
  external_budget_monthly: number | null;
  external_budget_annual: number | null;
  managed_by: string | null;
  service_catalog_id: string;
  department_id: string | null;
  agency_id: string | null;
  catalog?: {
    service_name: string;
    category_id: string | null;
    subcategory_id: string | null;
    category?: { id: string; name: string } | null;
    subcategory?: { id: string; name: string } | null;
  } | null;
  department?: { id: string; name: string } | null;
  agency?: { id: string; name: string } | null;
  manager?: { user_id: string; first_name: string | null; last_name: string | null; avatar_url: string | null } | null;
  match_count?: number;
}

const ServicesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadFilters();
    loadServices();
  }, []);

  const loadFilters = async () => {
    const [{ data: deps }, { data: ags }] = await Promise.all([
      supabase.from('departments').select('id, name').order('name'),
      supabase.from('agencies').select('id, name').eq('is_active', true).order('name'),
    ]);
    setDepartments(deps || []);
    setAgencies(ags || []);
  };

  const loadServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select(`
        id, description, projects_per_month, projects_per_year,
        external_budget_monthly, external_budget_annual, managed_by,
        service_catalog_id, department_id, agency_id,
        catalog:service_catalog!services_service_catalog_id_fkey(
          service_name, category_id, subcategory_id,
          category:service_categories!service_catalog_category_id_fkey(id, name),
          subcategory:service_categories!service_catalog_subcategory_id_fkey(id, name)
        ),
        department:departments!services_department_id_fkey(id, name),
        agency:agencies!services_agency_id_fkey(id, name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error(t('services.loadFailed'));
      setLoading(false);
      return;
    }

    const rows = (data || []) as unknown as ServiceRow[];

    // Fetch managers and match counts in batch
    const managerIds = Array.from(new Set(rows.map(r => r.managed_by).filter(Boolean))) as string[];
    const serviceIds = rows.map(r => r.id);

    const [managersRes, matchesRes] = await Promise.all([
      managerIds.length
        ? supabase.from('profiles').select('user_id, first_name, last_name, avatar_url').in('user_id', managerIds)
        : Promise.resolve({ data: [] as any[] }),
      serviceIds.length
        ? supabase.from('service_talent_matches').select('service_id').in('service_id', serviceIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const managerMap = new Map((managersRes.data || []).map((m: any) => [m.user_id, m]));
    const matchCountMap = new Map<string, number>();
    (matchesRes.data || []).forEach((m: any) => {
      matchCountMap.set(m.service_id, (matchCountMap.get(m.service_id) || 0) + 1);
    });

    const enriched = rows.map(r => ({
      ...r,
      manager: r.managed_by ? (managerMap.get(r.managed_by) as any) || null : null,
      match_count: matchCountMap.get(r.id) || 0,
    }));
    setServices(enriched);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return services.filter(s => {
      if (tab !== 'all') {
        const cat = s.catalog?.category?.name?.toLowerCase() || '';
        if (tab === 'production' && !cat.includes('production')) return false;
        if (tab === 'marketing' && !cat.includes('marketing')) return false;
        if (tab === 'strategic' && !cat.includes('strategic')) return false;
      }
      if (departmentFilter !== 'all' && s.department_id !== departmentFilter) return false;
      if (agencyFilter !== 'all' && s.agency_id !== agencyFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = s.catalog?.service_name?.toLowerCase() || '';
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [services, tab, departmentFilter, agencyFilter, search]);

  const grouped = useMemo(() => {
    const out: Record<string, ServiceRow[]> = {};
    filtered.forEach(s => {
      const k = s.catalog?.category?.name || 'Other';
      (out[k] ||= []).push(s);
    });
    return out;
  }, [filtered]);

  const formatCurrency = (n: number | null) => {
    if (!n) return '$0';
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Briefcase className="h-7 w-7" />
            {t('services.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('services.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/services/create')}>
          <Plus className="h-4 w-4" />
          {t('services.addService')}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">{t('services.tabs.all')} ({services.length})</TabsTrigger>
          <TabsTrigger value="production">{t('services.tabs.production')}</TabsTrigger>
          <TabsTrigger value="marketing">{t('services.tabs.marketing')}</TabsTrigger>
          <TabsTrigger value="strategic">{t('services.tabs.strategic')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('services.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('services.filters.allDepartments')}</SelectItem>
            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={agencyFilter} onValueChange={setAgencyFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('services.filters.allAgencies')}</SelectItem>
            {agencies.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p>{t('services.loading')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <Briefcase className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{t('services.noServices')}</h2>
          <p className="text-muted-foreground mt-1 mb-4">{t('services.noServicesDescription')}</p>
          <Button onClick={() => navigate('/services/create')}>
            <Plus className="h-4 w-4" />
            {t('services.createFirst')}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                {category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map(s => (
                  <Link
                    key={s.id}
                    to={`/services/${s.id}`}
                    className="border border-border bg-card hover:border-primary transition-colors p-4 flex flex-col gap-3"
                  >
                    <div>
                      <h3 className="font-semibold text-base">{s.catalog?.service_name}</h3>
                      {s.catalog?.subcategory?.name && (
                        <Badge variant="secondary" className="mt-1 text-xs">{s.catalog.subcategory.name}</Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('services.department')}</span>
                        <span className="font-medium">{s.department?.name || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('services.volume')}</span>
                        <span className="font-medium">
                          {s.projects_per_month
                            ? `${s.projects_per_month}${t('services.perMonth')}`
                            : s.projects_per_year
                              ? `${s.projects_per_year}${t('services.perYear')}`
                              : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('services.external')}</span>
                        <span className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(
                            s.external_budget_monthly ||
                              (s.external_budget_annual ? Number(s.external_budget_annual) / 12 : 0)
                          )}{t('services.perMonth')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                      <span className="truncate">
                        {s.manager
                          ? `${s.manager.first_name || ''} ${s.manager.last_name || ''}`.trim() || '—'
                          : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {s.match_count} {t('services.matched')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesList;
