# Skill*form — Functional & Capability Specification

> Purpose: hand this document to a developer replicating Skill\*form. It describes **what the app does** — every feature, module, workflow, permission, and business rule. Visual/design decisions are intentionally excluded.

---

## 1. Product summary

Skill\*form is a **multi-tenant SaaS** combining a **Talent Directory** with a **full HR & internal-communications suite**. Each tenant is a **company** (workspace). Every user belongs to exactly one company; a special **platform master** account exists outside any company for support/administration.

Core capability pillars:

1. **Talent profiles & directory** — rich employee records, searchable and filterable.
2. **Services catalog & talent matching** — services the company offers, matched to internal talent.
3. **HR operations** — time-off, onboarding, internal jobs, HR fields on profiles, documents, policies.
4. **Culture & communication** — kudos, announcements, events, celebrations (birthdays/anniversaries), org chart, shared files, surveys.
5. **Administration** — role-based dashboards, invitations, taxonomies (agencies, departments, industries), audit and analytics.
6. **Multi-language** — every user-facing string in English and Spanish, per-user preference.

---

## 2. Tenancy, accounts, and roles

### 2.1 Tenancy model
- **Company** = workspace. All feature data (profiles, documents, events, etc.) is scoped by `company_id`.
- A user cannot see or affect data from another company. This is enforced in the database (RLS) and in the UI.
- A **platform master admin** has no `company_id` and is a special case: bypasses the company gate, can support any workspace, but has no employee profile.

### 2.2 Roles
Three application roles, stored in a dedicated `user_roles` table (never on the profile):

- `user` (Employee) — standard team member. Sees their own profile, the directory, culture modules, and can act on their own HR items (request time-off, complete onboarding, acknowledge policies, apply to jobs, RSVP, etc.).
- `manager` (Director / Department Head) — everything an employee has, plus a **Director Dashboard**, team roster, ability to approve time-off for direct reports, moderate policies/announcements in their department, and see richer directory info.
- `admin` (Master Admin) — full workspace administration: user management, invitations, roles, taxonomies, all HR governance, all analytics, all module CRUD.

Roles are checked with a security-definer helper (`has_role(user_id, role)`), never trusting client claims. Elevating a user's role is an admin-only action.

### 2.3 Authentication & sign-up
- Email + password authentication with email confirmation.
- Google OAuth is configured by default.
- **No open sign-ups**: a user can only join a company via (a) a valid **invitation token** issued by an admin, or (b) creating a **new company** (which makes them its admin).
- Password reset via email link.
- Sessions persist across refresh; a route guard redirects unauthenticated users to `/landing`.
- A "company gate" redirects any logged-in user without a `company_id` to `/company/create` or `/company/join` (unless they are the platform master).

### 2.4 Invitations
- Admins issue invitations with: target email, role (`user`/`manager`/`admin`), optional department, expiry.
- Each invitation produces a **single-use token**. The token is emailed and also visible/copyable in the admin panel while pending.
- On accept, the invitee sets a password (or authenticates via Google), and is placed into the company with the specified role. The token is consumed and cannot be reused.
- Admins can revoke pending invitations, resend them, or change the assigned role before acceptance.
- Expired/revoked/used tokens are rejected with a clear error.

### 2.5 Company creation & joining
- **Create company**: name, workspace URL slug (spaces converted to underscores, uniqueness enforced), country, industry, optional logo. The creator becomes the company's first `admin`. A default set of taxonomies (departments/industries) is seeded.
- **Join company**: accepts an invitation token from a URL or manual entry; user is bound to the tenant and role.
- A user belongs to **one company at a time**. Switching companies requires re-invitation.

### 2.6 Account lifecycle
- Admins can **deactivate** users (removes access, keeps history) or **delete** them via an edge function (removes auth user + profile + associated records under RLS).
- Users can delete their own account (self-service) — this runs a server-side function that cascades cleanup while preserving audit rows.

---

## 3. Data model overview (what each table stores)

Every table below is company-scoped unless noted, has RLS enabled, and grants the necessary privileges to `authenticated` / `service_role` (never `anon` except for pre-auth flows).

