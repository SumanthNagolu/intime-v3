/**
 * Raw check of Sprint 5 tables using Edge Function
 */

async function rawCheck() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('\nChecking Sprint 5 tables via Edge Function...\n');

  const tables = ['candidate_embeddings', 'requisition_embeddings', 'resume_matches', 'generated_resumes'];

  for (const table of tables) {
    const response = await fetch(
      'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: `SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = '${table}'
          ) as exists`,
        }),
      }
    );

    const result = await response.json();
    console.log(`${table}:`, JSON.stringify(result, null, 2));
  }

  // Also get ALL public tables
  console.log('\n\nALL PUBLIC TABLES:\n');

  const allTablesResponse = await fetch(
    'https://gkwhxmvugnjwwwiufmdy.supabase.co/functions/v1/execute-sql',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%embedd%' OR table_name LIKE '%resume%' ORDER BY table_name`,
      }),
    }
  );

  const allResult = await allTablesResponse.json();
  console.log(JSON.stringify(allResult, null, 2));
}

rawCheck().catch(console.error);
