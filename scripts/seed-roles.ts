/**
 * Seed Initial System Roles
 *
 * Creates the core system roles needed for the application
 * Run this after applying migrations
 *
 * Epic: FOUND-002 - Implement RBAC System
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Initial system roles
const systemRoles = [
  {
    name: 'super_admin',
    display_name: 'Super Administrator',
    description: 'Full system access with all permissions',
    is_system_role: true,
    hierarchy_level: 0,
    color_code: '#dc2626', // red-600
  },
  {
    name: 'admin',
    display_name: 'Administrator',
    description: 'Administrative access to manage users and settings',
    is_system_role: true,
    hierarchy_level: 1,
    color_code: '#ea580c', // orange-600
  },
  {
    name: 'recruiter',
    display_name: 'Recruiter',
    description: 'Manages candidates, placements, and client relationships',
    is_system_role: true,
    hierarchy_level: 2,
    color_code: '#0891b2', // cyan-600
  },
  {
    name: 'trainer',
    display_name: 'Trainer',
    description: 'Manages training courses and student progress',
    is_system_role: true,
    hierarchy_level: 2,
    color_code: '#7c3aed', // violet-600
  },
  {
    name: 'student',
    display_name: 'Student',
    description: 'Enrolled in training academy courses',
    is_system_role: true,
    hierarchy_level: 3,
    color_code: '#2563eb', // blue-600
  },
  {
    name: 'candidate',
    display_name: 'Candidate',
    description: 'Job seeker available for placement',
    is_system_role: true,
    hierarchy_level: 3,
    color_code: '#16a34a', // green-600
  },
  {
    name: 'employee',
    display_name: 'Employee',
    description: 'Internal team member',
    is_system_role: true,
    hierarchy_level: 3,
    color_code: '#4f46e5', // indigo-600
  },
  {
    name: 'client',
    display_name: 'Client',
    description: 'Hiring company representative',
    is_system_role: true,
    hierarchy_level: 3,
    color_code: '#9333ea', // purple-600
  },
];

async function seedRoles() {
  console.log('\n🌱 Seeding System Roles...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const role of systemRoles) {
    // Check if role already exists
    const { data: existing } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role.name)
      .single();

    if (existing) {
      console.log(`⏭️  ${role.name.padEnd(15)} - Already exists (skipped)`);
      skipCount++;
      continue;
    }

    // Insert the role
    const { error } = await supabase.from('roles').insert(role);

    if (error) {
      console.log(`❌ ${role.name.padEnd(15)} - ERROR: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${role.name.padEnd(15)} - Created`);
      successCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Created: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Errors:  ${errorCount}\n`);

  if (errorCount > 0) {
    console.log('⚠️  Some roles failed to create. Check the errors above.\n');
    return false;
  }

  if (successCount === 0 && skipCount > 0) {
    console.log('✨ All roles already exist. Database is ready!\n');
  } else {
    console.log('✨ Role seeding complete! Database is ready!\n');
  }

  return true;
}

// Run the seed
seedRoles()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  });
