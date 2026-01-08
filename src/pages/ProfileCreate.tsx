import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Confetti from 'react-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  ProfileFormData,
  BasicInfoData,
  ProfessionalInfoData,
  EducationData,
  PerformanceData,
  BrandsProjectsData,
  LanguagesData,
  SkillsData,
  AwardsData,
} from '@/components/profile/types';

const TOTAL_STEPS = 9;

const ProfileCreate: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  // Form instances for each step
  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: { first_name: '', last_name: '', email: user?.email || '', phone: '', avatar_url: '' },
  });

  const professionalForm = useForm<ProfessionalInfoData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: { country_id: '', agency_id: '', department_id: '', current_position: '', previous_positions: [] },
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
    defaultValues: { brands_managed: [], recent_projects: [{ project_name: '', brand: '', description: '', project_year: 2025, project_month: 1, role_in_project: '', key_results: '' }] },
  });

  const languagesForm = useForm<LanguagesData>({
    resolver: zodResolver(languagesSchema),
    defaultValues: { languages: [{ language: '', speaking_level: 50, reading_level: 50, writing_level: 50, is_native: false }] },
  });

  const skillsForm = useForm<SkillsData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { skills: [] },
  });

  const awardsForm = useForm<AwardsData>({
    resolver: zodResolver(awardsSchema),
    defaultValues: { awards: [], consulting_work: '' },
  });

  // Load existing data on mount
  useEffect(() => {
    if (!user) return;
    const loadExistingData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (profile) {
        basicInfoForm.reset({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || '',
        });
        professionalForm.reset({
          country_id: profile.country_id || '',
          agency_id: profile.agency_id || '',
          department_id: '',
          current_position: profile.current_position || '',
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
      }

      // Load related data
      const [positionsRes, agenciesRes, brandsRes, projectsRes, languagesRes, skillsRes, awardsRes] = await Promise.all([
        supabase.from('previous_positions').select('*').eq('user_id', user.id),
        supabase.from('previous_agencies').select('*').eq('user_id', user.id),
        supabase.from('brands_managed').select('*').eq('user_id', user.id),
        supabase.from('recent_projects').select('*').eq('user_id', user.id),
        supabase.from('employee_languages').select('*').eq('user_id', user.id),
        supabase.from('employee_skills').select('*').eq('user_id', user.id),
        supabase.from('awards').select('*').eq('user_id', user.id),
      ]);

      if (positionsRes.data?.length) professionalForm.setValue('previous_positions', positionsRes.data);
      if (agenciesRes.data?.length) educationForm.setValue('previous_agencies', agenciesRes.data);
      if (brandsRes.data?.length) brandsProjectsForm.setValue('brands_managed', brandsRes.data);
      if (projectsRes.data?.length) brandsProjectsForm.setValue('recent_projects', projectsRes.data);
      if (languagesRes.data?.length) languagesForm.setValue('languages', languagesRes.data);
      if (skillsRes.data?.length) skillsForm.setValue('skills', skillsRes.data);
      if (awardsRes.data?.length) awardsForm.setValue('awards', awardsRes.data);
    };
    loadExistingData();
  }, [user]);

  const getAllFormData = (): ProfileFormData => ({
    basicInfo: basicInfoForm.getValues(),
    professionalInfo: professionalForm.getValues(),
    education: educationForm.getValues(),
    performance: performanceForm.getValues(),
    brandsProjects: brandsProjectsForm.getValues(),
    languages: languagesForm.getValues(),
    skills: skillsForm.getValues(),
    awards: awardsForm.getValues(),
  });

  const saveDraft = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const data = getAllFormData();
      await supabase.from('profiles').update({
        first_name: data.basicInfo.first_name,
        last_name: data.basicInfo.last_name,
        phone: data.basicInfo.phone,
        avatar_url: data.basicInfo.avatar_url,
        country_id: data.professionalInfo.country_id || null,
        agency_id: data.professionalInfo.agency_id || null,
        current_position: data.professionalInfo.current_position,
        academic_degree: data.education.academic_degree,
        years_of_experience: data.education.years_of_experience,
        pitches_won: data.performance.pitches_won,
        pitches_participated: data.performance.pitches_participated,
        brand_creations: data.performance.brand_creations,
        brand_refreshes: data.performance.brand_refreshes,
        effie_awards_won: data.performance.effie_awards_won,
        effie_awards_participated: data.performance.effie_awards_participated,
        consulting_work: data.awards.consulting_work,
      }).eq('user_id', user.id);
      setLastSaved(new Date());
      toast.success('Draft saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, 30000);
    return () => clearInterval(autoSaveTimerRef.current);
  }, [saveDraft]);

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
    if (!user) return;
    setIsSubmitting(true);
    try {
      const data = getAllFormData();

      // Save profile
      await supabase.from('profiles').update({
        first_name: data.basicInfo.first_name,
        last_name: data.basicInfo.last_name,
        phone: data.basicInfo.phone,
        avatar_url: data.basicInfo.avatar_url,
        country_id: data.professionalInfo.country_id || null,
        agency_id: data.professionalInfo.agency_id || null,
        current_position: data.professionalInfo.current_position,
        academic_degree: data.education.academic_degree,
        years_of_experience: data.education.years_of_experience,
        pitches_won: data.performance.pitches_won,
        pitches_participated: data.performance.pitches_participated,
        brand_creations: data.performance.brand_creations,
        brand_refreshes: data.performance.brand_refreshes,
        effie_awards_won: data.performance.effie_awards_won,
        effie_awards_participated: data.performance.effie_awards_participated,
        consulting_work: data.awards.consulting_work,
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
      }).eq('user_id', user.id);

      // Save related tables
      await supabase.from('previous_positions').delete().eq('user_id', user.id);
      const validPositions = data.professionalInfo.previous_positions.filter(p => p.position_title && p.company);
      if (validPositions.length > 0) {
        await supabase.from('previous_positions').insert(
          validPositions.map((p) => ({ position_title: p.position_title, company: p.company, start_date: p.start_date || null, end_date: p.end_date || null, description: p.description || null, user_id: user.id }))
        );
      }

      await supabase.from('previous_agencies').delete().eq('user_id', user.id);
      const validAgencies = data.education.previous_agencies.filter(a => a.agency_name && a.role);
      if (validAgencies.length > 0) {
        await supabase.from('previous_agencies').insert(
          validAgencies.map((a) => ({ agency_name: a.agency_name, role: a.role, start_date: a.start_date || null, end_date: a.end_date || null, user_id: user.id }))
        );
      }

      await supabase.from('brands_managed').delete().eq('user_id', user.id);
      const validBrands = data.brandsProjects.brands_managed.filter(b => b.brand_name);
      if (validBrands.length > 0) {
        await supabase.from('brands_managed').insert(
          validBrands.map((b) => ({ brand_name: b.brand_name, description: b.description || null, years_managed: b.years_managed || null, user_id: user.id }))
        );
      }

      await supabase.from('recent_projects').delete().eq('user_id', user.id);
      const validProjects = data.brandsProjects.recent_projects.filter(p => p.project_name);
      if (validProjects.length > 0) {
        await supabase.from('recent_projects').insert(
          validProjects.map((p) => ({ project_name: p.project_name, brand: p.brand || null, description: p.description || null, project_year: p.project_year || null, project_month: p.project_month || null, role_in_project: p.role_in_project || null, key_results: p.key_results || null, user_id: user.id }))
        );
      }

      await supabase.from('employee_languages').delete().eq('user_id', user.id);
      const validLanguages = data.languages.languages.filter(l => l.language);
      if (validLanguages.length > 0) {
        await supabase.from('employee_languages').insert(
          validLanguages.map((l) => ({ language: l.language, speaking_level: l.speaking_level, reading_level: l.reading_level, writing_level: l.writing_level, is_native: l.is_native, user_id: user.id }))
        );
      }

      await supabase.from('awards').delete().eq('user_id', user.id);
      const validAwards = data.awards.awards.filter(a => a.award_name);
      if (validAwards.length > 0) {
        await supabase.from('awards').insert(
          validAwards.map((a) => ({ award_name: a.award_name, award_type: a.award_type || null, category: a.category || null, award_year: a.award_year || null, won: a.won, description: a.description || null, user_id: user.id }))
        );
      }

      // Save skills
      await supabase.from('employee_skills').delete().eq('user_id', user.id);
      const validSkills = data.skills.skills.filter(s => s.skill_name && s.proficiency_level >= 1);
      if (validSkills.length > 0) {
        await supabase.from('employee_skills').insert(
          validSkills.map((s) => ({ 
            skill_name: s.skill_name, 
            skill_category: s.skill_category, 
            proficiency_level: s.proficiency_level, 
            years_experience: s.years_experience || null, 
            user_id: user.id 
          }))
        );
      }

      await refreshProfile();
      setShowConfetti(true);
      toast.success('Profile completed successfully!');
      setTimeout(() => navigate('/profile/me'), 2000);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <FormProvider {...basicInfoForm}><BasicInfoStep form={basicInfoForm} userId={user?.id || ''} /></FormProvider>;
      case 2: return <FormProvider {...professionalForm}><ProfessionalInfoStep form={professionalForm} /></FormProvider>;
      case 3: return <FormProvider {...educationForm}><EducationStep form={educationForm} /></FormProvider>;
      case 4: return <FormProvider {...performanceForm}><PerformanceStep form={performanceForm} /></FormProvider>;
      case 5: return <FormProvider {...brandsProjectsForm}><BrandsProjectsStep form={brandsProjectsForm} /></FormProvider>;
      case 6: return <FormProvider {...languagesForm}><LanguagesStep form={languagesForm} /></FormProvider>;
      case 7: return <FormProvider {...skillsForm}><SkillsStep form={skillsForm} /></FormProvider>;
      case 8: return <FormProvider {...awardsForm}><AwardsStep form={awardsForm} onSkip={handleNext} /></FormProvider>;
      case 9: return <ReviewStep data={getAllFormData()} onEdit={setCurrentStep} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pattern-bg flex items-center justify-center p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div className="w-full max-w-3xl">
        {/* Header with save indicator */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
            ) : lastSaved ? (
              <><Save className="h-3 w-3" /> Saved</>
            ) : null}
          </div>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-border">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious} className="border-dark-border">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              <Button variant="ghost" onClick={saveDraft} disabled={isSaving} className="text-muted-foreground">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Draft
              </Button>
            </div>

            {currentStep < TOTAL_STEPS ? (
              <Button onClick={handleNext} className="bg-gradient-primary shadow-primary">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-primary shadow-primary">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Check className="mr-2 h-4 w-4" /> Complete Profile</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCreate;
