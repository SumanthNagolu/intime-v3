/**
 * Test Authentication Script
 *
 * Quick script to test signup/login functionality
 * Run with: npx tsx scripts/test-auth.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function testSignUp() {
  console.log('\n=== Test Sign Up ===\n');

  const email = await question('Email: ');
  const password = await question('Password: ');
  const fullName = await question('Full Name: ');

  console.log('\nAttempting signup...');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('❌ Signup failed:', error.message);
    return;
  }

  console.log('✅ Signup successful!');
  console.log('User ID:', data.user?.id);
  console.log('Email:', data.user?.email);
  console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');

  if (!data.user?.email_confirmed_at) {
    console.log('\n⚠️  Email not confirmed. To fix:');
    console.log('1. Go to Supabase Dashboard > Auth > Settings');
    console.log('2. Disable "Confirm email" checkbox');
    console.log('3. Or manually confirm in Dashboard > Auth > Users');
  }
}

async function testSignIn() {
  console.log('\n=== Test Sign In ===\n');

  const email = await question('Email: ');
  const password = await question('Password: ');

  console.log('\nAttempting signin...');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Signin failed:', error.message);
    return;
  }

  console.log('✅ Signin successful!');
  console.log('User ID:', data.user?.id);
  console.log('Email:', data.user?.email);
  console.log('Session expires:', new Date(data.session?.expires_at! * 1000).toLocaleString());
}

async function checkAuthSettings() {
  console.log('\n=== Check Auth Settings ===\n');

  // Try to get current user (should be null if not logged in)
  const { data: { user } } = await supabase.auth.getUser();

  console.log('Current User:', user ? user.email : 'Not logged in');
  console.log('\nSupabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

  console.log('\n📝 To disable email confirmation:');
  console.log(`   Visit: https://app.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1]}/auth/settings`);
  console.log('   Disable: "Confirm email" checkbox');
}

async function main() {
  console.log('🧪 InTime Auth Testing Tool');
  console.log('============================\n');

  console.log('Choose an option:');
  console.log('1. Test Sign Up');
  console.log('2. Test Sign In');
  console.log('3. Check Auth Settings');
  console.log('4. Exit');

  const choice = await question('\nEnter choice (1-4): ');

  switch (choice.trim()) {
    case '1':
      await testSignUp();
      break;
    case '2':
      await testSignIn();
      break;
    case '3':
      await checkAuthSettings();
      break;
    case '4':
      console.log('Goodbye!');
      rl.close();
      return;
    default:
      console.log('Invalid choice');
  }

  // Ask if they want to continue
  const again = await question('\nTest again? (y/n): ');
  if (again.toLowerCase() === 'y') {
    await main();
  } else {
    rl.close();
  }
}

// Load environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  console.error('Make sure .env.local exists with:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

main().catch((error) => {
  console.error('Error:', error);
  rl.close();
});
