#!/usr/bin/env tsx
/**
 * Assign Junior Recruiter Role
 *
 * Assigns the junior_recruiter role to jr_rec@intime.com
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

async function assignRecruiterRole() {
  console.log('🚀 Assigning junior_recruiter role to jr_rec@intime.com...\n');

  try {
    // Get the user profile for jr_rec@intime.com
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', 'jr_rec@intime.com')
      .single();

    if (profileError || !profile) {
      console.error('❌ User profile not found for jr_rec@intime.com');
      console.error('   Error:', profileError?.message);
      process.exit(1);
    }

    console.log(`✅ Found user profile: ${profile.full_name} (${profile.email})`);

    // Get the junior_recruiter role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name, display_name')
      .eq('name', 'junior_recruiter')
      .single();

    if (roleError || !role) {
      console.error('❌ Role "junior_recruiter" not found');
      console.error('   Error:', roleError?.message);
      process.exit(1);
    }

    console.log(`✅ Found role: ${role.display_name} (${role.name})`);

    // Check if role assignment already exists
    const { data: existingAssignment } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', profile.id)
      .eq('role_id', role.id)
      .maybeSingle();

    if (existingAssignment) {
      console.log('⏭️  Role already assigned - skipping');
      return;
    }

    // Assign the role
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: profile.id,
        role_id: role.id,
        is_primary: true,
      });

    if (assignError) {
      console.error('❌ Error assigning role:', assignError.message);
      process.exit(1);
    }

    console.log('✅ Successfully assigned junior_recruiter role to jr_rec@intime.com');

    // Verify the assignment
    const { data: roles, error: verifyError } = await supabase
      .from('user_roles')
      .select('role:roles(name, display_name)')
      .eq('user_id', profile.id);

    if (!verifyError && roles) {
      console.log('\n📋 User roles:');
      roles.forEach((r: any) => {
        console.log(`   - ${r.role.display_name} (${r.role.name})`);
      });
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  }
}

assignRecruiterRole()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
