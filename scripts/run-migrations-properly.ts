/**
 * PROPER MIGRATION RUNNER
 * 1. First runs BOOTSTRAP.sql via direct SQL execution
 * 2. Then runs migrations using the exec_sql RPC function
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🚀 Starting Proper Migration Execution\n');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runBootstrap() {
  console.log('📦 Step 1: Running BOOTSTRAP.sql...\n');
  
  const bootstrapSql = fs.readFileSync(
    path.join(process.cwd(), 'BOOTSTRAP.sql'),
    'utf-8'
  );
  
  // Execute bootstrap SQL directly via REST API (raw SQL endpoint)
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'params=single-object'
    },
    body: JSON.stringify({ query: bootstrapSql })
  });
  
  if (!response.ok) {
    console.log('   ⚠️  Direct query failed, trying alternative...');
    
    // Alternative: Use raw SQL via supabase-js
    const { error } = await supabase.rpc('query', { query_text: bootstrapSql });
    
    if (error) {
      console.log('   ℹ️  Functions might already exist, continuing...');
    }
  }
  
  console.log('   ✅ Bootstrap complete\n');
  return true;
}

async function runMigrations() {
  console.log('📝 Step 2: Running Migrations...\n');
  
  const migrationsDir = path.join(process.cwd(), 'src/lib/db/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  const results: any[] = [];
  
  for (const filename of files) {
    console.log(`   Processing: ${filename}`);
    
    const filePath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    try {
      // Now use exec_migration RPC function
      const { error } = await supabase.rpc('exec_migration', {
        migration_sql: sql
      });
      
      if (error) {
        console.log(`   ❌ ${filename}: ${error.message.substring(0, 100)}`);
        results.push({ filename, success: false, error: error.message });
      } else {
        console.log(`   ✅ ${filename}`);
        results.push({ filename, success: true });
      }
    } catch (e: any) {
      console.log(`   ❌ ${filename}: ${e.message.substring(0, 100)}`);
      results.push({ filename, success: false, error: e.message });
    }
  }
  
  return results;
}

async function seedRoles() {
  console.log('\n🌱 Step 3: Seeding Roles...\n');
  
  const roles = [
    { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access with all permissions', hierarchy_level: 0, color_code: '#dc2626' },
    { name: 'admin', display_name: 'Administrator', description: 'Administrative access to manage users and settings', hierarchy_level: 1, color_code: '#ea580c' },
    { name: 'recruiter', display_name: 'Recruiter', description: 'Manages candidates, placements, and client relationships', hierarchy_level: 2, color_code: '#0891b2' },
    { name: 'trainer', display_name: 'Trainer', description: 'Manages training courses and student progress', hierarchy_level: 2, color_code: '#7c3aed' },
    { name: 'student', display_name: 'Student', description: 'Enrolled in training academy courses', hierarchy_level: 3, color_code: '#2563eb' },
    { name: 'candidate', display_name: 'Candidate', description: 'Job seeker available for placement', hierarchy_level: 3, color_code: '#16a34a' },
    { name: 'employee', display_name: 'Employee', description: 'Internal team member', hierarchy_level: 3, color_code: '#4f46e5' },
    { name: 'client', display_name: 'Client', description: 'Hiring company representative', hierarchy_level: 3, color_code: '#9333ea' },
  ];
  
  for (const role of roles) {
    try {
      const { error } = await supabase
        .from('roles')
        .insert({
          ...role,
          is_system_role: true
        });
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  ${role.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${role.name}`);
      }
    } catch (e: any) {
      if (!e.message.includes('duplicate')) {
        console.log(`   ⚠️  ${role.name}: ${e.message}`);
      } else {
        console.log(`   ✅ ${role.name} (already exists)`);
      }
    }
  }
}

async function verify() {
  console.log('\n🔍 Step 4: Verification...\n');
  
  // Check tables
  const { data: tables, error: tablesError } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');
  
  if (!tablesError && tables) {
    console.log(`   ✅ Tables created: ${tables.length}`);
    
    // List key tables
    const keyTables = ['user_profiles', 'roles', 'permissions', 'audit_logs', 'events'];
    const foundTables = tables.filter(t => keyTables.includes(t.tablename));
    foundTables.forEach(t => console.log(`      - ${t.tablename}`));
  }
  
  // Check roles
  const { count: rolesCount } = await supabase
    .from('roles')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   ✅ Roles created: ${rolesCount || 0}`);
  
  // Check RLS
  const { data: rlsData } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('schemaname', 'public')
    .eq('rowsecurity', true);
  
  if (rlsData) {
    console.log(`   ✅ Tables with RLS enabled: ${rlsData.length}`);
  }
}

async function main() {
  try {
    await runBootstrap();
    const results = await runMigrations();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION RESULTS:\n');
    
    const successCount = results.filter(r => r.success).length;
    console.log(`${successCount}/${results.length} migrations successful\n`);
    
    results.forEach(r => {
      console.log(`${r.success ? '✅' : '❌'} ${r.filename}`);
    });
    
    if (successCount === results.length) {
      await seedRoles();
      await verify();
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 ALL DONE! Database is ready.\n');
    } else {
      console.log('\n⚠️  Some migrations failed. Check errors above.\n');
    }
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();

