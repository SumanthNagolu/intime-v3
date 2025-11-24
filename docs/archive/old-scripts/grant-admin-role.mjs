#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('👑 Granting admin role...\n');

const userId = 'ce964085-533c-4771-857a-7e457dee867a';

// Get admin role
const { data: adminRole, error: roleError } = await supabase
  .from('roles')
  .select('id')
  .eq('name', 'admin')
  .single();

if (roleError) {
  console.error('❌ Error finding admin role:', roleError.message);
  console.log('\nChecking what roles exist...\n');

  const { data: roles } = await supabase.from('roles').select('*');
  console.log('Available roles:', roles);

  if (!roles || roles.length === 0) {
    console.log('\n💡 No roles found. Creating admin role...\n');

    const { data: newRole, error: createError } = await supabase
      .from('roles')
      .insert({
        name: 'admin',
        description: 'Administrator with full system access',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating role:', createError.message);
      process.exit(1);
    }

    console.log('✅ Admin role created:', newRole);

    // Grant the new role
    const { error: grantError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: newRole.id,
      });

    if (grantError) {
      console.error('❌ Error granting role:', grantError.message);
      process.exit(1);
    }

    console.log('✅ Admin role granted!\n');
  }
  process.exit(0);
}

console.log('✅ Found admin role:', adminRole.id);

// Grant admin role
const { error: grantError } = await supabase
  .from('user_roles')
  .insert({
    user_id: userId,
    role_id: adminRole.id,
  });

if (grantError) {
  console.error('❌ Error granting role:', grantError.message);
  console.log('Details:', grantError);
  process.exit(1);
}

console.log('✅ Admin role granted successfully!\n');
console.log('🎉 Setup complete!\n');
console.log('📧 Email: admin@intime.test');
console.log('🔑 Password: Admin123456!\n');
