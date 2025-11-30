/**
 * Database Audit Script
 * Checks all tables, functions, and views
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function auditDatabase() {
  console.log('🔍 DATABASE AUDIT\n');

  // Check tables
  const tablesSQL = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  const tablesRes = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: tablesSQL }),
  });

  const tablesData = await tablesRes.json();

  console.log('📊 TABLES:');
  if (tablesData.rows) {
    tablesData.rows.forEach((row: Record<string, unknown>) => console.log(`  ✓ ${row.table_name}`));
  }
  console.log(`\nTotal: ${tablesData.rows?.length || 0} tables\n`);

  // Check functions
  const functionsSQL = `
    SELECT
      proname as function_name,
      pg_get_function_arguments(pg_proc.oid) as arguments
    FROM pg_proc
    JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public'
    AND proname NOT LIKE 'pg_%'
    ORDER BY proname;
  `;

  const functionsRes = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: functionsSQL }),
  });

  const functionsData = await functionsRes.json();

  console.log('⚙️  FUNCTIONS:');
  if (functionsData.rows) {
    functionsData.rows.forEach((row: Record<string, unknown>) => console.log(`  ✓ ${row.function_name}(${row.arguments || ''})`));
  }
  console.log(`\nTotal: ${functionsData.rows?.length || 0} functions\n`);

  // Check views
  const viewsSQL = `
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  const viewsRes = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: viewsSQL }),
  });

  const viewsData = await viewsRes.json();

  console.log('👁️  VIEWS:');
  if (viewsData.rows) {
    viewsData.rows.forEach((row: Record<string, unknown>) => console.log(`  ✓ ${row.table_name}`));
  }
  console.log(`\nTotal: ${viewsData.rows?.length || 0} views\n`);
}

auditDatabase();
