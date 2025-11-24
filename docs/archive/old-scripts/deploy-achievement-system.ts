/**
 * Deploy Achievement System Migration
 * ACAD-016
 */

import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function deploySql(name: string, sql: string): Promise<boolean> {
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
      console.log(`  ✅ ${name}`);
      return true;
    } else {
      console.error(`  ❌ ${name}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ ${name}:`, error);
    return false;
  }
}

async function deployMigration() {
  console.log('📦 Deploying Achievement System...\n');

  // Read migration file
  const migrationSql = readFileSync(
    'supabase/migrations/20251121130000_create_achievement_system.sql',
    'utf8'
  );

  const success = await deploySql('Achievement System Migration', migrationSql);

  if (success) {
    console.log('\n✅ Achievement system deployed successfully\n');
  } else {
    console.log('\n❌ Deployment failed\n');
    process.exit(1);
  }
}

deployMigration();
