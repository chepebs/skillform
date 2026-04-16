import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { SkillFormLogo } from '@/components/SkillFormLogo';
import aideaformLogo from '@/assets/aideaform-logo.svg';
import { Users, Search, Shield, BarChart3, Globe, Folder, Award, Briefcase } from 'lucide-react';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-primary selection:text-primary-foreground">
      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] shadow-sm border-b border-border/50 dark:border-transparent">
        <div className="flex justify-between items-center px-6 sm:px-12 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-3 shrink-0">
            <img src={aideaformLogo} alt="aidea*form" className="h-3 shrink-0" />
            <span className="text-muted-foreground/40 text-xs">|</span>
            <SkillFormLogo iconClassName="h-4 w-4" textClassName="text-sm" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher compact />
            <div className="hidden sm:block"><ThemeToggle /></div>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors hidden sm:block px-3 py-2"
            >
              {t('auth.login.signIn', 'Login')}
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="accent-gradient font-bold py-2 px-6 rounded-full text-white text-sm"
            >
              {t('landing.getStarted', 'Get Started')} →
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative min-h-screen pt-24 overflow-hidden flex items-center justify-start">
          {/* Abstract Background */}
          <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 dark:opacity-20 pointer-events-none">
            <svg className="w-full h-full text-secondary" viewBox="0 0 800 800">
              <path d="M400 0 C600 0 800 200 800 400 S600 800 400 800 0 600 0 400 200 0 400 0" fill="none" stroke="currentColor" strokeDasharray="10 5" strokeWidth="0.5" />
              <circle cx="400" cy="400" r="300" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M100 100 L700 700" stroke="currentColor" strokeWidth="0.5" />
              <path d="M100 700 L700 100" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10">
            <div className="md:col-span-7 flex flex-col justify-center">
              <FadeIn>
                <div className="mb-6">
                  <SkillFormLogo iconClassName="h-7 w-7 sm:h-8 sm:w-8" textClassName="text-2xl sm:text-3xl" />
                </div>
                <h1 className="text-display-lg text-foreground mb-8">
                  {t('landing.hero.titlePart1', 'Discover &')}{' '}
                  <span className="text-primary">{t('landing.hero.titlePart2', 'Connect')}</span>{' '}
                  {t('landing.hero.titlePart3', 'With Your Team\'s Talent')}
                </h1>
              </FadeIn>

              <FadeIn delay={0.1}>
                <p className="text-lg sm:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                  {t('landing.hero.description', 'A centralized platform to explore profiles, skills, and expertise across Grupo Garnier. Find the right talent for every project.')}
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="accent-gradient text-white px-8 sm:px-10 py-4 rounded-full font-bold text-lg shadow-orange transition-all"
                  >
                    {t('landing.getStarted', 'Get Started')} →
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="glass-card text-foreground px-8 sm:px-10 py-4 rounded-full font-bold text-lg transition-all"
                  >
                    {t('landing.learnMore', 'Learn More')}
                  </motion.button>
                </div>
              </FadeIn>
            </div>

            {/* Hero Glass Card */}
            <div className="md:col-span-5 flex items-center justify-center relative">
              <FadeIn direction="right" delay={0.3}>
                <div className="glass-card p-6 rounded-xl shadow-2xl relative z-20 w-full rotate-3 transform">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-secondary font-headline font-bold uppercase tracking-widest text-xs">
                      {t('landing.hero.talentOverview', 'Talent Overview')}
                    </span>
                    <div className="flex gap-1 px-[10px]">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <div className="w-2 h-2 rounded-full bg-tertiary" />
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-32 w-full rounded-lg bg-surface-container-high flex items-end px-4 pb-4 gap-2">
                      <div className="w-full bg-secondary/20 h-[40%] rounded-sm" />
                      <div className="w-full bg-secondary/40 h-[60%] rounded-sm" />
                      <div className="w-full bg-secondary h-[90%] glow-line rounded-sm" />
                      <div className="w-full bg-secondary/30 h-[50%] rounded-sm" />
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-high p-4 rounded-lg">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold">{t('landing.hero.totalProfiles', 'Total Profiles')}</p>
                        <p className="text-xl font-headline font-bold text-primary">1,248</p>
                      </div>
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 dark:bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 dark:bg-secondary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>

        {/* ── FEATURES BENTO GRID ── */}
        <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-[1440px] mx-auto">
          <FadeIn>
            <div className="mb-16 md:mb-20 text-center md:text-left">
              <h2 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground">
                {t('landing.features.title', 'Everything You')}{' '}
                <span className="text-primary">{t('landing.features.titleAccent', 'Need')}</span>
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-lg">
                {t('landing.features.subtitle', 'A comprehensive talent management platform designed for modern organizations.')}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {/* Feature 1: Directory — 8 cols */}
            <FadeIn className="md:col-span-8">
              <div className="group glass-card p-8 sm:p-12 rounded-xl hover:border-secondary/30 transition-all cursor-default relative overflow-hidden h-full">
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                      <Search className="text-secondary h-7 w-7" />
                    </div>
                    <h3 className="font-headline text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                      {t('landing.features.directory.title', 'Talent Directory')}
                    </h3>
                    <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-md">
                      {t('landing.features.directory.desc', 'Search and filter through your entire organization. Find people by skills, departments, languages, and expertise areas.')}
                    </p>
                  </div>
                  <div className="mt-8 sm:mt-12 flex gap-3 flex-wrap">
                    <div className="px-4 py-2 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                      {t('landing.features.directory.tag1', 'Smart Filters')}
                    </div>
                    <div className="px-4 py-2 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                      {t('landing.features.directory.tag2', 'Real-time Search')}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Feature 2: Profiles — 4 cols */}
            <FadeIn delay={0.1} className="md:col-span-4">
              <div className="glass-card p-8 sm:p-12 rounded-xl hover:border-tertiary/30 transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="w-14 h-14 bg-tertiary/10 rounded-lg flex items-center justify-center mb-6">
                    <Users className="text-tertiary h-7 w-7" />
                  </div>
                  <h3 className="font-headline text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                    {t('landing.features.profiles.title', 'Rich Profiles')}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {t('landing.features.profiles.desc', 'Comprehensive talent profiles with skills, experience, awards, and project history.')}
                  </p>
                </div>
                <div className="pt-6 sm:pt-8 border-t border-outline-variant/10 mt-6 sm:mt-8">
                  <p className="text-sm font-bold text-tertiary">
                    {t('landing.features.profiles.stat', '10+ profile sections')}
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Feature 3: Groups — 4 cols */}
            <FadeIn delay={0.15} className="md:col-span-4">
              <div className="glass-card p-8 sm:p-12 rounded-xl hover:border-primary/30 transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <Folder className="text-primary h-7 w-7" />
                  </div>
                  <h3 className="font-headline text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                    {t('landing.features.groups.title', 'Team Groups')}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {t('landing.features.groups.desc', 'Organize talent into custom groups for projects, departments, and initiatives.')}
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Feature 4: Analytics — 8 cols */}
            <FadeIn delay={0.2} className="md:col-span-8">
              <div className="glass-card p-8 sm:p-12 rounded-xl hover:border-secondary/30 transition-all relative overflow-hidden h-full">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                  <div className="flex-1">
                    <h3 className="font-headline text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                      {t('landing.features.analytics.title', 'Talent Analytics')}
                    </h3>
                    <p className="text-on-surface-variant leading-relaxed">
                      {t('landing.features.analytics.desc', 'Get insights into skill distribution, experience levels, language capabilities, and department composition across your organization.')}
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="mt-8 text-secondary font-bold flex items-center gap-2 group"
                    >
                      {t('landing.features.analytics.cta', 'Explore Analytics')}
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
                    </button>
                  </div>
                  <div className="w-full md:w-1/2 bg-surface-container-low p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-secondary glow-line" />
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        {t('landing.features.analytics.skillMap', 'Skill Coverage')}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-secondary h-full w-3/4" />
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-secondary h-full w-1/2" />
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-secondary h-full w-4/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── CAPABILITIES ── */}
        <section className="py-24 sm:py-32 bg-surface-container-low relative">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn direction="left">
              <div>
                <h2 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight mb-8 text-foreground">
                  {t('landing.capabilities.titlePart1', 'Built for')}{' '}
                  <span className="text-primary">{t('landing.capabilities.titlePart2', 'Modern Teams')}</span>
                </h2>
                <p className="text-lg sm:text-xl text-on-surface-variant mb-12 leading-relaxed">
                  {t('landing.capabilities.desc', 'Every feature designed to help you discover, organize, and leverage the talent within your organization.')}
                </p>
                <div className="space-y-8">
                  {[
                    { icon: Globe, label: t('landing.capabilities.multilingual', 'Multi-language Support'), value: 'EN / ES' },
                    { icon: Shield, label: t('landing.capabilities.roleBased', 'Role-based Access'), value: t('landing.capabilities.roles', '4 Roles') },
                    { icon: Award, label: t('landing.capabilities.awards', 'Awards & Recognition'), value: t('landing.capabilities.tracking', 'Full Tracking') },
                    { icon: Briefcase, label: t('landing.capabilities.experience', 'Experience Management'), value: t('landing.capabilities.comprehensive', 'Complete') },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">{item.label}</p>
                      </div>
                      <span className="text-primary font-headline font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="glass-card p-8 sm:p-12 rounded-xl text-center relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-secondary text-secondary-foreground font-bold rounded-full text-xs uppercase tracking-widest shadow-xl">
                  {t('landing.capabilities.badge', 'Platform Stats')}
                </div>
                <div className="mt-6">
                  <span className="text-6xl sm:text-7xl lg:text-8xl font-headline font-bold tracking-tighter text-foreground">100%</span>
                  <p className="text-on-surface-variant text-lg mt-4">{t('landing.capabilities.coverage', 'Organization Coverage')}</p>
                </div>
                <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-surface-container rounded-lg">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">{t('landing.capabilities.departments', 'Departments')}</p>
                    <p className="text-lg sm:text-xl font-headline font-bold text-secondary">12+</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-surface-container rounded-lg">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">{t('landing.capabilities.skills', 'Skills Tracked')}</p>
                    <p className="text-lg sm:text-xl font-headline font-bold text-tertiary">200+</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-surface-container rounded-lg">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">{t('landing.capabilities.countries', 'Countries')}</p>
                    <p className="text-lg sm:text-xl font-headline font-bold text-primary">15+</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  className="w-full mt-12 accent-gradient text-white font-bold py-5 rounded-xl text-lg transition-all"
                >
                  {t('landing.getStarted', 'Get Started')} →
                </motion.button>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-[1440px] mx-auto">
          <FadeIn>
            <div className="mb-16 md:mb-20 text-center md:text-left">
              <h2 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground">
                {t('landing.trust.title', 'Trusted by')}{' '}
                <span className="text-primary">{t('landing.trust.titleAccent', 'Teams')}</span>
              </h2>
              <p className="text-on-surface-variant text-lg">
                {t('landing.trust.subtitle', 'See how teams across Grupo Garnier use Skill*form every day.')}
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { quote: t('landing.trust.t1.quote', '"Skill*form transformed how we find the right people for our projects. The search and filter capabilities are incredible."'), name: t('landing.trust.t1.name', 'María García'), role: t('landing.trust.t1.role', 'Creative Director') },
              { quote: t('landing.trust.t2.quote', '"Having all our team\'s skills and experience in one place has made resource allocation so much more efficient."'), name: t('landing.trust.t2.name', 'Carlos Rodríguez'), role: t('landing.trust.t2.role', 'Department Head') },
              { quote: t('landing.trust.t3.quote', '"The multi-language support and role-based access make it perfect for our international team structure."'), name: t('landing.trust.t3.name', 'Ana Martínez'), role: t('landing.trust.t3.role', 'HR Manager') },
            ].map((tm) => (
              <StaggerItem key={tm.name}>
                <div className="glass-card rounded-xl h-full flex flex-col p-8 sm:p-10">
                  <div className="flex gap-1 mb-6 sm:mb-8">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed text-foreground mb-8 sm:mb-10 flex-1">{tm.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{tm.name}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{tm.role}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full py-16 sm:py-20 px-6 sm:px-12 border-t border-border/50 bg-background">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col gap-3 mb-6 sm:mb-8">
              <SkillFormLogo iconClassName="h-5 w-5" textClassName="text-base" />
              <img src={aideaformLogo} alt="aidea*form" className="h-3 shrink-0 w-fit" />
            </div>
            <p className="text-sm text-on-surface-variant/60 mb-6">
              {t('landing.footer.tagline', 'Discover and connect with talent across your organization.')}
            </p>
          </div>

          {[
            { title: t('landing.footer.product', 'Product'), links: [t('landing.footer.features', 'Features'), t('landing.footer.directory', 'Directory'), t('landing.footer.profiles', 'Profiles'), t('landing.footer.analytics', 'Analytics')] },
            { title: t('landing.footer.company', 'Company'), links: [t('landing.footer.about', 'About'), t('landing.footer.careers', 'Careers'), t('landing.footer.contact', 'Contact')] },
            { title: t('landing.footer.resources', 'Resources'), links: [t('landing.footer.help', 'Help Center'), t('landing.footer.guides', 'Guides'), t('landing.footer.support', 'Support')] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-headline font-bold mb-6 sm:mb-8 text-primary text-sm">{section.title}</h4>
              <ul className="space-y-3 sm:space-y-4 text-sm">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-on-surface-variant/50 hover:text-secondary transition-all">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-[1440px] mx-auto mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-on-surface-variant/40">
          <p>© Grupo Garnier. {t('common.labels.allRightsReserved', 'All rights reserved.')}</p>
          <div className="flex gap-6 sm:gap-8">
            <a href="#" className="hover:text-foreground transition-all">{t('landing.footer.privacy', 'Privacy')}</a>
            <a href="#" className="hover:text-foreground transition-all">{t('landing.footer.terms', 'Terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
