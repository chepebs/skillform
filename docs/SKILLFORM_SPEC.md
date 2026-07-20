# Skill*form — Exhaustive Replication Specification

> Audience: an autonomous coding agent (Claude Code) tasked with rebuilding Skill\*form from scratch. This document is intended to be self-sufficient. If something is ambiguous, prefer the choice that maximizes **security (RLS-first), multi-tenancy isolation, i18n coverage, accessibility, and design-token discipline**.

Owner: Grupo Garnier. Product: **Skill\*form** — a multi-tenant HR + Talent Management SaaS. Stack: React 18 + Vite 5 + TypeScript 5 + Tailwind 3 + shadcn/ui + Supabase (Postgres/Auth/Storage/Edge Functions).

---

## Table of Contents

1. Product overview & personas
2. Tech stack & runtime
3. Repo layout
4. Design system (tokens, typography, motion, components)
5. Internationalization
6. Auth, tenancy, roles
7. Database — full schema, RLS, functions, triggers, storage
8. Routing map
9. Global layout, header, sidebar, footer
10. Modules — one section per feature, each with data, UI, permissions, edge cases
11. Notifications, messaging, realtime
12. Edge functions
13. Cross-cutting patterns (forms, queries, uploads, exports, errors)
14. Accessibility & SEO
15. Testing seed data
16. Non-negotiable rules & anti-patterns
17. Suggested improvements to include on rebuild

---

## 1. Product overview & personas

Skill\*form combines four surfaces inside one tenant workspace:

1. **Talent Directory** — deep employee profiles (skills, languages, brands, agencies, industries, awards, projects, social).
2. **Services & Talent Matching** — internal catalog of client/service engagements plus skill-weighted matching to employees (Recharts-driven insights, edge function scoring).
3. **HR Suite** — Time-off, Onboarding, Jobs, Documents (personal HR), Policies (versioned + acknowledgements), Files (shared), Kudos, Events, Surveys (with anonymity), Announcements, Org Chart, Birthdays & Anniversaries.
4. **Admin consoles** — three role-scoped dashboards (Master Admin, Director, Organizer) plus Admin Settings.

### Personas & roles

| Role (`app_role`) | Who | Sees |
|---|---|---|
| `user` | Employees | Own profile, directory, HR self-service, feeds, own onboarding, own time-off, apply to jobs, take surveys |
| `manager` | Team leads / Dept directors | Everything a user sees + Director dashboard, team roster, approvals (time-off, jobs), department documents |
| `admin` | Company or platform admins | Full Master Admin console: user management, departments, agencies, analytics, policies publishing, survey builder, onboarding templates, subscription/settings |
| Platform master (derived) | `admin` with `profiles.company_id IS NULL` | Cross-tenant operations (rare) |

Admins **do not** have an employee profile — the wizard is skipped for them. Approvals derive from `profiles.manager_id` chain and department director, never from a new role.

---

## 2. Tech stack & runtime

- **React** 18.3, **Vite** 5, **TypeScript** 5.
- **Routing**: `react-router-dom` v7 (v6-compatible API; nested routes, `Outlet`).
- **Data**: `@tanstack/react-query` v5 (per-resource queries, `invalidateQueries` after writes).
- **Forms**: `react-hook-form` v7 + `@hookform/resolvers` + `zod`.
- **UI kit**: shadcn/ui components over Radix primitives (accordion, alert-dialog, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip). Additional: `cmdk` (command palette), `sonner` + `@radix-ui/react-toast` (dual toaster), `vaul` (drawers), `input-otp`, `embla-carousel-react`, `react-day-picker` v8, `react-resizable-panels`.
- **Tailwind** 3 + `tailwindcss-animate` + `@tailwindcss/typography`. `tailwind-merge` + `clsx` + `class-variance-authority`.
- **Icons**: `@phosphor-icons/react` (primary; use `weight="duotone"` on active nav; `weight="regular"` otherwise). `lucide-react` allowed only where a Phosphor equivalent is missing.
- **Motion**: `framer-motion` v12 (fade, slide, stagger only — no bouncy springs), `lenis` for smooth scroll on the landing page.
- **Charts**: `recharts` v2 — all colors from `--chart-1` … `--chart-8` HSL tokens (never hex).
- **Files**: `react-easy-crop` for avatar cropping.
- **PDF**: `jspdf` + `jspdf-autotable`, `html2canvas` for on-screen capture; Garnier-branded header/footer.
- **DnD**: `@dnd-kit/core|sortable|utilities` (Kanban in Organizer, sortable lists).
- **i18n**: `i18next` + `react-i18next` v16.
- **Backend (Supabase)**: `@supabase/supabase-js` v2 client; Postgres 15+; Deno-based Edge Functions.
- **Utilities**: `date-fns` v3 (never Moment).
- **Confetti**: `react-confetti` (used on onboarding completion + celebrations).

Package manager: `bun` in dev harness; the repo also builds with `npm`. Dev port: **8080** (Vite).

---

## 3. Repo layout

