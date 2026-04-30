import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ClipboardText, AirplaneTilt, ArrowRight } from '@phosphor-icons/react';

/**
 * Surfaces pending items awaiting the current user's decision:
 *  - Time-off requests where the current user is the direct manager (or admin)
 *  - Job applications on postings the current user owns (or admin)
 * Visible only to managers and admins.
 */
export const PendingApprovalsWidget: React.FC = () => {
  const { t } = useTranslation();
  const [timeOffCount, setTimeOffCount] = useState(0);
  const [jobAppCount, setJobAppCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ count: toCount }, { count: jaCount }] = await Promise.all([
        supabase
          .from('time_off_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'submitted'),
      ]);
      if (!active) return;
      setTimeOffCount(toCount ?? 0);
      setJobAppCount(jaCount ?? 0);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const total = timeOffCount + jobAppCount;

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {t('widgets.pendingApprovals.title', 'Pending approvals')}
        </h3>
        <span className="text-2xl font-bold text-foreground">
          {loading ? '—' : total}
        </span>
      </div>
      <div className="space-y-2">
        <Link
          to="/time-off"
          className="flex items-center justify-between p-3 border border-border hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <AirplaneTilt className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {t('widgets.pendingApprovals.timeOff', 'Time-off requests')}
            </span>
          </div>
          <span className="text-sm font-semibold">{timeOffCount}</span>
        </Link>
        <Link
          to="/jobs"
          className="flex items-center justify-between p-3 border border-border hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <ClipboardText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {t('widgets.pendingApprovals.jobApplications', 'Job applications')}
            </span>
          </div>
          <span className="text-sm font-semibold">{jobAppCount}</span>
        </Link>
      </div>
      {total > 0 && (
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/time-off">
            {t('widgets.pendingApprovals.review', 'Review all')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
    </div>
  );
};
