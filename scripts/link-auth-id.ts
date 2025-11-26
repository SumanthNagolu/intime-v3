#!/usr/bin/env tsx
/**
 * Link Auth ID to User Profile
 *
 * Links the Supabase auth user ID to the user_profiles table
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

async function linkAuthId() {
  console.log('🔗 Linking auth_id to user profile for jr_rec@intime.com...\n');

  try {
    // Get the auth user
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData?.users?.find(u => u.email === 'jr_rec@intime.com');

    if (!authUser) {
      console.error('❌ Auth user not found for jr_rec@intime.com');
      process.exit(1);
    }

    console.log(`✅ Found auth user: ${authUser.email}`);
    console.log(`   Auth ID: ${authUser.id}\n`);

    // Get the user profile
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

    console.log(`✅ Found user profile: ${profile.full_name}`);
    console.log(`   Profile ID: ${profile.id}`);
    console.log(`   Current auth_id: ${profile.auth_id || 'NOT SET'}\n`);

    // Update the profile with the auth_id
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ auth_id: authUser.id })
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Error updating auth_id:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Successfully linked auth_id to user profile');

    // Verify the update
    const { data: updated } = await supabase
      .from('user_profiles')
      .select('id, email, auth_id')
      .eq('id', profile.id)
      .single();

    if (updated) {
      console.log('\n📋 Updated Profile:');
      console.log(`   Email: ${updated.email}`);
      console.log(`   Auth ID: ${updated.auth_id}`);
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  }
}

linkAuthId()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
