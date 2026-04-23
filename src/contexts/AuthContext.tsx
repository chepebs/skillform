import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'employee' | 'organizer_admin' | 'department_director' | 'master_admin';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  profile_completed: boolean;
  company_id: string | null;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  company: Company | null;
  role: AppRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; invite_token?: string; company_id?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const profileTyped = (profileData as Profile) ?? null;
    setProfile(profileTyped);

    if (profileTyped?.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, slug, logo_url')
        .eq('id', profileTyped.company_id)
        .maybeSingle();
      setCompany((companyData as Company) ?? null);
    } else {
      setCompany(null);
    }

    const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
      _user_id: userId,
    });

    if (!roleError && roleData) {
      setRole(roleData as AppRole);
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setProfile(null);
        setCompany(null);
        setRole(null);
        setIsLoading(false);
        return;
      }

      // Keep the app in a loading state until role/profile are fetched,
      // so route guards and redirects don't run with role=null.
      setIsLoading(true);
      setTimeout(async () => {
        if (cancelled) return;
        await fetchUserData(session.user.id);
        if (!cancelled) setIsLoading(false);
      }, 0);
    });

    // THEN check for existing session
    setIsLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setProfile(null);
        setCompany(null);
        setRole(null);
        setIsLoading(false);
        return;
      }

      await fetchUserData(session.user.id);
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { first_name?: string; last_name?: string; invite_token?: string; company_id?: string }
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCompany(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        company,
        role,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};