### 3.1 Identity & org
- `profiles` — one row per user, ~36 fields: identity (name, avatar, cover, bio), contact, location, company_id, department, agency, seniority, role in company, `manager_id` (self-referencing for org chart), HR fields (see §7.4), `profile_completed`, `is_active`, timestamps, birth date, hire date, onboarding fields.
- `user_roles` — `(user_id, role)` pairs. **Never** stores roles on `profiles`.
- `companies` — tenant record: name, slug, country, industry, logo, invite metadata, plan flags.
- `agencies`, `departments`, `industries`, `countries` — taxonomies. Agencies, departments, and industries are per-company and admin-managed. Countries are global.
- `invitation_tokens` — pending invites (see §2.4).

### 3.2 Talent
- `previous_positions`, `previous_agencies`, `brands_managed`, `recent_projects`, `awards`, `employee_languages`, `employee_skills`, `employee_industries` — rich profile detail rows, each with a proficiency/scoring column where relevant.

### 3.3 Services
- `service_categories`, `service_catalog` (canonical services), `services` (company-specific instances), `service_skills`, `service_vendors`, `service_talent_matches`.

### 3.4 HR
- `time_off_policies`, `time_off_balances`, `time_off_requests`.
- `onboarding_templates`, `onboarding_template_tasks`, `onboarding_assignments`, `onboarding_tasks`.
- `job_postings`, `job_applications`.
- `policies`, `policy_acknowledgements`.
- `documents`, `document_folders` — personal HR documents and general document library.

### 3.5 Culture & comms
- `announcements`, `announcement_reads`.
- `events`, `event_rsvps`.
- `kudos`.
- `groups`, `group_members` (interest/department groups).
- `messages` (internal 1:1 messaging).
- `notifications` (per-user unread feed).
- `shared_files` (company/department scoped file library).
- `surveys`, `survey_questions`, `survey_responses`, `survey_answers`.

### 3.6 Cross-cutting
- `attachments` — polymorphic file attachments referenced by other rows (`entity_type`, `entity_id`).
- `comments` — polymorphic comments (same shape).
- `audit_log` — sensitive administrative actions (role changes, deletions, invite issuance).

---

## 4. Security & data access rules

- **RLS enabled on every public table.** Every table has explicit policies; there is no implicit access.
- **Tenant isolation**: every query filters by `company_id = current user's company_id`, enforced in policy `USING` clauses.
- **Role checks** always go through `has_role(auth.uid(), 'role')` — a `SECURITY DEFINER` function with pinned `search_path` — to prevent RLS recursion and privilege escalation.
- **Least-privilege grants**: `SELECT/INSERT/UPDATE/DELETE` are granted only where needed; `anon` is granted access only for the two pre-auth flows (accepting an invite, looking up a public company by slug).
- **Storage**:
  - Public buckets: `company-logos`, `event-images`, `profile-photos` (read-anonymous by design, uploads restricted to owner/admin).
  - Private bucket: HR documents. `SELECT` on storage is gated by document RLS (owner + direct manager + admin). Uploads restricted to manager/admin.
- **Sensitive columns** (`companies.invite_token`, HR fields) are excluded from broad SELECT policies.
- **Signup hardening**: the `handle_new_user` trigger ignores any client-supplied `company_id`; company binding only occurs via verified invitation tokens.
- **Audit log** captures role changes, user deletions, invitation issuance/revocation, policy publishes, and document deletions.
- **No client-side admin checks** — every admin gate is validated server-side by RLS or edge functions.

---

## 5. Global capabilities

### 5.1 Navigation & routing
- Authenticated app is behind an `AppLayout` with sidebar + header.
- Sidebar items appear/hide based on role and feature flags.
- Breadcrumbs on every page; parent segments are unclickable when they are not real routes.
- Role-aware home routing:
  - `admin` → `/admin/master`
  - `manager` → `/admin/director`
  - `user` with completed profile → `/profile/me`
  - `user` without profile → `/profile/create` (wizard)

### 5.2 Localization
- Languages: **English** and **Spanish**.
- Every user-facing string routed through `t()`; locale files kept at key parity.
- Language selector in the header; preference persisted per user.
- Date, number, and pluralization respect the active locale.

