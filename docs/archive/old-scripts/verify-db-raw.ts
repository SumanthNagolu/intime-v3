/**
 * Verify database state using raw SQL queries
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verifyDatabase() {
  console.log('\n🔍 Deep Database Verification...\n');

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // List all tables in public schema using information_schema
  console.log('📊 Querying information_schema for actual tables...\n');

  const { data: tables, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

  if (error) {
    console.log('⚠️  RPC query failed:', error.message);
    console.log('\nTrying alternative method...\n');

    // Try using PostgREST metadata
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('PostgREST metadata:', data);
    } else {
      console.log('❌ Could not fetch metadata');
    }
  } else {
    console.log('Tables found:', tables);
  }

  // Try direct table count
  console.log('\n📈 Attempting direct table queries...\n');

  const tablesToCheck = [
    'user_profiles',
    'roles',
    'permissions',
    'organizations'
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName.padEnd(20)} - Error: ${error.code} - ${error.message}`);
      } else {
        console.log(`✅ ${tableName.padEnd(20)} - ${count} rows`);
      }
    } catch (err: any) {
      console.log(`❌ ${tableName.padEnd(20)} - Exception: ${err.message}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('RECOMMENDATION:\n');
  console.log('The schema cache issue suggests you should:');
  console.log('1. Run BOOTSTRAP.sql in Supabase Dashboard');
  console.log('2. Use the web UI at /setup/migrate');
  console.log('3. This will properly create everything via PostgREST\n');
}

verifyDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
