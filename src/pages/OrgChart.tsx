import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CircleNotch as Loader2, CaretDown, CaretRight, User } from '@phosphor-icons/react';

interface PersonNode {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  position: string | null;
  department: string | null;
  manager_id: string | null;
  reports: PersonNode[];
}

function buildTree(rows: Omit<PersonNode, 'reports'>[]): PersonNode[] {
  const map = new Map<string, PersonNode>();
  rows.forEach((r) => map.set(r.user_id, { ...r, reports: [] }));
  const roots: PersonNode[] = [];
  map.forEach((node) => {
    if (node.manager_id && map.has(node.manager_id)) {
      map.get(node.manager_id)!.reports.push(node);
    } else {
      roots.push(node);
    }
  });
  // Stable sort: by name
  const sortRec = (nodes: PersonNode[]) => {
    nodes.sort((a, b) =>
      `${a.first_name ?? ''} ${a.last_name ?? ''}`.localeCompare(`${b.first_name ?? ''} ${b.last_name ?? ''}`),
    );
    nodes.forEach((n) => sortRec(n.reports));
  };
  sortRec(roots);
  return roots;
}

const TreeRow: React.FC<{ node: PersonNode; depth: number }> = ({ node, depth }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(depth < 1);
  const fullName = `${node.first_name ?? ''} ${node.last_name ?? ''}`.trim() || '—';
  const hasReports = node.reports.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-2 border-b border-border hover:bg-secondary/40"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-5 h-5 flex items-center justify-center"
          disabled={!hasReports}
          aria-label="toggle"
        >
          {hasReports ? open ? <CaretDown className="w-3 h-3" /> : <CaretRight className="w-3 h-3" /> : null}
        </button>
        {node.avatar_url ? (
          <img src={node.avatar_url} alt={fullName} className="w-8 h-8 object-cover" />
        ) : (
          <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-xs font-semibold">
            {fullName[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${node.user_id}`} className="text-sm font-semibold text-foreground hover:underline">
            {fullName}
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            {node.position}
            {node.department ? ` • ${node.department}` : ''}
          </p>
        </div>
        {hasReports && (
          <span className="text-xs text-muted-foreground">
            {node.reports.length} {t('modules.orgChart.directReports')}
          </span>
        )}
      </div>
      {open && hasReports && (
        <div>
          {node.reports.map((r) => (
            <TreeRow key={r.user_id} node={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChart: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [people, setPeople] = useState<Omit<PersonNode, 'reports'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.company_id) {
      setPeople([]);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url, position, department, manager_id')
        .eq('company_id', profile.company_id);
      setPeople(data ?? []);
      setLoading(false);
    })();
  }, [profile?.company_id]);

  const tree = useMemo(() => buildTree(people), [people]);

  return (
    <div className="max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t('modules.orgChart.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('modules.orgChart.subtitle')}</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {t('common.loading')}</div>
      ) : tree.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('modules.orgChart.noManager')}</p>
      ) : (
        <div className="border border-border">
          {tree.map((n) => (
            <TreeRow key={n.user_id} node={n} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgChart;
