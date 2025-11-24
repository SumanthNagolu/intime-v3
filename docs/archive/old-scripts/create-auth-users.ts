#!/usr/bin/env tsx
/**
 * Create Supabase Auth Users for Test Data
 *
 * This script creates authentication users in Supabase Auth
 * for all test profiles that were seeded in the database.
 *
 * Prerequisites:
 * 1. Run reset-and-seed-test-data.ts first
 * 2. Ensure SUPABASE_SERVICE_ROLE_KEY is set
 *
 * Usage: npm run seed:auth
 * or: tsx scripts/create-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = 'TestPass123!';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAuthUser(userId: string, email: string, name: string) {
  try {
    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        profile_id: userId
      },
    });

    if (error) {
      // Check if user already exists
      if (error.message.includes('already registered')) {
        console.log(`   ⏭️  ${email} (already exists)`);
        return { success: true, skipped: true };
      }
      console.error(`   ❌ ${email}: ${error.message}`);
      return { success: false, error };
    }

    if (!data.user) {
      console.error(`   ❌ ${email}: No user returned`);
      return { success: false, error: 'No user returned' };
    }

    // Link auth user to profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ auth_id: data.user.id })
      .eq('id', userId);

    if (updateError) {
      console.error(`   ⚠️  ${email}: Created auth but failed to link profile - ${updateError.message}`);
      // Try to delete the auth user we just created
      await supabase.auth.admin.deleteUser(data.user.id);
      return { success: false, error: updateError };
    }

    console.log(`   ✅ ${email}`);
    return { success: true };

  } catch (err: any) {
    console.error(`   ❌ ${email}: ${err.message}`);
    return { success: false, error: err };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  InTime v3 - Create Auth Users                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n🔐 Default Password: ${DEFAULT_PASSWORD}\n`);

  // Step 1: Fetch all active test users without auth accounts
  console.log('📊 Step 1: Fetching users without auth accounts...\n');

  const { data: users, error: fetchError } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, auth_id')
    .like('email', '%@intime.com')
    .is('deleted_at', null)
    .order('email');

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('⚠️  No test users found in database!\n');
    process.exit(1);
  }

  const usersWithoutAuth = users.filter(u => !u.auth_id);
  const usersWithAuth = users.filter(u => u.auth_id);

  console.log(`   Total users: ${users.length}`);
  console.log(`   Already have auth: ${usersWithAuth.length}`);
  console.log(`   Need auth accounts: ${usersWithoutAuth.length}\n`);

  if (usersWithoutAuth.length === 0) {
    console.log('✅ All users already have auth accounts!\n');
    return;
  }

  // Step 2: Create auth accounts
  console.log('🔐 Step 2: Creating auth accounts...\n');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of usersWithoutAuth) {
    const result = await createAuthUser(user.id, user.email, user.full_name);

    if (result.success) {
      if (result.skipped) {
        skipped++;
      } else {
        created++;
      }
    } else {
      failed++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped (existing): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total processed: ${usersWithoutAuth.length}\n`);

  // Step 3: Verification
  console.log('📊 Step 3: Verifying auth accounts...\n');

  const { data: verifyUsers, error: verifyError } = await supabase
    .from('user_profiles')
    .select('email, auth_id')
    .like('email', '%@intime.com')
    .is('deleted_at', null)
    .order('email');

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
  } else if (verifyUsers) {
    const withAuth = verifyUsers.filter(u => u.auth_id !== null).length;
    const withoutAuth = verifyUsers.filter(u => u.auth_id === null).length;

    console.log(`   ✅ Users with auth accounts: ${withAuth}`);
    console.log(`   ⚠️  Users without auth accounts: ${withoutAuth}`);

    if (withoutAuth > 0) {
      console.log('\n   Users still missing auth:');
      verifyUsers
        .filter(u => u.auth_id === null)
        .forEach(u => console.log(`     • ${u.email}`));
    }
  }

  if (failed > 0) {
    console.log('\n⚠️  Some users failed to create. Check errors above.\n');
    process.exit(1);
  }

  console.log('\n✅ All auth users created successfully!\n');
  console.log('📖 See TEST-CREDENTIALS.md for complete list\n');
}

main();
