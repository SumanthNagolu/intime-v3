/**
 * Deploy Escalation Migration
 * ACAD-014
 */

import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function deployMigration() {
  console.log('📦 Deploying Escalation System migration...\n');

  const sql = readFileSync(
    'supabase/migrations/20251121110000_create_escalation_system.sql',
    'utf-8'
  );

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
      console.log('✅ Migration deployed successfully!\n');
      console.log('Created:');
      console.log('  - ai_mentor_escalations table');
      console.log('  - trainer_responses table');
      console.log('  - escalation_notifications table');
      console.log('  - 4 analytics views');
      console.log('  - Row Level Security policies');
      console.log('  - Triggers for auto-updates\n');
    } else {
      throw new Error(result.error || 'Migration failed');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

deployMigration();