### 5.3 Notifications
- In-app notification feed with unread badge.
- Triggered by: new kudos, mentions in comments, new messages, time-off request/decision, onboarding task assignment, new policy requiring acknowledgement, announcement published, event RSVP reminders, job application status changes.
- Real-time delivery via subscription channels; clicking a notification deep-links to the related object and marks it read.

### 5.4 Messaging
- 1:1 internal messages between users of the same company.
- Threaded by pair; unread counter; realtime updates; muteable.
- Managers/admins cannot silently read others' private messages (no back-office view).

### 5.5 Search & filtering
- Global directory search (name, department, skill, agency, country, language, industry).
- Per-module search (documents, policies, events, jobs, files, surveys, announcements).
- Filters persist in URL query params where useful (deep-linkable results).

### 5.6 Comments & attachments (polymorphic)
- Announcements, events, documents, policies, kudos, and job postings can accept comments and attachments through a shared subsystem.
- Attachments respect the visibility of their parent entity.

### 5.7 Audit & compliance
- All destructive/privilege-changing actions are recorded (actor, target, before/after, timestamp, IP if available).
- Admins can view the audit log; a filter by actor/target/type is available.

### 5.8 Exports
- **PDF export** of the Master Dashboard analytics view (via a print-optimized DOM subtree).
- **CSV export** of the directory (respecting current filters).
- Garnier-branded PDF wrapper (logo, footer text).

### 5.9 Analytics
- Master Dashboard aggregates: total users, profile completion %, active-this-month, role distribution, registrations over time (7/30/90 days), department distribution, country distribution.
- Director Dashboard aggregates: team headcount, completion, activity for the manager's department only.

---

## 6. Talent profile subsystem

### 6.1 Profile creation wizard (Employee onboarding of their own profile)
- 10 steps, non-skippable required fields per step, progress persisted per step so a user can resume:
  1. **Basic info** — first/last name, preferred name, avatar, cover, birth date, gender (optional), pronouns.
  2. **Contact & location** — email (auto-filled from auth, read-only), phone (permissive validation with spaces/dashes), country, city, timezone.
  3. **Professional info** — current position, agency, department, seniority, hire date, employment type.
  4. **Education** — degrees, institutions, dates.
  5. **Previous positions & agencies** — repeatable entries with dates, role, responsibilities.
  6. **Brands managed & recent projects** — repeatable, per-brand/project detail.
  7. **Skills & expertise** — skill names + proficiency (1–5, labeled Beginner→Expert); new skills default to level 1 and are immediately visible.
  8. **Industries** — industries the user has worked in, with years of experience.
  9. **Languages** — language + proficiency, plus "native" flag.
  10. **Awards & performance** — awards (name, year, issuer), performance highlights, review.
- **Review step** collates everything and finalizes `profile_completed = true`.
- Each step validates in isolation and shows field-level errors in the active locale.

### 6.2 Profile view
- Header: avatar, name, role/position, agency, department, quick action buttons (message, edit if allowed).
- Quick stats bar: years of experience, brands managed count, awards count, languages count.
- Tabs:
  - **Overview** — bio, contact, headline metadata.
  - **Experience** — current & previous positions, agencies.
  - **Skills & Languages**.
  - **Projects & Awards**.
  - **Additional info** (visible only to master admins, and to the user themselves if they marked "available for consulting").
- **HR Fields card** (§7.4) visible only to owner + admin.
- **Cross-suite widgets** on `/profile/me` only: My Time-Off Balance, My Onboarding Progress, Kudos Feed.

### 6.3 Profile edit
- Users can edit their own profile at any time.
- Admins can edit any profile; managers can edit direct reports' non-HR fields.
- All edits are logged with `updated_at`.

### 6.4 Directory
- Card + table views (user-toggleable).
- Filters: department, agency, industry, country, language, skill, seniority.
- Search box (debounced).
- Pagination.
- Clicking a card opens the profile detail page.

---

## 7. HR operations modules

### 7.1 Time-off
- **Policies** (admin-managed): name, accrual type (fixed / accrual per period / unlimited), balance unit (days/hours), default balance, carryover rules, min notice, max consecutive.
- **Balances** per user per policy; recalculated when a request is approved/denied.
- **Requests**: user selects policy, dates (single day, range, or half-day), reason. Business rules:
  - Cannot exceed available balance.
  - Cannot overlap another approved request.
  - Notifies the direct manager (`manager_id` chain) for approval.
