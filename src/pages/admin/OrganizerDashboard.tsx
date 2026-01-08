import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Folder, Users, Plus, ArrowRight } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage talent groups and organize profiles
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/organizer/groups')}
          className="bg-gradient-primary hover:bg-gradient-primary-hover shadow-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Folder className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Groups</p>
              <p className="text-3xl font-bold text-foreground">{groups.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profiles Organized</p>
              <p className="text-3xl font-bold text-foreground">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Groups */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Groups</h2>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/organizer/groups')}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg shimmer mb-4" />
                <div className="h-5 w-32 shimmer rounded mb-2" />
                <div className="h-4 w-full shimmer rounded" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first group to start organizing profiles
            </p>
            <Button
              onClick={() => navigate('/admin/organizer/groups')}
              className="bg-gradient-primary hover:bg-gradient-primary-hover shadow-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/admin/organizer/groups/${group.id}`)}
                className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all hover:shadow-primary group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {group.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;