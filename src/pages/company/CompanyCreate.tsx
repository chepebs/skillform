import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, Check, Copy, Building2, Image as ImageIcon, CreditCard, Sparkles } from 'lucide-react';
import { SkillFormLogo } from '@/components/SkillFormLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { cn } from '@/lib/utils';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

const CompanyCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [data, setData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    industry: '',
  });

  const update = (k: keyof typeof data, v: string) =>
    setData(prev => ({ ...prev, [k]: k === 'slug' ? slugify(v) : v, ...(k === 'name' && !prev.slug ? { slug: slugify(v) } : {}) }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('company.create.logoTooLarge'));
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      let logo_url: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split('.').pop() || 'png';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('company-logos')
          .upload(path, logoFile, { upsert: true });
        if (upErr) throw upErr;
        logo_url = supabase.storage.from('company-logos').getPublicUrl(path).data.publicUrl;
      }

      const { data: company, error: cErr } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          website: data.website || null,
          industry: data.industry || null,
          logo_url,
          created_by: user.id,
        })
        .select('id, slug, invite_token')
        .single();
      if (cErr) throw cErr;

      // Attach creator profile to company + mark complete
      await supabase.from('profiles')
        .update({ company_id: company.id, profile_completed: true })
        .eq('user_id', user.id);

      // Promote to master_admin within their company
      await supabase.from('user_roles')
        .upsert({ user_id: user.id, role: 'master_admin' }, { onConflict: 'user_id,role' });

      const url = `${window.location.origin}/c/${company.slug}/join?token=${company.invite_token}`;
      setInviteUrl(url);
      await refreshProfile();
      setStep(5);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || t('common.messages.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success(t('company.create.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { id: 1, label: t('company.create.step1'), icon: Building2 },
    { id: 2, label: t('company.create.step2'), icon: ImageIcon },
    { id: 3, label: t('company.create.step3'), icon: Sparkles },
    { id: 4, label: t('company.create.step4'), icon: CreditCard },
  ];

  const canNext1 = data.name.trim().length > 0 && data.slug.trim().length > 0;

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

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        {step < 5 && (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-headline font-bold text-foreground mb-2">
                {t('company.create.title')}
              </h1>
              <p className="text-muted-foreground">{t('company.create.subtitle')}</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-10">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = step === s.id;
                const done = step > s.id;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className={cn(
                        'w-10 h-10 flex items-center justify-center border-2 transition-colors',
                        active && 'border-foreground bg-foreground text-background',
                        done && 'border-foreground bg-foreground text-background',
                        !active && !done && 'border-border bg-background text-muted-foreground',
                      )}>
                        {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className={cn('text-xs text-center', active || done ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={cn('h-px flex-1 mb-6', step > s.id ? 'bg-foreground' : 'bg-border')} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}

        <Card className="p-8 bg-card text-card-foreground border-border">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-foreground mb-1">{t('company.create.step1Title')}</h2>
                <p className="text-sm text-muted-foreground">{t('company.create.step1Desc')}</p>
              </div>
              <div className="space-y-2">
                <Label>{t('company.create.nameLabel')} *</Label>
                <Input
                  value={data.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={t('company.create.namePlaceholder')}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('company.create.slugLabel')} *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{window.location.host}/c/</span>
                  <Input
                    value={data.slug}
                    onChange={(e) => update('slug', e.target.value)}
                    placeholder="acme-corp"
                    className="bg-background text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t('company.create.slugHint')}</p>
              </div>
              <div className="space-y-2">
                <Label>{t('company.create.industryLabel')}</Label>
                <Input
                  value={data.industry}
                  onChange={(e) => update('industry', e.target.value)}
                  placeholder={t('company.create.industryPlaceholder')}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('company.create.websiteLabel')}</Label>
                <Input
                  value={data.website}
                  onChange={(e) => update('website', e.target.value)}
                  placeholder="https://acme.com"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('company.create.descriptionLabel')}</Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder={t('company.create.descriptionPlaceholder')}
                  className="bg-background text-foreground min-h-[100px]"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!canNext1}>
                  {t('common.buttons.next')}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-foreground mb-1">{t('company.create.step2Title')}</h2>
                <p className="text-sm text-muted-foreground">{t('company.create.step2Desc')}</p>
              </div>
              <div className="flex flex-col items-center gap-4 py-6">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo preview" className="h-32 w-32 object-contain border border-border bg-background p-2" />
                ) : (
                  <div className="h-32 w-32 border-2 border-dashed border-border flex items-center justify-center bg-muted">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                  <span className="inline-flex items-center gap-2 px-4 py-2 border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors">
                    <Upload className="h-4 w-4" />
                    {logoPreview ? t('company.create.changeLogo') : t('company.create.uploadLogo')}
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">{t('company.create.logoHint')}</p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>{t('common.buttons.back')}</Button>
                <Button onClick={() => setStep(3)}>{t('common.buttons.next')}</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-foreground mb-1">{t('company.create.step3Title')}</h2>
                <p className="text-sm text-muted-foreground">{t('company.create.step3Desc')}</p>
              </div>
              <div className="p-4 bg-muted border border-border space-y-2">
                <p className="text-sm text-foreground"><span className="text-muted-foreground">{t('company.create.signedInAs')}:</span> {user?.email}</p>
                <p className="text-sm text-foreground"><span className="text-muted-foreground">{t('company.create.youWillBeAdmin')}.</span></p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>{t('common.buttons.back')}</Button>
                <Button onClick={() => setStep(4)}>{t('common.buttons.next')}</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-foreground mb-1">{t('company.create.step4Title')}</h2>
                <p className="text-sm text-muted-foreground">{t('company.create.step4Desc')}</p>
              </div>
              <div className="border-2 border-foreground p-6 bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">{t('company.create.currentPlan')}</p>
                    <p className="text-2xl font-headline font-bold text-foreground">{t('company.create.freeTesting')}</p>
                  </div>
                  <span className="px-3 py-1 bg-foreground text-background text-xs font-medium">{t('company.create.activeBadge')}</span>
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-foreground" /> {t('company.create.feature1')}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-foreground" /> {t('company.create.feature2')}</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-foreground" /> {t('company.create.feature3')}</li>
                </ul>
                <button disabled className="mt-4 text-sm text-muted-foreground underline disabled:opacity-50 cursor-not-allowed">
                  {t('company.create.addPaymentLater')}
                </button>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>{t('common.buttons.back')}</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('company.create.creating')}</> : t('company.create.finish')}
                </Button>
              </div>
            </div>
          )}

          {step === 5 && inviteUrl && (
            <div className="space-y-6 text-center py-6">
              <div className="mx-auto w-16 h-16 bg-foreground text-background flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-headline font-bold text-foreground mb-2">{t('company.create.successTitle')}</h2>
                <p className="text-muted-foreground">{t('company.create.successDesc')}</p>
              </div>
              <div className="bg-muted border border-border p-4 text-left">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t('company.create.inviteUrl')}</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={inviteUrl} readOnly className="bg-background text-foreground font-mono text-sm" />
                  <Button onClick={copyInvite} variant="outline">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t('company.create.inviteHint')}</p>
              </div>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                {t('company.create.goToDashboard')}
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default CompanyCreate;
