#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('👤 Creating user profiles...\n');

// Get or create test organization
console.log('1. Ensuring test organization exists...');
const { data: org, error: orgError } = await supabase
  .from('organizations')
  .upsert({
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Screenshot Test Organization',
    slug: 'screenshot-test-org',
    status: 'active',
    subscription_tier: 'enterprise',
    subscription_status: 'active',
  }, { onConflict: 'id' })
  .select()
  .single();

if (orgError) {
  console.error('❌ Error creating organization:', orgError.message);
  process.exit(1);
}

console.log('✅ Organization ready:', org.name);
console.log('');

// Get admin role
console.log('2. Getting admin role...');
const { data: adminRole, error: roleError } = await supabase
  .from('roles')
  .select('id')
  .eq('name', 'admin')
  .single();

if (roleError) {
  console.error('❌ Error getting admin role:', roleError.message);
  console.log('💡 Creating admin role...');

  const { data: newRole, error: createRoleError } = await supabase
    .from('roles')
    .insert({
      name: 'admin',
      description: 'Administrator with full system access',
      permissions: ['*']
    })
    .select()
    .single();

  if (createRoleError) {
    console.error('❌ Error creating admin role:', createRoleError.message);
    process.exit(1);
  }

  console.log('✅ Admin role created');
} else {
  console.log('✅ Admin role found');
}

const roleId = adminRole?.id || newRole?.id;
console.log('');

// Create profile for admin@intime.test
console.log('3. Creating user profile for admin@intime.test...');
const userId = 'ce964085-533c-4771-857a-7e457dee867a';

const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .upsert({
    id: userId,
    email: 'admin@intime.test',
    full_name: 'Admin Test User',
    org_id: org.id,
    status: 'active',
  }, { onConflict: 'id' })
  .select()
  .single();

if (profileError) {
  console.error('❌ Error creating profile:', profileError.message);
  process.exit(1);
}

console.log('✅ User profile created');
console.log('');

// Grant admin role
console.log('4. Granting admin role...');
const { error: roleGrantError } = await supabase
  .from('user_roles')
  .upsert({
    user_id: userId,
    role_id: roleId,
    granted_by: 'system',
  }, { onConflict: 'user_id,role_id' });

if (roleGrantError) {
  console.error('❌ Error granting role:', roleGrantError.message);
} else {
  console.log('✅ Admin role granted');
}

console.log('');
console.log('🎉 Test user setup complete!\n');
console.log('📧 Email: admin@intime.test');
console.log('🔑 Password: Admin123456!');
console.log('🏢 Organization: Screenshot Test Organization');
console.log('👑 Role: Admin\n');
console.log('✅ You can now login and capture all screenshots!\n');
