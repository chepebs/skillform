

## Plan: Multi-Tenant Companies + Cleanup + Display Fixes

### 1. Companies (full multi-tenancy)

**Schema** — new migration:
- `companies` table: `id`, `name`, `slug` (unique, used in invite URL), `logo_url`, `description`, `website`, `industry`, `country_id`, `subscription_status` (enum: `trialing|active|past_due|canceled`, default `trialing`), `subscription_plan` (text, default `free_testing`), `invite_token` (unique), `created_by`, timestamps.
- Add `company_id uuid` (nullable to avoid breaking the seed master) to: `profiles`, `services`, `service_vendors`, `service_skills`, `service_talent_matches`, `groups`, `group_members`, `departments`, `agencies`, `awards`, `brands_managed`, `recent_projects`, `previous_agencies`, `previous_positions`, `employee_skills`, `employee_languages`, `employee_industries`, `messages`, `notifications`, `invitation_tokens`.
- Storage bucket `company-logos` (public), with RLS for company admins to upload.

**Security definer functions:**
- `get_user_company(_user_id uuid) returns uuid` — returns the company_id from the user's profile.
- `is_company_admin(_user_id uuid, _company_id uuid) returns boolean` — true if user is the company's `created_by` or has `master_admin` role within that company.
- `is_platform_master(_user_id uuid) returns boolean` — true only when the user has `master_admin` role AND `company_id IS NULL` (the platform-level master like Master@mastertestuse.com).

**RLS rewrite** — every tenant-scoped table gets policies of the shape:
`USING (company_id = get_user_company(auth.uid()) OR is_platform_master(auth.uid()))`.
Existing role-based admin policies are kept but scoped to the same company. The platform master sees everything.

**Onboarding flow** — new `/company/create` wizard (4 steps): Company info → Logo upload → Admin profile → Billing (placeholder "Free during testing"). On finish:
- Insert company, set creator's `profiles.company_id`, promote to `master_admin` for that company, mark `profile_completed = true`, generate `invite_token`, show shareable URL `/{slug}/join?token=...`.

**Invite URL** — new route `/:companySlug/join` that pre-resolves company from slug+token, opens the auth modal in register mode, and on signup auto-attaches the new user to that company via the `handle_new_user` trigger (extended to read invite metadata).

**Routing** — when a logged-in user has no `company_id`, redirect to `/company/create`. The platform master bypasses this.

### 2. Top-bar company logo

Modify `src/components/layout/Header.tsx` to render, on the left of the breadcrumbs:
`[aidea*form] | [Skill*form] | [Company logo + name]`
Logos come from `useAuth().profile.company` (joined). Hidden for the platform master (no company). Both light/dark variants supported via `dark:invert` on aidea*form and existing Skill*form handling.

### 3. Database cleanup

Delete 12 non-master auth users + cascade their data via an edge function using the service role (auth admin API):
- Keep only `a4976bed-be57-4006-806d-829ad672d9f6` (Master@mastertestuse.com).
- Set that user's `company_id = NULL` so they remain a platform-level master.
- Remove the older `4b3e6055-...` (jose@arbolcg.com) master admin too per your request.
- Also wipe child rows in: profiles, user_roles, employee_*, awards, brands_managed, recent_projects, previous_*, services, service_*, groups, group_members, messages, notifications, invitation_tokens.

### 4. Display / dark-light fixes

Audit pass for hard-coded white-on-white inputs and contrast:
- Replace remaining `bg-white`, `text-white`, `bg-gray-*`, `text-gray-*` outside the dialog overlays with semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`).
- Files flagged: `ChangeRoleModal`, `DeleteUserDialog`, `PendingInvitations`, `UserManagementTable`, `GroupsList`, `KanbanView`, `DirectorDashboard`, `OrganizerDashboard`, `BasicInfoStep`, plus any `<Input>`/`<Textarea>` missing the `bg-background` class on white-card forms.
- Verify the auth modal inputs render with foreground text in light mode (the SkillFormLogo uses `text-primary` which is red — confirm legibility on the modal's white background; switch to `text-foreground` if needed inside the modal header).
- Re-run the grep after edits to make sure no offenders remain.

### 5. Translations sweep

Add EN/ES keys for: `company.*` (create wizard, fields, billing placeholder, invite share screen, copy-link toast), header company badge, new routes, and any newly added UI strings. Run a key-diff script to ensure every key in `en.json` exists in `es.json` and vice-versa, then fix gaps. No Spanish strings will be left as English.

### Technical notes

- The `handle_new_user` trigger will be updated to read `raw_user_meta_data->>'company_id'` and `->>'invite_token'` and attach the new profile accordingly. Invite tokens get marked used.
- `prevent_seniority_self_escalation` trigger is left intact.
- Company logo uploads use the existing image-cropper component (1:1 ratio, max 2MB).
- Billing step is purely visual: a single "Free — Testing Phase" plan card with a disabled "Add payment method later" link. No Stripe wiring per your choice.
- All new RLS policies will use security definer helpers so we don't trigger recursion.

### Deliverable order

```text
1. Migration: companies table, columns, helper functions, RLS rewrite, storage bucket
2. Edge function: cleanup-test-users (one-shot, called once then can be deleted)
3. Company onboarding wizard + routes + invite flow
4. Header: company logo slot
5. Display/contrast audit + fixes
6. EN/ES translation sweep + parity check
7. Smoke-test checklist for you to verify
```

