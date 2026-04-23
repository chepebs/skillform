import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CaretRight as ChevronRight, CaretLeft as ChevronLeft, Check, CircleNotch as Loader2, FloppyDisk as Save, ArrowLeft, User, SignOut as LogOut } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { SkillFormLogo } from '@/components/SkillFormLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import StepIndicator from '@/components/profile/StepIndicator';
import BasicInfoStep from '@/components/profile/steps/BasicInfoStep';
import ProfessionalInfoStep from '@/components/profile/steps/ProfessionalInfoStep';
import EducationStep from '@/components/profile/steps/EducationStep';
import PerformanceStep from '@/components/profile/steps/PerformanceStep';
import BrandsProjectsStep from '@/components/profile/steps/BrandsProjectsStep';
import LanguagesStep from '@/components/profile/steps/LanguagesStep';
import SkillsStep from '@/components/profile/steps/SkillsStep';
import AwardsStep from '@/components/profile/steps/AwardsStep';
import ReviewStep from '@/components/profile/steps/ReviewStep';

import {
  basicInfoSchema,
  professionalInfoSchema,
  educationSchema,
  performanceSchema,
  brandsProjectsSchema,
  languagesSchema,
  skillsSchema,
  awardsSchema,
  industriesSchema,
  ProfileFormData,
  BasicInfoData,
  ProfessionalInfoData,
  EducationData,
  PerformanceData,
  BrandsProjectsData,
  LanguagesData,
  SkillsData,
  AwardsData,
  IndustriesData,
} from '@/components/profile/types';
import IndustriesStep from '@/components/profile/steps/IndustriesStep';

const TOTAL_STEPS = 10;

