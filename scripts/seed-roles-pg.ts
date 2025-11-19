/**
 * Seed Initial System Roles using pg library
 * Bypasses Supabase client issues
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const connectionString = process.env.SUPABASE_DB_URL!;

if (!connectionString) {
  console.error('❌ Missing SUPABASE_DB_URL in .env.local');
  process.exit(1);
}

async function seedRoles() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('\n🌱 Seeding System Roles...\n');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const insertSQL = `
      INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code)
      VALUES
        ('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE, 0, '#dc2626'),
        ('admin', 'Administrator', 'Administrative access to manage users and settings', TRUE, 1, '#ea580c'),
        ('recruiter', 'Recruiter', 'Manages candidates, placements, and client relationships', TRUE, 2, '#0891b2'),
        ('trainer', 'Trainer', 'Manages training courses and student progress', TRUE, 2, '#7c3aed'),
        ('student', 'Student', 'Enrolled in training academy courses', TRUE, 3, '#2563eb'),
        ('candidate', 'Candidate', 'Job seeker available for placement', TRUE, 3, '#16a34a'),
        ('employee', 'Employee', 'Internal team member', TRUE, 3, '#4f46e5'),
        ('client', 'Client', 'Hiring company representative', TRUE, 3, '#9333ea')
      ON CONFLICT (name) DO NOTHING
      RETURNING name, display_name;
    `;

    const result = await client.query(insertSQL);

    if (result.rowCount === 0) {
      console.log('⏭️  All roles already exist (skipped)');
    } else {
      console.log(`✅ Created ${result.rowCount} roles:\n`);
      result.rows.forEach((row) => {
        console.log(`   - ${row.name.padEnd(15)} (${row.display_name})`);
      });
    }

    // Verify all roles
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 All System Roles:\n');

    const verifySQL = `
      SELECT name, display_name, hierarchy_level, is_system_role
      FROM roles
      WHERE is_system_role = TRUE
      ORDER BY hierarchy_level, name;
    `;

    const verifyResult = await client.query(verifySQL);
    verifyResult.rows.forEach((row) => {
      console.log(`   ${row.name.padEnd(15)} - ${row.display_name} (Level ${row.hierarchy_level})`);
    });

    console.log(`\n✨ Total: ${verifyResult.rowCount} system roles\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

seedRoles()
  .then(() => {
    console.log('✅ Seed complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  });
