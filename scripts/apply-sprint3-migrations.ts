#!/usr/bin/env tsx

/**
 * Apply Sprint 3 Migrations to Supabase
 *
 * This script applies migrations 010-015 to the Supabase database.
 * Uses Supabase service role key for admin access.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const migrations = [
  '010_create_workflow_engine.sql',
  '011_create_document_service.sql',
  '012_create_file_management.sql',
  '013_create_email_service.sql',
  '014_create_background_jobs.sql',
  '015_seed_workflows.sql',
];

async function applyMigration(filename: string): Promise<void> {
  console.log(`\n📄 Applying ${filename}...`);

  const migrationPath = join(process.cwd(), 'src/lib/db/migrations', filename);
  const sql = readFileSync(migrationPath, 'utf-8');

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Failed to apply ${filename}:`);
      console.error(error);
      throw error;
    }

    console.log(`✅ Successfully applied ${filename}`);
  } catch (error: any) {
    console.error(`❌ Error applying ${filename}:`, error.message);
    throw error;
  }
}

async function verifyMigration(migrationName: string): Promise<void> {
  console.log(`🔍 Verifying ${migrationName}...`);

  try {
    if (migrationName === '010_create_workflow_engine.sql') {
      // Verify workflow tables exist
      const { data, error } = await supabase
        .from('workflows')
        .select('count', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') throw error;
      console.log(`  ✓ workflows table exists`);
    }

    if (migrationName === '011_create_document_service.sql') {
      const { data, error } = await supabase
        .from('document_templates')
        .select('count', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') throw error;
      console.log(`  ✓ document_templates table exists`);
    }

    if (migrationName === '012_create_file_management.sql') {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('count', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') throw error;
      console.log(`  ✓ file_uploads table exists`);
    }

    if (migrationName === '013_create_email_service.sql') {
      const { data, error } = await supabase
        .from('email_templates')
        .select('count', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') throw error;
      console.log(`  ✓ email_templates table exists`);
    }

    if (migrationName === '014_create_background_jobs.sql') {
      const { data, error } = await supabase
        .from('background_jobs')
        .select('count', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') throw error;
      console.log(`  ✓ background_jobs table exists`);
    }

    if (migrationName === '015_seed_workflows.sql') {
      const { data, error } = await supabase
        .from('workflows')
        .select('name')
        .in('name', ['Student Lifecycle', 'Candidate Placement', 'Job Requisition']);

      if (error) throw error;
      console.log(`  ✓ Seed workflows created: ${data?.length || 0}/3`);
    }
  } catch (error: any) {
    console.warn(`  ⚠ Verification warning: ${error.message}`);
  }
}

async function main() {
  console.log('========================================');
  console.log('Sprint 3 Migration Runner');
  console.log('========================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Migrations to apply: ${migrations.length}`);
  console.log('========================================\n');

  for (const migration of migrations) {
    try {
      await applyMigration(migration);
      await verifyMigration(migration);
    } catch (error) {
      console.error(`\n❌ Migration failed at ${migration}`);
      console.error('Stopping migration process.');
      process.exit(1);
    }
  }

  console.log('\n========================================');
  console.log('✅ All Sprint 3 migrations applied successfully!');
  console.log('========================================\n');

  // Print summary
  console.log('📊 Migration Summary:');
  console.log('  - Workflow Engine (010): ✅');
  console.log('  - Document Service (011): ✅');
  console.log('  - File Management (012): ✅');
  console.log('  - Email Service (013): ✅');
  console.log('  - Background Jobs (014): ✅');
  console.log('  - Seed Workflows (015): ✅');
  console.log('\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
