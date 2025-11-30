#!/usr/bin/env tsx
/**
 * Seed Workspace Data Script
 *
 * Creates comprehensive test data for the workspace dashboard:
 * - 10 leads, 10 deals, 10 accounts
 * - 30 jobs, 20 talent (candidates)
 * - 50 submissions, 20 interviews, 10 placements
 *
 * Ownership model:
 * - jr_rec, sr_rec: R (Recruiter) - owners
 * - CEO: C (Creator) and I (Owner for all)
 *
 * Usage: pnpm tsx scripts/seed-workspace-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// =============================================================================
// CONSTANTS
// =============================================================================

const COMPANIES = [
  { name: 'TechFlow Inc', industry: 'Technology', type: 'direct_client' },
  { name: 'CloudScale Systems', industry: 'Cloud Services', type: 'direct_client' },
  { name: 'DataPrime Analytics', industry: 'Data & Analytics', type: 'msp_vms' },
  { name: 'FinanceHub Corp', industry: 'Financial Services', type: 'direct_client' },
  { name: 'HealthTech Solutions', industry: 'Healthcare IT', type: 'implementation_partner' },
  { name: 'RetailEdge Inc', industry: 'Retail Technology', type: 'direct_client' },
  { name: 'SecureNet Systems', industry: 'Cybersecurity', type: 'direct_client' },
  { name: 'AutoDrive Tech', industry: 'Automotive', type: 'system_integrator' },
  { name: 'EduLearn Platform', industry: 'EdTech', type: 'direct_client' },
  { name: 'GreenEnergy Solutions', industry: 'Energy', type: 'direct_client' },
];

const JOB_TITLES = [
  'Senior React Developer', 'DevOps Engineer', 'Full Stack Developer',
  'Java Backend Developer', 'Cloud Architect', 'Data Engineer',
  'Python Developer', 'Mobile Developer', 'QA Automation Engineer',
  'Frontend Developer', 'System Administrator', 'Database Administrator',
  'Security Engineer', 'Machine Learning Engineer', 'Solutions Architect',
  'Technical Lead', 'Scrum Master', 'Product Manager',
  'Business Analyst', 'UI/UX Designer', 'Site Reliability Engineer',
  'Platform Engineer', 'Integration Specialist', 'Support Engineer',
  'Network Engineer', 'Salesforce Developer', 'ServiceNow Developer',
  'SAP Consultant', 'AWS Solutions Architect', 'Azure Administrator',
];

const LOCATIONS = [
  'Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX',
  'Seattle, WA', 'Chicago, IL', 'Boston, MA', 'Denver, CO',
  'Atlanta, GA', 'Dallas, TX',
];

const CANDIDATE_FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Blake', 'Drew', 'Reese', 'Cameron', 'Skylar', 'Dakota', 'Jamie', 'Jesse',
  'Finley', 'Parker', 'Hayden', 'Emerson',
];

const CANDIDATE_LAST_NAMES = [
  'Chen', 'Johnson', 'Williams', 'Martinez', 'Garcia', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young', 'King',
  'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams',
];

const SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes',
  'PostgreSQL', 'MongoDB', 'GraphQL', 'REST API', 'Git', 'CI/CD', 'Agile', 'Scrum',
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number, daysAhead: number = 0): Date {
  const now = new Date();
  const start = now.getTime() - daysAgo * 24 * 60 * 60 * 1000;
  const end = now.getTime() + daysAhead * 24 * 60 * 60 * 1000;
  return new Date(start + Math.random() * (end - start));
}

function futureDate(daysAhead: number): Date {
  const now = new Date();
  return new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function seedWorkspaceData() {
  console.log('🚀 Starting Workspace Data Seeding...\n');

  // Step 1: Get Organization
  console.log('📍 Finding organization...');
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single();

  if (!org) {
    console.error('❌ No organization found');
    process.exit(1);
  }
  const orgId = org.id;
  console.log(`✅ Found organization: ${orgId}\n`);

  // Step 2: Get User Profiles
  console.log('📍 Fetching user profiles...');
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, email, first_name, last_name')
    .eq('org_id', orgId);

  if (!profiles || profiles.length === 0) {
    console.error('❌ No user profiles found');
    process.exit(1);
  }

  const users: Record<string, string> = {};
  profiles.forEach(p => {
    if (p.email) users[p.email] = p.id;
  });

  // Find CEO or fallback to admin users
  const ceoId = users['ceo@intime.com'] || users['cfo@intime.com'] || users['hr@intime.com'] || users['admin@intime.com'];

  // Find recruiters - try multiple email patterns
  const recruiterEmails = [
    'sr_rec@intime.com', 'jr_rec@intime.com',
    'sr_rec2@intime.com', 'jr_rec2@intime.com',
    'sr_rec_2@intime.com', 'jr_rec_2@intime.com',
  ];

  const recruiters = recruiterEmails
    .map(email => users[email])
    .filter(Boolean);

  if (recruiters.length === 0) {
    // Fallback: find any user with 'rec' in email
    const fallbackRecruiters = Object.entries(users)
      .filter(([email]) => email.includes('rec'))
      .map(([, id]) => id)
      .slice(0, 4);

    if (fallbackRecruiters.length > 0) {
      recruiters.push(...fallbackRecruiters);
    }
  }

  // Use first recruiter as CEO fallback
  const creatorId = ceoId || recruiters[0];

  if (!creatorId || recruiters.length === 0) {
    console.error('❌ Required users not found (no CEO/admin or recruiters)');
    console.log('Available users:', Object.keys(users));
    process.exit(1);
  }
  console.log(`✅ Found ${recruiters.length} recruiters and creator\n`);
  console.log(`   Creator: ${creatorId}`);
  console.log(`   Recruiters: ${recruiters.length}\n`);

  // =============================================================================
  // SEED ACCOUNTS
  // =============================================================================
  console.log('📦 Creating 10 accounts...');
  const accountIds: string[] = [];

  for (let i = 0; i < 10; i++) {
    const company = COMPANIES[i];
    const owner = randomItem(recruiters);

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        org_id: orgId,
        name: company.name,
        industry: company.industry,
        company_type: company.type,
        status: i < 7 ? 'active' : 'prospect',
        tier: i < 3 ? 'enterprise' : i < 6 ? 'mid_market' : 'smb',
        account_manager_id: owner,
        payment_terms_days: randomItem([15, 30, 45, 60]),
        website: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        headquarters_location: randomItem(LOCATIONS),
        description: `${company.name} - A leading ${company.industry} company`,
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Error creating account ${company.name}:`, error.message);
    } else {
      accountIds.push(account!.id);
      console.log(`  ✅ Created: [ACC-${i+1}] ${company.name}`);
    }
  }
  console.log();

  // =============================================================================
  // SEED LEADS
  // =============================================================================
  console.log('📋 Creating 10 leads...');
  const leadIds: string[] = [];
  const leadStatuses = ['new', 'warm', 'hot', 'cold', 'converted'];

  for (let i = 0; i < 10; i++) {
    const owner = randomItem(recruiters);
    const firstName = randomItem(CANDIDATE_FIRST_NAMES);
    const lastName = randomItem(CANDIDATE_LAST_NAMES);
    const company = `Lead Company ${i + 1}`;

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        org_id: orgId,
        lead_type: i % 2 === 0 ? 'company' : 'person',
        company_name: company,
        industry: randomItem(COMPANIES).industry,
        company_type: randomItem(['direct_client', 'msp_vms', 'implementation_partner']),
        company_size: randomItem(['1-50', '51-200', '201-1000', '1000+']),
        first_name: firstName,
        last_name: lastName,
        title: randomItem(['VP Engineering', 'Director IT', 'CTO', 'Hiring Manager', 'Procurement Lead']),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@leadco${i+1}.com`,
        phone: `555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        status: randomItem(leadStatuses),
        source: randomItem(['LinkedIn', 'Referral', 'Website', 'Conference', 'Cold Outreach']),
        owner_id: owner,
        estimated_value: String(randomInt(50000, 500000)),
        bant_budget: randomInt(0, 25),
        bant_authority: randomInt(0, 25),
        bant_need: randomInt(0, 25),
        bant_timeline: randomInt(0, 25),
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Error creating lead:`, error.message);
    } else {
      leadIds.push(lead!.id);
      console.log(`  ✅ Created: [LEAD-${i+1}] ${firstName} ${lastName} @ ${company}`);
    }
  }
  console.log();

  // =============================================================================
  // SEED DEALS
  // =============================================================================
  console.log('💰 Creating 10 deals...');
  const dealIds: string[] = [];
  const dealStages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  for (let i = 0; i < 10; i++) {
    const owner = randomItem(recruiters);
    const accountId = accountIds[i] || randomItem(accountIds);

    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        org_id: orgId,
        account_id: accountId,
        lead_id: leadIds[i] || null,
        title: `Deal-${i+1}: ${COMPANIES[i]?.name || 'Enterprise'} Staffing Contract`,
        description: `Staffing engagement for ${randomInt(2, 10)} positions`,
        value: String(randomInt(100000, 1000000)),
        stage: dealStages[i % dealStages.length],
        probability: randomInt(10, 90),
        expected_close_date: futureDate(randomInt(7, 90)).toISOString().split('T')[0],
        owner_id: owner,
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Error creating deal:`, error.message);
    } else {
      dealIds.push(deal!.id);
      console.log(`  ✅ Created: [DEAL-${i+1}] ${COMPANIES[i]?.name || 'Enterprise'} - ${dealStages[i % dealStages.length]}`);
    }
  }
  console.log();

  // =============================================================================
  // FETCH EXISTING CANDIDATES (Talent) - Use existing profiles with 'candidate' in email
  // =============================================================================
  console.log('👤 Finding existing candidates...');
  const candidateIds: string[] = [];

  // Get existing candidate profiles
  const { data: existingCandidates } = await supabase
    .from('user_profiles')
    .select('id, email, first_name, last_name')
    .eq('org_id', orgId)
    .or('email.ilike.%candidate%,email.ilike.%talent%')
    .limit(20);

  if (existingCandidates && existingCandidates.length > 0) {
    existingCandidates.forEach((c, i) => {
      candidateIds.push(c.id);
      console.log(`  ✅ Found: [TALENT-${i+1}] ${c.first_name || 'Unknown'} ${c.last_name || ''} (${c.email})`);
    });
  }

  // If not enough candidates, use recruiters as candidates too (for testing)
  if (candidateIds.length < 10) {
    console.log('  ℹ️  Adding recruiters as additional candidates for testing...');
    recruiters.forEach((id, _i) => {
      if (!candidateIds.includes(id)) {
        candidateIds.push(id);
        console.log(`  ✅ Added recruiter as candidate: [TALENT-${candidateIds.length}]`);
      }
    });
  }

  console.log(`  📊 Total candidates available: ${candidateIds.length}\n`);

  // =============================================================================
  // SEED JOBS
  // =============================================================================
  console.log('💼 Creating 30 jobs...');
  const jobIds: string[] = [];
  const jobStatuses = ['open', 'open', 'open', 'urgent', 'on_hold', 'filled', 'closed'];
  const urgencies = ['low', 'medium', 'high', 'urgent'];

  for (let i = 0; i < 30; i++) {
    const owner = randomItem(recruiters);
    const accountId = accountIds[i % accountIds.length];
    const title = JOB_TITLES[i % JOB_TITLES.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const rateMin = randomInt(50, 100);
    const rateMax = rateMin + randomInt(10, 40);

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        org_id: orgId,
        account_id: accountId,
        deal_id: dealIds[i % dealIds.length] || null,
        title,
        description: `We are looking for an experienced ${title} to join our team. The ideal candidate will have strong skills in modern technologies and excellent communication abilities.`,
        job_type: randomItem(['contract', 'contract-to-hire', 'permanent']),
        location,
        is_remote: location === 'Remote',
        rate_min: String(rateMin),
        rate_max: String(rateMax),
        rate_type: 'hourly',
        status: jobStatuses[i % jobStatuses.length],
        urgency: urgencies[i % urgencies.length],
        positions_count: randomInt(1, 3),
        required_skills: SKILLS.slice(0, randomInt(3, 6)),
        min_experience_years: randomInt(2, 5),
        max_experience_years: randomInt(6, 12),
        visa_requirements: ['US Citizen', 'Green Card', 'H1B'],
        owner_id: owner,
        recruiter_ids: [owner],
        posted_date: randomDate(30, 0).toISOString().split('T')[0],
        target_fill_date: futureDate(randomInt(14, 60)).toISOString().split('T')[0],
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Error creating job:`, error.message);
    } else {
      jobIds.push(job!.id);
      const status = jobStatuses[i % jobStatuses.length];
      const urgency = urgencies[i % urgencies.length];
      console.log(`  ✅ Created: [JOB-${i+1}] ${title} (${status}/${urgency}) @ ${COMPANIES[i % COMPANIES.length].name}`);
    }
  }
  console.log();

  // =============================================================================
  // SEED SUBMISSIONS
  // =============================================================================
  console.log('📝 Creating 50 submissions...');
  const submissionIds: string[] = [];
  const submissionStatuses = [
    'sourced', 'sourced', 'screening', 'screening',
    'vendor_pending', 'vendor_accepted', 'submitted_to_client',
    'client_review', 'client_accepted', 'client_interview',
    'offer_stage', 'placed', 'rejected',
  ];

  // Track unique job-candidate pairs to avoid duplicates
  const usedPairs = new Set<string>();

  for (let i = 0; i < 50; i++) {
    const owner = randomItem(recruiters);
    let jobId: string;
    let candidateId: string;
    let pairKey: string;

    // Find a unique job-candidate pair
    do {
      jobId = jobIds[i % jobIds.length];
      candidateId = candidateIds[i % candidateIds.length];
      pairKey = `${jobId}-${candidateId}`;
    } while (usedPairs.has(pairKey) && usedPairs.size < jobIds.length * candidateIds.length);

    usedPairs.add(pairKey);

    const status = submissionStatuses[i % submissionStatuses.length];
    const accountId = accountIds[i % accountIds.length];

    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        org_id: orgId,
        job_id: jobId,
        candidate_id: candidateId,
        account_id: accountId,
        status,
        ai_match_score: randomInt(60, 98),
        recruiter_match_score: randomInt(70, 95),
        submitted_rate: String(randomInt(60, 120)),
        submitted_rate_type: 'hourly',
        submission_notes: `Submission ${i+1}: Strong candidate match for this position`,
        vendor_decision: status.includes('vendor') || status.includes('client') || status === 'placed' ? 'accepted' : 'pending',
        vendor_submitted_at: status !== 'sourced' ? randomDate(14, 0).toISOString() : null,
        submitted_to_client_at: status.includes('client') || status === 'placed' ? randomDate(10, 0).toISOString() : null,
        owner_id: owner,
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (error) {
      // Skip duplicates silently
      if (!error.message.includes('duplicate')) {
        console.error(`  ❌ Error creating submission:`, error.message);
      }
    } else {
      submissionIds.push(submission!.id);
      console.log(`  ✅ Created: [SUB-${i+1}] ${status} - Job ${(i % jobIds.length) + 1} / Talent ${(i % candidateIds.length) + 1}`);
    }
  }
  console.log(`  📊 Created ${submissionIds.length} submissions\n`);

  // =============================================================================
  // SEED INTERVIEWS
  // =============================================================================
  console.log('🎤 Creating 20 interviews...');
  const interviewIds: string[] = [];
  const interviewStatuses = ['scheduled', 'scheduled', 'completed', 'cancelled', 'no_show'];
  const interviewTypes = ['phone_screen', 'technical', 'behavioral', 'panel', 'final'];

  // Get submissions that are at interview stage
  const interviewEligibleSubmissions = submissionIds.slice(0, 20);

  for (let i = 0; i < 20 && i < interviewEligibleSubmissions.length; i++) {
    const submissionId = interviewEligibleSubmissions[i];

    // Get submission details
    const { data: sub } = await supabase
      .from('submissions')
      .select('job_id, candidate_id')
      .eq('id', submissionId)
      .single();

    if (!sub) continue;

    const status = interviewStatuses[i % interviewStatuses.length];
    const scheduledAt = status === 'scheduled' ? futureDate(randomInt(1, 14)) : randomDate(14, 0);

    const { data: interview, error } = await supabase
      .from('interviews')
      .insert({
        org_id: orgId,
        submission_id: submissionId,
        job_id: sub.job_id,
        candidate_id: sub.candidate_id,
        round_number: randomInt(1, 3),
        interview_type: interviewTypes[i % interviewTypes.length],
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: randomItem([30, 45, 60, 90]),
        timezone: 'America/New_York',
        meeting_link: `https://meet.intime.com/interview-${i+1}`,
        interviewer_names: ['John Smith', 'Jane Doe'],
        interviewer_emails: ['interviewer@client.com'],
        status,
        feedback: status === 'completed' ? 'Strong technical skills, good cultural fit' : null,
        rating: status === 'completed' ? randomInt(3, 5) : null,
        recommendation: status === 'completed' ? randomItem(['strong_hire', 'hire', 'no_hire']) : null,
        scheduled_by: randomItem(recruiters),
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Error creating interview:`, error.message);
    } else {
      interviewIds.push(interview!.id);
      console.log(`  ✅ Created: [INT-${i+1}] ${interviewTypes[i % interviewTypes.length]} - ${status}`);
    }
  }
  console.log();

  // =============================================================================
  // SEED PLACEMENTS
  // =============================================================================
  console.log('🏆 Creating 10 placements...');
  const placementStatuses = ['active', 'active', 'active', 'completed', 'terminated'];

  // Get submissions that are placed
  const placedSubmissions = submissionIds.filter((_, i) => submissionStatuses[i % submissionStatuses.length] === 'placed');

  for (let i = 0; i < 10; i++) {
    const submissionId = placedSubmissions[i % placedSubmissions.length] || submissionIds[i];

    // Get submission details
    const { data: sub } = await supabase
      .from('submissions')
      .select('job_id, candidate_id')
      .eq('id', submissionId)
      .single();

    if (!sub) continue;

    const accountId = accountIds[i % accountIds.length];
    const recruiterId = randomItem(recruiters);
    const billRate = randomInt(80, 150);
    const payRate = Math.round(billRate * 0.7);
    const startDate = randomDate(60, 0);

    const { data: _placement, error } = await supabase
      .from('placements')
      .insert({
        org_id: orgId,
        submission_id: submissionId,
        job_id: sub.job_id,
        candidate_id: sub.candidate_id,
        account_id: accountId,
        placement_type: randomItem(['contract', 'contract-to-hire', 'permanent']),
        start_date: startDate.toISOString().split('T')[0],
        end_date: futureDate(randomInt(90, 365)).toISOString().split('T')[0],
        bill_rate: String(billRate),
        pay_rate: String(payRate),
        markup_percentage: String(((billRate - payRate) / payRate * 100).toFixed(1)),
        status: placementStatuses[i % placementStatuses.length],
        onboarding_status: 'completed',
        recruiter_id: recruiterId,
        account_manager_id: randomItem(recruiters),
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Error creating placement:`, error.message);
    } else {
      console.log(`  ✅ Created: [PLACE-${i+1}] ${placementStatuses[i % placementStatuses.length]} - $${billRate}/hr`);
    }
  }
  console.log();

  // =============================================================================
  // SEED ACTIVITIES (Tasks for Today)
  // =============================================================================
  console.log('📋 Creating activities/tasks...');
  const activityTypes = ['task', 'follow_up', 'call', 'meeting', 'email'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  for (let i = 0; i < 15; i++) {
    const assignedTo = randomItem(recruiters);
    const entityType = randomItem(['lead', 'deal', 'submission', 'job']);
    let entityId: string;

    switch (entityType) {
      case 'lead': entityId = leadIds[i % leadIds.length]; break;
      case 'deal': entityId = dealIds[i % dealIds.length]; break;
      case 'submission': entityId = submissionIds[i % submissionIds.length]; break;
      default: entityId = jobIds[i % jobIds.length];
    }

    const activityType = activityTypes[i % activityTypes.length];
    const priority = priorities[i % priorities.length];
    const isCompleted = i > 10; // Last few are completed
    const dueDate = i < 5 ? new Date() : futureDate(randomInt(1, 7)); // First 5 due today

    const subjects = [
      `Schedule interview for candidate`,
      `Follow up with ${COMPANIES[i % COMPANIES.length].name}`,
      `Review resume submissions`,
      `Call client about job requirements`,
      `Send offer letter`,
      `Update job posting`,
      `Check references for candidate`,
      `Prep for client meeting`,
      `Review contract terms`,
      `Onboarding checklist`,
      `Weekly status update`,
      `Pipeline review meeting`,
      `Candidate feedback call`,
      `Rate negotiation follow-up`,
      `Background check status`,
    ];

    const { error } = await supabase
      .from('activities')
      .insert({
        org_id: orgId,
        entity_type: entityType,
        entity_id: entityId,
        activity_type: activityType,
        status: isCompleted ? 'completed' : 'open',
        priority,
        subject: subjects[i % subjects.length],
        body: `Task ${i + 1}: ${subjects[i % subjects.length]}`,
        due_date: dueDate.toISOString(),
        completed_at: isCompleted ? new Date().toISOString() : null,
        assigned_to: assignedTo,
        created_by: creatorId,
      });

    if (error) {
      console.error(`  ❌ Error creating activity:`, error.message);
    } else {
      console.log(`  ✅ Created: [TASK-${i+1}] ${priority} - ${subjects[i % subjects.length].substring(0, 40)}...`);
    }
  }
  console.log();

  // =============================================================================
  // SUMMARY
  // =============================================================================
  console.log('━'.repeat(60));
  console.log('\n📊 Seed Summary:');
  console.log(`   ✅ Accounts:    ${accountIds.length}`);
  console.log(`   ✅ Leads:       ${leadIds.length}`);
  console.log(`   ✅ Deals:       ${dealIds.length}`);
  console.log(`   ✅ Talent:      ${candidateIds.length}`);
  console.log(`   ✅ Jobs:        ${jobIds.length}`);
  console.log(`   ✅ Submissions: ${submissionIds.length}`);
  console.log(`   ✅ Interviews:  ${interviewIds.length}`);
  console.log(`   ✅ Placements:  10`);
  console.log(`   ✅ Activities:  15`);
  console.log('\n🎉 Workspace data seeded successfully!\n');
}

// Run the script
seedWorkspaceData()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
