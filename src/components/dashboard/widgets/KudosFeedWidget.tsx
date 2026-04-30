import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight } from '@phosphor-icons/react';

interface KudoRow {
  id: string;
  message: string;
  value_tag: string | null;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  from_profile?: { first_name: string | null; last_name: string | null } | null;
  to_profile?: { first_name: string | null; last_name: string | null } | null;
}

const fullName = (p?: { first_name: string | null; last_name: string | null } | null) =>
  [p?.first_name, p?.last_name].filter(Boolean).join(' ') || '—';

export const KudosFeedWidget: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<KudoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('kudos')
        .select('id, message, value_tag, created_at, from_user_id, to_user_id')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!active) return;
      const rows = (data ?? []) as KudoRow[];
      const userIds = Array.from(
        new Set(rows.flatMap((r) => [r.from_user_id, r.to_user_id])),
      );
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        const map = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
        rows.forEach((r) => {
          r.from_profile = map.get(r.from_user_id) as any;
          r.to_profile = map.get(r.to_user_id) as any;
        });
      }
      if (!active) return;
      setItems(rows);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          {t('widgets.kudos.title', 'Recent kudos')}
        </h3>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 shimmer rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('widgets.kudos.empty', 'No kudos yet — be the first!')}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((k) => (
            <li key={k.id} className="text-sm border-b border-border last:border-0 pb-3 last:pb-0">
              <p className="text-foreground">
                <span className="font-semibold">{fullName(k.from_profile)}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="font-semibold">{fullName(k.to_profile)}</span>
              </p>
              <p className="text-muted-foreground line-clamp-2 mt-1">{k.message}</p>
            </li>
          ))}
        </ul>
      )}
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link to="/kudos">
          {t('widgets.kudos.openFeed', 'Open kudos feed')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};
