import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { buildCelebrations, bucketByWindow, CelebrationItem } from '@/lib/celebrations';
import { Cake, Trophy, CircleNotch as Loader2 } from '@phosphor-icons/react';

const Avatar: React.FC<{ url: string | null; name: string }> = ({ url, name }) => {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  return url ? (
    <img src={url} alt={name} className="w-10 h-10 object-cover" />
  ) : (
    <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center font-semibold text-sm">
      {initial}
    </div>
  );
};

const Row: React.FC<{ item: CelebrationItem }> = ({ item }) => {
  const { t } = useTranslation();
  const fullName = `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim();
  const Icon = item.kind === 'birthday' ? Cake : Trophy;
  const subtitle =
    item.kind === 'birthday'
      ? item.age
        ? t('modules.celebrations.turning', { age: item.age })
        : t('modules.celebrations.birthdays')
      : t('modules.celebrations.celebrating', { years: item.years });

  return (
    <Link
      to={`/profile/${item.user_id}`}
      className="flex items-center gap-3 px-3 py-3 border border-border hover:bg-secondary/40 transition-colors"
    >
      <Avatar url={item.avatar_url} name={fullName || '?'} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{fullName || '—'}</p>
        <p className="text-xs text-muted-foreground truncate">{item.position ?? item.department ?? ''}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="w-4 h-4" weight="duotone" />
        <span>{subtitle}</span>
      </div>
    </Link>
  );
};

const Section: React.FC<{ title: string; items: CelebrationItem[] }> = ({ title, items }) => {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{title}</h2>
      <div className="space-y-px">
        {items.map((i) => (
          <Row key={`${i.user_id}-${i.kind}`} item={i} />
        ))}
      </div>
    </section>
  );
};

const Celebrations: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [items, setItems] = useState<CelebrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.company_id) {
      setItems([]);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url, position, department, birth_date, start_date')
        .eq('company_id', profile.company_id);
      setItems(buildCelebrations(data ?? []));
      setLoading(false);
    })();
  }, [profile?.company_id]);

  const buckets = bucketByWindow(items);

  return (
    <div className="max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t('modules.celebrations.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('modules.celebrations.subtitle')}</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('modules.celebrations.noUpcoming')}</p>
      ) : (
        <div className="space-y-6">
          <Section title={t('modules.celebrations.today')} items={buckets.today} />
          <Section title={t('modules.celebrations.thisWeek')} items={buckets.week} />
          <Section title={t('modules.celebrations.thisMonth')} items={buckets.month} />
        </div>
      )}
    </div>
  );
};

export default Celebrations;
