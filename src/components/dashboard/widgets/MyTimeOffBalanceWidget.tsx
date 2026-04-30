import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AirplaneTilt, ArrowRight } from '@phosphor-icons/react';

interface BalanceRow {
  id: string;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  policy: { name: string; type: string; color: string | null } | null;
}

export const MyTimeOffBalanceWidget: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rows, setRows] = useState<BalanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const year = new Date().getFullYear();
      const { data } = await supabase
        .from('time_off_balances')
        .select('id, allocated_days, used_days, pending_days, policy:time_off_policies(name, type, color)')
        .eq('user_id', user.id)
        .eq('year', year);
      if (!active) return;
      setRows((data as any) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AirplaneTilt className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          {t('widgets.timeOffBalance.title', 'My time-off balance')}
        </h3>
      </div>

      {loading ? (
        <div className="h-16 shimmer rounded" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('widgets.timeOffBalance.empty', 'No balance allocated yet.')}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const remaining = Number(r.allocated_days) - Number(r.used_days) - Number(r.pending_days);
            return (
              <div key={r.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {r.policy?.name ?? '—'}
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">{remaining}</span>
                    <span className="text-muted-foreground"> / {r.allocated_days} {t('widgets.timeOffBalance.days', 'days')}</span>
                  </span>
                </div>
                <div className="h-1 bg-muted">
                  <div
                    className="h-full bg-foreground"
                    style={{
                      width: `${Math.min(100, (Number(r.used_days) / Math.max(1, Number(r.allocated_days))) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button asChild variant="outline" size="sm" className="w-full">
        <Link to="/time-off">
          {t('widgets.timeOffBalance.request', 'Request time off')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};