const ProfileEdit: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user, role, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Determine the user ID to edit
  const profileUserId = id || user?.id;
  const isOwnProfile = profileUserId === user?.id;
  const canEdit = isOwnProfile || role === 'master_admin' || role === 'organizer_admin';

  // Form instances for each step
  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: { first_name: '', last_name: '', email: '', phone: '', avatar_url: '', linkedin_url: '', instagram_url: '', behance_url: '' },
  });

  const industriesForm = useForm<IndustriesData>({
    resolver: zodResolver(industriesSchema),
    defaultValues: { industries: [] },
  });

  const professionalForm = useForm<ProfessionalInfoData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: { country_id: '', agency_id: '', department_id: '', current_position: '', seniority_level: 'mid', previous_positions: [] },
  });

  const educationForm = useForm<EducationData>({
    resolver: zodResolver(educationSchema),
    defaultValues: { academic_degree: '', years_of_experience: 0, previous_agencies: [] },
  });

  const performanceForm = useForm<PerformanceData>({
    resolver: zodResolver(performanceSchema),
    defaultValues: { pitches_won: 0, pitches_participated: 0, brand_creations: 0, brand_refreshes: 0, effie_awards_won: 0, effie_awards_participated: 0 },
  });

  const brandsProjectsForm = useForm<BrandsProjectsData>({
    resolver: zodResolver(brandsProjectsSchema),
    defaultValues: { brands_managed: [], recent_projects: [] },
  });

  const languagesForm = useForm<LanguagesData>({
    resolver: zodResolver(languagesSchema),
    defaultValues: { languages: [] },
  });

  const skillsForm = useForm<SkillsData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { skills: [] },
  });

  const awardsForm = useForm<AwardsData>({
    resolver: zodResolver(awardsSchema),
    defaultValues: { awards: [], consulting_work: '' },
  });

  // Check permissions
  useEffect(() => {
    if (!canEdit) {
      toast.error(t('common.validation.unauthorized'));
      navigate('/403');
    }
  }, [canEdit, navigate, t]);

  // Load existing data on mount
  useEffect(() => {
    if (!profileUserId) return;

    const loadExistingData = async () => {
      setIsLoading(true);
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', profileUserId).maybeSingle();
        
        if (!profile) {
          toast.error(t('common.validation.notFound'));
          navigate(-1);
          return;
        }

        basicInfoForm.reset({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || '',
          linkedin_url: profile.linkedin_url || '',
          instagram_url: profile.instagram_url || '',
          behance_url: profile.behance_url || '',
        });
        professionalForm.reset({
          country_id: profile.country_id || '',
          agency_id: profile.agency_id || '',
          department_id: '',
          current_position: profile.current_position || '',
          seniority_level: ((profile as any).seniority_level as any) || 'mid',
          previous_positions: [],
        });
        educationForm.reset({
          academic_degree: profile.academic_degree || '',
          years_of_experience: profile.years_of_experience || 0,
          previous_agencies: [],
        });
        performanceForm.reset({
          pitches_won: profile.pitches_won || 0,
          pitches_participated: profile.pitches_participated || 0,
          brand_creations: profile.brand_creations || 0,
          brand_refreshes: profile.brand_refreshes || 0,
          effie_awards_won: profile.effie_awards_won || 0,
          effie_awards_participated: profile.effie_awards_participated || 0,
        });
        awardsForm.setValue('consulting_work', profile.consulting_work || '');

        // Load related data
        const [positionsRes, agenciesRes, brandsRes, projectsRes, languagesRes, skillsRes, awardsRes, industriesRes] = await Promise.all([
          supabase.from('previous_positions').select('*').eq('user_id', profileUserId),
          supabase.from('previous_agencies').select('*').eq('user_id', profileUserId),
          supabase.from('brands_managed').select('*').eq('user_id', profileUserId),
          supabase.from('recent_projects').select('*').eq('user_id', profileUserId),
          supabase.from('employee_languages').select('*').eq('user_id', profileUserId),
          supabase.from('employee_skills').select('*').eq('user_id', profileUserId),
          supabase.from('awards').select('*').eq('user_id', profileUserId),
          supabase.from('employee_industries').select('*, industry:industries(*)').eq('user_id', profileUserId),
        ]);

        if (positionsRes.data?.length) professionalForm.setValue('previous_positions', positionsRes.data);
        if (agenciesRes.data?.length) educationForm.setValue('previous_agencies', agenciesRes.data);
        if (brandsRes.data?.length) brandsProjectsForm.setValue('brands_managed', brandsRes.data);
        if (projectsRes.data?.length) brandsProjectsForm.setValue('recent_projects', projectsRes.data);
        if (languagesRes.data?.length) languagesForm.setValue('languages', languagesRes.data);
        if (skillsRes.data?.length) skillsForm.setValue('skills', skillsRes.data);
        if (awardsRes.data?.length) awardsForm.setValue('awards', awardsRes.data);
        if (industriesRes.data?.length) {
          industriesForm.setValue('industries', industriesRes.data.map(ind => ({
            industry_id: ind.industry_id,
            years_experience: ind.years_experience || 0,
          })));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error(t('common.messages.error'));
      } finally {
        setIsLoading(false);
      }
    };
    loadExistingData();
  }, [profileUserId]);

  const getAllFormData = (): ProfileFormData => ({
    basicInfo: basicInfoForm.getValues(),
    professionalInfo: professionalForm.getValues(),
    education: educationForm.getValues(),
    performance: performanceForm.getValues(),
    brandsProjects: brandsProjectsForm.getValues(),
    languages: languagesForm.getValues(),
    skills: skillsForm.getValues(),
    awards: awardsForm.getValues(),
    industries: industriesForm.getValues(),
  });

  const saveDraft = useCallback(async () => {
    if (!profileUserId) return;
    setIsSaving(true);
    try {
      const data = getAllFormData();
      await supabase.from('profiles').update({
        first_name: data.basicInfo.first_name,
        last_name: data.basicInfo.last_name,
        phone: data.basicInfo.phone,
        avatar_url: data.basicInfo.avatar_url,
        linkedin_url: data.basicInfo.linkedin_url || null,
        instagram_url: data.basicInfo.instagram_url || null,
        behance_url: data.basicInfo.behance_url || null,
        country_id: data.professionalInfo.country_id || null,
        agency_id: data.professionalInfo.agency_id || null,
        current_position: data.professionalInfo.current_position,
        seniority_level: data.professionalInfo.seniority_level || 'mid',
        academic_degree: data.education.academic_degree,
        years_of_experience: data.education.years_of_experience,
        pitches_won: data.performance.pitches_won,
        pitches_participated: data.performance.pitches_participated,
        brand_creations: data.performance.brand_creations,
        brand_refreshes: data.performance.brand_refreshes,
        effie_awards_won: data.performance.effie_awards_won,
        effie_awards_participated: data.performance.effie_awards_participated,
        consulting_work: data.awards.consulting_work,
      }).eq('user_id', profileUserId);
      setLastSaved(new Date());
      toast.success(t('profile.creation.draftSaved'));
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('common.messages.error'));
    } finally {
      setIsSaving(false);
    }
  }, [profileUserId, t]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isLoading) return;
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, 30000);
    return () => clearInterval(autoSaveTimerRef.current);
  }, [saveDraft, isLoading]);

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1: return await basicInfoForm.trigger();
      case 2: return await professionalForm.trigger();
      case 3: return await educationForm.trigger();
      case 4: return await performanceForm.trigger();
      case 5: return await brandsProjectsForm.trigger();
      case 6: return await languagesForm.trigger();
      case 7: return await skillsForm.trigger();
      case 8: return true; // Awards optional
      default: return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!profileUserId) return;
    setIsSubmitting(true);
    try {
      const data = getAllFormData();

      // Save profile
      await supabase.from('profiles').update({
        first_name: data.basicInfo.first_name,
        last_name: data.basicInfo.last_name,
        phone: data.basicInfo.phone,
        avatar_url: data.basicInfo.avatar_url,
        linkedin_url: data.basicInfo.linkedin_url || null,
        instagram_url: data.basicInfo.instagram_url || null,
        behance_url: data.basicInfo.behance_url || null,
        country_id: data.professionalInfo.country_id || null,
        agency_id: data.professionalInfo.agency_id || null,
        current_position: data.professionalInfo.current_position,
        seniority_level: data.professionalInfo.seniority_level || 'mid',
        academic_degree: data.education.academic_degree,
        years_of_experience: data.education.years_of_experience,
        pitches_won: data.performance.pitches_won,
        pitches_participated: data.performance.pitches_participated,
        brand_creations: data.performance.brand_creations,
        brand_refreshes: data.performance.brand_refreshes,
        effie_awards_won: data.performance.effie_awards_won,
        effie_awards_participated: data.performance.effie_awards_participated,
        consulting_work: data.awards.consulting_work,
      }).eq('user_id', profileUserId);

      // Save related tables
      await supabase.from('previous_positions').delete().eq('user_id', profileUserId);
      const validPositions = data.professionalInfo.previous_positions.filter(p => p.position_title && p.company);
      if (validPositions.length > 0) {
        await supabase.from('previous_positions').insert(
          validPositions.map((p) => ({ position_title: p.position_title, company: p.company, start_date: p.start_date || null, end_date: p.end_date || null, description: p.description || null, user_id: profileUserId }))
        );
      }

      await supabase.from('previous_agencies').delete().eq('user_id', profileUserId);
      const validAgencies = data.education.previous_agencies.filter(a => a.agency_name && a.role);
      if (validAgencies.length > 0) {
        await supabase.from('previous_agencies').insert(
          validAgencies.map((a) => ({ agency_name: a.agency_name, role: a.role, start_date: a.start_date || null, end_date: a.end_date || null, user_id: profileUserId }))
        );
      }

      await supabase.from('brands_managed').delete().eq('user_id', profileUserId);
      const validBrands = data.brandsProjects.brands_managed.filter(b => b.brand_name);
      if (validBrands.length > 0) {
        await supabase.from('brands_managed').insert(
          validBrands.map((b) => ({ brand_name: b.brand_name, description: b.description || null, years_managed: b.years_managed || null, user_id: profileUserId }))
        );
      }

      await supabase.from('recent_projects').delete().eq('user_id', profileUserId);
      const validProjects = data.brandsProjects.recent_projects.filter(p => p.project_name);
      if (validProjects.length > 0) {
        await supabase.from('recent_projects').insert(
          validProjects.map((p) => ({ project_name: p.project_name, brand: p.brand || null, description: p.description || null, project_year: p.project_year || null, project_month: p.project_month || null, role_in_project: p.role_in_project || null, key_results: p.key_results || null, user_id: profileUserId }))
        );
      }

      await supabase.from('employee_languages').delete().eq('user_id', profileUserId);
      const validLanguages = data.languages.languages.filter(l => l.language);
      if (validLanguages.length > 0) {
        await supabase.from('employee_languages').insert(
          validLanguages.map((l) => ({ language: l.language, speaking_level: l.speaking_level, reading_level: l.reading_level, writing_level: l.writing_level, is_native: l.is_native, user_id: profileUserId }))
        );
      }

      await supabase.from('awards').delete().eq('user_id', profileUserId);
      const validAwards = data.awards.awards.filter(a => a.award_name);
      if (validAwards.length > 0) {
        await supabase.from('awards').insert(
          validAwards.map((a) => ({ award_name: a.award_name, award_type: a.award_type || null, category: a.category || null, award_year: a.award_year || null, won: a.won, description: a.description || null, user_id: profileUserId }))
        );
      }

      // Save skills
      await supabase.from('employee_skills').delete().eq('user_id', profileUserId);
      const validSkills = data.skills.skills.filter(s => s.skill_name && s.proficiency_level >= 1);
      if (validSkills.length > 0) {
        await supabase.from('employee_skills').insert(
          validSkills.map((s) => ({ 
            skill_name: s.skill_name, 
            skill_category: s.skill_category, 
            proficiency_level: s.proficiency_level, 
            years_experience: s.years_experience || null, 
            user_id: profileUserId 
          }))
        );
      }

      // Save industries
      await supabase.from('employee_industries').delete().eq('user_id', profileUserId);
      const validIndustries = data.industries.industries.filter(i => i.industry_id);
      if (validIndustries.length > 0) {
        await supabase.from('employee_industries').insert(
          validIndustries.map((i) => ({
            industry_id: i.industry_id,
            years_experience: i.years_experience || 0,
            user_id: profileUserId
          }))
        );
      }

      if (isOwnProfile) {
        await refreshProfile();
      }
      
      toast.success(t('common.messages.saved'));
      navigate(isOwnProfile ? '/profile/me' : `/profile/${profileUserId}`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(t('common.messages.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <FormProvider {...basicInfoForm}><BasicInfoStep form={basicInfoForm} userId={profileUserId || ''} /></FormProvider>;
      case 2: return <FormProvider {...professionalForm}><ProfessionalInfoStep form={professionalForm} /></FormProvider>;
      case 3: return <FormProvider {...educationForm}><EducationStep form={educationForm} /></FormProvider>;
      case 4: return <FormProvider {...performanceForm}><PerformanceStep form={performanceForm} /></FormProvider>;
      case 5: return <FormProvider {...brandsProjectsForm}><BrandsProjectsStep form={brandsProjectsForm} /></FormProvider>;
      case 6: return <FormProvider {...languagesForm}><LanguagesStep form={languagesForm} /></FormProvider>;
      case 7: return <FormProvider {...skillsForm}><SkillsStep form={skillsForm} /></FormProvider>;
      case 8: return <FormProvider {...industriesForm}><IndustriesStep form={industriesForm} /></FormProvider>;
      case 9: return <FormProvider {...awardsForm}><AwardsStep form={awardsForm} onSkip={handleNext} /></FormProvider>;
      case 10: return <ReviewStep data={getAllFormData()} onEdit={setCurrentStep} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <SkillFormLogo iconClassName="h-5 w-5" textClassName="text-sm" />
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-border">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{t('auth.myAccount')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border z-50">
              <DropdownMenuItem onClick={() => navigate('/profile/me')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                {t('profile.viewProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => { await signOut(); navigate('/login'); }} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 pt-24 pb-12 px-6 lg:px-10 max-w-6xl w-full mx-auto">
        {/* Header - left justified */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.buttons.back')}
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{t('common.actions.editProfile')}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> {t('profile.creation.savingDraft')}</>
            ) : lastSaved ? (
              <><Save className="h-3 w-3" /> {t('profile.creation.draftSaved')}</>
            ) : null}
          </div>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="border border-border p-6 sm:p-8 lg:p-10 bg-card">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious} className="border-border">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.buttons.back')}
              </Button>
            )}
            <Button variant="ghost" onClick={saveDraft} disabled={isSaving} className="text-muted-foreground">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t('common.buttons.saveDraft')}
            </Button>
          </div>

          {currentStep < TOTAL_STEPS ? (
            <Button onClick={handleNext} className="bg-primary text-primary-foreground">
              {t('common.buttons.next')} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary text-primary-foreground">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.messages.saving')}</>
              ) : (
                <><Check className="mr-2 h-4 w-4" /> {t('common.buttons.save')}</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Copyright Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        © Grupo Garnier. {t('common.labels.allRightsReserved')}
      </footer>
    </div>
  );
};

export default ProfileEdit;