- **Approvals**: only the requester's manager (or admin) can approve/deny. Denial requires a reason. Approval decrements balance atomically.
- **Views**:
  - Employee: my requests + balances.
  - Manager: team requests pending approval + team balances.
  - Admin: all requests + policy management + manual balance adjustments.
- Notifications sent on: submitted (to manager), approved/denied (to requester), reminder before start date.

### 7.2 Onboarding
- **Templates**: named checklist of tasks, each task with title, description, due-offset (days from start), owner (assignee or role), optional attachments.
- **Assignment**: admin/manager assigns a template to a new hire; the system materializes an `onboarding_assignment` and one `onboarding_task` per template task with an absolute due date.
- **Task lifecycle**: `pending → in_progress → completed` (or `blocked`). Each task has comments and attachments.
- **Progress**: assignment is auto-completed when all tasks are `completed`.
- **My onboarding widget** on the employee's profile shows progress (done/total, %).
- **Admin views**: onboarding pipeline, per-hire status, overdue tasks.

### 7.3 Internal jobs
- **Postings** (admin/manager): title, department, location, employment type, description, requirements, is_open flag, close date.
- **Applications**: employees can apply with a note; status pipeline `submitted → screening → interview → offer → hired → rejected`.
- Applicants receive notifications on status change.
- Job postings can carry comments and attachments (JD PDFs).

### 7.4 HR fields on profile (Owner + Manager + Admin)
- Employment: employee ID, contract type, hire date, termination date (if any).
- Compensation: salary band or amount, currency, effective date (visible to admin only; manager sees band label only).
- Emergency contact: name, relation, phone.
- ID document reference.
- Tenure (auto-computed from hire date).
- All edits audit-logged.

### 7.5 Documents (personal HR + shared)
- **Folders** with hierarchy; folder-level ACL inherited by children.
- **Documents**: file + metadata (title, category, expires_at, owner_id, department_id, visibility).
- Visibility resolution order: owner, owner's manager chain, admin, department (if scoped), everyone-in-company.
- **Versioning**: each new upload increments a version; older versions retained; changelog note optional.
- **Expiration**: expiring documents raise notifications 30/7/1 day before.
- Storage access uses signed URLs, gated by the same RLS as the metadata row.

### 7.6 Policies
- **Policy** entities: title, body (rich text), category, effective date, requires_acknowledgement flag, version.
- **Publishing workflow**: draft → published; admin-only publish.
- **Acknowledgements**: when required, each user must click "I acknowledge"; the system records timestamp + version.
- Dashboard shows: my pending acknowledgements, per-policy acknowledgement rate (admin view).

---

## 8. Culture & communication modules

### 8.1 Announcements
- Company-wide or department-scoped posts, pinned/unpinned, with attachments and comments.
- Read-tracking: `announcement_reads` records who's viewed each post.
- Publishing rights: admins + managers (managers limited to their department).
- Realtime insert appears in the feed for eligible users.

### 8.2 Events
- Company events with title, description, location (physical or URL), start/end datetime, cover image, capacity, RSVP toggle.
- **RSVP** states: going / maybe / declined.
- Views: upcoming, past, my RSVPs.
- Reminders sent 24h and 1h before start.
- Event pages support comments and attachments.

### 8.3 Kudos
- Peer recognition post: recipient(s), category tag (e.g., "Teamwork", "Ownership"), message.
- Public feed; likes; comments.
- Cross-suite **Kudos feed widget** appears on employee profile and admin dashboards.

### 8.4 Celebrations (birthdays & anniversaries)
- Computed from `birth_date` and `hire_date` on `profiles`.
- Views: today, this week, this month.
- Optional automatic post to the announcements feed (admin-configurable).
- Users can opt out of showing their birthday.

### 8.5 Org chart
- Recursive tree built from `manager_id`.
- Interactive: expand/collapse subordinates, click node → profile.
- Multiple roots supported (top-level nodes without a manager).
- Search jumps to and highlights a person in the tree.
- Export (PDF) available to admins.

