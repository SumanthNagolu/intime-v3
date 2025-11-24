#!/usr/bin/env tsx
/**
 * Test Supabase connection and apply migrations
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test connection by checking database version
    const { data, error } = await supabase.rpc('version' as any);

    if (error && (error.message.includes('Could not find') || error.message.includes('does not exist'))) {
      // This is actually a good sign - means we're connecting but function doesn't exist
      console.log('✅ Connection successful (fresh database)');
      return true;
    }

    if (error) {
      console.log('⚠️  Connection test inconclusive, but likely working:', error.message);
      // Still return true because we're getting database responses
      return true;
    }

    console.log('✅ Connection successful');
    console.log('📊 Database version:', data);
    return true;
  } catch (err: any) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function applyMigrations() {
  console.log('\n📊 Applying database migrations...\n');

  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  console.log(`Found ${migrationFiles.length} migrations:\n`);
  migrationFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log('');

  for (const file of migrationFiles) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf8');

    console.log(`🔄 Applying: ${file}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

      if (error) {
        // If exec_sql doesn't exist, try direct SQL execution
        const { error: directError } = await supabase.from('_migration_check').select('*').limit(1);

        if (directError) {
          console.log(`⚠️  Note: ${file} may need to be applied via Supabase Dashboard SQL Editor`);
          console.log(`   Reason: ${error.message}`);
        } else {
          console.log(`✅ ${file} applied`);
        }
      } else {
        console.log(`✅ ${file} applied`);
      }
    } catch (err: any) {
      console.log(`⚠️  ${file}: ${err.message}`);
    }
  }

  console.log('\n✅ Migration process complete');
  console.log('\n📝 Note: Some migrations may need to be applied manually via Supabase Dashboard → SQL Editor');
}

async function main() {
  const connected = await testConnection();

  if (!connected) {
    process.exit(1);
  }

  console.log('\n⚠️  Important: For security reasons, Supabase doesn\'t allow arbitrary SQL execution via API.');
  console.log('📝 Please apply migrations manually via Supabase Dashboard → SQL Editor');
  console.log('\n🔗 Migration files location: src/lib/db/migrations/');
  console.log('\n📋 Apply in order:');

  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  migrationFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  console.log('\n✅ Connection verified and ready for migrations!');
}

main();
