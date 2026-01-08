import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Edit, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
}

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = user?.id === id || id === 'me';
  const profileId = id === 'me' ? user?.id : id;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    if (!profileId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profileId)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Profile not found</h3>
        <p className="text-muted-foreground mb-6">
          This profile doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-orange flex items-center justify-center text-primary-foreground text-3xl font-bold flex-shrink-0 shadow-orange-lg">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.first_name || 'User'}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              profile.first_name?.[0] || profile.email[0].toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.email}
                </h1>
                {profile.position && (
                  <p className="text-lg text-muted-foreground mt-1">{profile.position}</p>
                )}
                {profile.department && (
                  <Badge className="mt-3 bg-dark-elevated text-muted-foreground border-dark-border">
                    <Building className="h-3 w-3 mr-1" />
                    {profile.department}
                  </Badge>
                )}
              </div>

              {isOwnProfile && (
                <Button
                  onClick={() => navigate(`/profile/${profileId}/edit`)}
                  className="bg-gradient-orange hover:bg-gradient-orange-hover shadow-orange"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-elevated">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-foreground">{profile.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-elevated">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-foreground">{profile.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-elevated">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="text-foreground">{profile.department || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-elevated">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="text-foreground">{profile.position || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileView;