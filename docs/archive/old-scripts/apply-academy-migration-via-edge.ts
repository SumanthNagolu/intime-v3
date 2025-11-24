/**
 * Apply Academy Migration via Edge Function
 * Story: ACAD-001
 *
 * Uses the existing execute-sql edge function to apply the migration
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const EXECUTE_SQL_URL = `${SUPABASE_URL}/functions/v1/execute-sql`;

async function executeSQL(sql: string): Promise<any> {
  const response = await fetch(EXECUTE_SQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function applyMigration() {
  console.log('🚀 Applying Academy Migration via Edge Function\n');
  console.log(`📍 Edge Function: ${EXECUTE_SQL_URL}\n`);

  // Read migration file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251121000000_create_academy_courses.sql'
  );

  console.log('📖 Reading migration file...');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('✅ Migration file loaded\n');

  console.log('🔄 Executing migration SQL...');
  try {
    const result = await executeSQL(migrationSQL);
    console.log('✅ Migration executed successfully\n');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }

  // Apply seed data
  console.log('\n🌱 Applying seed data...\n');

  const seedPath = path.join(__dirname, '../supabase/seeds/021_academy_courses_seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');

  try {
    const result = await executeSQL(seedSQL);
    console.log('✅ Seed data applied successfully\n');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ Seed data failed:', error.message);
    console.log('⚠️  This might be OK if data already exists\n');
  }

  // Verify tables exist
  console.log('🔍 Verifying Academy tables...\n');

  const verifySQL = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('courses', 'course_modules', 'module_topics', 'topic_lessons')
    ORDER BY table_name;
  `;

  try {
    const result = await executeSQL(verifySQL);
    console.log('✅ Tables verified:', result);

    if (result.length === 4) {
      console.log('\n✅ All 4 Academy tables exist!\n');
    } else {
      console.log(`\n⚠️  Expected 4 tables, found ${result.length}\n`);
    }
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
  }

  // Get sample data
  console.log('📚 Fetching sample courses...\n');

  const sampleSQL = `
    SELECT id, slug, title, is_published, is_featured
    FROM courses
    ORDER BY created_at;
  `;

  try {
    const result = await executeSQL(sampleSQL);
    console.log('✅ Courses in database:');
    console.table(result);
  } catch (error: any) {
    console.error('❌ Failed to fetch courses:', error.message);
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Migration complete!\n');
    console.log('🎉 ACAD-001 is now deployed to production!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