```
src/
  App.tsx                        # BrowserRouter + all routes
  main.tsx                       # ReactDOM.createRoot; imports i18n, App.css, index.css
  index.css                      # Design tokens (light + dark), base layer
  App.css                        # Legacy overrides (kept minimal)
  lib/
    i18n.ts                      # i18next init (en/es, persist to localStorage)
    utils.ts                     # cn() = twMerge(clsx(...))
    celebrations.ts              # birthday/anniversary helpers
    useSmoothScroll.ts           # Lenis wrapper for landing
  hooks/
    use-toast.ts, use-mobile.tsx
    useDebounce.ts
    useDirectoryData.ts          # paginated directory query
    useProfileData.ts            # profile + related tables
    useMasterDashboardData.ts, useDirectorData.ts, useOrganizerData.ts
    useCanAccessServices.ts, useNavigation.ts
  contexts/
    AuthContext.tsx              # user, session, profile, company, role, isLoading
  integrations/supabase/
    client.ts                    # AUTO-GENERATED — never edit
    types.ts                     # AUTO-GENERATED — never edit
  locales/
    en.json, es.json             # Exact key parity, ~1800 lines each
  components/
    layout/{AppLayout,AuthLayout,Sidebar,Header,LanguageSwitcher,ThemeToggle,NotificationsDropdown}.tsx
    brand/{AmbientBackground,AsteriskPreloader,BrandMark,BracketTag,SectionAdornment,SectionRail,ImagePlaceholder}.tsx
    common/Logo.tsx
    animations/{FadeIn,StaggerContainer}.tsx
    auth/{AuthModal,LoginForm,RegisterForm,ProtectedRoute,CompanyGate}.tsx
    ui/                          # shadcn/ui primitives (button, card, dialog, etc.)
    directory/{ProfileCard,ProfileTable,DirectorySearch,DirectoryFilters,DirectoryPagination,SkeletonCard,types.ts}
    profile/{HRFieldsCard,ImageCropper,SocialMediaLinks,StepIndicator,types.ts}
    profile/steps/{BasicInfoStep,ProfessionalInfoStep,EducationStep,SkillsStep,IndustriesStep,LanguagesStep,BrandsProjectsStep,PerformanceStep,AwardsStep,ReviewStep,SocialMediaFields}.tsx
    profile/view/{ProfileHeader,ProfileSkeleton,QuickStatsBar,OverviewTab,ExperienceTab,SkillsLanguagesTab,ProjectsAwardsTab,AdditionalInfoTab}.tsx
    services/{MatchedTalentList,ServiceSkillsManager}.tsx
    messaging/{MessageButton,SendMessageModal}.tsx
    dashboard/widgets/{KudosFeedWidget,MyTimeOffBalanceWidget,MyOnboardingProgressWidget,PendingApprovalsWidget}.tsx
    admin/master/{StatsCard,DashboardCharts,ActivityFeed,UserManagementTable,AddUserModal,ChangeRoleModal,DeleteUserDialog,PendingInvitations,AgencyManagement,DepartmentManagement,ExportPDFButton}.tsx
    admin/director/{DirectorStatsCards,TeamRoster,TeamAnalytics,DepartmentInfoForm}.tsx
    admin/organizer/{OrganizerStats,GroupsList,CreateGroupModal,DeleteGroupDialog,GroupDetails,KanbanView}.tsx
  pages/
    Landing.tsx, Login.tsx, Register.tsx, NotFound.tsx, Forbidden.tsx, Index.tsx
    Dashboard.tsx, Directory.tsx
    ProfileCreate.tsx, ProfileEdit.tsx, ProfileView.tsx
    OrgChart.tsx, Celebrations.tsx, Kudos.tsx, Events.tsx
    Documents.tsx, Policies.tsx, TimeOff.tsx, Jobs.tsx, Onboarding.tsx
    Surveys.tsx, Announcements.tsx, Files.tsx
    company/{CompanyCreate,CompanyJoin}.tsx
    services/{ServicesLayout,ServicesList,ServiceCreate,ServiceDetail,ServiceEdit,ServiceForm}.tsx
    admin/{MasterDashboard,DirectorDashboard,OrganizerDashboard,AdminSettings}.tsx
  assets/{logo-garnier.svg,aideaform-logo.svg,skillform-icon.svg}
supabase/
  config.toml
  migrations/*.sql
  functions/{auto-match-services,cleanup-test-users,delete-account,seed-master-user,seed-test-accounts}/index.ts
```

---

## 4. Design system

### 4.1 Philosophy
- **Signal\*form v2.0 (Arbol)** applied to Skill\*form: minimal, editorial, high-contrast, restrained motion. No default AI aesthetics (no random purple/indigo gradients, no Inter/Poppins default fonts, no interchangeable hero layouts).
- **All colors, gradients, shadows, radii, motion durations, easings are HSL semantic tokens.** Never hardcode `text-white`, `bg-black`, `bg-[#...]`. Never bypass shadcn variant system.
- Dark mode is class-based (`.dark` on `<html>`), toggled by `ThemeToggle`, persisted in `localStorage` under `theme` (`light` | `dark` | `system`).

### 4.2 Token reference (`src/index.css`)

```css
:root {
  --background: 213 24% 98%;   --foreground: 215 31% 12%;
  --card: 0 0% 100%;           --card-foreground: 215 31% 12%;
  --popover: 0 0% 100%;        --popover-foreground: 215 31% 12%;
  --primary: 1 81% 57%;        --primary-foreground: 0 0% 100%;         /* Garnier red */
  --secondary: 181 100% 22%;   --secondary-foreground: 0 0% 100%;       /* Teal */
  --muted: 213 24% 96%;        --muted-foreground: 210 13% 35%;
  --accent: 213 24% 93%;       --accent-foreground: 215 31% 12%;
  --destructive: 0 73% 44%;    --destructive-foreground: 0 0% 100%;
  --border: 213 24% 84%;       --input: 213 27% 90%;                    --ring: 1 81% 57%;
  --success: 160 72% 34%;      --warning: 35 95% 46%;                    --info: 217 72% 55%;
  --brand-signal: 1 81% 57%;   --brand-teal: 181 100% 22%;

  --radius: 0.5rem; --radius-sm: 0.25rem; --radius-lg: 0.75rem; --radius-xl: 1rem; --radius-full: 9999px;
  --duration-fast: 150ms; --duration-normal: 250ms; --duration-slow: 400ms;
  --ease-default: cubic-bezier(0.4,0,0.2,1);
  --ease-motion:  cubic-bezier(0.22,1,0.36,1);
  --ease-bounce:  cubic-bezier(0.34,1.56,0.64,1);
  --ease-out:     cubic-bezier(0,0,0.2,1);

  /* Material-3-inspired surfaces */
  --surface-dim: 213 24% 95%; --surface: 213 24% 98%;
  --surface-container-low: 213 27% 96%; --surface-container: 213 24% 93%;
  --surface-container-high: 213 24% 88%; --surface-bright: 0 0% 100%;
  --on-surface-variant: 215 13% 35%; --outline-variant: 214 24% 78%;

  /* Sidebar */
  --sidebar-background: 0 0% 99%; --sidebar-foreground: 215 13% 35%;
  --sidebar-primary: 215 31% 12%; --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 213 24% 93%;  --sidebar-accent-foreground: 215 31% 12%;
  --sidebar-border: 213 24% 84%;  --sidebar-ring: 1 81% 57%;

  /* Charts (categorical, theme-aware) */
  --chart-1: 1 81% 57%; --chart-2: 181 100% 22%; --chart-3: 217 72% 55%;
  --chart-4: 35 95% 46%; --chart-5: 160 72% 34%; --chart-6: 271 81% 56%;
  --chart-7: 326 78% 60%; --chart-8: 220 13% 60%;

  --seniority-junior: 220 13% 60%; --seniority-mid: 217 72% 55%;
  --seniority-senior: 271 65% 60%; --seniority-lead: 35 95% 46%;

  --social-linkedin: 210 90% 40%; --social-instagram: 340 75% 55%; --social-behance: 217 100% 55%;
}
.dark { /* full override — all tokens re-declared */ }
```

Extras: `accent-gradient` utility (linear from primary → secondary), `shadow-signal` (subtle brand-tinted shadow), `shadow-tonal` (elevated tonal), `ease-smooth` (=`--ease-motion`).

### 4.3 Typography scale
- Display / headline: **Space Grotesk** 500/600, tight tracking.
- Body: **Manrope** 400/500 (base 15–16px, 1.55 line-height).
- Labels & meta: **Inter** 500.
- Mono: **JetBrains Mono**.
- Section markers: **BracketTag** e.g. `[ 04 / 07 ] Built in` — 12px uppercase mono with primary bracket color.

