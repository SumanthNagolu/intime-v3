/**
 * Seed roles directly using Supabase client insert
 * Bypasses RLS by using service role key
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
  console.log('\n🌱 Seeding System Roles...\n');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Insert roles one by one to handle conflicts gracefully
    let successCount = 0;
    let skipCount = 0;

    for (const role of roles) {
      const { data, error } = await supabase
        .from('roles')
        .insert(role)
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⏭️  ${role.name.padEnd(15)} - Already exists`);
          skipCount++;
        } else {
          console.log(`❌ ${role.name.padEnd(15)} - Error: ${error.message}`);
        }
      } else {
        console.log(`✅ ${role.name.padEnd(15)} - Created`);
        successCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Created: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`\n✨ Role seeding complete!\n`);

    // Verify
    const { data: allRoles, error: verifyError } = await supabase
      .from('roles')
      .select('name, display_name, hierarchy_level')
      .eq('is_system_role', true)
      .order('hierarchy_level')
      .order('name');

    if (!verifyError && allRoles) {
      console.log('📋 System Roles in Database:\n');
      allRoles.forEach(r => {
        console.log(`   ${r.name.padEnd(15)} - ${r.display_name} (Level ${r.hierarchy_level})`);
      });
      console.log();
    }

  } catch (error: any) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

seedRoles()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
