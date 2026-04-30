import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MagnifyingGlass, Users, FolderOpen, Briefcase, ChartLine, Globe, ShieldCheck, Trophy, FileText, ListChecks, Target, Sparkle, ArrowRight, Star, User as UserIcon, LinkedinLogo, YoutubeLogo, InstagramLogo, Calendar, Megaphone, Files, ClipboardText, Heart, Confetti, GraduationCap, ChartBar, TreeStructure, BookOpen } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { SkillFormLogo } from '@/components/SkillFormLogo';

import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandMark } from '@/components/brand/BrandMark';
import { SkillFormIcon } from '@/components/SkillFormIcon';
import { BracketTag } from '@/components/brand/BracketTag';
import { SectionAdornment } from '@/components/brand/SectionAdornment';
import { ImagePlaceholder } from '@/components/brand/ImagePlaceholder';
import { SectionRail } from '@/components/brand/SectionRail';
import { AuthModal, AuthModalMode } from '@/components/auth/AuthModal';
import aideaformLogo from '@/assets/aideaform-logo.svg';

const TOTAL_SECTIONS = 7;

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthModalMode>('login');
  const [registerToken, setRegisterToken] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState(0);

  // Open the modal automatically based on ?auth=login|register
  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth === 'login' || auth === 'register') {
      setAuthMode(auth);
      setRegisterToken(searchParams.get('token') || undefined);
      setAuthOpen(true);
    }
  }, [searchParams]);

  // Top-of-page scroll progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openAuth = (mode: AuthModalMode = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleAuthOpenChange = (open: boolean) => {
    setAuthOpen(open);
    if (!open && (searchParams.get('auth') || searchParams.get('token'))) {
      const next = new URLSearchParams(searchParams);
      next.delete('auth');
      next.delete('token');
      setSearchParams(next, { replace: true });
    }
  };

  const features = [
    {
      icon: MagnifyingGlass,
      title: t('landing.features.directory.title', 'Talent directory'),
      desc: t(
        'landing.features.directory.desc',
        'Search and filter through your entire organization — by skills, departments, languages, and expertise.',
      ),
      stat: t('landing.features.directory.stat', 'Smart filters & real-time search'),
    },
    {
      icon: Users,
      title: t('landing.features.profiles.title', 'Rich profiles'),
      desc: t(
        'landing.features.profiles.desc',
        'Comprehensive talent profiles with skills, experience, awards, and project history.',
      ),
      stat: t('landing.features.profiles.stat', '10+ profile sections'),
    },
    {
      icon: FolderOpen,
      title: t('landing.features.groups.title', 'Team groups'),
      desc: t(
        'landing.features.groups.desc',
        'Organize talent into custom groups for projects, departments, and initiatives.',
      ),
      stat: t('landing.features.groups.stat', 'Custom collections'),
    },
    {
      icon: Briefcase,
      title: t('landing.features.services.title', 'Services & matching'),
      desc: t(
        'landing.features.services.desc',
        'Document external services, track vendors and budgets, and auto-match the best internal talent.',
      ),
      stat: t('landing.features.services.stat', 'Director access & up'),
    },
    {
      icon: ChartLine,
      title: t('landing.features.analytics.title', 'Talent analytics'),
      desc: t(
        'landing.features.analytics.desc',
        'Insights into skill distribution, experience levels, languages, and department composition.',
      ),
      stat: t('landing.features.analytics.stat', 'Real-time dashboards'),
    },
    {
      icon: Globe,
      title: t('landing.features.multilingual.title', 'Multilingual ready'),
      desc: t(
        'landing.features.multilingual.desc',
        'Full English and Spanish support across the platform — language preference saved per user.',
      ),
      stat: t('landing.features.multilingual.stat', 'EN & ES included'),
    },
  ];

  const steps = [
    {
      icon: FileText,
      step: '01',
      title: t('landing.services.step1.title', 'Document services'),
      desc: t(
        'landing.services.step1.desc',
        'Capture every external production service — agency, department, budget, vendors, frequency.',
      ),
    },
    {
      icon: ListChecks,
      step: '02',
      title: t('landing.services.step2.title', 'Define required skills'),
      desc: t(
        'landing.services.step2.desc',
        'Set the skills each service needs, mark them as required or preferred, tune minimum proficiency.',
      ),
    },
    {
      icon: Target,
      step: '03',
      title: t('landing.services.step3.title', 'Auto-match talent'),
      desc: t(
        'landing.services.step3.desc',
        'Skill*form scores every employee nightly and surfaces the best internal matches.',
      ),
    },
  ];

  const capabilities = [
    { icon: Globe, label: t('landing.capabilities.multilingual', 'Multi-language support'), value: 'EN / ES' },
    { icon: ShieldCheck, label: t('landing.capabilities.roleBased', 'Role-based access'), value: t('landing.capabilities.roles', '4 roles') },
    { icon: Trophy, label: t('landing.capabilities.awards', 'Awards & recognition'), value: t('landing.capabilities.tracking', 'Full tracking') },
    { icon: Briefcase, label: t('landing.capabilities.experience', 'Experience management'), value: t('landing.capabilities.comprehensive', 'Complete') },
  ];

  const testimonials = [
    {
      quote: t(
        'landing.trust.t1.quote',
        '"Skill*form transformed how we find the right people for our projects. The search and filter capabilities are incredible."',
      ),
      name: t('landing.trust.t1.name', 'María García'),
      role: t('landing.trust.t1.role', 'Creative Director'),
    },
    {
      quote: t(
        'landing.trust.t2.quote',
        '"Having all our team\'s skills and experience in one place has made resource allocation so much more efficient."',
      ),
      name: t('landing.trust.t2.name', 'Carlos Rodríguez'),
      role: t('landing.trust.t2.role', 'Department Head'),
    },
    {
      quote: t(
        'landing.trust.t3.quote',
        '"The multi-language support and role-based access make it perfect for our international team structure."',
      ),
      name: t('landing.trust.t3.name', 'Ana Martínez'),
      role: t('landing.trust.t3.role', 'HR Manager'),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-primary selection:text-primary-foreground">
      {/* Top scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-[60] h-0.5 accent-gradient pointer-events-none transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 -top-px h-1 w-1 rounded-full bg-primary shadow-signal" />
      </div>

      {/* Section rail (desktop) + bottom-left section indicator */}
      <SectionRail
        items={[
          { id: 'features', label: t('landing.nav.features', 'Features') },
          { id: 'services', label: t('landing.nav.services', 'Services') },
          { id: 'capabilities', label: t('landing.nav.capabilities', 'Capabilities') },
          { id: 'trust', label: t('landing.nav.trust', 'Trust') },
        ]}
      />

      {/* ── STICKY NAV (Signal*form Launchpad style) ── */}
      <nav className="sticky top-0 w-full z-50 bg-card border-b border-border">
        <div className="flex justify-between items-center h-[58px] px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto gap-2">
          {/* Left: Logos + Menu trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            {/* Partner logo + separator — desktop only to avoid mobile crowding */}
            <img
              src={aideaformLogo}
              alt="aidea*form"
              className="h-3 shrink-0 hidden md:block"
            />
            <span className="text-muted-foreground/40 text-xs hidden md:inline">|</span>

            {/* Brand tile + wordmark */}
            <a href="#top" className="flex items-center gap-2 min-w-0">
              <span
                className="w-7 h-7 rounded-md accent-gradient flex items-center justify-center text-white shadow-signal shrink-0"
                aria-hidden="true"
              >
                <SkillFormIcon className="h-4 w-4" />
              </span>
              <BrandMark
                prefix="Skill"
                suffix="form"
                className="text-[15px] tracking-tight truncate"
              />
            </a>

            {/* Menu trigger (desktop) — separator + section links */}
            <span className="hidden md:inline text-muted-foreground/40 text-xs ml-1">|</span>
            <div className="hidden md:flex items-center gap-5 ml-1 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                {t('landing.nav.features', 'Features')}
              </a>
              <a href="#services" className="hover:text-foreground transition-colors">
                {t('landing.nav.services', 'Services')}
              </a>
              <a href="#capabilities" className="hover:text-foreground transition-colors">
                {t('landing.nav.capabilities', 'Capabilities')}
              </a>
              <a href="#trust" className="hover:text-foreground transition-colors">
                {t('landing.nav.trust', 'Trust')}
              </a>
            </div>
          </div>

          {/* Right: Lang + Theme + Auth */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <button
              onClick={() => openAuth('login')}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-2"
            >
              {t('auth.login.signIn', 'Sign in')}
            </button>
            <button
              onClick={() => openAuth('login')}
              className="accent-gradient text-white text-sm font-medium px-5 py-2 rounded-full shadow-signal hover:opacity-90 transition-opacity"
            >
              {t('landing.getStarted', 'Get started')}
            </button>
          </div>

          {/* Mobile: Lang + Theme + CTA */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <button
              onClick={() => openAuth('login')}
              className="accent-gradient text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-signal hover:opacity-90 transition-opacity"
            >
              {t('landing.getStarted', 'Get started')}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ═══════ HERO ═══════ */}
        <section className="relative pt-20 pb-24 px-6 overflow-hidden bg-dots">
          {/* Glow orbs */}
          <div
            className="pointer-events-none absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.14) 0%, transparent 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl"
            style={{ background: 'hsl(var(--secondary) / 0.10)' }}
          />

          {/* Floating bracket tags */}
          <div className="hidden md:block absolute top-28 right-12 z-20 animate-fade-in-up">
            <BracketTag variant="success">
              {t('landing.hero.live', 'Skill*form Live')}
            </BracketTag>
          </div>
          <div className="hidden md:block absolute top-28 left-12 z-20 animate-fade-in-up">
            <BracketTag variant="accent">
              {t('landing.hero.tag', 'Talent suite v2')}
            </BracketTag>
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 bg-signal-subtle border border-signal text-primary text-label py-1.5 px-4 rounded-full"
            >
              <span className="pulse-ring" />
              {t('landing.hero.eyebrow', 'Discover and connect with talent')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-display-lg mt-6"
            >
              {t('landing.hero.titlePart1', 'Discover &')}{' '}
              <span className="text-primary">
                {t('landing.hero.titlePart2', 'connect')}
              </span>
              <br />
              {t('landing.hero.titlePart3', "with your team's talent")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-body-lg text-muted-foreground max-w-2xl mx-auto mt-6"
            >
              {t(
                'landing.hero.description',
                'A centralized platform to explore profiles, skills, and expertise — find the right talent for every project.',
              )}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm text-muted-foreground max-w-2xl mx-auto mt-3"
            >
              <span className="inline-flex items-center gap-2 font-medium text-foreground">
                <Sparkle weight="fill" size={14} className="text-primary" />
                {t('landing.hero.servicesEyebrow', 'Now with services & talent matching')}
              </span>{' '}
              — {t(
                'landing.hero.servicesTagline',
                'document external services, define required skills, and auto-match the right internal talent.',
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
            >
              <button
                onClick={() => openAuth('login')}
                className="inline-flex items-center gap-2 accent-gradient text-white px-8 py-3 rounded-full shadow-signal hover:opacity-90 transition-opacity font-medium"
              >
                {t('landing.getStarted', 'Get started')}
                <ArrowRight weight="bold" size={16} />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 border border-border hover:border-signal px-8 py-3 rounded-full transition-colors text-foreground font-medium"
              >
                {t('landing.learnMore', 'Learn more')}
              </a>
            </motion.div>
          </div>

          {/* Hero visual placeholder */}
          <div className="max-w-5xl mx-auto mt-16 relative z-10">
            <ImagePlaceholder
              tint="primary"
              aspect="aspect-[16/7]"
              description={t(
                'landing.hero.placeholder',
                'Hero product shot — Skill*form directory dashboard showing search, filters, and a grid of talent profile cards in dark mode.',
              )}
            />
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section id="features" className="relative py-24 px-6 bg-lines">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-12"
            >
              <SectionAdornment
                index={1}
                total={TOTAL_SECTIONS}
                label={t('landing.features.badge', 'Capabilities')}
                className="mb-4"
              />
              <h2 className="text-display-md">
                {t('landing.features.title', 'Everything you')}{' '}
                <span className="text-primary">
                  {t('landing.features.titleAccent', 'need')}
                </span>
              </h2>
              <p className="text-body-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                {t(
                  'landing.features.subtitle',
                  'A comprehensive talent management platform — designed for modern organizations.',
                )}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="feature-card flex flex-col h-full"
                >
                  <div className="w-11 h-11 rounded-lg bg-signal-subtle border border-signal flex items-center justify-center mb-5">
                    <f.icon weight="regular" size={22} className="text-primary" />
                  </div>
                  <h3 className="text-headline-md mb-3 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                  <div className="mt-6 pt-5 border-t border-border/60">
                    <span className="text-mono text-primary">{f.stat}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ SERVICES MODULE ═══════ */}
        <section
          id="services"
          className="relative py-24 px-6 bg-surface-container-low border-y border-border/60"
        >
          {/* Glow orb */}
          <div
            className="pointer-events-none absolute top-20 right-10 w-[400px] h-[400px] rounded-full blur-3xl"
            style={{ background: 'hsl(var(--primary) / 0.06)' }}
          />

          <div className="max-w-6xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl mb-16"
            >
              <SectionAdornment
                index={2}
                total={TOTAL_SECTIONS}
                label={t('landing.services.eyebrow', 'New module')}
                align="left"
                className="mb-4"
              />
              <h2 className="text-display-md">
                {t('landing.services.title', 'Services &')}{' '}
                <span className="text-primary">
                  {t('landing.services.titleAccent', 'talent matching')}
                </span>
              </h2>
              <p className="text-body-lg text-muted-foreground mt-4">
                {t(
                  'landing.services.subtitle',
                  'Directors and admins can document every external service, manage vendors and budgets, and let Skill*form auto-match the best internal talent — based on real skills, experience, and proficiency.',
                )}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
              {steps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="feature-card h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-lg bg-signal-subtle border border-signal flex items-center justify-center">
                      <item.icon weight="regular" size={22} className="text-primary" />
                    </div>
                    <span className="text-mono text-primary/40 text-2xl font-semibold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-headline-md mb-3 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stat strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-border bg-card p-8 sm:p-10"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: '29+', label: t('landing.services.stat1', 'Catalog services') },
                  { value: '100%', label: t('landing.services.stat2', 'Skill-based matching') },
                  { value: '24/7', label: t('landing.services.stat3', 'Nightly auto-match') },
                  { value: 'EN / ES', label: t('landing.services.stat4', 'Bilingual interface') },
                ].map((s) => (
                  <div key={s.label} className="text-center md:text-left">
                    <p className="text-display-md text-foreground tracking-tighter">
                      {s.value}
                    </p>
                    <p className="text-mono text-muted-foreground mt-2">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground max-w-xl">
                  {t(
                    'landing.services.access',
                    'Available to department directors, organizer admins, master admins, and senior employees.',
                  )}
                </p>
                <button
                  onClick={() => openAuth('login')}
                  className="inline-flex items-center gap-2 accent-gradient text-white px-6 py-2.5 rounded-full shadow-signal hover:opacity-90 transition-opacity text-sm font-medium shrink-0"
                >
                  {t('landing.services.cta', 'Sign in to explore services')}
                  <ArrowRight weight="bold" size={14} />
                </button>
              </div>
            </motion.div>

            {/* Services placeholder */}
            <div className="mt-16">
              <ImagePlaceholder
                tint="teal"
                aspect="aspect-[16/7]"
                description={t(
                  'landing.services.placeholder',
                  'Services module screenshot — service detail view with required skills, vendor list, and the auto-matched internal talent panel.',
                )}
              />
            </div>
          </div>
        </section>

        {/* ═══════ CAPABILITIES ═══════ */}
        <section id="capabilities" className="relative py-24 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionAdornment
                index={3}
                total={TOTAL_SECTIONS}
                label={t('landing.capabilities.badge', 'Built in')}
                align="left"
                className="mb-4"
              />
              <h2 className="text-display-md">
                {t('landing.capabilities.titlePart1', 'Built for')}{' '}
                <span className="text-primary">
                  {t('landing.capabilities.titlePart2', 'modern teams')}
                </span>
              </h2>
              <p className="text-body-lg text-muted-foreground mt-4 mb-10">
                {t(
                  'landing.capabilities.desc',
                  'Every feature designed to help you discover, organize, and leverage the talent within your organization.',
                )}
              </p>

              <div className="space-y-3">
                {capabilities.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="stat-card flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-md bg-signal-subtle border border-signal flex items-center justify-center shrink-0">
                      <c.icon weight="regular" size={18} className="text-primary" />
                    </div>
                    <p className="text-label flex-1 text-foreground">{c.label}</p>
                    <span className="text-mono text-primary">{c.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-xl border border-border bg-card p-10 text-center overflow-hidden"
            >
              <div className="scan-line" />

              <BracketTag variant="accent" className="mb-6">
                {t('landing.capabilities.badgeStats', 'Platform stats')}
              </BracketTag>

              <p className="text-display-lg tracking-tighter text-foreground">100%</p>
              <p className="text-muted-foreground mt-3">
                {t('landing.capabilities.coverage', 'Organization coverage')}
              </p>

              <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                  { label: t('landing.capabilities.departments', 'Departments'), value: '12+', tone: 'text-secondary' },
                  { label: t('landing.capabilities.skills', 'Skills tracked'), value: '200+', tone: 'text-primary' },
                  { label: t('landing.capabilities.countries', 'Countries'), value: '15+', tone: 'text-foreground' },
                ].map((s) => (
                  <div key={s.label} className="stat-card text-center">
                    <p className="text-mono text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-headline-md ${s.tone}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openAuth('login')}
                className="mt-10 w-full inline-flex items-center justify-center gap-2 accent-gradient text-white px-8 py-3 rounded-full shadow-signal hover:opacity-90 transition-opacity font-medium"
              >
                {t('landing.getStarted', 'Get started')}
                <ArrowRight weight="bold" size={16} />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ═══════ VISUAL SHOWCASE ═══════ */}
        <section className="relative py-20 px-6 bg-surface-container-low border-y border-border/60">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-12"
            >
              <SectionAdornment
                index={4}
                total={TOTAL_SECTIONS}
                label={t('landing.showcase.badge', 'Inside the product')}
                className="mb-4"
              />
              <h2 className="text-display-md">
                {t('landing.showcase.title', 'A glimpse of')}{' '}
                <span className="text-primary">
                  {t('landing.showcase.titleAccent', 'the platform')}
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ImagePlaceholder
                tint="primary"
                aspect="aspect-[4/3]"
                description={t(
                  'landing.showcase.placeholder1',
                  'Profile detail page — header with avatar, role, country flag, plus skills, languages, and project history tabs.',
                )}
              />
              <ImagePlaceholder
                tint="teal"
                aspect="aspect-[4/3]"
                description={t(
                  'landing.showcase.placeholder2',
                  'Master admin analytics dashboard — bar charts of skill distribution and seniority breakdown across the organization.',
                )}
              />
              <ImagePlaceholder
                tint="neutral"
                aspect="aspect-[4/3]"
                description={t(
                  'landing.showcase.placeholder3',
                  'Director "my team" roster view — list of direct reports with seniority badges and quick-action buttons.',
                )}
              />
              <ImagePlaceholder
                tint="primary"
                aspect="aspect-[4/3]"
                description={t(
                  'landing.showcase.placeholder4',
                  'Service create wizard — step-by-step form for naming a service, picking a category, and assigning vendors.',
                )}
              />
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section id="trust" className="relative py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-16"
            >
              <SectionAdornment
                index={5}
                total={TOTAL_SECTIONS}
                label={t('landing.trust.badge', 'Voices')}
                className="mb-4"
              />
              <div className="text-center">
                <h2 className="text-display-md">
                  {t('landing.trust.title', 'Trusted by')}{' '}
                  <span className="text-primary">
                    {t('landing.trust.titleAccent', 'teams')}
                  </span>
                </h2>
                <p className="text-body-lg text-muted-foreground mt-4">
                  {t(
                    'landing.trust.subtitle',
                    'See how teams across Grupo Garnier use Skill*form every day.',
                  )}
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((tm, i) => (
                <motion.div
                  key={tm.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="feature-card h-full flex flex-col"
                >
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} weight="fill" size={14} className="text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed flex-1">{tm.quote}</p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                      <UserIcon weight="regular" size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tm.name}</p>
                      <p className="text-xs text-muted-foreground">{tm.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CTA BAND ═══════ */}
        <section className="relative py-20 px-6 bg-diagonal border-t border-border/60">
          <div className="max-w-4xl mx-auto text-center">
            <SectionAdornment
              index={6}
              total={TOTAL_SECTIONS}
              label={t('landing.cta.badge', 'Get started')}
              variant="live"
              className="mb-6"
            />
            <h2 className="text-display-md">
              {t('landing.cta.title', 'Bring your talent into')}{' '}
              <span className="text-primary">
                {t('landing.cta.titleAccent', 'one signal.')}
              </span>
            </h2>
            <p className="text-body-lg text-muted-foreground mt-4 max-w-xl mx-auto">
              {t(
                'landing.cta.subtitle',
                'Sign in to start exploring profiles, services, and the matching engine.',
              )}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openAuth('login')}
                className="inline-flex items-center gap-2 accent-gradient text-white px-8 py-3 rounded-full shadow-signal hover:opacity-90 transition-opacity font-medium"
              >
                {t('landing.getStarted', 'Get started')}
                <ArrowRight weight="bold" size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-muted/10 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand cluster */}
            <div>
              <div className="flex flex-col gap-3 mb-4">
                <SkillFormLogo textClassName="text-base" />
                <img
                  src={aideaformLogo}
                  alt="aidea*form"
                  className="h-3 shrink-0 w-fit"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {t(
                  'landing.footer.tagline',
                  'Discover and connect with talent across your organization.',
                )}
              </p>
              <div className="flex gap-3 mt-5">
                {[LinkedinLogo, YoutubeLogo, InstagramLogo].map((Icon, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground w-8 h-8"
                  >
                    <Icon className="w-4 h-4" weight="regular" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                title: t('landing.footer.product', 'Product'),
                links: [
                  t('landing.footer.features', 'Features'),
                  t('landing.footer.directory', 'Directory'),
                  t('landing.footer.profiles', 'Profiles'),
                  t('landing.footer.services', 'Services'),
                  t('landing.footer.analytics', 'Analytics'),
                ],
              },
              {
                title: t('landing.footer.company', 'Company'),
                links: [
                  t('landing.footer.about', 'About'),
                  t('landing.footer.careers', 'Careers'),
                  t('landing.footer.contact', 'Contact'),
                  t('landing.footer.privacy', 'Privacy policy'),
                  t('landing.footer.terms', 'Terms of service'),
                ],
              },
              {
                title: t('landing.footer.resources', 'Resources'),
                links: [
                  t('landing.footer.help', 'Help center'),
                  t('landing.footer.guides', 'Guides'),
                  t('landing.footer.support', 'Support'),
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <p className="eyebrow mb-4">{section.title}</p>
                <div className="space-y-2.5">
                  {section.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="tonal-divider" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-8">
            <p className="text-sm text-muted-foreground">
              © Grupo Garnier. {t('common.labels.allRightsReserved', 'All rights reserved.')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('landing.footer.builtWithAI', 'Built with AI by aidea*form')}
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        onOpenChange={handleAuthOpenChange}
        defaultMode={authMode}
        registerToken={registerToken}
      />
    </div>
  );
};

export default Landing;