### 4.4 Component conventions
- Buttons: shadcn variants `default | secondary | outline | ghost | destructive | link`; sizes `sm | default | lg | icon`. **Never** style buttons ad-hoc.
- Cards: `bg-card border border-border rounded-[var(--radius)]` (no shadows by default; add `shadow-signal` only for elevated CTAs).
- Empty states: brand icon + one-sentence copy + optional CTA.
- Loading: `SkeletonCard` variants per surface (never spinners on primary surfaces).
- Toasts: `sonner` for stacked feedback; Radix Toaster reserved for legacy calls.

### 4.5 Layout primitives
- **AppLayout** (`src/components/layout/AppLayout.tsx`)
  - Fixed left `Sidebar` (desktop: `w-56` open / `w-14` collapsed, persisted in `localStorage.sidebarCollapsed`).
  - Mobile: slide-in sidebar with backdrop, closes on route change / Escape / outside click.
  - Fixed `Header` with height **58px**, brand mark, breadcrumbs, LanguageSwitcher, ThemeToggle, NotificationsDropdown, avatar menu.
  - `<main>` uses `pt-[58px]` and responsive padding `p-6 md:p-8 lg:p-10`, wrapped in `animate-fade-in`.
  - Footer: exact literal `© Grupo Garnier. {t('common.labels.allRightsReserved')}` (no year, no extra text).
- **AuthLayout** — centered card `max-w-lg`, brand mark top, LanguageSwitcher top-right.
- **Landing** uses `SectionRail` (right vertical rail), `SectionAdornment` (per-section index `[ N / TOTAL ]`), `AmbientBackground` (gradient), `AsteriskPreloader` (brand asterisk during initial paint).

---

## 5. Internationalization

- `src/lib/i18n.ts` initializes `i18next` with `en` and `es`, `fallbackLng: 'en'`, `interpolation.escapeValue: false`, detection via `localStorage` (`i18nextLng`), then `navigator`.
- **Key parity is mandatory.** `en.json` and `es.json` must have identical key trees.
- Namespace shape (top-level):
  - `common.{save, saving, cancel, delete, edit, active, inactive, select, loading, buttons.*, actions.*, navigation.*, status.*, labels.*, time.*, validation.*, messages.*}`
  - `auth.{login, register, forgotPassword, myAccount, logout}`
  - `landing.*` (hero, sections, capabilities, footer)
  - `dashboard.*`, `profile.{wizard, view, counters, hr}`, `directory.*`
  - `services.*`, `admin.{master, director, organizer, settings}`
  - `modules.{timeOff, jobs, onboarding, surveys, announcements, files, kudos, events, celebrations, orgChart, documents, policies}`
  - `widgets.*`, `notifications.*`, `messaging.*`
- Every user-visible string must call `t()`. No hardcoded English or Spanish in JSX. Counters must be i18n keyed (`profile.counters.position`, `profile.counters.brand`, `profile.counters.award`, etc.).
- Pluralization uses i18next suffixes (`daysAgo` + `daysAgo_plural`). Interpolation uses `{{count}}`, `{{name}}`, etc.
- Language switcher writes `localStorage.i18nextLng` and calls `i18n.changeLanguage`.

---

## 6. Auth, tenancy, roles

### 6.1 Auth flow
1. **Sign up** (`RegisterForm`) — requires an invite token (`/register/:token`). Calls `supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/`, data: { first_name, last_name, invite_token } } })`.
2. On confirmation, DB trigger `handle_new_user` inserts `profiles` row (deriving `company_id` **only** from a valid `invite_token`, never from client-supplied `company_id`) and a default `user_roles(role='user')`.
3. **Sign in** (`LoginForm`) — `signInWithPassword`. Google OAuth optional (must be enabled at provider level; `redirectTo` must be a full same-origin URL like `${window.location.origin}/auth/callback` — never a protected route).
4. **AuthContext** subscribes to `onAuthStateChange` FIRST, then calls `getSession`. Keeps `isLoading=true` until profile + role are fetched so guards never see `role=null`.
5. **Guards**:
   - `ProtectedRoute` — redirects unauthenticated → `/login`; supports `allowedRoles`.
   - `CompanyGate` — if `profile.company_id` is null, redirects to `/company/create`.
6. **Sign out** — clears context state, then `supabase.auth.signOut()`.
7. **Password reset** — `resetPasswordForEmail(email, { redirectTo: ${origin}/reset-password })`. `/reset-password` page checks URL hash for `type=recovery`, then `supabase.auth.updateUser({ password })`.
8. **Session validation** — for any authorization decision that must trust the user, call `supabase.auth.getUser()` (revalidates with Auth server); `getSession()` is only for attaching bearer tokens.

### 6.2 Tenancy model
- Enum `public.app_role AS ('user','manager','admin')`.
- Every domain table has `company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE`.
- All RLS policies scope by `company_id = public.get_user_company(auth.uid())`.
- Roles live in `public.user_roles(user_id, role)` — **never** on `profiles`.
- Admin actor with `profiles.company_id IS NULL` = **platform master** (`is_platform_master`).

### 6.3 Company creation & invites
- `/company/create` (auth-only, before `CompanyGate`): input company name, slug auto-generated (`slugify` = lowercase, spaces → `_`, strip non-`[a-z0-9_]`), logo upload → `company-logos`. INSERT policy: `created_by = auth.uid()`. After success, update `profiles.company_id`, mint invite tokens for admin peers.
- `invitation_tokens(id, token, email, role, used, expires_at, company_id, created_at)` — each token is single-use, email-bound, expires in 7 days by default.
- Public helpers:
  - `get_company_by_invite(_slug, _token)` — returns branded company preview.
  - `validate_invitation_token(_token)` — returns `(email, role, is_valid)`.
  - `use_invitation_token(_token, _email)` — marks used atomically.
- `/c/:slug/join` — public branded join screen; deep-links into `/register/:token`.

---

## 7. Database

### 7.1 Extensions & enums
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE public.app_role AS ENUM ('user','manager','admin');
CREATE TYPE public.subscription_status AS ENUM ('active','trialing','past_due','cancelled');
CREATE TYPE public.seniority_level AS ENUM ('junior','mid','senior','director','vp','c-level');
```

### 7.2 Table inventory

Identity / org:
- `profiles` — 1 row per auth user. Columns: `id`, `user_id (unique, FK auth.users)`, `email`, `first_name`, `last_name`, `avatar_url`, `phone`, `bio`, `department`, `position`, `current_position`, `years_of_experience`, `academic_degree`, `pitches_participated`, `pitches_won`, `brand_creations`, `brand_refreshes`, `effie_awards_participated`, `effie_awards_won`, `consulting_work`, `linkedin_url`, `instagram_url`, `behance_url`, `country_id`, `agency_id`, `company_id`, `manager_id (FK profiles.user_id)`, `birth_date`, `start_date`, `seniority_level enum`, `profile_completed`, `last_login_at`, `created_at`, `updated_at`.
- `user_roles(id, user_id, role, UNIQUE(user_id, role))`.
- `companies(id, name, slug, logo_url, description, website, industry, country_id, subscription_status, subscription_plan, invite_token, created_by, created_at, updated_at)`.
- `departments(id, name, description, director_id, company_id, sort_order, is_active)`.
- `agencies(id, name, country_id, company_id, description, is_active, sort_order, created_at)`.
- `countries(id, name, code, created_at)` — global reference.
- `industries(id, name, sort_order, created_at)` — global reference.

