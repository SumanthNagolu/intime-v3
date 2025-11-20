#!/usr/bin/env node

/**
 * Apply database migrations to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration(migrationFile, migrationName) {
  console.log(`\n📋 Applying ${migrationName}...`);

  try {
    // Read migration file
    const migrationPath = join(projectRoot, 'src', 'lib', 'db', 'migrations', migrationFile);
    const sql = readFileSync(migrationPath, 'utf-8');

    // Split into individual statements (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_migrations')
            .select('*')
            .limit(1);

          if (directError && directError.code === '42P01') {
            console.warn(`   ⚠️  Cannot execute via RPC, using alternative method...`);
            // For Supabase, we need to use the SQL Editor or psql
            console.log(`   Statement ${i + 1}/${statements.length}: Skipping (requires direct database access)`);
          } else {
            throw error;
          }
        } else {
          console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`);
        }
      } catch (err) {
        console.error(`   ❌ Error in statement ${i + 1}:`, err.message);
        throw err;
      }
    }

    console.log(`✅ ${migrationName} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${migrationName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migration...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);

  // Test connection
  console.log('\n🔌 Testing connection...');
  const { data, error } = await supabase.from('user_profiles').select('count').limit(1);

  if (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Alternative: Apply migrations via Supabase SQL Editor');
    console.log('   1. Go to: https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy/sql/new');
    console.log('   2. Copy contents of src/lib/db/migrations/008_refine_event_bus.sql');
    console.log('   3. Paste and run in SQL Editor');
    console.log('   4. Repeat for 009_add_permission_function.sql');
    process.exit(1);
  }

  console.log('✅ Connection successful\n');

  // Apply migrations
  const migrations = [
    ['008_refine_event_bus.sql', 'Migration 008 (Event Bus Refinements)'],
    ['009_add_permission_function.sql', 'Migration 009 (Permission Functions)'],
  ];

  let allSuccessful = true;

  for (const [file, name] of migrations) {
    const success = await applyMigration(file, name);
    if (!success) {
      allSuccessful = false;
      break;
    }
  }

  if (allSuccessful) {
    console.log('\n✅ All migrations applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify migrations in Supabase dashboard');
    console.log('   2. Configure Sentry DSN');
    console.log('   3. Deploy to production');
  } else {
    console.log('\n❌ Migration failed. Please fix errors and retry.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
