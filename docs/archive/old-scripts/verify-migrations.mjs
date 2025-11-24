#!/usr/bin/env node

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EDGE_FUNCTION_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql';

const checks = [
  {
    name: 'Migration 008: org_id on event_subscriptions',
    sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'event_subscriptions' AND column_name = 'org_id';`,
    expected: 'org_id',
  },
  {
    name: 'Migration 008: admin functions',
    sql: `SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE 'admin_%' ORDER BY routine_name;`,
    expected: 'admin_',
  },
  {
    name: 'Migration 008: admin views',
    sql: `SELECT table_name FROM information_schema.views WHERE table_name LIKE 'admin_%' ORDER BY table_name;`,
    expected: 'admin_',
  },
  {
    name: 'Migration 009: user_has_permission function',
    sql: `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'user_has_permission';`,
    expected: 'user_has_permission',
  },
];

async function runCheck(check) {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: check.sql }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { check: check.name, status: '❌', error: result.error };
    }

    const hasData = result.rows && result.rows.length > 0;
    return {
      check: check.name,
      status: hasData ? '✅' : '❌',
      details: hasData ? `Found: ${result.rows.length} items` : 'Not found',
    };
  } catch (error) {
    return { check: check.name, status: '❌', error: error.message };
  }
}

async function main() {
  console.log('🔍 Checking migration status...\n');

  for (const check of checks) {
    const result = await runCheck(check);
    console.log(`${result.status} ${result.check}`);
    if (result.details) console.log(`   ${result.details}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }

  console.log('\n✅ Verification complete');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