Talent detail:
- `previous_positions`, `previous_agencies`, `brands_managed`, `recent_projects`, `awards`.
- `employee_languages(language, is_native, speaking_level 1–5, reading_level 1–5, writing_level 1–5)`.
- `employee_skills(skill_name, skill_category, proficiency_level 1–5, years_experience)`.
- `employee_industries(industry_id, years_experience)`.

Services module:
- `service_categories`, `service_catalog`, `services`, `service_skills(min_proficiency, weight)`, `service_vendors`, `service_talent_matches(match_score, matched_skills jsonb, status)`.

HR suite:
- `kudos(from_user_id, to_user_id, message, value_tag, visibility)`.
- `events`, `event_rsvps(status ∈ going|maybe|declined)`.
- `document_folders(name, parent_id)`, `documents(name, folder_id, owner_id, uploaded_by, visibility ∈ private|manager|company, department, file_path, mime_type, size_bytes)`.
- `policies(title, body_md, version, status ∈ draft|published|archived, effective_from)`, `policy_acknowledgements(policy_id, user_id, acknowledged_at)`.
- `time_off_policies(name, kind ∈ vacation|sick|personal, accrual_days_per_year, max_carryover, min_notice_days, requires_approval)`.
- `time_off_balances(user_id, policy_id, balance_days numeric(6,2), year int)`.
- `time_off_requests(user_id, policy_id, start_date, end_date, days numeric, status ∈ pending|approved|rejected|cancelled, approver_id, reason, decided_at, decided_by)`.
- `job_postings(title, description, department, location, employment_type ∈ full_time|part_time|contract|intern, seniority, status ∈ draft|open|closed, deadline)`, `job_applications(job_id, applicant_id, cover_note, status ∈ submitted|reviewing|interview|offer|hired|rejected)`.
- `onboarding_templates(name, description, department, is_active)`, `onboarding_template_tasks(template_id, title, description, day_offset int, assignee_role text)`, `onboarding_assignments(user_id, template_id, started_at, status)`, `onboarding_tasks(assignment_id, template_task_id, status ∈ pending|in_progress|done, completed_at)`.
- `surveys(title, description, status ∈ draft|open|closed, anonymous bool, target_scope ∈ company|department|role, opens_at, closes_at)`, `survey_questions(type ∈ single|multi|scale|text|nps, prompt, options jsonb, required, sort_order)`, `survey_responses(user_id nullable-if-anonymous, submitted_at)`, `survey_answers(response_id, question_id, value jsonb)`.
- `announcements(title, body, scope ∈ company|department, department, pinned, published_at, expires_at, created_by)`, `announcement_reads(user_id, read_at)`.
- `shared_files(name, description, folder_id, file_path, visibility ∈ company|department, department, uploaded_by, size_bytes, mime_type)`.

Cross-cutting:
- `attachments(entity_type text, entity_id uuid, file_path, file_name, mime_type, size_bytes, uploaded_by, company_id, created_at)` — polymorphic uploads.
- `comments(entity_type, entity_id, user_id, body, company_id, timestamps)` — polymorphic threads.
- `notifications(user_id, type, title, body, entity_type, entity_id, read_at, created_at, company_id)`.
- `messages(from_user_id, to_user_id, body, read_at, created_at, company_id)`.
- `audit_log(user_id, action, target_type, target_id, details jsonb, ip_address, created_at)`.
- `groups(name, description, created_by, company_id)`, `group_members(group_id, user_id)`.

### 7.3 RLS pattern (mandatory)

For every public table, migrations must run in this exact order:

```sql
CREATE TABLE public.<t> (...);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<t> TO authenticated;
GRANT ALL ON public.<t> TO service_role;
-- Optionally: GRANT SELECT ON public.<t> TO anon; only for fully public tables
ALTER TABLE public.<t> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON public.<t> FOR SELECT USING (company_id = public.get_user_company(auth.uid()));
-- etc.
```

Common policy patterns:
- **Company read**: `USING (company_id = public.get_user_company(auth.uid()))`.
- **Self-write**: `WITH CHECK (user_id = auth.uid() AND company_id = public.get_user_company(auth.uid()))`.
- **Admin-only insert**: `WITH CHECK (public.has_role(auth.uid(),'admin') AND company_id = public.get_user_company(auth.uid()))`.
- **Manager approvals**: `USING (approver_id = auth.uid() OR public.is_direct_manager(auth.uid(), user_id) OR public.has_role(auth.uid(),'admin'))`.
- **Document visibility**: `USING (owner_id = auth.uid() OR (visibility='manager' AND public.is_direct_manager(auth.uid(), owner_id)) OR (visibility='company' AND company_id = public.get_user_company(auth.uid())) OR public.has_role(auth.uid(),'admin'))`.

### 7.4 SECURITY DEFINER helper functions

All are `stable security definer` with `SET search_path = public`. `EXECUTE` is revoked from `PUBLIC/anon` and granted to `authenticated` — except invite-flow helpers granted to `anon`.

```
has_role(_user_id, _role)                    -> boolean
get_user_role(_user_id)                      -> app_role   (highest by rank)
is_platform_master(_user_id)                 -> boolean
is_company_admin(_user_id, _company_id)      -> boolean
get_user_company(_user_id)                   -> uuid
can_access_services(_user_id)                -> boolean    (admin|manager|senior+)
can_edit_service(_user_id, _service_id)      -> boolean
is_direct_manager(_manager, _user)           -> boolean
get_company_invite_token(_company_id)        -> text       (admin-only readback)
get_company_by_invite(_slug, _token)         -> table      (anon-callable)
validate_invitation_token(_token)            -> table      (anon-callable)
use_invitation_token(_token, _email)         -> boolean    (anon-callable)
```

### 7.5 Triggers

- `set_updated_at` on every mutable table.
- `handle_new_user` (AFTER INSERT ON auth.users) — creates profile + default role; derives `company_id` ONLY from a validated `invite_token`.
- `update_last_login` (AFTER INSERT ON auth.sessions or on sign-in webhook) — updates `profiles.last_login_at`.
- `prevent_seniority_self_escalation` (BEFORE UPDATE ON profiles) — silently reverts `seniority_level` change unless actor is `master_admin`.
- Balance decrement trigger on `time_off_requests` when status transitions to `approved` (and re-credit on `cancelled` after approval).

### 7.6 Storage buckets & policies

