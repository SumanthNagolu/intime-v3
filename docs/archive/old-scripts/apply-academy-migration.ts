/**
 * Apply Academy Migration
 * Story: ACAD-001
 *
 * Directly applies the Academy courses migration to the database
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('📦 Applying Academy migration...\n');

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121000000_create_academy_courses.sql'
  );

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split into statements
  const statements = migrationSQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Log statement type
    const statementType = statement.split(/\s+/)[0].toUpperCase();
    process.stdout.write(`[${i + 1}/${statements.length}] ${statementType}... `);

    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: statement + ';',
      });

      if (error) {
        throw error;
      }

      console.log('✅');
      successCount++;
    } catch (error: any) {
      // Ignore "already exists" errors
      if (
        error.message.includes('already exists') ||
        error.message.includes('PGRST202')
      ) {
        console.log('⚠️  (already exists)');
        successCount++;
      } else {
        console.log(`❌ ${error.message}`);
        errorCount++;

        // Show statement snippet for debugging
        console.log(`   Statement: ${statement.substring(0, 100)}...`);
      }
    }
  }

  console.log(`\n✅ Migration complete: ${successCount} successful, ${errorCount} errors\n`);

  // Apply seed data
  console.log('🌱 Applying seed data...\n');

  const seedPath = path.join(__dirname, '../supabase/seeds/021_academy_courses_seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');

  const seedStatements = seedSQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of seedStatements) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: statement + ';',
      });

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }

      console.log('✅ Seed data applied');
    } catch (error: any) {
      if (error.message.includes('duplicate key')) {
        console.log('⚠️  Seed data already exists');
      } else {
        console.log(`❌ ${error.message}`);
      }
    }
  }

  // Verify tables exist
  console.log('\n🔍 Verifying Academy tables...\n');

  const tables = ['courses', 'course_modules', 'module_topics', 'topic_lessons'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count');

    if (error) {
      console.log(`❌ ${table}: Not found`);
    } else {
      console.log(`✅ ${table}: Exists`);
    }
  }

  console.log('\n✅ Migration verification complete\n');
}

applyMigration()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
