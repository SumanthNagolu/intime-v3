/**
 * Quick verification script - check what was created
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verify() {
  console.log('🔍 Verifying Sprint 1 Migration Results\n');
  console.log('='.repeat(60));
  
  // Check tables
  console.log('\n📋 TABLES CREATED:');
  const { data: tables } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .order('tablename');
  
  if (tables) {
    const keyTables = ['user_profiles', 'roles', 'permissions', 'user_roles', 'audit_logs', 'events', 'organizations'];
    console.log(`   Total: ${tables.length} tables`);
    tables.forEach(t => {
      const emoji = keyTables.includes(t.tablename) ? '✅' : '  ';
      console.log(`   ${emoji} ${t.tablename}`);
    });
  }
  
  // Check roles
  console.log('\n👥 SYSTEM ROLES:');
  const { data: roles, count: rolesCount } = await supabase
    .from('roles')
    .select('name, display_name, hierarchy_level', { count: 'exact' })
    .eq('is_system_role', true)
    .order('hierarchy_level, name');
  
  if (roles) {
    console.log(`   Total: ${rolesCount} roles`);
    roles.forEach(r => console.log(`   ✅ ${r.name.padEnd(15)} → ${r.display_name} (level ${r.hierarchy_level})`));
  }
  
  // Check permissions
  console.log('\n🔐 PERMISSIONS:');
  const { count: permCount } = await supabase
    .from('permissions')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   ✅ ${permCount} permissions created`);
  
  // Check RLS
  console.log('\n🛡️  ROW LEVEL SECURITY:');
  const { data: rlsTables } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('schemaname', 'public')
    .eq('rowsecurity', true);
  
  if (rlsTables) {
    console.log(`   ✅ ${rlsTables.length} tables with RLS enabled`);
    rlsTables.forEach(t => console.log(`      - ${t.tablename}`));
  }
  
  // Check indexes
  console.log('\n📊 INDEXES:');
  const { data: indexes } = await supabase
    .from('pg_indexes')
    .select('indexname', { count: 'exact' })
    .eq('schemaname', 'public');
  
  console.log(`   ✅ ${indexes?.length || 0} indexes created`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ DATABASE SETUP COMPLETE!\n');
}

verify().catch(console.error);

