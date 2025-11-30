/**
 * Migration Runner
 *
 * Executes all SQL migrations in order using Supabase REST API
 * Works around network/DNS issues by using HTTP requests
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

interface Migration {
  filename: string;
  number: string;
  sql: string;
}

async function executeSqlQuery(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function runMigrations() {
  console.log('\n🚀 Running Database Migrations...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const migrationsDir = path.join(process.cwd(), 'src/lib/db/migrations');

  // Read all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort(); // Ensures 001, 002, 003... order

  const migrations: Migration[] = files.map(filename => ({
    filename,
    number: filename.split('_')[0],
    sql: fs.readFileSync(path.join(migrationsDir, filename), 'utf-8'),
  }));

  console.log(`Found ${migrations.length} migration files:\n`);
  migrations.forEach(m => console.log(`  - ${m.filename}`));
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Execute each migration
  for (const migration of migrations) {
    console.log(`📝 Executing: ${migration.filename}...`);

    const result = await executeSqlQuery(migration.sql);

    if (result.success) {
      console.log(`✅ ${migration.filename} - SUCCESS\n`);
    } else {
      console.log(`❌ ${migration.filename} - FAILED`);
      console.log(`   Error: ${result.error}\n`);

      // Continue with other migrations instead of stopping
      console.log(`⚠️  Continuing with remaining migrations...\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✨ Migration process complete!\n');

  // Now seed roles
  console.log('🌱 Seeding system roles...\n');

  const seedSQL = `
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
    ON CONFLICT (name) DO NOTHING;
  `;

  const seedResult = await executeSqlQuery(seedSQL);

  if (seedResult.success) {
    console.log('✅ Roles seeded successfully!\n');
  } else {
    console.log('❌ Role seeding failed:', seedResult.error, '\n');
  }
}

runMigrations()
  .then(() => {
    console.log('🎉 All done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
