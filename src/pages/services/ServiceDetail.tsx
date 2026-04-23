import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Briefcase, CurrencyDollar as DollarSign, Calendar, Clock, PencilSimple as Edit, Trash as Trash2, CircleNotch as Loader2 } from '@phosphor-icons/react';
import ServiceSkillsManager from '@/components/services/ServiceSkillsManager';
import MatchedTalentList from '@/components/services/MatchedTalentList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ServiceDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [service, setService] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          catalog:service_catalog!services_service_catalog_id_fkey(
            service_name, description, typical_skills,
            category:service_categories!service_catalog_category_id_fkey(name),
            subcategory:service_categories!service_catalog_subcategory_id_fkey(name)
          ),
          department:departments!services_department_id_fkey(id, name),
          agency:agencies!services_agency_id_fkey(id, name)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        toast.error(t('services.notFound'));
        setLoading(false);
        return;
      }
      setService(data);
      // Check edit permission
      if (user) {
        const { data: canEditResult } = await supabase.rpc('can_edit_service', {
          _user_id: user.id,
          _service_id: id!,
        });
        setCanEdit(!!canEditResult);
      }
      if (data.managed_by) {
        const { data: m } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, current_position, avatar_url')
          .eq('user_id', data.managed_by)
          .maybeSingle();
        setManager(m);
      }
      setLoading(false);
    })();
  }, [id, t]);

  const handleDelete = async () => {
    const { error } = await supabase.from('services').delete().eq('id', id!);
    if (error) {
      toast.error(t('services.deleteFailed'));
      return;
    }
    toast.success(t('services.deleted'));
    navigate('/services');
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!service) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{t('services.notFound')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-4 w-4" /> {t('services.backToList')}
        </Button>
      </div>
    );
  }

  const fmt = (n: number | null | undefined) => n ? `$${Number(n).toLocaleString()}` : '$0';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> {t('services.backToList')}
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Briefcase className="h-4 w-4" />
            {service.catalog?.category?.name}
            {service.catalog?.subcategory?.name && <> / {service.catalog.subcategory.name}</>}
          </div>
          <h1 className="text-3xl font-semibold">{service.catalog?.service_name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/services/${id}/edit`)}>
            <Edit className="h-4 w-4" /> {t('services.edit')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" /> {t('services.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('services.delete')}</AlertDialogTitle>
                <AlertDialogDescription>{t('services.deleteConfirm')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.buttons.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{t('common.buttons.delete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <section className="border border-border p-5 space-y-4">
        <h2 className="font-semibold">{t('services.detail.overview')}</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {service.description || service.catalog?.description || t('services.detail.noDescription')}
        </p>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 text-sm pt-2">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">{t('services.agency')}</span>
            <span className="font-medium">{service.agency?.name || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">{t('services.department')}</span>
            <span className="font-medium">{service.department?.name || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">{t('services.manager')}</span>
            <span className="font-medium">
              {manager ? `${manager.first_name || ''} ${manager.last_name || ''}`.trim() : '—'}
            </span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">{t('services.volume')}</span>
            <span className="font-medium">
              {service.projects_per_month ? `${service.projects_per_month}${t('services.perMonth')}` : ''}
              {service.projects_per_month && service.projects_per_year ? ' · ' : ''}
              {service.projects_per_year ? `${service.projects_per_year}${t('services.perYear')}` : ''}
              {!service.projects_per_month && !service.projects_per_year && '—'}
            </span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />{t('services.form.monthlyBudget')}</span>
            <span className="font-medium">{fmt(service.external_budget_monthly)}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />{t('services.form.annualBudget')}</span>
            <span className="font-medium">{fmt(service.external_budget_annual)}</span>
          </div>
          {service.typical_duration_days && (
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{t('services.form.typicalDurationDays')}</span>
              <span className="font-medium">{service.typical_duration_days}</span>
            </div>
          )}
          {service.typical_duration_hours && (
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t('services.form.typicalDurationHours')}</span>
              <span className="font-medium">{service.typical_duration_hours}</span>
            </div>
          )}
        </div>

        {service.catalog?.typical_skills?.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">{t('services.detail.skills')}</p>
            <div className="flex flex-wrap gap-2">
              {service.catalog.typical_skills.map((s: string) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {service.notes && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-1">{t('services.form.notes')}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{service.notes}</p>
          </div>
        )}
      </section>

      {/* Skills Requirements */}
      <section className="border border-border p-5">
        <ServiceSkillsManager serviceId={id!} canEdit={canEdit} />
      </section>

      {/* Matched Talent */}
      <section className="border border-border p-5">
        <MatchedTalentList serviceId={id!} canEdit={canEdit} />
      </section>
    </div>
  );
};

export default ServiceDetail;
