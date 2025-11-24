/**
 * Quick Signup Test
 * Tests the signup API directly to verify if email confirmation is still blocking
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testSignup() {
  console.log('🧪 Testing Signup Flow\n');
  console.log('====================\n');

  // Generate unique test email
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123456!';
  const testName = 'Test User';

  console.log('Test Credentials:');
  console.log(`  Email: ${testEmail}`);
  console.log(`  Password: ${testPassword}`);
  console.log(`  Name: ${testName}\n`);

  console.log('Attempting signup...\n');

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testName,
      },
    },
  });

  if (error) {
    console.log('❌ SIGNUP FAILED\n');
    console.log('Error:', error.message);
    console.log('Status:', error.status);
    console.log('\n🔧 FIX NEEDED:\n');

    if (error.message.includes('invalid') || error.message.includes('email')) {
      console.log('This error likely means email confirmation is still enabled.');
      console.log('To fix:');
      console.log('1. Go to: https://app.supabase.com/project/gkwhxmvugnjwwwiufmdy/auth/settings');
      console.log('2. Scroll to "Email Auth" section');
      console.log('3. UNCHECK "Confirm email" checkbox');
      console.log('4. Click "Save"');
      console.log('5. Run this test again: pnpm test:signup');
    }

    return false;
  }

  console.log('✅ SIGNUP SUCCESSFUL!\n');
  console.log('User Details:');
  console.log(`  ID: ${data.user?.id}`);
  console.log(`  Email: ${data.user?.email}`);
  console.log(`  Email Confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`);
  console.log(`  Created At: ${data.user?.created_at}`);

  if (data.user?.email_confirmed_at) {
    console.log('\n✅ Email auto-confirmed! Configuration is correct.');
  } else {
    console.log('\n⚠️  Email not confirmed yet.');
    console.log('You may need to manually confirm in Supabase dashboard or wait for confirmation email.');
  }

  // Try to verify we can access the session
  const { data: session } = await supabase.auth.getSession();

  if (session.session) {
    console.log('\n✅ Session created! User can access the app.');
  } else {
    console.log('\n⚠️  No session created. User cannot access the app until email is confirmed.');
  }

  return true;
}

// Check env vars
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  console.error('Make sure .env.local exists with:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

testSignup()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
