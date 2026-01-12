import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting admin user creation...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const adminEmail = 'jose@arbolcg.com';
    const adminPassword = 'TalentMap2025';

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      throw listError;
    }

    const existingUser = existingUsers?.users?.find(u => u.email === adminEmail);
    
    if (existingUser) {
      console.log('⚠️ User already exists:', existingUser.id);
      
      // Update user role to master_admin if not already
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: existingUser.id,
          role: 'master_admin'
        }, { onConflict: 'user_id' });

      if (roleError) {
        console.error('❌ Error updating role:', roleError);
        throw roleError;
      }

      console.log('✅ Updated existing user to master_admin');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User already exists, updated to master_admin',
        userId: existingUser.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create new user with admin API
    console.log('📝 Creating new user...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Jose',
        last_name: 'Admin'
      }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError);
      throw createError;
    }

    console.log('✅ User created:', newUser.user.id);

    // The handle_new_user trigger will create profile and default 'employee' role
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the role to master_admin
    console.log('🔑 Updating role to master_admin...');
    const { error: roleUpdateError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: 'master_admin' })
      .eq('user_id', newUser.user.id);

    if (roleUpdateError) {
      console.error('❌ Error updating role:', roleUpdateError);
      // Try upsert as fallback
      const { error: upsertError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: newUser.user.id,
          role: 'master_admin'
        }, { onConflict: 'user_id' });
      
      if (upsertError) {
        console.error('❌ Upsert also failed:', upsertError);
        throw upsertError;
      }
    }

    console.log('✅ Role updated to master_admin');

    // Verify the user was created correctly
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', newUser.user.id)
      .single();

    const { data: role, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', newUser.user.id)
      .single();

    console.log('📋 Profile:', profile);
    console.log('📋 Role:', role);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin user created successfully!',
      userId: newUser.user.id,
      email: adminEmail,
      profile: profile,
      role: role
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in create-admin-user:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
