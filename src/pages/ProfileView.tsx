import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User } from '@phosphor-icons/react';
import { useProfileData } from '@/hooks/useProfileData';
import { ProfileHeader } from '@/components/profile/view/ProfileHeader';
import { QuickStatsBar } from '@/components/profile/view/QuickStatsBar';
import { OverviewTab } from '@/components/profile/view/OverviewTab';
import { ExperienceTab } from '@/components/profile/view/ExperienceTab';
import { SkillsLanguagesTab } from '@/components/profile/view/SkillsLanguagesTab';
import { ProjectsAwardsTab } from '@/components/profile/view/ProjectsAwardsTab';
import { AdditionalInfoTab } from '@/components/profile/view/AdditionalInfoTab';
import { ProfileSkeleton } from '@/components/profile/view/ProfileSkeleton';
import { SectionAdornment } from '@/components/brand/SectionAdornment';

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const isMe = !id || id === 'me';
  const profileId = isMe ? user?.id : id;

  const {
    profile,
    previousPositions,
    previousAgencies,
    brandsManaged,
    languages,
    recentProjects,
    awards,
    canEdit,
    isLoading,
    error,
  } = useProfileData(profileId);

  const isOrganizerOrAdmin = role === 'organizer_admin' || role === 'master_admin';
  const isMasterAdmin = role === 'master_admin';
  const showAdditionalTab = profile?.consulting_work || isMasterAdmin;

  // Admins should never land on /profile/me (they may not have an employee profile)
  useEffect(() => {
    if (!isMe || !role) return;

    if (role === 'master_admin') {
      navigate('/admin/master', { replace: true });
    } else if (role === 'organizer_admin') {
      navigate('/admin/organizer', { replace: true });
    } else if (role === 'department_director') {
      navigate('/admin/director', { replace: true });
    }
  }, [isMe, role, navigate]);

  // Employees without a profile should be sent to the profile wizard.
  useEffect(() => {
    if (!isMe) return;
    if (role !== 'employee') return;
    if (isLoading) return;

    if (!profile) {
      navigate('/profile/create', { replace: true });
    }
  }, [isMe, role, isLoading, profile, navigate]);

  if (isLoading) {
    return (
      <div className="p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  // Avoid flashing the "Profile not found" state while we redirect.
  if (isMe && role && role !== 'employee') {
    return (
      <div className="p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (isMe && role === 'employee' && !profile) {
    return (
      <div className="p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="glass-card rounded-xl p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('profile.notFound', 'Profile not found')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('profile.notFoundDescription', "This profile doesn't exist or you don't have permission to view it.")}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.actions.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.buttons.back')}
      </Button>

      <SectionAdornment index={1} total={1} label={t('profile.sectionLabel', 'Profile')} align="left" />

      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        canEdit={canEdit}
        isOrganizerOrAdmin={isOrganizerOrAdmin}
      />

      {/* Quick Stats Bar */}
      <QuickStatsBar
        profile={profile}
        languages={languages}
        brandsManaged={brandsManaged}
        awards={awards}
      />

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-card/50 border border-border/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t('profile.tabs.overview', 'Overview')}
          </TabsTrigger>
          <TabsTrigger value="experience" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t('profile.tabs.experience', 'Experience')}
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t('profile.tabs.skills', 'Skills & Languages')}
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t('profile.tabs.projects', 'Projects & Awards')}
          </TabsTrigger>
          {showAdditionalTab && (
            <TabsTrigger value="additional" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t('profile.tabs.additional', 'Additional Info')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab profile={profile} onNavigateToTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <ExperienceTab
            profile={profile}
            previousPositions={previousPositions}
            previousAgencies={previousAgencies}
          />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SkillsLanguagesTab
            languages={languages}
            brandsManaged={brandsManaged}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsAwardsTab
            recentProjects={recentProjects}
            awards={awards}
          />
        </TabsContent>

        {showAdditionalTab && (
          <TabsContent value="additional" className="mt-6">
            <AdditionalInfoTab
              profile={profile}
              isMasterAdmin={isMasterAdmin}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProfileView;
