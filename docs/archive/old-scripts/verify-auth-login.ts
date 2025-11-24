#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DEFAULT_PASSWORD = 'TestPass123!';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Verifying Auth Login for Test Users                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Test a sample of users from different roles
const TEST_USERS = [
  { email: 'admin@intime.com', role: 'Admin' },
  { email: 'ceo@intime.com', role: 'CEO' },
  { email: 'hr@intime.com', role: 'HR Manager' },
  { email: 'trainer@intime.com', role: 'Trainer' },
  { email: 'student@intime.com', role: 'Student' },
  { email: 'sr_rec@intime.com', role: 'Senior Recruiter' },
  { email: 'jr_bs@intime.com', role: 'Junior Bench Sales' },
  { email: 'candidate@intime.com', role: 'Candidate' },
  { email: 'client@intime.com', role: 'Client' },
];

async function testLogin(email: string, role: string) {
  // Create a new client for each test
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: DEFAULT_PASSWORD,
    });

    if (error) {
      console.log(`   ❌ ${email.padEnd(30)} - ${error.message}`);
      return { success: false, error };
    }

    if (!data.user) {
      console.log(`   ❌ ${email.padEnd(30)} - No user returned`);
      return { success: false };
    }

    // Sign out immediately
    await supabase.auth.signOut();

    console.log(`   ✅ ${email.padEnd(30)} (${role})`);
    return { success: true };

  } catch (err: any) {
    console.log(`   ❌ ${email.padEnd(30)} - ${err.message}`);
    return { success: false, error: err };
  }
}

async function main() {
  console.log('🔐 Testing login for sample users...\n');
  console.log(`   Password: ${DEFAULT_PASSWORD}\n`);

  let success = 0;
  let failed = 0;

  for (const user of TEST_USERS) {
    const result = await testLogin(user.email, user.role);
    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Login Test Summary                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`   ✅ Successful logins: ${success}/${TEST_USERS.length}`);
  console.log(`   ❌ Failed logins: ${failed}/${TEST_USERS.length}\n`);

  if (failed === 0) {
    console.log('✅ All test logins successful!\n');
    console.log('🎯 Test users can now log in with:');
    console.log(`   • Email: Any user from TEST-CREDENTIALS.md`);
    console.log(`   • Password: ${DEFAULT_PASSWORD}\n`);
  } else {
    console.log('⚠️  Some logins failed. Check errors above.\n');
    process.exit(1);
  }
}

main();
