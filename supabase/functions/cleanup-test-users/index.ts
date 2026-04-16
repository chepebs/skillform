import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KEEP_USER_ID = "a4976bed-be57-4006-806d-829ad672d9f6";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Wipe tenant data first (the platform master has none anyway)
    const tables = [
      "service_talent_matches", "service_skills", "service_vendors", "services",
      "group_members", "groups",
      "awards", "brands_managed", "recent_projects", "previous_agencies", "previous_positions",
      "employee_skills", "employee_languages", "employee_industries",
      "messages", "notifications", "invitation_tokens",
      "departments", "companies",
    ];
    const wipeResults: Record<string, string> = {};
    for (const t of tables) {
      const { error } = await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      wipeResults[t] = error ? `ERR: ${error.message}` : "ok";
    }

    // Delete profiles + roles for non-kept users
    await supabase.from("profiles").delete().neq("user_id", KEEP_USER_ID);
    await supabase.from("user_roles").delete().neq("user_id", KEEP_USER_ID);

    // Ensure kept user has no company and is master_admin + completed
    await supabase.from("profiles")
      .update({ company_id: null, profile_completed: true })
      .eq("user_id", KEEP_USER_ID);
    await supabase.from("user_roles").upsert(
      { user_id: KEEP_USER_ID, role: "master_admin" },
      { onConflict: "user_id,role" },
    );

    // Delete other auth users
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const deleted: string[] = [];
    for (const u of list?.users ?? []) {
      if (u.id === KEEP_USER_ID) continue;
      const { error } = await supabase.auth.admin.deleteUser(u.id);
      if (!error) deleted.push(u.email ?? u.id);
    }

    return new Response(
      JSON.stringify({ ok: true, wipeResults, deletedUsers: deleted, kept: KEEP_USER_ID }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
