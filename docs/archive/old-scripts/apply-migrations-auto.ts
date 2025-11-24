/**
 * FULLY AUTOMATED Migration Runner
 *
 * Uses PostgreSQL client library directly - NO MANUAL STEPS!
 * Handles connection issues, retries, and executes all migrations
 *
 * Usage: pnpm exec tsx scripts/apply-migrations-auto.ts
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DB_URL = process.env.SUPABASE_DB_URL!;

if (!DB_URL) {
  console.error('❌ Missing SUPABASE_DB_URL in .env.local');
  process.exit(1);
}

interface MigrationFile {
  filename: string;
  number: string;
  sql: string;
}

async function connectWithRetry(maxRetries: number = 3): Promise<Client> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔌 Connecting to database (attempt ${i + 1}/${maxRetries})...`);

      const client = new Client({
        connectionString: DB_URL,
        ssl: {
          rejectUnauthorized: false // Required for Supabase
        },
        connectionTimeoutMillis: 10000,
      });

      await client.connect();
      console.log(`✅ Connected successfully!\n`);
      return client;
    } catch (error: any) {
      console.log(`⚠️  Connection attempt ${i + 1} failed: ${error.message}`);

      if (i < maxRetries - 1) {
        console.log(`   Retrying in 2 seconds...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw new Error(`Failed to connect after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }

  throw new Error('Connection failed');
}

async function executeMigration(client: Client, migration: MigrationFile): Promise<{ success: boolean; error?: string }> {
  try {
    // Remove sample data to avoid conflicts on re-run
    const cleanSql = migration.sql.replace(/-- SAMPLE DATA[\s\S]*?(?=-- ={50,}|$)/g, '');

    await client.query(cleanSql);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || String(error)
    };
  }
}

async function checkTableExists(client: Client, tableName: string): Promise<boolean> {
  try {
    const result = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      )`,
      [tableName]
    );
    return result.rows[0].exists;
  } catch {
    return false;
  }
}

async function seedRoles(client: Client): Promise<void> {
  console.log(`🌱 Seeding system roles...\n`);

  const seedSql = `
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
    RETURNING name;
  `;

  try {
    const result = await client.query(seedSql);

    if (result.rowCount === 0) {
      console.log(`⏭️  Roles already exist (skipped)\n`);
    } else {
      console.log(`✅ Created ${result.rowCount} roles:\n`);
      result.rows.forEach(row => console.log(`   - ${row.name}`));
      console.log();
    }
  } catch (error: any) {
    console.log(`⚠️  Role seeding: ${error.message}\n`);
  }
}

async function verifyMigrations(client: Client): Promise<void> {
  console.log(`🔍 Verifying migrations...\n`);

  const tables = [
    'project_timeline',
    'user_profiles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'audit_logs',
    'events',
    'event_subscriptions',
    'organizations'
  ];

  for (const table of tables) {
    const exists = await checkTableExists(client, table);
    console.log(`   ${exists ? '✅' : '❌'} ${table.padEnd(25)}`);
  }

  console.log();

  // Count roles
  try {
    const result = await client.query(`SELECT COUNT(*) as count FROM roles WHERE is_system_role = TRUE`);
    console.log(`   ✅ System roles: ${result.rows[0].count}\n`);
  } catch (error: any) {
    console.log(`   ⚠️  Could not count roles: ${error.message}\n`);
  }
}

async function runAllMigrations() {
  console.log('\n🤖 FULLY AUTOMATED MIGRATION RUNNER\n');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  let client: Client | null = null;

  try {
    // Connect to database
    client = await connectWithRetry(3);

    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'src/lib/db/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
      .sort();

    const migrations: MigrationFile[] = files.map(filename => ({
      filename,
      number: filename.split('_')[0],
      sql: fs.readFileSync(path.join(migrationsDir, filename), 'utf-8')
    }));

    console.log(`📂 Found ${migrations.length} migration files:\n`);
    migrations.forEach(m => console.log(`   - ${m.filename}`));
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Execute migrations
    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
      console.log(`📝 Executing: ${migration.filename}...`);

      const result = await executeMigration(client, migration);

      if (result.success) {
        console.log(`   ✅ SUCCESS\n`);
        successCount++;
      } else {
        console.log(`   ❌ FAILED: ${result.error}\n`);
        failCount++;

        // Continue with other migrations
        console.log(`   ⚠️  Continuing with remaining migrations...\n`);
      }
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Seed roles
    await seedRoles(client);

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Verify
    await verifyMigrations(client);

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`📊 SUMMARY:\n`);
    console.log(`   ✅ Successful: ${successCount}/${migrations.length}`);
    console.log(`   ❌ Failed: ${failCount}/${migrations.length}\n`);

    if (successCount === migrations.length) {
      console.log(`🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!\n`);
      console.log(`✨ Your database is ready!\n`);
      console.log(`📝 Next step: Run 'pnpm dev' and test signup at /signup\n`);
      return true;
    } else {
      console.log(`⚠️  Some migrations failed. Check errors above.\n`);
      return false;
    }

  } catch (error: any) {
    console.error(`\n💥 Fatal Error: ${error.message}\n`);

    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error(`🔧 DNS Resolution Issue Detected:\n`);
      console.error(`   This might be a network/firewall issue.`);
      console.error(`   Alternative: Run migrations manually in Supabase Dashboard.\n`);
      console.error(`   File to use: ALL-MIGRATIONS.sql\n`);
    }

    return false;
  } finally {
    if (client) {
      await client.end();
      console.log(`🔌 Database connection closed.\n`);
    }
  }
}

// Run
runAllMigrations()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Uncaught error:', error);
    process.exit(1);
  });
