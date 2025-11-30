/**
 * Verify data counts in database
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ORG_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('📊 Data Verification Report\n');
  console.log('=' .repeat(50));

  const tables = [
    'accounts',
    'leads',
    'deals',
    'jobs',
    'submissions',
    'interviews',
    'placements',
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('org_id', ORG_ID);

    if (error) {
      console.log(`  ${table}: ERROR - ${error.message}`);
    } else {
      console.log(`  ${table.padEnd(15)}: ${count}`);
    }
  }

  // Check submission status distribution
  console.log('\n📋 Submission Status Distribution:');
  const { data: submissions } = await supabase
    .from('submissions')
    .select('status')
    .eq('org_id', ORG_ID);

  const statusCounts: Record<string, number> = {};
  for (const s of submissions || []) {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  }

  for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status.padEnd(20)}: ${count}`);
  }

  // Check interview status distribution
  console.log('\n📅 Interview Status Distribution:');
  const { data: interviews } = await supabase
    .from('interviews')
    .select('status')
    .eq('org_id', ORG_ID);

  const interviewCounts: Record<string, number> = {};
  for (const i of interviews || []) {
    interviewCounts[i.status] = (interviewCounts[i.status] || 0) + 1;
  }

  for (const [status, count] of Object.entries(interviewCounts)) {
    console.log(`  ${status.padEnd(15)}: ${count}`);
  }

  // Check placement status distribution
  console.log('\n🎉 Placement Status Distribution:');
  const { data: placements } = await supabase
    .from('placements')
    .select('status')
    .eq('org_id', ORG_ID);

  const placementCounts: Record<string, number> = {};
  for (const p of placements || []) {
    placementCounts[p.status] = (placementCounts[p.status] || 0) + 1;
  }

  for (const [status, count] of Object.entries(placementCounts)) {
    console.log(`  ${status.padEnd(15)}: ${count}`);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Verification complete!');
}

main().catch(console.error);
