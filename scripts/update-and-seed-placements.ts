/**
 * Update submissions to placed status and create placements
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ORG_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🔄 Updating submissions to placed status...\n');

  // Find submissions that can be promoted to placed
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, status')
    .eq('org_id', ORG_ID)
    .in('status', ['offer_stage', 'client_accepted', 'client_interview'])
    .limit(8);

  console.log(`Found ${submissions?.length} submissions to update\n`);

  for (const sub of submissions || []) {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'placed' })
      .eq('id', sub.id);
    if (!error) {
      console.log(`  ✅ Updated submission ${sub.id.slice(0, 8)}... to placed`);
    }
  }

  // Now create placements for all placed submissions
  console.log('\n🎉 Creating placements for placed submissions...\n');

  const { data: placedSubmissions } = await supabase
    .from('submissions')
    .select('id, job_id, candidate_id, owner_id, account_id')
    .eq('org_id', ORG_ID)
    .eq('status', 'placed');

  console.log(`Found ${placedSubmissions?.length} placed submissions\n`);

  // Get accounts
  const { data: accountsData } = await supabase
    .from('accounts')
    .select('id')
    .eq('org_id', ORG_ID)
    .limit(10);
  const accountIds = accountsData?.map(a => a.id) || [];

  // Check existing placements
  const { data: existingPlacements } = await supabase
    .from('placements')
    .select('submission_id')
    .eq('org_id', ORG_ID);

  const existingSubmissionIds = new Set(existingPlacements?.map(p => p.submission_id) || []);

  let count = 0;
  for (const sub of placedSubmissions || []) {
    // Skip if placement already exists
    if (existingSubmissionIds.has(sub.id)) {
      console.log(`  ⏭️  Skipping ${sub.id.slice(0, 8)}... - placement exists`);
      continue;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + [3, 6, 12][Math.floor(Math.random() * 3)]);

    const billRate = 80 + Math.floor(Math.random() * 120);
    const payRate = Math.round(billRate * 0.7);

    const accountId = sub.account_id || accountIds[count % accountIds.length];

    const { error } = await supabase
      .from('placements')
      .insert({
        org_id: ORG_ID,
        submission_id: sub.id,
        job_id: sub.job_id,
        candidate_id: sub.candidate_id,
        account_id: accountId,
        recruiter_id: sub.owner_id,
        status: ['active', 'active', 'active', 'ended'][Math.floor(Math.random() * 4)],
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        bill_rate: billRate,
        pay_rate: payRate,
        placement_type: ['contract', 'contract', 'full_time'][Math.floor(Math.random() * 3)],
        created_by: sub.owner_id,
      });

    if (error) {
      console.log(`  ⚠️  Error: ${error.message}`);
    } else {
      count++;
      console.log(`  ✅ Created placement ${count} - Bill: $${billRate}/hr`);
    }
  }

  console.log(`\n📊 Created ${count} new placements`);
  console.log('✅ Done!');
}

main().catch(console.error);