### 8.6 Shared files
- General-purpose file library (not the HR document store).
- Scope options: company-wide, department, group.
- Version-aware; download tracked.

### 8.7 Groups
- Interest or working groups: name, description, members, private/public flag.
- Members can post to a group feed (announcements-style) and share files/events with the group scope.

### 8.8 Surveys
- Types of questions: single-choice, multi-choice, Likert (1–5), rating (stars), free-text, NPS.
- Anonymous flag per survey (v1 supported): if on, responses store no `user_id`, only aggregate answers.
- Audiences: whole company, department, group, or manual selection.
- Windows: open/close dates.
- Results view: charts per question, response rate, export CSV. Anonymous surveys hide any per-user drilldown even for admins.

### 8.9 Notifications feed
See §5.3 for triggers; the feed page lists everything with filters (unread, module, date), and supports "mark all as read".

---

## 9. Services & talent matching subsystem

### 9.1 Catalog
- Admin-curated hierarchy: `service_categories` → `service_catalog` (canonical service definitions with description, expected skills, seniority levels).

### 9.2 Company services
- A `services` row is an instance the company offers/consumes: name, category, description, `managed_by` (an admin/manager/employee), vendors, required skills, seniority level, is_active.
- **Managed by** dropdown includes admins, managers, and (fallback) all active employees — never empty.

### 9.3 Talent matching
- For a given service, the system computes a **match score** for each employee based on:
  - Skill overlap and proficiency.
  - Seniority alignment.
  - Industry experience.
  - Language coverage.
  - Availability signals (time-off calendar, current onboarding load).
- Ranked matches stored in `service_talent_matches`.
- Auto-match is refreshed on service create/edit and on relevant profile updates (via an edge function).

### 9.4 Vendors
- External providers linked to services with contact and rate info; admin-managed; not exposed to standard employees.

---

## 10. Dashboards

### 10.1 Master admin dashboard (`/admin/master`)
Tabs: **Dashboard**, **Agencies**, **Departments**.

Dashboard tab widgets:
- **Stats grid**: Total users (with role-distribution mini-chart), Profile completion % + counts, Active this month + engagement %, System status.
- **Charts**: Registration trend (7/30/90-day toggle), Department distribution, Country distribution.
- **Activity feed** (recent audit-log-friendly events).
- **HR cross-suite widgets**: Pending approvals, Kudos feed.
- **Pending invitations** list.
- **User management table** with columns: name, email, role, department, agency, active, profile complete, last login. Actions: change role, deactivate, delete, resend invite.
- Header controls: date-range selector, refresh, PDF export, "Add user" (opens invitation modal).

Agencies tab: CRUD for agencies (name, country, notes).
Departments tab: CRUD for departments (name, description, head).

### 10.2 Director dashboard (`/admin/director`)
- Scoped to the manager's department + direct reports chain.
- **Stats cards**: team headcount, profile completion, active this month, pending time-off approvals.
- **Team roster** with quick actions (message, view profile, approve time-off).
- **Team analytics**: mini charts for the department only.
- **HR widgets**: Pending approvals (their department), Kudos feed (department scope), My onboarding, My time-off.

### 10.3 Organizer dashboard (`/admin/organizer`)
- For designated event/culture organizers (subset of managers).
- Kanban view of events being planned, groups management, celebration calendar.

### 10.4 Employee "dashboard" (`/profile/me`)
- Personal profile with:
  - My time-off balance widget (all policies).
  - My onboarding progress widget (if assigned).
  - Kudos feed widget (received + given).
  - Colleague recommendations (based on skills/departments).

---

## 11. Admin taxonomies & settings

- **Agencies**: name, country, contact, active flag. Used to group employees.
- **Departments**: name, description, head (a user), parent (optional).
- **Industries**: name, description. Shared list; users pick from this list.
- **Countries**: global static list; used for company, employee location, and event location.
- **Company settings**: name, logo, workspace URL, default language, feature toggles (celebrations auto-post, anonymous surveys allowed, jobs module on/off, etc.), password policy, session length.
- **Roles & permissions**: view of who has which role; role change modal with confirmation and audit reason.

---

