#!/usr/bin/env tsx
/**
 * Seed Auth Users Script
 * 
 * Creates Supabase Auth users for all test accounts in user_profiles table
 * This bridges the gap between application data and authentication system
 * 
 * Usage: tsx scripts/seed-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client (can bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Default password for all test users (change in production!)
const DEFAULT_PASSWORD = 'TestPass123!';

// Test users - only the 8 new team members
const TEST_USERS = [
  // Recruiting Pods (Teams)
  { email: 'rec_mgr1@intime.com', name: 'Recruiting Manager 1' },
  { email: 'rec1@intime.com', name: 'Recruiter 1' },
  { email: 'rec_mgr2@intime.com', name: 'Recruiting Manager 2' },
  { email: 'rec2@intime.com', name: 'Recruiter 2' },

  // Bench Sales Pods (Teams)
  { email: 'bs_mgr1@intime.com', name: 'Bench Sales Manager 1' },
  { email: 'bs1@intime.com', name: 'Bench Sales Rep 1' },
  { email: 'bs_mgr2@intime.com', name: 'Bench Sales Manager 2' },
  { email: 'bs2@intime.com', name: 'Bench Sales Rep 2' },
];

async function seedAuthUsers() {
  console.log('🚀 Starting Auth User Seeding...\n');
  console.log(`📝 Default password for all users: ${DEFAULT_PASSWORD}\n`);
  console.log('━'.repeat(60));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const user of TEST_USERS) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users.some(u => u.email === user.email);

      if (userExists) {
        console.log(`⏭️  Skipped: ${user.email} (already exists)`);
        skipCount++;
        continue;
      }

      // Create auth user
      const { data: _data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true, // Auto-confirm email for test users
        user_metadata: {
          full_name: user.name,
        },
      });

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Created: ${user.email}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${user.email}:`, err);
      errorCount++;
    }
  }

  console.log('━'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ⏭️  Skipped (existing): ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📧 Total users: ${TEST_USERS.length}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Auth users created successfully!');
    console.log(`\n🔑 Test Credentials:`);
    console.log(`   Email: student@intime.com`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log(`\n   Email: admin@intime.com`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log(`\n   (All test users use the same password)\n`);
  }
}

// Run the script
seedAuthUsers()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });



















