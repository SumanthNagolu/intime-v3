#!/usr/bin/env tsx
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-sql`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_KEY ? 'Present' : 'Missing');
  process.exit(1);
}

async function executeSql(sql: string) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  return await response.json();
}

async function runMigration(filePath: string, fileName: string) {
  console.log(`\n📄 Running: ${fileName}`);

  const sql = fs.readFileSync(filePath, 'utf-8');

  // Execute the entire migration file as one statement
  const result = await executeSql(sql);

  if (result.success) {
    console.log(`   ✅ Success!`);
    return true;
  } else {
    // Check if error is benign (already exists)
    if (
      result.error?.includes('already exists') ||
      result.error?.includes('duplicate key')
    ) {
      console.log(`   ⚠️  Already exists (skipping)`);
      return true;
    } else {
      console.error(`   ❌ Failed: ${result.error}`);
      return false;
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  InTime v3 - Database Migration Runner                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const rootDir = path.join(__dirname, '..');

  // Phase 1: Base migrations from src/lib/db/migrations/
  console.log('\n🔧 Phase 1: Running base migrations...\n');

  const baseMigrationDir = path.join(rootDir, 'src/lib/db/migrations');
  let baseMigrations: string[] = [];
  let baseFailed = 0;

  if (fs.existsSync(baseMigrationDir)) {
    baseMigrations = fs.readdirSync(baseMigrationDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Alphabetical order (001, 002, 003, etc.)

    for (const file of baseMigrations) {
      const success = await runMigration(
        path.join(baseMigrationDir, file),
        file
      );
      if (!success) baseFailed++;
    }

    console.log(`\n   Base migrations: ${baseMigrations.length - baseFailed}/${baseMigrations.length} successful`);
  } else {
    console.log(`   ⚠️  Base migrations directory not found, skipping...`);
  }

  // Phase 2: Feature migrations from supabase/migrations/
  console.log('\n🔧 Phase 2: Running feature migrations...\n');

  const featureMigrationDir = path.join(rootDir, 'supabase/migrations');
  const featureMigrations = fs.readdirSync(featureMigrationDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Chronological order (timestamp-based)

  let featureFailed = 0;
  for (const file of featureMigrations) {
    const success = await runMigration(
      path.join(featureMigrationDir, file),
      file
    );
    if (!success) featureFailed++;
  }

  console.log(`\n   Feature migrations: ${featureMigrations.length - featureFailed}/${featureMigrations.length} successful`);

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Migration Summary                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const totalMigrations = baseMigrations.length + featureMigrations.length;
  const totalFailed = baseFailed + featureFailed;
  const totalSuccess = totalMigrations - totalFailed;

  console.log(`   ✅ Successful: ${totalSuccess}/${totalMigrations}`);
  console.log(`   ❌ Failed: ${totalFailed}/${totalMigrations}`);

  if (totalFailed === 0) {
    console.log('\n✅ All migrations completed successfully!\n');
  } else {
    console.log('\n⚠️  Some migrations failed. Check errors above.\n');
    process.exit(1);
  }
}

main();
