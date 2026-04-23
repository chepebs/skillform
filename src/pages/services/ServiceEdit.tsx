import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ServiceForm, { } from './ServiceForm';
import { CircleNotch as Loader2 } from '@phosphor-icons/react';

const ServiceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`*, catalog:service_catalog!services_service_catalog_id_fkey(category_id, subcategory_id)`)
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        setLoading(false);
        return;
      }
      setCategoryId((data as any).catalog?.category_id || null);
      setSubcategoryId((data as any).catalog?.subcategory_id || null);
      setInitial({
        service_catalog_id: data.service_catalog_id || '',
        department_id: data.department_id || '',
        agency_id: data.agency_id || '',
        managed_by: data.managed_by || '',
        projects_per_month: data.projects_per_month?.toString() || '',
        projects_per_year: data.projects_per_year?.toString() || '',
        external_budget_monthly: data.external_budget_monthly?.toString() || '',
        external_budget_annual: data.external_budget_annual?.toString() || '',
        description: data.description || '',
        typical_duration_days: data.typical_duration_days?.toString() || '',
        typical_duration_hours: data.typical_duration_hours?.toString() || '',
        notes: data.notes || '',
      });
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!initial) return <div className="text-center py-16">Not found</div>;

  return (
    <ServiceForm
      mode="edit"
      serviceId={id!}
      initialValues={initial}
      initialCategoryId={categoryId}
      initialSubcategoryId={subcategoryId}
    />
  );
};

export default ServiceEdit;
