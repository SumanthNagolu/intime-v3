#!/usr/bin/env tsx
/**
 * Seed Test Data via Edge Function
 * Uses the execute-sql edge function to run SQL commands
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/execute-sql`;

async function executeSql(sql: string): Promise<{ success: boolean; error?: string; rows?: any[] }> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function executeSqlFile(filePath: string, description: string) {
  console.log(`\n📄 ${description}...`);

  const sql = fs.readFileSync(filePath, 'utf-8');

  // Remove comments and split by statements
  const lines = sql.split('\n').filter(line => !line.trim().startsWith('--'));
  const cleanSql = lines.join('\n');

  // Split by semicolons but preserve DO blocks and functions
  const statements: string[] = [];
  let current = '';
  let inBlock = 0;

  for (const line of cleanSql.split('\n')) {
    current += line + '\n';

    // Track DO $$ blocks
    if (line.includes('DO $$') || line.includes('DO $')) {
      inBlock++;
    }
    if (line.includes('END $$') || (line.includes('END $') && inBlock > 0)) {
      inBlock--;
    }

    // Split on semicolon if not in a block
    if (line.includes(';') && inBlock === 0) {
      const trimmed = current.trim();
      if (trimmed && trimmed !== ';') {
        statements.push(trimmed);
      }
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (!statement || statement.length < 10) continue;

    const result = await executeSql(statement);

    if (result.success) {
      successCount++;
      process.stdout.write('.');
    } else {
      errorCount++;
      console.error(`\n   ❌ Error: ${result.error}`);
    }
  }

  console.log(`\n   ✅ Executed ${successCount} statements successfully`);
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} statements failed`);
  }
}

async function verifyData() {
  console.log('\n🔍 Verifying test data...\n');

  const queries = [
    {
      label: 'Users created',
      sql: "SELECT COUNT(*)::int as count FROM user_profiles WHERE email LIKE '%@intime.com' AND deleted_at IS NULL"
    },
    {
      label: 'System roles',
      sql: "SELECT COUNT(*)::int as count FROM roles WHERE is_system_role = true"
    },
    {
      label: 'Role assignments',
      sql: "SELECT COUNT(*)::int as count FROM user_roles"
    },
  ];

  for (const query of queries) {
    const result = await executeSql(query.sql);
    if (result.success && result.rows && result.rows.length > 0) {
      console.log(`   ✅ ${query.label}: ${result.rows[0].count}`);
    } else {
      console.log(`   ❌ ${query.label}: Failed to verify`);
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  InTime v3 - Test Data Seeding (via Edge Function)       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Test edge function connectivity
    console.log('\n🔌 Testing edge function connection...');
    const test = await executeSql('SELECT 1 as test');
    if (!test.success) {
      console.error('❌ Edge function not accessible:', test.error);
      process.exit(1);
    }
    console.log('   ✅ Connected to execute-sql edge function');

    // Step 1: Cleanup
    const cleanupPath = path.join(__dirname, 'cleanup-test-users.sql');
    if (fs.existsSync(cleanupPath)) {
      await executeSqlFile(cleanupPath, 'Cleaning up existing test data');
    }

    // Step 2: Seed
    const seedPath = path.join(__dirname, 'seed-comprehensive-test-data.sql');
    if (fs.existsSync(seedPath)) {
      await executeSqlFile(seedPath, 'Seeding comprehensive test data');
    }

    // Step 3: Verify
    await verifyData();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Database seeding completed successfully!              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n📖 See TEST-CREDENTIALS.md for login details');
    console.log('🔐 Default password: TestPass123!');
    console.log('\n📝 Next step: Create Supabase Auth users');
    console.log('   Run: npm run seed:auth\n');

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
