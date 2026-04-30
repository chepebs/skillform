
# Plan: Expand into a full HR & Talent platform

You're going from a talent directory + services module into a full HR suite. Trying to ship 11 modules in one pass would produce a fragile build. The cheapest path is to first build **shared foundations** that every module reuses, then ship modules in 4 thematic passes that share UI patterns, tables, and edge functions.

## Guiding principles

- **One company-scoped data model.** Every new table gets `company_id`, `created_at`, `updated_at`, RLS scoped to `get_user_company(auth.uid())`, and uses the existing 3-tier roles (`user`, `manager`, `admin`).
- **Reuse what exists.** Notifications, messaging, departments, profiles, storage buckets, and i18n are already in place — every module hooks into them rather than reinventing.
- **Ship vertically, not horizontally.** Each pass delivers a fully usable module (schema + RLS + UI + i18n + nav) before moving to the next, so you can demo at every step.
- **No new role tiers.** Approvers (time-off, job applications, etc.) are derived from `manager` role + department director relationship, not new roles.

---

## Pass 0 — Shared foundations (prerequisite, small)

These unlock every later module. Doing them once avoids 11 rounds of duplicated work.

1. **Storage buckets**: add `hr-documents` (private), `policies` (private), `event-images` (public).
2. **Generic `attachments` table**: polymorphic `(entity_type, entity_id, file_path, file_name, mime_type, size, uploaded_by, company_id)` so policies/documents/events/onboarding all share one upload pipeline.
3. **Generic `comments` table**: same polymorphic pattern for kudos, events, job postings.
4. **Notification taxonomy**: extend `notifications.type` usage with constants (`time_off_request`, `kudos_received`, `birthday_today`, `event_invite`, `job_posted`, `onboarding_task`, `policy_acknowledge_required`, `survey_invite`).
5. **Profile additions**: `birth_date date`, `start_date date`, `manager_id uuid` (self-FK to profiles.user_id) — needed by birthdays, anniversaries, org chart, onboarding, time-off approvals.
6. **Sidebar restructure**: group nav into sections (`People`, `Workplace`, `Me`) so 11 new items don't explode the sidebar. Add a "More" overflow.
7. **i18n scaffolding**: add `modules.*` namespace in `en.json`/`es.json` with empty blocks per module, filled per-pass.

---

## Pass 1 — People & culture (low complexity, high visibility)

Modules that are mostly read + simple writes, share the same card/feed UI.

- **Org Chart** — derived view from `profiles.manager_id` + `departments`. Tree component, no new tables. Routes: `/org-chart`.
- **Birthdays & Anniversaries** — derived view from `birth_date` + `start_date`. Dashboard widget + dedicated page `/people/celebrations`. Daily edge function `daily-celebrations` posts notifications.
- **Kudos** — table `kudos (id, from_user_id, to_user_id, message, value_tag, visibility, company_id)` + reactions via `comments`. Public feed at `/kudos`, dashboard widget, profile tab.
- **Events** — tables `events`, `event_rsvps`. Calendar + list view at `/events`. Reuses `attachments` for cover image, `comments` for discussion.

Deliverable: a working "company life" surface area with feed, calendar, org tree.

---

## Pass 2 — Documents & policies (storage-heavy, shares one pattern)

Both modules share file upload, versioning, and acknowledgement — build the pattern once.

- **Documents (Files)** — `documents (id, name, folder_id, owner_id, visibility, company_id)` + `document_folders` (tree) + uses `attachments`. Personal vs shared scopes. Routes: `/files`.
  - Personal HR docs (payslips, contracts) visible only to owner + admin.
  - Shared company files visible per-department or company-wide.
- **Company Policies** — `policies (id, title, body_md, version, status, effective_from, company_id)` + `policy_acknowledgements (policy_id, user_id, acknowledged_at)`. Admin publishes → all users get notification → must acknowledge. Routes: `/policies`. Admin dashboard shows acknowledgement coverage %.

Deliverable: compliant document hub + auditable policy acknowledgement.

---

## Pass 3 — Workflows (approval engines, the heaviest pass)

These three share the same primitive: a request with states, an approver chain, and notifications.

- **Time-off** — `time_off_policies` (per-company: vacation, sick, personal, accrual rules), `time_off_balances (user_id, policy_id, balance_days, year)`, `time_off_requests (user_id, policy_id, start_date, end_date, status, approver_id, reason)`. Manager approval flow uses `manager_id` chain. Calendar view + balance widget. Routes: `/time-off`, `/admin/time-off`.
- **Internal Job Postings** — `job_postings (id, title, department_id, description, requirements, status, posted_by, closes_at)`, `job_applications (posting_id, user_id, cover_letter, resume_attachment_id, status)`. Anyone can apply, hiring manager reviews. Routes: `/jobs`, `/jobs/:id`, `/admin/jobs`.
- **Onboarding** — `onboarding_templates`, `onboarding_template_tasks (template_id, title, description, day_offset, assignee_role)`, `onboarding_plans (user_id, template_id, started_at)`, `onboarding_tasks (plan_id, template_task_id, status, completed_at)`. Triggered when a new user joins. Checklist UI on dashboard for new hires; admin sees completion %. Routes: `/onboarding/me`, `/admin/onboarding`.

Build a shared `<ApprovalRequestCard />` and `useApprovalChain(userId)` hook used by time-off and jobs.

Deliverable: end-to-end employee lifecycle from onboarding through time-off requests to internal mobility.

---

## Pass 4 — Surveys (standalone, complex form engine)

Last because it touches no other module and has the most form-builder UI.

- **Surveys** — `surveys (id, title, description, status, anonymous, target_scope, opens_at, closes_at)`, `survey_questions (survey_id, type, prompt, options, required, sort_order)` (types: single, multi, scale, text, nps), `survey_responses (survey_id, user_id, submitted_at)` (user_id null if anonymous), `survey_answers (response_id, question_id, value)`. Admin builder UI, employee fill UI, results dashboard with charts. Routes: `/surveys`, `/admin/surveys`, `/admin/surveys/:id/results`.

Deliverable: pulse surveys, eNPS, custom forms.

---

## Cross-cutting work each pass includes

- RLS policies (company scope + role checks)
- i18n keys for both `en` and `es`
- Sidebar entry under the right section, role-gated
- Dashboard widget where it makes sense (birthdays, my time-off balance, pending approvals, onboarding progress, kudos feed)
- Notifications wired to existing `notifications` table + realtime
- PDF export only where it adds value (policies, time-off history)

---

## Suggested execution order and sizing

| Pass | Modules | Est. complexity | Demo value |
|------|---------|-----------------|------------|
| 0 | Foundations | S | Enables everything |
| 1 | Org Chart, Birthdays, Kudos, Events | M | High — visible immediately |
| 2 | Documents, Policies | M | High — compliance |
| 3 | Time-off, Jobs, Onboarding | L | Highest — core HR |
| 4 | Surveys | M | Medium |

## What I need from you before starting

1. **Confirm pass order** above, or reshuffle (e.g. push Time-off earlier if it's the priority).
2. **Approver model for time-off**: strictly `manager_id` chain, or department director, or admin-defined per request?
3. **Anonymous surveys**: required from day one, or v2?
4. **Document privacy default**: personal HR docs visible to admin only, or also to direct manager?
5. **Start with Pass 0 + Pass 1 in this run**, or just Pass 0 to keep the diff small?
