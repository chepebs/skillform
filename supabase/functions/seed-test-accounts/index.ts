// Seeds 3 test accounts (admin, manager, employee) under a fresh test company
// and populates sample data across every new HR module so the suite can be tested end-to-end.
//
// Idempotent: re-running deletes existing test users (by email) before recreating.
// Returns the created credentials in the response (one-shot — do not log).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TEST_PASSWORD = "TestPass!2026";
const ACCOUNTS = [
  { email: "test-admin@garnier-test.local", role: "admin", first: "Test", last: "Admin" },
  { email: "test-manager@garnier-test.local", role: "manager", first: "Test", last: "Manager" },
  { email: "test-employee@garnier-test.local", role: "user", first: "Test", last: "Employee" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 1. Wipe prior test users (cascade clears profiles + roles via fk + handler trigger)
    const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
    for (const u of existing.users) {
      if (ACCOUNTS.some((a) => a.email === u.email)) {
        await admin.auth.admin.deleteUser(u.id);
      }
    }

    // 2. Wipe test company (cascade should clear most rows; use service role)
    await admin.from("companies").delete().eq("slug", "garnier-test");

    // 3. Create company
    const { data: company, error: companyErr } = await admin
      .from("companies")
      .insert({
        name: "Garnier Test Co",
        slug: "garnier-test",
        subscription_plan: "free_testing",
        subscription_status: "trialing",
      })
      .select()
      .single();
    if (companyErr) throw companyErr;

    // 4. Create accounts
    const created: Record<string, string> = {};
    for (const a of ACCOUNTS) {
      const { data, error } = await admin.auth.admin.createUser({
        email: a.email,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { first_name: a.first, last_name: a.last },
      });
      if (error) throw new Error(`${a.email}: ${error.message}`);
      created[a.role] = data.user!.id;

      // Patch profile to link company + correct names (handle_new_user runs but with no company)
      await admin
        .from("profiles")
        .update({
          company_id: company.id,
          first_name: a.first,
          last_name: a.last,
          profile_completed: true,
        })
        .eq("user_id", data.user!.id);

      // Set role (handle_new_user inserted 'user' by default)
      if (a.role !== "user") {
        await admin.from("user_roles").delete().eq("user_id", data.user!.id);
        await admin
          .from("user_roles")
          .insert({ user_id: data.user!.id, role: a.role });
      }
    }

    const adminId = created.admin;
    const managerId = created.manager;
    const employeeId = created.user;

    // 5. Wire org structure: manager is director of "Creative", employee in "Creative" reporting to manager
    const { data: dept } = await admin
      .from("departments")
      .select("id, name")
      .eq("name", "Creative")
      .maybeSingle();
    if (dept) {
      await admin
        .from("departments")
        .update({ director_id: managerId, company_id: company.id })
        .eq("id", dept.id);
    }
    await admin
      .from("profiles")
      .update({ department: "Creative" })
      .eq("user_id", managerId);
    await admin
      .from("profiles")
      .update({ department: "Creative", manager_id: managerId })
      .eq("user_id", employeeId);

    // 6. Seed time-off policy + balance + pending request from employee
    const { data: policy } = await admin
      .from("time_off_policies")
      .insert({
        company_id: company.id,
        name: "Vacation",
        type: "vacation",
        annual_allowance_days: 20,
        accrual_method: "yearly",
        is_paid: true,
        requires_approval: true,
        created_by: adminId,
      })
      .select()
      .single();

    const year = new Date().getFullYear();
    if (policy) {
      await admin.from("time_off_balances").insert({
        company_id: company.id,
        user_id: employeeId,
        policy_id: policy.id,
        year,
        allocated_days: 20,
        used_days: 3,
        pending_days: 2,
      });
      await admin.from("time_off_requests").insert({
        company_id: company.id,
        user_id: employeeId,
        policy_id: policy.id,
        start_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10),
        day_count: 2,
        reason: "Family event",
        status: "pending",
      });
    }

    // 7. Kudos
    await admin.from("kudos").insert([
      {
        from_user_id: managerId,
        to_user_id: employeeId,
        message: "Great work shipping the Q1 campaign!",
        value_tag: "excellence",
        visibility: "public",
        company_id: company.id,
      },
      {
        from_user_id: employeeId,
        to_user_id: managerId,
        message: "Thanks for the thoughtful feedback this week.",
        value_tag: "leadership",
        visibility: "public",
        company_id: company.id,
      },
    ]);

    // 8. Announcement
    await admin.from("announcements").insert({
      company_id: company.id,
      title: "Welcome to the new HR suite",
      body: "We've launched time-off, kudos, policies and more. Explore from the sidebar.",
      scope: "company",
      pinned: true,
      created_by: adminId,
    });

    // 9. Job posting
    await admin.from("job_postings").insert({
      company_id: company.id,
      title: "Senior Creative Director",
      description: "Lead creative direction across our top accounts.",
      department: "Creative",
      employment_type: "full_time",
      seniority: "senior",
      status: "open",
      posted_by: managerId,
    });

    // 10. Onboarding template + assignment for the employee
    const { data: tpl } = await admin
      .from("onboarding_templates")
      .insert({
        company_id: company.id,
        name: "New Hire — 30 day plan",
        description: "Standard 30-day onboarding for new hires.",
        created_by: adminId,
      })
      .select()
      .single();

    if (tpl) {
      await admin.from("onboarding_template_tasks").insert([
        { template_id: tpl.id, title: "Complete profile", sort_order: 1, default_due_offset_days: 1 },
        { template_id: tpl.id, title: "Meet your team", sort_order: 2, default_due_offset_days: 3 },
        { template_id: tpl.id, title: "Read company policies", sort_order: 3, default_due_offset_days: 7 },
        { template_id: tpl.id, title: "First 1:1 with manager", sort_order: 4, default_due_offset_days: 7 },
      ]);

      const { data: assignment } = await admin
        .from("onboarding_assignments")
        .insert({
          company_id: company.id,
          user_id: employeeId,
          template_id: tpl.id,
          status: "in_progress",
          created_by: adminId,
        })
        .select()
        .single();

      if (assignment) {
        await admin.from("onboarding_tasks").insert([
          { assignment_id: assignment.id, title: "Complete profile", sort_order: 1, status: "completed", completed_at: new Date().toISOString() },
          { assignment_id: assignment.id, title: "Meet your team", sort_order: 2, status: "completed", completed_at: new Date().toISOString() },
          { assignment_id: assignment.id, title: "Read company policies", sort_order: 3, status: "pending" },
          { assignment_id: assignment.id, title: "First 1:1 with manager", sort_order: 4, status: "pending" },
        ]);
      }
    }

    // 11. Published policy
    await admin.from("policies").insert({
      company_id: company.id,
      title: "Code of Conduct",
      summary: "How we treat each other and clients.",
      body_md: "# Code of Conduct\n\nBe kind. Be honest. Do great work.",
      version: 1,
      status: "published",
      published_at: new Date().toISOString(),
      effective_from: new Date().toISOString().slice(0, 10),
      requires_acknowledgement: true,
      created_by: adminId,
    });

    // 12. Event
    await admin.from("events").insert({
      company_id: company.id,
      title: "All-Hands Q2",
      description: "Quarterly all-hands meeting.",
      starts_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      ends_at: new Date(Date.now() + 14 * 86400000 + 3600000).toISOString(),
      visibility: "company",
      is_virtual: true,
      meeting_url: "https://example.com/all-hands",
      created_by: adminId,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        company: { id: company.id, name: company.name },
        password: TEST_PASSWORD,
        accounts: ACCOUNTS.map((a) => ({ email: a.email, role: a.role })),
        seeded: [
          "time_off_policy",
          "time_off_balance",
          "time_off_request(pending)",
          "kudos x2",
          "announcement",
          "job_posting(open)",
          "onboarding_template+assignment(2/4 done)",
          "policy(published)",
          "event",
        ],
      }, null, 2),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String((e as Error).message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
