import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verify() {
  console.log('🔍 Verifying Migration...\n');

  const sql = `
    SELECT code, name, entity_type, target_days 
    FROM activity_patterns 
    WHERE entity_type = 'campaign' 
    ORDER BY code;
  `;

  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/execute-sql`;
  
  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Campaign Activity Patterns Created:\n');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.code}: ${row.name} (${row.target_days} days)`);
    });
    console.log(`\n  Total: ${result.rows.length} patterns`);
  } else {
    console.error('❌ Error:', result.error);
  }

  // Check workplan template
  const sql2 = `
    SELECT code, name, entity_type, trigger_event 
    FROM workplan_templates 
    WHERE entity_type = 'campaign';
  `;

  const response2 = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: sql2 }),
  });

  const result2 = await response2.json();
  
  if (result2.success && result2.rows.length > 0) {
    console.log('\n✅ Workplan Template Created:');
    result2.rows.forEach((row: any) => {
      console.log(`  - ${row.code}: ${row.name} (trigger: ${row.trigger_event})`);
    });
  }

  // Check functions
  const sql3 = `
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_name IN ('create_campaign_workplan', 'complete_campaign_activity', 'check_campaign_status_progression')
    AND routine_type = 'FUNCTION';
  `;

  const response3 = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: sql3 }),
  });

  const result3 = await response3.json();
  
  if (result3.success && result3.rows.length > 0) {
    console.log('\n✅ Functions Created:');
    result3.rows.forEach((row: any) => {
      console.log(`  - ${row.routine_name}()`);
    });
  }

  console.log('\n🎉 Verification complete!\n');
}

verify();