| Bucket | Public | Owner-scoped path | Notes |
|---|---|---|---|
| `profile-photos` | ✅ | `{user_id}/avatar.{ext}` | Upload requires `auth.uid() = user_id` |
| `company-logos` | ✅ | `{company_id}/logo.{ext}` | Company admin only |
| `event-images` | ✅ | `{company_id}/events/{event_id}.{ext}` | Event creator |
| `hr-documents` | ❌ | `{company_id}/{owner_id}/{uuid}` | **Manager/Admin only upload**; SELECT policy JOINs `documents` RLS; downloads via signed URLs |
| `policies` | ❌ | `{company_id}/policies/{policy_id}/v{version}.pdf` | Admin upload |
| `company-files` | ❌ | `{company_id}/{folder}/...` | Shared files |

All private buckets serve via `createSignedUrl(path, 60 * 5)` (5-minute default).

### 7.7 Realtime
- Enable replication (`REPLICA IDENTITY FULL`) on: `notifications`, `messages`, `kudos`, `announcements`, `time_off_requests`, `event_rsvps`, `comments`.
- Add to `supabase_realtime` publication.
- Client subscribes per-user channel; UI updates via query invalidation and toast.

---

## 8. Routing map (React Router)

Public: `/`, `/landing`, `/login`, `/register/:token`, `/c/:slug/join`, `/reset-password`, `/403`, `/404`.

Auth-only, no company gate: `/company/create`, `/profile/create`, `/profile/:id/edit`.

Company-gated (inside `AppLayout`):
- `/dashboard`, `/directory`, `/profile/me`, `/profile/:id`
- `/org-chart`, `/people/celebrations`, `/kudos`, `/events`
- `/documents`, `/policies`, `/time-off`, `/jobs`, `/onboarding`, `/surveys`, `/announcements`, `/files`
- `/services` (nested: `index`, `create`, `:id`, `:id/edit`) — wrapped in `<ServicesLayout>`
- Role-gated admin: `/admin/organizer[/groups]` (manager|admin), `/admin/director[/team|/info]` (manager|admin), `/admin/master[/users|/users/new|/analytics]` (admin), `/admin/settings` (admin)

Catch-all: `<Route path="*" element={<Navigate to="/404" replace />} />`.

`/` redirects to `/landing` for unauthenticated users; if authenticated + company, `/dashboard`.

---

## 9. Global layout — header, sidebar, footer

### Header (`Header.tsx`)
- Height 58px, `border-b border-border`, backdrop-blur on scroll.
- Left: mobile menu button (md:hidden), collapsed brand mark, breadcrumbs (name resolved via route matches; parent items unclickable when they are containers like `Admin`).
- Right: `LanguageSwitcher`, `ThemeToggle`, `NotificationsDropdown` (bell with unread count, opens Popover with real-time list, "Mark all read", pagination), avatar menu (`My Account`, `Sign out`).

### Sidebar (`Sidebar.tsx`)
- Width `w-56` open / `w-14` collapsed; persisted in `localStorage.sidebarCollapsed`.
- 58px brand header (brand asterisk tile + `SkillFormLogo`).
- Nav pill buttons: rounded-full, `bg-secondary text-foreground font-semibold shadow-tonal` when active; `text-muted-foreground hover:bg-secondary/60` when inactive. Duotone icon weight when active.
- Order of items (role-filtered):
  1. Dashboard, My Profile, Directory
  2. Org Chart, Celebrations, Kudos, Events
  3. Documents, Policies, Time Off, Jobs, Onboarding
  4. Announcements, Surveys, Files
  5. Services (only if `can_access_services`)
  6. Manager+: Groups, My Team, Department Info
  7. Admin: User Management, Settings
- Bottom: user card (avatar initial, name, role label).
- Collapse toggle: absolute `-right-3 top-[70px]` chevron.

### Footer
Fixed at bottom of main flow, respects sidebar width. Text literal: `© Grupo Garnier. All rights reserved.` (never add a year, never localize the "Grupo Garnier" portion).

---

## 10. Modules

Every module page follows this structure:
1. **PageHeader** (title, subtitle, primary action button — CTA copy from `t()`).
2. **Filters/Toolbar** row.
3. **Main content** (list, calendar, kanban, or feed).
4. **Empty state** (icon + copy + CTA).
5. **Skeletons** while loading (never spinners on the primary surface).
6. All writes → `invalidateQueries` + `toast.success(t('common.messages.saved'))`.
7. All errors → `toast.error(err.message ?? t('common.messages.error'))`.

### 10.1 Landing (`/landing`) — 7 sections
1. **Hero** — brand asterisk mark, headline (`landing.hero.headline`), sub-headline, dual CTAs (Sign in / Request access via `AuthModal`), scroll progress bar (top hairline), `AmbientBackground`.
2. **Directory & profiles** — showcase of `ProfileCard`s.
3. **Services & matching** — screenshots + copy for talent scoring.
4. **Complete HR Suite** — 9 module cards (Time-off, Onboarding, Jobs, Documents, Policies, Surveys, Kudos, Events, Announcements) in a 3×3 grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with right-column **"Surfaced where it matters"** callout listing the four dashboard widgets. Uses `items-start` alignment so the right callout aligns to the top of the second-row-left card.
5. **Capabilities** — 4-tile grid (Multi-language, Theming, Roles & RLS, Realtime) on the left with a `Platform Stats` card on the right, top-aligned (grid `items-start`).
6. **Roles & workflows** — three column swimlanes for User / Manager / Admin.
7. **Footer CTA** — call to action + footer with legal literal.

Global landing chrome: `SectionRail` right rail (dots + section labels, scroll-spy), `SectionAdornment` (bracketed index `[ 0N / 07 ]` before each title), `AsteriskPreloader` first paint.

### 10.2 Auth screens
- **Login** — email + password (with visibility toggle), remember me, forgot password link, sign-in button, `Sign in with Google` (optional), invite-only messaging when no `?auth=` deep link.
- **Register** (`/register/:token`) — verify token, show branded company (from `get_company_by_invite`), pre-fill email, block if invalid/expired, on submit call `signUp` with `invite_token` in metadata, then redirect to `/profile/create`.
- **AuthModal** — dual-mode dialog for landing page login/register CTAs; deep-linked via `?auth=login|register&token=...`.
- **CompanyCreate** — logo upload (drop zone + preview), name → slug preview (`spaces → _`), description, industry, country. On submit: refresh session, insert, then patch `profiles.company_id`.
- **CompanyJoin** — public branded screen (logo, name), Accept invite CTA → `/register/:token`.

### 10.3 Dashboard (`/dashboard`)
Behavior: read `role` from context. If `admin` → navigate to `/admin/master`. If `manager` → `/admin/director`. If `user` → render **Employee Dashboard**:
- **Welcome header** (localized greeting by time of day + first name).
- **QuickStatsBar** (skills count, brands managed, projects, years of experience) using `StatsCard`.
- **Widgets row**:
  - `MyTimeOffBalanceWidget` — per-policy balances, next accrual, quick "Request time off" link.
  - `MyOnboardingProgressWidget` — progress bar + next 3 tasks (only if assignment exists).
  - `KudosFeedWidget` — top 5 latest kudos (company-wide).
  - `PendingApprovalsWidget` — visible only if user is a direct manager or admin; shows time-off + job applications awaiting decision.
