import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  CheckCircle,
  Edit,
  Trash2,
  UserCog,
  LogIn,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  user_registered: { icon: UserPlus, color: 'text-green-500', label: 'registered' },
  profile_completed: { icon: CheckCircle, color: 'text-blue-500', label: 'completed their profile' },
  profile_updated: { icon: Edit, color: 'text-yellow-500', label: 'updated their profile' },
  role_changed: { icon: UserCog, color: 'text-purple-500', label: 'role was changed' },
  user_login: { icon: LogIn, color: 'text-green-400', label: 'logged in' },
  activate_user: { icon: CheckCircle, color: 'text-green-500', label: 'activated a user' },
  deactivate_user: { icon: UserCog, color: 'text-orange-500', label: 'deactivated a user' },
  delete_user: { icon: Trash2, color: 'text-red-500', label: 'deleted a user' },
  default: { icon: Activity, color: 'text-muted-foreground', label: 'performed an action' },
};

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivityCount, setNewActivityCount] = useState(0);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch user profiles for each activity
      const userIds = [...new Set((data || []).map((a) => a.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', userIds);

        const profileMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p;
          return acc;
        }, {} as Record<string, typeof profiles[0]>);

        setActivities(
          (data || []).map((a) => ({
            ...a,
            details: a.details as Record<string, unknown> | null,
            user_profile: a.user_id ? profileMap[a.user_id] : undefined,
          }))
        );
      } else {
        setActivities(data?.map(a => ({ ...a, details: a.details as Record<string, unknown> | null })) || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('audit_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_log',
        },
        (payload) => {
          setNewActivityCount((prev) => prev + 1);
          // Optionally add to top of list
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || ACTION_CONFIG.default;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          {newActivityCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full animate-pulse">
              {newActivityCount} new
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          View All
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const config = getActionConfig(activity.action);
              const Icon = config.icon;

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg transition-colors",
                    index === 0 && newActivityCount > 0 && "animate-fade-in bg-primary/5"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user_profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-muted">
                      {getInitials(
                        activity.user_profile?.first_name || null,
                        activity.user_profile?.last_name || null
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 flex-shrink-0", config.color)} />
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">
                          {activity.user_profile?.first_name || 'Unknown'}{' '}
                          {activity.user_profile?.last_name || 'User'}
                        </span>{' '}
                        <span className="text-muted-foreground">{config.label}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