## 12. Edge functions (server-side jobs)

- `seed-master-user` — bootstraps the platform master admin.
- `seed-test-accounts` — creates a "Garnier Test Co" with admin/manager/employee sample users for QA.
- `cleanup-test-users` — removes test data.
- `delete-account` — fully removes a user (auth + related rows) respecting RLS.
- `auto-match-services` — recomputes service ↔ talent matches on relevant changes.

All edge functions authenticate the caller and re-check role/tenant server-side.

---

## 13. Business rules (cross-cutting)

- A user has exactly one company, one active role.
- Admins do **not** require an employee profile; they can exist purely for administration.
- Managers **must** have a profile because they show up in the org chart and directory.
- Deactivated users cannot log in; their historical records remain visible where appropriate.
- Deleting a company is not a self-service action (support-only).
- Time-off balances never go negative except via explicit admin override (audit-logged).
- Only one open time-off request per date range per user.
- Only one active onboarding assignment per user at a time.
- Policy acknowledgements are versioned: a new version resets acknowledgements for users to whom it applies.
- Announcements read receipts are per version; edits do not reset unless flagged "material change".
- Documents cannot be deleted if referenced by an active policy or onboarding task; they can be archived instead.
- Anonymous survey answers must be irrecoverable to any user (no correlation columns).

---

## 14. Notifications matrix (who gets notified on what)

| Event | Recipients |
|---|---|
| Time-off requested | Direct manager (fallback: admin) |
| Time-off approved/denied | Requester |
| Time-off starts tomorrow | Requester + manager |
| Onboarding task assigned | Assignee |
| Onboarding task overdue | Assignee + manager |
| Kudos received | Recipient |
| Kudos posted | Followers of recipient (optional) |
| Announcement published | Audience |
| Event created / RSVP window | Invitees |
| Event tomorrow / in 1 hour | RSVP=going |
| Policy published / new version | Audience requiring ack |
| Document expiring | Owner + manager |
| Job application status change | Applicant |
| Direct message | Recipient |
| Comment mention (`@user`) | Mentioned user |
| Role changed | Affected user |
| Invitation issued | Invitee (email) |

---

## 15. API surface (implicit)

- All data reads/writes use Supabase JS client → PostgREST, gated by RLS.
- Edge functions expose typed HTTP endpoints for privileged/complex operations (see §12).
- Realtime channels subscribe to: messages, notifications, kudos, announcements, and time-off decisions.
- Storage uses signed URLs for private files; public buckets have direct URLs.

---

## 16. Extensibility hooks

- **Polymorphic attachments + comments** allow any new entity to gain files and discussion for free.
- **Taxonomy tables** (agencies/departments/industries) are user-editable without code changes.
- **Onboarding templates** and **time-off policies** are data-driven; admins tailor them per company.
- **Surveys** support new question types by extending the question `type` enum + a renderer.
- **Notification triggers** are centralized so new modules only need to emit an event, not build a delivery pipeline.

---

## 17. Non-functional requirements

- **Multi-tenant isolation** must be verifiable: a test harness attempts cross-tenant reads/writes and expects failure on every module table.
- **Localization coverage**: EN and ES key sets must remain byte-parity; CI fails on missing keys.
- **Accessibility**: keyboard navigation across sidebar/tables/dialogs; ARIA on interactive controls.
- **Performance targets**: directory list < 400 ms for 1k profiles; dashboard aggregates < 800 ms with caching.
- **Auditability**: every admin action is queryable by target user + action type + date.
- **Data export**: users can export their own data (JSON) on request (GDPR-friendly).
- **Data retention**: configurable per module (default: onboarding assignments auto-archive after 2 years).

---

## 18. What the app is **not** doing (explicit non-goals)

- No public profile sharing links (removed, do not re-add).
- No cross-company visibility of any kind.
- No client-side role checks for security-sensitive actions.
- No roles stored on `profiles`.
- No auto-confirm email unless explicitly enabled.
- No anonymous sign-ups.
- No payroll processing (out of scope; may integrate later).
- No performance-review workflow beyond capturing awards/highlights (out of scope for v1).

---

This document, together with the migrations and application source, fully describes the platform's functional behavior, business rules, and capabilities.