- **Recommended colleagues** — up to 6 profile cards ranked by shared-skill count.
- **Recent announcements** (unread first, then pinned).
- **Upcoming events** (next 30 days RSVP-scoped).

### 10.4 Directory (`/directory`)
- `useDirectoryData` — paginated (12/page) with filters: search (debounced 300ms via `useDebounce`), country, agency, department, seniority, skills (multi), languages (multi).
- Two views: **Grid** (`ProfileCard`) and **Table** (`ProfileTable` — sortable). Toggle persisted in `localStorage.directoryView`.
- Each card: avatar, name, position, seniority chip (color-coded), country flag (via `src/utils/countryFlags.ts`), top-3 skills, "View profile" hover CTA.
- `DirectoryPagination` — page numbers + prev/next, keyboard nav.
- Empty state per filter combination.

### 10.5 Profile

**Create wizard** (`/profile/create`, admin skipped) — 10 steps in a fullscreen layout with `StepIndicator` at the top (numbered chips with progress connector):
1. **Basic Info** — first/last name, email (readonly if from auth), phone (validated to allow spaces/dashes), country, avatar upload with `ImageCropper` (square, min 200×200).
2. **Professional Info** — current position, department, agency (from tenant catalog), years of experience, bio (500 chars max), social links (`SocialMediaFields`).
3. **Education** — academic degree(s), certifications.
4. **Skills** — add/edit skill (name, category, proficiency 1–5, years). New skills default `proficiency_level=1` so they render immediately with the "Beginner" label.
5. **Industries** — pick from `industries` reference + years.
6. **Languages** — language + `is_native` toggle + speak/read/write levels 1–5.
7. **Brands & Projects** — `brands_managed`, `recent_projects` (with year/month, role, key results).
8. **Awards** — award name, type, category, year, won?, description.
9. **Performance** — pitches (participated/won), brand creations/refreshes, Effie awards, consulting work.
10. **Review** — read-only summary; on submit sets `profile_completed=true`.

Rules:
- The wizard is fully i18n-driven; every counter label ("Position 1", "Brand 2", "Award 3") comes from `profile.counters.*`.
- Phone validation is permissive (regex allowing digits, spaces, dashes, parentheses, leading `+`).
- Email field auto-populates once the auth user resolves (race-condition safe).
- Race guard: don't allow "Next" if the current step's zod schema hasn't validated.

**View** (`/profile/:id` or `/profile/me`) — layout:
- `ProfileHeader` (avatar, name, position, seniority chip, socials, `MessageButton`).
- `QuickStatsBar`.
- Tabs: **Overview**, **Experience**, **Skills & Languages**, **Projects & Awards**, **Additional Info**.
- Owner/Manager/Admin see `HRFieldsCard` (birth date, start date, manager, department, seniority — masked for others).
- Non-owner view has "Contact" and "View services" if applicable.

**Edit** (`/profile/:id/edit`) — same 10-step wizard prefilled; admin can edit anyone in tenant; users only themselves.

### 10.6 Org Chart (`/org-chart`)
- Recursive tree built from `profiles.manager_id`.
- Root = employees with `manager_id IS NULL`.
- Node card: avatar, name, position, department chip, direct-report count. Click expands children.
- Empty state if no relationships defined.

### 10.7 Celebrations (`/people/celebrations`)
- Split view: **Birthdays** (today, this week, this month) and **Anniversaries** (today, upcoming, milestones).
- Each row: avatar, name, department, date, "Send kudos" quick-action.
- Edge function `daily-celebrations` runs at 00:05 tenant-local (or UTC + cron) and inserts `notifications` (`type='birthday_today'` / `'work_anniversary'`).

### 10.8 Kudos (`/kudos`)
- Company feed (latest first). Post form: recipient (searchable), message (280 chars), `value_tag` (Collaboration, Impact, Growth, Craft, etc.), visibility (`public` default; `private` DM-style).
- Real-time updates via Supabase channel.
- Each kudos supports reactions and threaded comments via polymorphic `comments`.
- Profile page shows "Received kudos" tab.

### 10.9 Events (`/events`)
- Tab: **Upcoming** / **Past**. View toggle: **List** / **Calendar** (react-day-picker).
- Create/edit (admin+manager): title, description, start/end datetime, timezone, location, `is_virtual` + `meeting_url`, cover image (`event-images`), visibility (`company|department`), department scope.
- RSVP buttons: Going / Maybe / Declined; attendee list; comments thread.
- Notifies invited audience on create/update.

### 10.10 Documents (`/documents`) — personal HR
- Folder tree sidebar (`document_folders`) — CRUD.
- File table: name, uploader, size, mime icon, visibility badge, actions (download, share, delete).
- Upload flow: drop zone → picks folder → sets visibility (`private|manager|company`) → PUT to `hr-documents` with path `{company_id}/{owner_id}/{uuid}` → insert `documents` row → toast.
- Downloads: `createSignedUrl` valid 5 min.
- Deletion cascades storage + row.

### 10.11 Policies (`/policies`)
- List with status chip (draft/published/archived), version, effective date, ack coverage %.
- **Admin publish flow**: create draft (Markdown body via `react-markdown` preview) → attach PDF (optional, via `policies` bucket) → publish (creates `notifications type='policy_acknowledge_required'` for all users in tenant).
- **User view**: full body + "I acknowledge" button (writes `policy_acknowledgements`, dismisses banner globally).
- Admin dashboard tile shows per-policy coverage bar.
- PDF export of any policy uses jspdf with Garnier header/footer.

### 10.12 Time Off (`/time-off`)
- **Employee tab**: balances per policy per year, "Request time off" (date range picker, policy select, reason textarea). Validates `min_notice_days`, day count math (excludes weekends optionally per policy).
- **Manager tab** (visible if `is_direct_manager` for any user): pending queue with approve/reject (mandatory comment on reject).
- **Admin tab**: manage `time_off_policies`, override balances, calendar of all approved leaves per department.
- Balance decrement runs in DB trigger on `approved` transition; re-credit if the request is later cancelled.
- Notifications sent to approver on submit; to requester on decision.

### 10.13 Jobs (`/jobs`)
- **Employees**: browse cards (title, department, location, employment type, deadline). Filter by department/type. Detail → apply modal (cover note textarea, resume upload via `attachments`).
- **Hiring manager view**: applications list per posting with status pipeline (submitted → reviewing → interview → offer → hired | rejected).
- **Admin**: create/edit postings (`draft|open|closed`); on `open` publish a `notifications type='job_posted'` to the target audience.

