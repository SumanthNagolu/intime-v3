import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gkwhxmvugnjwwwiufmdy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

console.log('🔍 Checking for existing users...\n');

// Check auth users
const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

if (authError) {
  console.log('❌ Error fetching auth users:', authError.message);
} else {
  console.log(`✅ Found ${authUsers.users.length} auth user(s):\n`);
  authUsers.users.forEach((user, i) => {
    console.log(`  ${i + 1}. ${user.email} (ID: ${user.id})`);
    console.log(`     Created: ${new Date(user.created_at).toLocaleDateString()}`);
  });
}

console.log('\n---\n');

// Check user profiles
const { data: profiles, error: profileError } = await supabase
  .from('user_profiles')
  .select('id, email, full_name, org_id')
  .limit(10);

if (profileError) {
  console.log('❌ Error fetching profiles:', profileError.message);
  console.log('📝 This confirms the audit log issue is blocking profile creation.\n');
} else {
  if (profiles && profiles.length > 0) {
    console.log(`✅ Found ${profiles.length} user profile(s):\n`);
    profiles.forEach((profile, i) => {
      console.log(`  ${i + 1}. ${profile.email || 'N/A'}`);
      console.log(`     Name: ${profile.full_name || 'N/A'}`);
      console.log(`     Org: ${profile.org_id || 'N/A'}`);
    });
    console.log('\n💡 You can try logging in with one of these accounts!\n');
  } else {
    console.log('❌ No user profiles found');
    console.log('🔧 Need to fix the audit log constraint first\n');
  }
}
