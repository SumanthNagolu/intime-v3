/**
 * Check roles table schema
 */

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkSchema() {
  const sql = `
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'roles'
AND table_schema = 'public'
ORDER BY ordinal_position;
`;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

checkSchema();
