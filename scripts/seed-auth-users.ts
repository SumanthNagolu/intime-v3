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
const DEFAULT_PASSWORD = 'Test1234!';

// Test users from seed data
const TEST_USERS = [
  // Leadership & Admin
  { email: 'ceo@intime.com', name: 'Sumanth Nagolu (CEO)' },
  { email: 'admin@intime.com', name: 'System Administrator' },
  { email: 'hr@intime.com', name: 'HR Manager' },
  
  // Training Academy
  { email: 'student@intime.com', name: 'John Student' },
  { email: 'student1@intime.com', name: 'Jane Learner' },
  { email: 'student2@intime.com', name: 'Bob Graduate' },
  { email: 'trainer@intime.com', name: 'Senior Trainer' },
  
  // Recruiting Services
  { email: 'sr_rec@intime.com', name: 'Alice Senior Recruiter' },
  { email: 'jr_rec@intime.com', name: 'Bob Junior Recruiter' },
  { email: 'sr_rec2@intime.com', name: 'Carol Senior Recruiter' },
  { email: 'jr_rec2@intime.com', name: 'David Junior Recruiter' },
  
  // Bench Sales
  { email: 'sr_bs@intime.com', name: 'Eve Senior Bench Sales' },
  { email: 'jr_bs@intime.com', name: 'Frank Junior Bench Sales' },
  { email: 'sr_bs2@intime.com', name: 'Grace Senior Bench Sales' },
  { email: 'jr_bs2@intime.com', name: 'Henry Junior Bench Sales' },
  
  // Talent Acquisition
  { email: 'sr_ta@intime.com', name: 'Ivy Senior TA' },
  { email: 'jr_ta@intime.com', name: 'Jack Junior TA' },
  
  // Candidates
  { email: 'candidate@intime.com', name: 'Active Candidate' },
  { email: 'candidate1@intime.com', name: 'Bench Consultant' },
  { email: 'candidate2@intime.com', name: 'Placed Consultant' },
  { email: 'candidate3@intime.com', name: 'Inactive Candidate' },
  
  // Clients
  { email: 'client@intime.com', name: 'TechCorp Contact' },
  { email: 'client1@intime.com', name: 'HealthPlus Contact' },
  { email: 'client2@intime.com', name: 'FinanceHub Contact' },
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
      const { data, error } = await supabase.auth.admin.createUser({
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



