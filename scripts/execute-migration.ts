/**
 * Execute SQL Migration Script
 * 
 * Usage: npx tsx scripts/execute-migration.ts <path-to-sql-file>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function executeMigration(sqlFilePath: string) {
  const absolutePath = path.resolve(process.cwd(), sqlFilePath);
  
  if (!fs.existsSync(absolutePath)) {
    console.error(`SQL file not found: ${absolutePath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(absolutePath, 'utf-8');
  console.log(`Executing migration: ${sqlFilePath}`);
  console.log(`SQL length: ${sql.length} characters`);
  
  const executeUrl = `${supabaseUrl}/functions/v1/execute-sql`;
  
  try {
    const response = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });
    
    const result = await response.text();
    
    if (!response.ok) {
      console.error(`Error (${response.status}):`, result);
      process.exit(1);
    }
    
    console.log('Migration executed successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed to execute migration:', error);
    process.exit(1);
  }
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: npx tsx scripts/execute-migration.ts <path-to-sql-file>');
  process.exit(1);
}

executeMigration(sqlFile)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });





