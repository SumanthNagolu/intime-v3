#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🔍 Checking current database state...\n');

  // Check users
  const { data: users, error: userError, count: userCount } = await supabase
    .from('user_profiles')
    .select('email, full_name', { count: 'exact' })
    .like('email', '%@intime.com')
    .is('deleted_at', null)
    .limit(10);

  if (userError) {
    console.log('❌ User query error:', userError.message);
  } else {
    console.log(`✅ Users: ${userCount || 0} total`);
    users?.forEach(u => console.log(`   - ${u.email} (${u.full_name})`));
  }

  console.log('');

  // Check roles
  const { data: roles, error: roleError, count: roleCount } = await supabase
    .from('roles')
    .select('name, display_name', { count: 'exact' })
    .eq('is_system_role', true)
    .limit(20);

  if (roleError) {
    console.log('❌ Role query error:', roleError.message);
  } else {
    console.log(`✅ Roles: ${roleCount || 0} total`);
    roles?.forEach(r => console.log(`   - ${r.name} (${r.display_name})`));
  }

  console.log('');

  // Check role assignments
  const { data: assignments, error: assignError, count: assignCount } = await supabase
    .from('user_roles')
    .select('*', { count: 'exact', head: true });

  if (assignError) {
    console.log('❌ Assignment query error:', assignError.message);
  } else {
    console.log(`✅ Role assignments: ${assignCount || 0} total`);
  }
}

main();
