// One-shot seed: ensures a platform-level master_admin user exists for testing.
// Idempotent — safe to invoke multiple times.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMAIL = "Master@mastertestuse.com";
const PASSWORD = "*Testing00";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Find or create the auth user
    let userId: string | null = null;
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw listErr;

    const existing = list.users.find(
      (u) => (u.email ?? "").toLowerCase() === EMAIL.toLowerCase(),
    );

    if (existing) {
      userId = existing.id;
      // Ensure password + confirmed
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { first_name: "Master", last_name: "Admin" },
      });
      if (updErr) throw updErr;
    } else {
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email: EMAIL,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: { first_name: "Master", last_name: "Admin" },
        });
      if (createErr) throw createErr;
      userId = created.user!.id;
    }

    // 2) Ensure profile exists, with company_id = NULL (platform-level)
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingProfile) {
      const { error: pErr } = await admin.from("profiles").insert({
        user_id: userId,
        email: EMAIL,
        first_name: "Master",
        last_name: "Admin",
        profile_completed: true,
        company_id: null,
      });
      if (pErr) throw pErr;
    } else {
      const { error: pErr } = await admin
        .from("profiles")
        .update({
          company_id: null,
          profile_completed: true,
          first_name: "Master",
          last_name: "Admin",
        })
        .eq("user_id", userId);
      if (pErr) throw pErr;
    }

    // 3) Ensure master_admin role
    const { data: existingRole } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "master_admin")
      .maybeSingle();

    if (!existingRole) {
      // Remove any non-master roles to keep it clean
      await admin.from("user_roles").delete().eq("user_id", userId);
      const { error: rErr } = await admin
        .from("user_roles")
        .insert({ user_id: userId, role: "master_admin" });
      if (rErr) throw rErr;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: userId,
        email: EMAIL,
        message: "Master testing user is ready.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("seed-master-user failed:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
