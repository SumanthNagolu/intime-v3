import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const roles = [
  { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access with all permissions', is_system_role: true, hierarchy_level: 0, color_code: '#dc2626' },
  { name: 'admin', display_name: 'Administrator', description: 'Administrative access to manage users and settings', is_system_role: true, hierarchy_level: 1, color_code: '#ea580c' },
  { name: 'recruiter', display_name: 'Recruiter', description: 'Manages candidates, placements, and client relationships', is_system_role: true, hierarchy_level: 2, color_code: '#0891b2' },
  { name: 'trainer', display_name: 'Trainer', description: 'Manages training courses and student progress', is_system_role: true, hierarchy_level: 2, color_code: '#7c3aed' },
  { name: 'student', display_name: 'Student', description: 'Enrolled in training academy courses', is_system_role: true, hierarchy_level: 3, color_code: '#2563eb' },
  { name: 'candidate', display_name: 'Candidate', description: 'Job seeker available for placement', is_system_role: true, hierarchy_level: 3, color_code: '#16a34a' },
  { name: 'employee', display_name: 'Employee', description: 'Internal team member', is_system_role: true, hierarchy_level: 3, color_code: '#4f46e5' },
  { name: 'client', display_name: 'Client', description: 'Hiring company representative', is_system_role: true, hierarchy_level: 3, color_code: '#9333ea' },
];

async function seedRoles() {
  console.log('\n🌱 Force Seeding System Roles...\n');

  // First, try to SELECT from roles to warm up the cache
  console.log('🔄 Warming up schema cache...');
  const { error: selectError } = await supabase
    .from('roles')
    .select('id')
    .limit(1);

  if (selectError) {
    console.log('⚠️  Cache warm-up error:', selectError.message);
    console.log('Waiting 3 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  } else {
    console.log('✅ Cache warmed\n');
  }

  // Now try to insert roles one by one
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const role of roles) {
    // Check if exists
    const { data: existing } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role.name)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  ${role.name.padEnd(15)} - Already exists`);
      skipCount++;
      continue;
    }

    // Try to insert
    const { error } = await supabase
      .from('roles')
      .insert(role);

    if (error) {
      console.log(`❌ ${role.name.padEnd(15)} - ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${role.name.padEnd(15)} - Created`);
      successCount++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`✅ Created: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Errors:  ${errorCount}\n`);

  return errorCount === 0;
}

seedRoles()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  });
