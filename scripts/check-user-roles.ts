#!/usr/bin/env tsx
/**
 * Check User Roles
 *
 * Check what roles are assigned to jr_rec@intime.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkUserRoles() {
  console.log('🔍 Checking roles for jr_rec@intime.com...\n');

  try {
    // Get the user profile for jr_rec@intime.com
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, auth_id')
      .eq('email', 'jr_rec@intime.com')
      .single();

    if (profileError || !profile) {
      console.error('❌ User profile not found for jr_rec@intime.com');
      console.error('   Error:', profileError?.message);
      process.exit(1);
    }

    console.log(`✅ User Profile:`);
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Profile ID: ${profile.id}`);
    console.log(`   Auth ID: ${profile.auth_id || 'Not linked'}\n`);

    // Get all roles for this user
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        is_primary,
        created_at,
        role:roles(id, name, display_name)
      `)
      .eq('user_id', profile.id)
      .is('deleted_at', null);

    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError.message);
      process.exit(1);
    }

    if (!userRoles || userRoles.length === 0) {
      console.log('⚠️  No roles assigned to this user');
      console.log('\nℹ️  Expected role: junior_recruiter');
      console.log('   To assign, you may need to check user_profiles and roles tables');
    } else {
      console.log(`✅ Assigned Roles (${userRoles.length}):`);
      userRoles.forEach((ur: Record<string, unknown>) => {
        const role = ur.role as Record<string, unknown> | undefined;
        if (role) {
          console.log(`   - ${role.display_name} (${role.name})`);
          console.log(`     Primary: ${ur.is_primary ? 'Yes' : 'No'}`);
          console.log(`     Assigned: ${new Date(String(ur.created_at)).toLocaleDateString()}`);
        }
      });
    }

    // Also check auth user
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData?.users?.find(u => u.email === 'jr_rec@intime.com');

    if (authUser) {
      console.log(`\n✅ Auth User:`);
      console.log(`   Email: ${authUser.email}`);
      console.log(`   Auth ID: ${authUser.id}`);
      console.log(`   Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Last Sign In: ${authUser.last_sign_in_at || 'Never'}`);
    } else {
      console.log('\n⚠️  No auth user found');
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

checkUserRoles()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('💥 Fatal error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
