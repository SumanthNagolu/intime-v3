#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Verifying Auth ↔ Profile Links                          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function main() {
  // Get all auth users
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    process.exit(1);
  }

  const intimeAuthUsers = authUsers.filter(u => u.email?.includes('@intime.com'));

  // Get all user profiles
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, email, auth_id')
    .like('email', '%@intime.com')
    .is('deleted_at', null);

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError);
    process.exit(1);
  }

  console.log(`📊 Found ${intimeAuthUsers.length} auth users and ${profiles?.length || 0} profiles\n`);

  // Check for mismatches
  let mismatches = 0;
  let missing = 0;

  console.log('🔍 Checking links...\n');

  for (const authUser of intimeAuthUsers) {
    const profile = profiles?.find(p => p.email === authUser.email);

    if (!profile) {
      missing++;
      console.log(`   ❌ ${authUser.email}: No profile found!`);
      continue;
    }

    if (profile.auth_id !== authUser.id) {
      mismatches++;
      console.log(`   ⚠️  ${authUser.email}:`);
      console.log(`       Profile auth_id: ${profile.auth_id || 'NULL'}`);
      console.log(`       Auth user ID:    ${authUser.id}`);
    }
  }

  // Check specific user from error
  const errorUserId = '73f7b94f-8516-43a8-9901-0d2c8937deb7';
  console.log(`\n🔍 Checking error user ID: ${errorUserId}\n`);

  const authUserWithId = authUsers.find(u => u.id === errorUserId);
  if (authUserWithId) {
    console.log(`   Found in auth.users: ${authUserWithId.email}`);

    const profileWithAuthId = profiles?.find(p => p.auth_id === errorUserId);
    if (profileWithAuthId) {
      console.log(`   ✅ Linked to profile: ${profileWithAuthId.email} (id: ${profileWithAuthId.id})`);
    } else {
      console.log(`   ❌ No profile has this auth_id!`);

      // Check if profile exists by email
      const profileByEmail = profiles?.find(p => p.email === authUserWithId.email);
      if (profileByEmail) {
        console.log(`   ⚠️  Profile exists with email ${profileByEmail.email} but auth_id is: ${profileByEmail.auth_id || 'NULL'}`);
      }
    }
  } else {
    console.log(`   ❌ Not found in auth.users`);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Summary                                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`   Auth users: ${intimeAuthUsers.length}`);
  console.log(`   Profiles: ${profiles?.length || 0}`);
  console.log(`   Mismatches: ${mismatches}`);
  console.log(`   Missing profiles: ${missing}\n`);

  if (mismatches > 0 || missing > 0) {
    console.log('⚠️  Issues found! Need to fix auth_id links.\n');
  } else {
    console.log('✅ All links are correct!\n');
  }
}

main();
