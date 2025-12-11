/**
 * Run Unified Contact Model Migrations
 *
 * Runs all migrations for the unified contact model via the execute-sql edge function
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ES Module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Edge function URL for executing SQL
const executeSqlUrl = `${supabaseUrl}/functions/v1/execute-sql`;

// All unified contact model migrations
const MIGRATIONS = [
  '20241209000001_unified_contact_model.sql',
  '20241209000002_migrate_candidates_to_contacts.sql',
  '20241209000003_migrate_leads_to_contacts.sql',
  '20241209000004_update_fk_references.sql',
];

async function runMigration(fileName: string): Promise<boolean> {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', fileName);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    return false;
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running migration: ${fileName}`);
  console.log(`${'='.repeat(60)}`);

  try {
    const response = await fetch(executeSqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Migration failed: ${fileName}`);
      console.error(`Status: ${response.status}`);
      console.error(`Error: ${errorText}`);
      return false;
    }

    const result = await response.json();
    
    if (result.error) {
      console.error(`❌ Migration failed: ${fileName}`);
      console.error(`Error: ${result.error}`);
      return false;
    }

    console.log(`✅ Migration completed: ${fileName}`);
    
    // Print any notices from the migration
    if (result.notices && result.notices.length > 0) {
      console.log('\nNotices:');
      result.notices.forEach((notice: string) => console.log(`  ${notice}`));
    }

    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${fileName}`);
    console.error(`Error: ${error}`);
    return false;
  }
}

async function runAllMigrations() {
  console.log('Starting Unified Contact Model Migrations...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Migrations to run: ${MIGRATIONS.length}`);

  let successCount = 0;
  let failCount = 0;

  for (const migration of MIGRATIONS) {
    const success = await runMigration(migration);
    if (success) {
      successCount++;
    } else {
      failCount++;
      // Stop on first failure
      console.log('\n⚠️  Stopping due to migration failure.');
      break;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('MIGRATION SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📋 Total: ${MIGRATIONS.length}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runAllMigrations()
  .then(() => {
    console.log('\n🎉 All migrations completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

