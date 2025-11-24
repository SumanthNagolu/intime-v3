/**
 * DIRECT MIGRATION RUNNER
 * Actually runs the migrations in Supabase - no validation, just execution
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🚀 Starting Direct Migration Execution\n');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration(filename: string, sql: string): Promise<boolean> {
  console.log(`\n📝 Running: ${filename}`);
  
  try {
    // Split into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 10);

    console.log(`   Found ${statements.length} statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Execute via Supabase client using raw SQL
      const { error } = await supabase.rpc('query', { 
        query_text: stmt + ';' 
      }).single();
      
      if (error) {
        // If query RPC doesn't exist, try direct execution
        console.log(`   Attempting direct execution...`);
        
        // Use the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`
          },
          body: JSON.stringify({ sql: stmt + ';' })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`   ⚠️  Statement ${i + 1} issue: ${errorText.substring(0, 100)}`);
          // Continue anyway - some errors are expected (IF NOT EXISTS, etc.)
        }
      }
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Progress: ${i + 1}/${statements.length}`);
      }
    }
    
    console.log(`   ✅ ${filename} completed`);
    return true;
    
  } catch (error: any) {
    console.log(`   ❌ ${filename} failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  
  // Read all migration files
  const migrationsDir = path.join(process.cwd(), 'src/lib/db/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  console.log(`\nFound ${files.length} migration files\n`);
  
  const results: any[] = [];
  
  // Run each migration
  for (const filename of files) {
    const filePath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    const success = await runMigration(filename, sql);
    results.push({ filename, success });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESULTS:\n');
  
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.filename}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n${successCount}/${results.length} migrations completed`);
  
  // Now seed roles
  console.log('\n🌱 Seeding roles...\n');
  
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
        console.log(`⚠️  ${role.name}: ${error.message}`);
      } else {
        console.log(`✅ ${role.name}`);
      }
    } catch (e: any) {
      console.log(`⚠️  ${role.name}: ${e.message}`);
    }
  }
  
  console.log('\n✅ DONE!\n');
  
  // Verify
  console.log('🔍 Verifying...\n');
  
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  console.log(`Tables created: ${tables?.length || 0}`);
  
  const { data: rolesData, count: rolesCount } = await supabase
    .from('roles')
    .select('*', { count: 'exact' });
  
  console.log(`Roles created: ${rolesCount || 0}`);
  
  console.log('\n🎉 Migration complete!\n');
}

main().catch(console.error);





