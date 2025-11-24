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
console.log('║  Complete Cleanup: Auth Users & User Profiles            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function main() {
  // Step 1: Get all auth users
  console.log('📊 Step 1: Analyzing auth.users...\n');

  const { data: { users: allAuthUsers }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing auth users:', listError);
    process.exit(1);
  }

  console.log(`   Total auth.users: ${allAuthUsers.length}`);

  const intimeAuthUsers = allAuthUsers.filter(u => u.email?.includes('@intime.com'));
  const otherAuthUsers = allAuthUsers.filter(u => !u.email?.includes('@intime.com'));

  console.log(`   @intime.com auth users: ${intimeAuthUsers.length}`);
  console.log(`   Other auth users: ${otherAuthUsers.length}\n`);

  // Step 2: Get all user_profiles
  console.log('📊 Step 2: Analyzing user_profiles...\n');

  const { data: allProfiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, email, deleted_at, auth_id');

  if (profileError) {
    console.error('❌ Error listing profiles:', profileError);
    process.exit(1);
  }

  const intimeProfiles = allProfiles?.filter(p => p.email?.includes('@intime.com')) || [];
  const activeIntimeProfiles = intimeProfiles.filter(p => !p.deleted_at);
  const deletedIntimeProfiles = intimeProfiles.filter(p => p.deleted_at);
  const otherProfiles = allProfiles?.filter(p => !p.email?.includes('@intime.com')) || [];

  console.log(`   Total user_profiles: ${allProfiles?.length || 0}`);
  console.log(`   @intime.com profiles (active): ${activeIntimeProfiles.length}`);
  console.log(`   @intime.com profiles (deleted): ${deletedIntimeProfiles.length}`);
  console.log(`   Other profiles: ${otherProfiles.length}\n`);

  // Step 3: Delete old/unwanted auth users
  console.log('🗑️  Step 3: Deleting unwanted auth.users...\n');

  let deletedAuthCount = 0;

  // Delete all non-@intime.com auth users
  for (const user of otherAuthUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.log(`   ❌ Failed to delete ${user.email}: ${error.message}`);
    } else {
      deletedAuthCount++;
      console.log(`   ✅ Deleted ${user.email} from auth.users`);
    }
  }

  // Delete auth users for soft-deleted @intime.com profiles
  for (const profile of deletedIntimeProfiles) {
    if (profile.auth_id) {
      const { error } = await supabase.auth.admin.deleteUser(profile.auth_id);
      if (error && !error.message.includes('not found')) {
        console.log(`   ❌ Failed to delete auth for ${profile.email}: ${error.message}`);
      } else {
        deletedAuthCount++;
        console.log(`   ✅ Deleted ${profile.email} from auth.users`);
      }
    }
  }

  console.log(`\n   Total auth users deleted: ${deletedAuthCount}`);

  // Step 4: Hard delete soft-deleted user_profiles (they're already marked as deleted)
  console.log('\n🗑️  Step 4: Cleaning up soft-deleted user_profiles...\n');

  // Actually, let's just verify they're soft-deleted and leave them for audit trail
  // But we can clear their auth_id since we deleted the auth user
  for (const profile of deletedIntimeProfiles) {
    if (profile.auth_id) {
      await supabase
        .from('user_profiles')
        .update({ auth_id: null })
        .eq('id', profile.id);
    }
  }

  // Delete non-@intime.com profiles
  let deletedProfileCount = 0;
  for (const profile of otherProfiles) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ deleted_at: new Date().toISOString(), is_active: false, auth_id: null })
      .eq('id', profile.id);

    if (error) {
      console.log(`   ❌ Failed to delete profile ${profile.email}: ${error.message}`);
    } else {
      deletedProfileCount++;
      console.log(`   ✅ Soft-deleted profile ${profile.email}`);
    }
  }

  console.log(`\n   Total profiles soft-deleted: ${deletedProfileCount}`);

  // Step 5: Final verification
  console.log('\n📊 Step 5: Final verification...\n');

  const { data: { users: finalAuthUsers } } = await supabase.auth.admin.listUsers();
  const finalIntimeAuth = finalAuthUsers.filter(u => u.email?.includes('@intime.com'));

  const { data: finalProfiles } = await supabase
    .from('user_profiles')
    .select('email, deleted_at')
    .like('email', '%@intime.com')
    .is('deleted_at', null);

  console.log('   Final state:');
  console.log(`   ✅ auth.users (@intime.com): ${finalIntimeAuth.length}`);
  console.log(`   ✅ user_profiles (@intime.com, active): ${finalProfiles?.length || 0}`);

  if (finalProfiles && finalProfiles.length > 0) {
    console.log('\n   Active @intime.com users:');
    finalProfiles.forEach(p => {
      console.log(`     • ${p.email}`);
    });
  }

  console.log('\n✅ Cleanup complete!\n');
}

main();