### 10.14 Onboarding (`/onboarding`)
- **Admin**: manage templates and tasks (day offset 0/7/14/30, assignee role `new_hire | manager | hr`).
- **New hire**: assignment created (on hire) → `onboarding_tasks` cloned. Personal checklist ordered by day offset. Mark done (records `completed_at`). Confetti + toast on 100% completion.
- **Manager / HR**: sees assignments where `assignee_role` matches; can mark on behalf.
- Widget on dashboard shows progress and next 3 tasks.

### 10.15 Surveys (`/surveys`)
- **Admin form builder**: title, description, anonymity toggle, target scope (`company|department|role`), open/close dates.
- **Questions builder**: drag-sort (dnd-kit), 5 types:
  - `single` — radio, options[].
  - `multi` — checkbox, options[].
  - `scale` — 1–5 or 1–10, labels.
  - `text` — textarea.
  - `nps` — 0–10 with promoter/passive/detractor grouping.
- **Employee fill**: one question per screen (or scroll), required indicator, progress bar; submit inserts `survey_responses` (+ `survey_answers`). If `anonymous`, `user_id` is NULL and no session identifier is written.
- **Results dashboard**: bar charts (categorical), histogram (scale), NPS breakdown (donut + score), word cloud placeholder for text (v1: latest 20 quotes).

### 10.16 Announcements (`/announcements`)
- Feed with pinned (sticky top) then chronological. Filter: company vs department.
- Publish flow (admin/manager): title, body (Markdown), scope, department (optional), pinned toggle, expires_at.
- On publish → notifications to audience.
- Reads recorded on view (`announcement_reads`).

### 10.17 Files (`/files`)
- Shared company/department files (distinct from personal HR docs).
- Folder navigation, department scoping, upload to `company-files`, size/mime badges, download via signed URL.

### 10.18 Services (`/services/*`)
- `ServicesLayout` — left sub-sidebar of categories + primary content `<Outlet/>`.
- **List**: filterable table (status, category, managed_by, client). Only visible if `can_access_services`.
- **Create/Edit**: form with catalog item, client, dates, status, **Managed by** (defaults to admins + managers; falls back to all active employees so the selector is never empty), `ServiceSkillsManager` (add skill + min proficiency 1–5 + weight), vendors sub-form.
- **Detail**: overview + `MatchedTalentList` (ranked by `match_score`, colored by seniority, `Message` CTA). Skill changes trigger `auto-match-services` edge function.

### 10.19 Admin — Master (`/admin/master`)
- Tabs: **Overview**, **Users**, **Departments**, **Agencies**, **Analytics**.
- Overview: `StatsCard` grid (total users, active this week, pending invites, filled profiles %), `ActivityFeed`.
- Users: `UserManagementTable` (search, filter by role, sort), `AddUserModal` (email + role → creates `invitation_tokens`), `ChangeRoleModal`, `DeleteUserDialog` (calls `delete-account` edge function), `PendingInvitations` (resend/revoke).
- Departments: `DepartmentManagement` — CRUD + assign director.
- Agencies: `AgencyManagement` — CRUD.
- Analytics: `DashboardCharts` (Recharts, using `--chart-N` HSL tokens; light + dark variants automatic).
- `ExportPDFButton` for roster & analytics (Garnier-branded).

### 10.20 Admin — Director (`/admin/director`)
- `DirectorStatsCards`, `TeamRoster` (direct reports + skip-level), `TeamAnalytics` (skills coverage, time-off usage), `DepartmentInfoForm`.

### 10.21 Admin — Organizer (`/admin/organizer`)
- `OrganizerStats`, `GroupsList`, `CreateGroupModal`, `DeleteGroupDialog`, `GroupDetails`, `KanbanView` (dnd-kit; columns = statuses like Shortlist / Contacted / Interviewing / Rejected).

### 10.22 Admin — Settings (`/admin/settings`)
- Company profile (name, logo, description, industry, country), subscription info, module toggles, danger zone (delete workspace — requires exact-name confirmation).

---

## 11. Notifications, messaging, realtime

- `NotificationsDropdown` — bell + unread badge, opens `Popover` with virtualized list. Types map to icons + deep links (e.g. `time_off_request` → `/time-off?request=<id>`).
- **Types** (constants):
  ```
  time_off_request, time_off_decision, kudos_received, birthday_today,
  work_anniversary, event_invite, event_reminder, job_posted,
  job_application_update, onboarding_task, onboarding_complete,
  policy_acknowledge_required, survey_invite, announcement,
  message_received, mention
  ```
- **Messaging** — 1:1 threads (`messages`); `MessageButton` on profiles opens `SendMessageModal`. Unread badges surface in Header. Realtime channel per user.
- All realtime uses Supabase channels; UI reacts via `queryClient.invalidateQueries` and optional toasts.

---

## 12. Edge functions (`supabase/functions/*`)

Deno + `Deno.serve`. Standard CORS headers. Never log secrets. Read env via `Deno.env.get`.

- `auto-match-services` — invoked after service or service_skills mutation. Reads service skills, ranks employees by weighted skill coverage, upserts `service_talent_matches`.
- `daily-celebrations` (to add if missing) — cron daily; inserts `notifications` for birthdays and work anniversaries.
- `cleanup-test-users` — deletes seeded test accounts and their tenant data (admin-only).
- `delete-account` — deletes an auth user + cascades (admin-only, requires JWT verification).
- `seed-master-user` — bootstraps a platform master admin (idempotent).
- `seed-test-accounts` — creates **Garnier Test Co** with test admin/manager/employee accounts populated with realistic data (skills, kudos, onboarding assignment, time-off balances).

All functions use JWT verification unless explicitly public. All functions must be registered in `supabase/config.toml` with `verify_jwt = true|false` per case.

---

## 13. Cross-cutting patterns

### 13.1 Data fetching
- One `useQuery` per resource; `queryKey` = `['entity', filters, pageParam]`.
- Cache-time defaults; use `staleTime: 30_000` on lists, `Infinity` on reference data (countries, industries).
- After every write: `queryClient.invalidateQueries({ queryKey: ['entity'] })`.

### 13.2 Forms
- `react-hook-form` + `zodResolver`.
- Error messages come from i18n via `t('common.validation.*')`.
- Async validation for unique fields (email, slug) with debounced check.

### 13.3 Uploads
```ts
const path = `${companyId}/${ownerId}/${crypto.randomUUID()}-${file.name}`;
await supabase.storage.from(bucket).upload(path, file, { upsert: false });
// then insert row referencing path
```

Downloads for private buckets:
```ts
const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
```

### 13.4 PDF export
- Use jspdf + jspdf-autotable. Header includes Garnier wordmark, tenant company name, date. Footer: page N of M + legal literal. Fonts embedded (Space Grotesk & Manrope). Never leak Supabase URLs into exports.

### 13.5 Error handling
- Wrap page trees in an ErrorBoundary that renders a branded fallback.
- Toast on transient errors; full page on auth/session failures.
- 403/404 pages branded via `Forbidden.tsx` / `NotFound.tsx`.

