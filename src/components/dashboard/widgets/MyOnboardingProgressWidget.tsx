import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from '@phosphor-icons/react';

export const MyOnboardingProgressWidget: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasAssignment, setHasAssignment] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data: assignments } = await supabase
        .from('onboarding_assignments')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'in_progress');
      if (!active) return;
      if (!assignments || assignments.length === 0) {
        setLoading(false);
        return;
      }
      setHasAssignment(true);
      const ids = assignments.map((a) => a.id);
      const { data: tasks } = await supabase
        .from('onboarding_tasks')
        .select('status')
        .in('assignment_id', ids);
      if (!active) return;
      setTotal(tasks?.length ?? 0);
      setDone(tasks?.filter((t) => t.status === 'completed').length ?? 0);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return <div className="glass-card rounded-xl p-6 h-32 shimmer" />;
  }
  if (!hasAssignment) return null;

  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          {t('widgets.onboarding.title', 'My onboarding')}
        </h3>
      </div>
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-muted-foreground">
            {t('widgets.onboarding.progress', '{{done}} of {{total}} tasks', { done, total })}
          </span>
          <span className="text-sm font-semibold">{pct}%</span>
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link to="/onboarding">
          {t('widgets.onboarding.open', 'Open onboarding')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};
