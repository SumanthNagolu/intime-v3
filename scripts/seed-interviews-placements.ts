/**
 * Seed Interviews and Placements
 *
 * Run with: pnpm tsx scripts/seed-interviews-placements.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ORG_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🚀 Seeding Interviews and Placements...\n');

  // Get submissions that can have interviews (with status field)
  const { data: submissions, error: subError } = await supabase
    .from('submissions')
    .select('id, job_id, candidate_id, status, owner_id, account_id')
    .eq('org_id', ORG_ID)
    .in('status', ['client_interview', 'offer_stage', 'placed', 'screening', 'vendor_accepted', 'submitted_to_client', 'client_review', 'client_accepted'])
    .limit(25);

  if (subError) {
    console.error('Error fetching submissions:', subError);
    return;
  }

  console.log(`📋 Found ${submissions?.length || 0} submissions for interviews\n`);

  // Get a recruiter for interview scheduling
  const { data: recruiters } = await supabase
    .from('user_profiles')
    .select('id, email')
    .eq('org_id', ORG_ID)
    .ilike('email', '%rec%')
    .limit(3);

  const recruiterIds = recruiters?.map(r => r.id) || [];
  console.log(`👤 Found ${recruiterIds.length} recruiters\n`);

  // Get accounts for placements
  const { data: accountsData } = await supabase
    .from('accounts')
    .select('id')
    .eq('org_id', ORG_ID)
    .limit(10);

  const accountIds = accountsData?.map(a => a.id) || [];
  console.log(`🏢 Found ${accountIds.length} accounts\n`);

  // Create interviews
  console.log('📅 Creating interviews...');
  const interviewTypes = ['phone_screen', 'technical', 'behavioral', 'panel', 'final'];
  const interviewStatuses = ['scheduled', 'completed', 'cancelled'];

  let interviewCount = 0;
  for (const sub of submissions || []) {
    // Create 1-2 interviews per submission
    const numInterviews = Math.random() > 0.5 ? 2 : 1;

    for (let i = 0; i < numInterviews && interviewCount < 20; i++) {
      const interviewType = interviewTypes[Math.floor(Math.random() * interviewTypes.length)];
      const status = interviewStatuses[Math.floor(Math.random() * interviewStatuses.length)];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 14) - 7); // -7 to +7 days

      const scheduledById = recruiterIds[interviewCount % recruiterIds.length] || sub.owner_id;

      const { error: intError } = await supabase
        .from('interviews')
        .insert({
          org_id: ORG_ID,
          submission_id: sub.id,
          job_id: sub.job_id,
          candidate_id: sub.candidate_id,
          round_number: i + 1,
          interview_type: interviewType,
          status: status,
          scheduled_at: scheduledDate.toISOString(),
          duration_minutes: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
          meeting_location: Math.random() > 0.5 ? 'Remote - Zoom' : 'On-site',
          scheduled_by: scheduledById,
          interviewer_names: ['John Smith', 'Jane Doe'],
          interviewer_emails: ['john@company.com', 'jane@company.com'],
          feedback: status === 'completed' ? 'Good technical skills, recommended for next round.' : null,
          rating: status === 'completed' ? Math.floor(Math.random() * 3) + 3 : null, // 3-5 rating
        });

      if (intError) {
        console.log(`  ⚠️  Interview error: ${intError.message}`);
      } else {
        interviewCount++;
        console.log(`  ✅ Created: Interview ${interviewCount} - ${interviewType} (${status})`);
      }
    }
  }

  console.log(`\n📊 Created ${interviewCount} interviews\n`);

  // Get submissions that should have placements (with status field)
  const { data: placedSubmissions } = await supabase
    .from('submissions')
    .select('id, job_id, candidate_id, owner_id, account_id')
    .eq('org_id', ORG_ID)
    .eq('status', 'placed')
    .limit(10);

  console.log(`📋 Found ${placedSubmissions?.length || 0} placed submissions\n`);

  // Create placements
  console.log('🎉 Creating placements...');
  let placementCount = 0;

  for (const sub of placedSubmissions || []) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Up to 30 days ago

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + [3, 6, 12][Math.floor(Math.random() * 3)]); // 3, 6, or 12 month contract

    const billRate = 80 + Math.floor(Math.random() * 120); // $80-$200/hr
    const payRate = billRate * 0.7; // 70% of bill rate

    // Use submission's account_id or fallback to first available account
    const accountId = sub.account_id || accountIds[placementCount % accountIds.length];

    if (!accountId) {
      console.log(`  ⚠️  Skipping placement - no account available`);
      continue;
    }

    const { error: placeError } = await supabase
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

    if (placeError) {
      console.log(`  ⚠️  Placement error: ${placeError.message}`);
    } else {
      placementCount++;
      console.log(`  ✅ Created: Placement ${placementCount} - Bill: $${billRate}/hr`);
    }
  }

  console.log(`\n📊 Created ${placementCount} placements`);
  console.log('\n✅ Seeding complete!');
}

main().catch(console.error);
