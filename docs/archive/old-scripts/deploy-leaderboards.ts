/**
 * Deploy Leaderboards Migration
 * ACAD-017
 */

import { readFileSync } from 'fs';
import { validateSql } from './validate-sql';

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function deployLeaderboards() {
  console.log('📊 Deploying Leaderboards Migration...\\n');

  // Read migration file
  const sql = readFileSync(
    'supabase/migrations/20251121150000_create_leaderboards.sql',
    'utf8'
  );

  // Validate SQL (allow ALTER TABLE for privacy column, and GRANT for permissions)
  const validation = validateSql(sql, {
    allowedStatements: [
      'ALTER TABLE',
      'CREATE OR REPLACE VIEW',
      'CREATE OR REPLACE FUNCTION',
      'CREATE INDEX IF NOT EXISTS',
      'COMMENT ON',
      'GRANT',
    ],
    forbiddenCommands: [
      'DROP DATABASE',
      'DROP SCHEMA',
      'DROP TABLE',
      'TRUNCATE TABLE',
      'DELETE FROM user',
      'UPDATE user SET',
      'REVOKE',
      'ALTER ROLE',
      'CREATE ROLE',
    ],
  });

  if (!validation.isValid) {
    console.error('❌ SQL validation failed:');
    validation.errors.forEach((err) => console.error(`   - ${err}`));
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    validation.warnings.forEach((warn) => console.warn(`   - ${warn}`));
  }

  // Deploy migration
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Leaderboards migration deployed successfully\\n');

      console.log('📋 Created:');
      console.log('   - Privacy column: user_profiles.leaderboard_visible');
      console.log('   - View: leaderboard_global');
      console.log('   - View: leaderboard_by_course');
      console.log('   - View: leaderboard_by_cohort');
      console.log('   - View: leaderboard_weekly');
      console.log('   - View: leaderboard_all_time');
      console.log('   - Function: get_user_global_rank()');
      console.log('   - Function: get_user_course_rank()');
      console.log('   - Function: get_user_cohort_rank()');
      console.log('   - Function: get_user_weekly_performance()');
      console.log('   - Function: update_leaderboard_visibility()');
      console.log('   - Function: get_user_leaderboard_summary()');
      console.log('   - 3 performance indexes\\n');

      process.exit(0);
    } else {
      console.error('❌ Deployment failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Deployment error:', error);
    process.exit(1);
  }
}

deployLeaderboards();
