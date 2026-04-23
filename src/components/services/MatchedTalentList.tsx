import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowsClockwise as RefreshCw, UserPlus, X, CircleNotch as Loader2, User, Envelope as Mail } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MatchProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  current_position: string | null;
  avatar_url: string | null;
  department: string | null;
  email: string;
}

interface TalentMatch {
  id: string;
  match_score: number | null;
  matched_skills: string[] | null;
  auto_matched: boolean | null;
  manually_added: boolean | null;
  profile: MatchProfile | null;
}

interface Props {
  serviceId: string;
  canEdit: boolean;
}

const MatchedTalentList: React.FC<Props> = ({ serviceId, canEdit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<TalentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [minScore, setMinScore] = useState(60);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => { loadMatches(); }, [serviceId, minScore]);

  const loadMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_talent_matches')
      .select('id, user_id, match_score, matched_skills, auto_matched, manually_added')
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .gte('match_score', minScore)
      .order('match_score', { ascending: false });

    if (error || !data) {
      console.error('Load matches:', error);
      setMatches([]);
      setLoading(false);
      return;
    }

    const userIds = data.map((m: any) => m.user_id).filter(Boolean);
    if (userIds.length === 0) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, current_position, avatar_url, department, email')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
    const merged = data.map((m: any) => ({
      ...m,
      profile: profileMap.get(m.user_id) || null,
    })).filter(m => m.profile);

    setMatches(merged as any);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('auto-match-services', {
        body: { service_id: serviceId },
      });
      if (error) throw error;
      toast.success(t('services.matches.refreshed'));
      loadMatches();
    } catch {
      toast.error(t('services.matches.refreshFailed'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemove = async (matchId: string) => {
    const { error } = await supabase
      .from('service_talent_matches')
      .update({ is_active: false })
      .eq('id', matchId);
    if (error) {
      toast.error(t('services.matches.removeFailed'));
      return;
    }
    toast.success(t('services.matches.removed'));
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold">{t('services.matches.title')} ({matches.length})</h3>
          <p className="text-sm text-muted-foreground">{t('services.matches.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {t('services.matches.refresh')}
              </Button>
              <AddTalentModal
                serviceId={serviceId}
                existingUserIds={matches.map(m => m.profile?.user_id).filter(Boolean) as string[]}
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                onAdded={loadMatches}
              />
            </>
          )}
        </div>
      </div>

      {/* Min score filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">{t('services.matches.minScore')}</span>
        <Slider
          value={[minScore]}
          onValueChange={([v]) => setMinScore(v)}
          min={0} max={100} step={5}
          className="max-w-[200px]"
        />
        <span className="text-sm font-medium w-10">{minScore}%</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : matches.length === 0 ? (
        <div className="text-center py-8 border border-border">
          <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{t('services.matches.noMatches')}</p>
          {canEdit && (
            <Button variant="outline" size="sm" className="mt-3" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" /> {t('services.matches.runMatching')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map(match => {
            const p = match.profile;
            if (!p) return null;
            const initials = `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`;
            return (
              <div key={match.id} className="flex items-center justify-between border border-border p-3 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p.avatar_url || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.current_position}{p.department ? ` · ${p.department}` : ''}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-center shrink-0">
                  <p className={`text-lg font-bold ${scoreColor(match.match_score || 0)}`}>{match.match_score}%</p>
                  <p className="text-[10px] text-muted-foreground">{t('services.matches.matchScore')}</p>
                </div>

                {/* Matched skills */}
                <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
                  {match.matched_skills?.slice(0, 3).map(s => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                  {(match.matched_skills?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-[10px]">+{(match.matched_skills?.length || 0) - 3}</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${p.user_id}`)}>
                    {t('services.matches.viewProfile')}
                  </Button>
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(match.id)} title={t('services.matches.remove')}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---- Manual Add Talent Modal ---- */
interface AddTalentModalProps {
  serviceId: string;
  existingUserIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

const AddTalentModal: React.FC<AddTalentModalProps> = ({ serviceId, existingUserIds, open, onOpenChange, onAdded }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setSearch(''); setResults([]); return; }
  }, [open]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, current_position, avatar_url, department, email')
        .eq('is_active', true)
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(10);
      setResults((data || []).filter(p => !existingUserIds.includes(p.user_id)));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, existingUserIds]);

  const handleAdd = async (userId: string) => {
    setAdding(userId);
    const { error } = await supabase.from('service_talent_matches').insert({
      service_id: serviceId,
      user_id: userId,
      match_score: 100,
      matched_skills: [],
      manually_added: true,
      auto_matched: false,
      is_active: true,
    });
    if (error) {
      toast.error(t('services.matches.addFailed'));
    } else {
      toast.success(t('services.matches.added'));
      onAdded();
      onOpenChange(false);
    }
    setAdding(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4" /> {t('services.matches.addTalent')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('services.matches.addTalent')}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder={t('services.matches.searchEmployees')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {results.map(p => (
            <div key={p.user_id} className="flex items-center justify-between p-2 border border-border">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback>{(p.first_name?.[0] || '') + (p.last_name?.[0] || '')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-muted-foreground">{p.current_position}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleAdd(p.user_id)} disabled={adding === p.user_id}>
                {adding === p.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              </Button>
            </div>
          ))}
          {search.length >= 2 && !loading && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('services.matches.noResults')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchedTalentList;
