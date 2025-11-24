/**
 * Check academy database schema to understand table structure
 */

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkSchema() {
  // Check what academy-related tables exist
  const tablesSQL = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%course%' OR table_name LIKE '%topic%' OR table_name LIKE '%module%')
    ORDER BY table_name;
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: tablesSQL }),
  });

  const result = await response.json();
  console.log('Academy Tables:');
  console.log(JSON.stringify(result.rows, null, 2));

  // Check module_topics columns
  const columnsSQL = `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'module_topics'
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `;

  const response2 = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: columnsSQL }),
  });

  const result2 = await response2.json();
  console.log('\nmodule_topics columns:');
  console.log(JSON.stringify(result2.rows, null, 2));
}

checkSchema();
