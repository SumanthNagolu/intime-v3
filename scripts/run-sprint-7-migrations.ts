#!/usr/bin/env ts-node

/**
 * Run Sprint 7 Database Migrations via Supabase Edge Function
 *
 * This script executes the three Sprint 7 migrations using the execute-sql edge function.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/execute-sql`;

interface MigrationFile {
  name: string;
  path: string;
  description: string;
}

const migrations: MigrationFile[] = [
  {
    name: '20251120200000_employee_screenshots',
    path: 'supabase/migrations/20251120200000_employee_screenshots.sql',
    description: 'Employee Screenshots Table (AI-PROD-001)'
  },
  {
    name: '20251120210000_productivity_reports',
    path: 'supabase/migrations/20251120210000_productivity_reports.sql',
    description: 'Productivity Reports Table (AI-PROD-003)'
  },
  {
    name: '20251120220000_twin_system',
    path: 'supabase/migrations/20251120220000_twin_system.sql',
    description: 'Twin System Tables (AI-TWIN-001)'
  }
];

async function executeSql(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runMigrations() {
  console.log('🚀 Sprint 7 Database Migrations\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const migration of migrations) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Migration: ${migration.name}`);
    console.log(`📝 ${migration.description}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // Read migration file
      const migrationPath = join(process.cwd(), migration.path);
      const sql = readFileSync(migrationPath, 'utf-8');

      console.log(`📖 Reading migration file: ${migration.path}`);
      console.log(`📊 SQL length: ${sql.length} characters\n`);

      // Execute migration
      console.log('⚙️  Executing migration...');
      const result = await executeSql(sql);

      if (result.success) {
        console.log('✅ Migration executed successfully!\n');
        successCount++;
      } else {
        console.error(`❌ Migration failed: ${result.error}\n`);
        failureCount++;
      }
    } catch (error: any) {
      console.error(`❌ Error processing migration: ${error.message}\n`);
      failureCount++;
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Migration Summary');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`✅ Successful: ${successCount}/${migrations.length}`);
  console.log(`❌ Failed: ${failureCount}/${migrations.length}\n`);

  if (failureCount === 0) {
    console.log('🎉 All migrations completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Create Supabase storage bucket: employee-screenshots');
    console.log('  2. Commit and push code to git');
    console.log('  3. Deploy to Vercel production\n');
  } else {
    console.error('⚠️  Some migrations failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