### 13.6 Performance
- Code-split routes with `React.lazy` where bundle grows.
- Virtualize long lists (react-window or manual windowing) when >200 items.
- Prefer semantic tokens over inline styles; avoid re-renders by memoizing rows.

---

## 14. Accessibility & SEO

- All interactive elements reachable via keyboard; visible focus rings using `--ring`.
- ARIA roles/labels on custom widgets (nav, tabs, listbox).
- Modals trap focus, restore on close, close on Escape.
- Motion respects `prefers-reduced-motion`.
- Color contrast ≥ 4.5:1 in both themes (verified against tokens).
- SEO: single `<h1>` per page, `<title>` and `<meta name="description">` per route (via `document.title` effect or a `SEOHead` helper), Open Graph + Twitter card set in `index.html`, semantic HTML, alt text for imagery, `viewport` responsive, `robots.txt` allow-all except admin.
- `index.html` `<title>` must be app-specific (`Skill*form — Talent & HR platform by Grupo Garnier`), never `Lovable App` defaults.

---

## 15. Testing seed data

Edge function `seed-test-accounts` creates:
- Company: **Garnier Test Co** (slug `garnier_test_co`)
- Password for all: `TestPass!2026`
- `test-admin@garnier-test.local` — `admin`
- `test-manager@garnier-test.local` — `manager` (with 3 direct reports)
- `test-employee@garnier-test.local` — `user` (has onboarding assignment, time-off balance, 5 skills, 2 kudos received)

---

## 16. Non-negotiable rules & anti-patterns

- ✅ RLS + explicit GRANTs on every public table. Migrations without both = incorrect.
- ✅ Roles ONLY in `user_roles`. Never on `profiles`.
- ✅ Every SECURITY DEFINER function has `SET search_path = public`; EXECUTE revoked from PUBLIC/anon; granted to `authenticated` (or `anon` when invite flow requires).
- ✅ Footer literal is exact: `© Grupo Garnier. All rights reserved.` — no year.
- ✅ Slugify uses `_` (underscore) not `-`.
- ✅ Admins do NOT have employee profiles.
- ✅ Every user-visible string calls `t()`; en/es key parity always.
- ✅ Only tokens in styles (colors/gradients/shadows/radii).
- ✅ Never edit `src/integrations/supabase/{client,types}.ts`, `supabase/config.toml` (project-level), `.env` (Supabase-injected keys), or introduce a second `config.toml`.
- ✅ Never expose Supabase project IDs/URLs, service role key, or DB password to users. Product name is **Lovable Cloud** in UX; the underlying backend name is never surfaced.
- ✅ Public sharing links were removed and must never be re-added.
- ✅ No shadows by default. No purple/indigo generic gradients. No serif fonts.
- ❌ No React Suspense-only spinners as primary loaders — use skeletons.
- ❌ No client-side admin gates (checking `localStorage` or hardcoded emails). Always server-verified via `has_role` / RLS.
- ❌ No `<noscript><img>` inside `<head>` — only metadata tags allowed there.
- ❌ Do not run `find /`, `sleep N`, or stateful `git` commands in the harness.

---

## 17. Suggested improvements to include on rebuild

These extend the current implementation and should be baked into the initial build:

### 17.1 Product / UX
1. **Global command palette** (⌘K) — cmdk-based: search users, jump to modules, quick actions (Request time off, Post kudos, New announcement).
2. **Saved views** for Directory and Services (persisted per user).
3. **Mentions system** — `@name` inside comments/announcements/messages → notification `type='mention'`; parsed via a small tokenizer.
4. **Reactions** on kudos, announcements, comments (emoji picker, aggregate counts).
5. **Employee wall** on profile (kudos received, awards, recent projects timeline).
6. **In-app onboarding tour** for first login (Shepherd.js-style) — respects reduced-motion.
7. **Dashboard customization** — drag to reorder widgets, per-user layout.
8. **Bulk operations** in admin tables (bulk role change, bulk invite, bulk deactivate).
9. **CSV import/export** for users, departments, agencies, time-off balances.
10. **PWA support** — installable, offline shell for the Dashboard, service worker with Workbox.
11. **Push notifications** (web push) opt-in per user.
12. **Two-factor authentication** (TOTP) enforced for admins.
13. **Session activity log** in profile (last logins, device, IP).
14. **Rate limiting** on invite creation and message sending (edge function + Postgres advisory locks).

### 17.2 HR depth
15. **Payroll placeholder module** with export to CSV (fields: gross, deductions, net) — no real payroll processing.
16. **Performance reviews** — 360° review cycles, self + manager + peer, calibration.
17. **1:1 meeting notes** — recurring, shared between manager and report.
18. **Goals / OKRs** — per user + team, quarterly, progress % rollup.
19. **Time-off calendar sync** — iCal feed per user + team.
20. **Public holiday calendars** per country (seeded).
21. **Custom fields** on profiles (JSONB + admin schema builder).

### 17.3 Data & analytics
22. **Materialized views** for dashboard counts (refresh nightly + on write for hot metrics).
23. **Weekly digest email** — pending approvals, birthdays this week, new announcements. Sent via Resend/SendGrid edge function.
24. **Event bus table** (`events_stream`) with retention window for downstream analytics.
25. **Analytics module** — filterable retention / engagement / skill-coverage charts.

### 17.4 Engineering
26. **Storybook** for shadcn components with token demos.
27. **Vitest + Testing Library** for hooks and UI; **Playwright** e2e for auth, wizard, time-off, onboarding.
28. **Zod schemas colocated** per feature under `src/features/<feature>/schema.ts`.
29. **API layer** thin wrappers per resource under `src/api/*` so pages import typed functions, not raw supabase queries.
30. **Feature flags table** (`feature_flags(name, enabled, tenant_id nullable)`) + `useFeature('flag')` hook.
31. **Migration linter** step in CI enforcing: `CREATE TABLE` in `public` must be followed by `GRANT` and `ENABLE ROW LEVEL SECURITY` in the same file.
32. **Type-safe env** via `zod` in `src/env.ts`.
33. **Sentry** wired for the client and edge functions (with PII scrubbing).
34. **Content Security Policy** delivered via meta + platform headers.
35. **Backup strategy documented** — daily Supabase logical backups + storage bucket versioning.
36. **Localization QA script** — parses locale JSONs, ensures parity + no missing interpolation tokens.

### 17.5 Compliance
37. **GDPR export & delete** — self-service data export (JSON zip) and account deletion request flow.
38. **Audit log viewer** in admin, filterable, exportable.
39. **Consent center** — user opt-ins for messaging, analytics, cookies.
40. **Data retention policies** per module (e.g., delete completed onboarding after 2 years).

---

**End of specification.** With this document plus the migrations and source, the platform can be reproduced deterministically. When in doubt, follow the rules in §16 and the token discipline in §4.
