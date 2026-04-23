import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CircleNotch as Loader2, Buildings as Building2 } from '@phosphor-icons/react';
import { SkillFormLogo } from '@/components/SkillFormLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

const CompanyJoin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { user, signUp, signIn, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!slug || !token) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.rpc('get_company_by_invite', { _slug: slug, _token: token });
      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
      setCompany(row as CompanyInfo | null);
      setLoading(false);
    };
    load();
  }, [slug, token]);

  // If already signed in and has no company, attach to this one
  useEffect(() => {
    const attach = async () => {
      if (user && company) {
        const { data: prof } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).maybeSingle();
        if (prof && !prof.company_id) {
          await supabase.from('profiles').update({ company_id: company.id }).eq('user_id', user.id);
          await refreshProfile();
          toast.success(t('company.join.attached'));
          navigate('/dashboard');
        } else if (prof?.company_id === company.id) {
          navigate('/dashboard');
        }
      }
    };
    attach();
  }, [user, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSubmitting(true);
    try {
      if (mode === 'register') {
        const { error } = await signUp(form.email, form.password, {
          first_name: form.first_name,
          last_name: form.last_name,
          invite_token: token,
          company_id: company.id,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(t('company.join.accountCreated'));
        navigate('/dashboard');
      } else {
        const { error } = await signIn(form.email, form.password);
        if (error) {
          toast.error(error.message);
          return;
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="p-8 max-w-md text-center bg-card text-card-foreground border-border">
          <h1 className="text-xl font-headline font-bold text-foreground mb-2">{t('company.join.invalidTitle')}</h1>
          <p className="text-muted-foreground mb-4">{t('company.join.invalidDesc')}</p>
          <Button onClick={() => navigate('/landing')} variant="outline">{t('common.buttons.back')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <SkillFormLogo iconClassName="h-5 w-5" textClassName="text-base" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 bg-card text-card-foreground border-border">
          <div className="text-center mb-6">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-16 w-16 mx-auto object-contain mb-3" />
            ) : (
              <div className="h-16 w-16 mx-auto bg-muted flex items-center justify-center mb-3">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <p className="text-sm text-muted-foreground">{t('company.join.joining')}</p>
            <h1 className="text-2xl font-headline font-bold text-foreground">{company.name}</h1>
          </div>

          <div className="flex border border-border mb-6">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium ${mode === 'register' ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}
            >
              {t('company.join.createAccount')}
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium ${mode === 'login' ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}
            >
              {t('auth.login.signIn')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('auth.register.firstNameLabel')}</Label>
                  <Input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="bg-background text-foreground" />
                </div>
                <div>
                  <Label>{t('auth.register.lastNameLabel')}</Label>
                  <Input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="bg-background text-foreground" />
                </div>
              </div>
            )}
            <div>
              <Label>{t('auth.register.emailLabel')}</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background text-foreground" />
            </div>
            <div>
              <Label>{t('auth.register.passwordLabel')}</Label>
              <Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-background text-foreground" />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (mode === 'register' ? t('company.join.joinNow') : t('auth.login.submitButton'))}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CompanyJoin;
