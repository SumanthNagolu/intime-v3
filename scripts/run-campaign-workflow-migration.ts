import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function runMigration() {
  console.log('🚀 Running Campaign Activity Workflow Migration\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260118000000_campaign_activity_workflow.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  console.log(`📝 Migration file: ${migrationPath}`);
  console.log(`📏 SQL length: ${sql.length} chars\n`);
  
  // Use execute-sql edge function
  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/execute-sql`;
  
  console.log(`📤 Sending to: ${edgeFunctionUrl}\n`);
  
  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`❌ Error: HTTP ${response.status}`);
      console.error(responseText);
      process.exit(1);
    }

    try {
      const result = JSON.parse(responseText);
      console.log('✅ Migration completed successfully!');
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch {
      console.log('✅ Migration completed!');
      console.log('Response:', responseText.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

runMigration();
