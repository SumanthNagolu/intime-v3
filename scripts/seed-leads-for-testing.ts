/**
 * Seed Leads for Testing
 * Creates 5 company leads and 5 person leads with activities, BANT scores, and notes
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Dynamic imports after env is loaded
const { db } = await import('../src/lib/db');
const { leads, activityLog, leadTasks } = await import('../src/lib/db/schema/crm');
const { v4: uuid } = await import('uuid');

// Sample company leads
const companyLeads = [
  {
    companyName: 'Pinnacle Insurance Group',
    industry: 'Insurance (P&C)',
    companyType: 'direct_client',
    companySize: '1001-5000',
    tier: 'enterprise',
    website: 'https://pinnacleins.com',
    headquarters: 'Hartford, CT',
    firstName: 'Michael',
    lastName: 'Crawford',
    title: 'VP of IT',
    email: 'mcrawford@pinnacleins.com',
    phone: '+1 (860) 555-0123',
    estimatedValue: 75000,
    source: 'linkedin',
  },
  {
    companyName: 'Meridian Financial Services',
    industry: 'Financial Services',
    companyType: 'direct_client',
    companySize: '501-1000',
    tier: 'mid_market',
    website: 'https://meridianfs.com',
    headquarters: 'Boston, MA',
    firstName: 'Jennifer',
    lastName: 'Walsh',
    title: 'Director of Operations',
    email: 'jwalsh@meridianfs.com',
    phone: '+1 (617) 555-0456',
    estimatedValue: 50000,
    source: 'referral',
  },
  {
    companyName: 'Sentinel Healthcare Systems',
    industry: 'Healthcare',
    companyType: 'direct_client',
    companySize: '5000+',
    tier: 'strategic',
    website: 'https://sentinelhealth.org',
    headquarters: 'Chicago, IL',
    firstName: 'David',
    lastName: 'Martinez',
    title: 'CTO',
    email: 'dmartinez@sentinelhealth.org',
    phone: '+1 (312) 555-0789',
    estimatedValue: 120000,
    source: 'cold_outreach',
  },
  {
    companyName: 'Atlas Technology Partners',
    industry: 'Technology',
    companyType: 'implementation_partner',
    companySize: '201-500',
    tier: 'mid_market',
    website: 'https://atlastech.io',
    headquarters: 'Austin, TX',
    firstName: 'Sarah',
    lastName: 'Chen',
    title: 'VP of Engineering',
    email: 'schen@atlastech.io',
    phone: '+1 (512) 555-0321',
    estimatedValue: 85000,
    source: 'conference_event',
  },
  {
    companyName: 'Liberty Manufacturing Corp',
    industry: 'Manufacturing',
    companyType: 'direct_client',
    companySize: '1001-5000',
    tier: 'enterprise',
    website: 'https://libertymanuf.com',
    headquarters: 'Detroit, MI',
    firstName: 'Robert',
    lastName: 'Thompson',
    title: 'IT Director',
    email: 'rthompson@libertymanuf.com',
    phone: '+1 (313) 555-0654',
    estimatedValue: 95000,
    source: 'linkedin_sales_navigator',
  },
];

// Sample person leads
const personLeads = [
  {
    firstName: 'Amanda',
    lastName: 'Peterson',
    title: 'Senior Technical Recruiter',
    email: 'amanda.peterson@gmail.com',
    phone: '+1 (650) 555-1234',
    linkedinUrl: 'https://linkedin.com/in/amandapeterson',
    decisionAuthority: 'influencer',
    preferredContactMethod: 'email',
    estimatedValue: 15000,
    source: 'linkedin',
  },
  {
    firstName: 'James',
    lastName: 'Wilson',
    title: 'HR Manager',
    email: 'james.wilson@outlook.com',
    phone: '+1 (415) 555-5678',
    linkedinUrl: 'https://linkedin.com/in/jameswilson',
    decisionAuthority: 'decision_maker',
    preferredContactMethod: 'phone',
    estimatedValue: 25000,
    source: 'referral',
  },
  {
    firstName: 'Emily',
    lastName: 'Rodriguez',
    title: 'Talent Acquisition Lead',
    email: 'emily.rodriguez@yahoo.com',
    phone: '+1 (310) 555-9012',
    linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
    decisionAuthority: 'champion',
    preferredContactMethod: 'linkedin',
    estimatedValue: 18000,
    source: 'website_inquiry',
  },
  {
    firstName: 'Daniel',
    lastName: 'Kim',
    title: 'VP of People Operations',
    email: 'daniel.kim@techstartup.io',
    phone: '+1 (206) 555-3456',
    linkedinUrl: 'https://linkedin.com/in/danielkim',
    decisionAuthority: 'decision_maker',
    preferredContactMethod: 'email',
    estimatedValue: 45000,
    source: 'cold_outreach',
  },
  {
    firstName: 'Rachel',
    lastName: 'Murphy',
    title: 'Recruiting Coordinator',
    email: 'rachel.murphy@enterprise.com',
    phone: '+1 (617) 555-7890',
    linkedinUrl: 'https://linkedin.com/in/rachelmurphy',
    decisionAuthority: 'gatekeeper',
    preferredContactMethod: 'email',
    estimatedValue: 12000,
    source: 'email_campaign',
  },
];

// Activity types for generating activities
const activityTypes = ['email', 'call', 'meeting', 'linkedin', 'note'] as const;

// Generate date for past N days
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Sample activity content
const activityContent = {
  email: [
    'Sent initial outreach email introducing InTime services',
    'Follow-up email regarding our staffing solutions',
    'Shared case study and success metrics',
    'Sent proposal document for review',
    'Thank you email after meeting',
  ],
  call: [
    'Discovery call - discussed current staffing challenges',
    'Follow-up call to answer questions',
    'Discussed technical requirements for placement',
    'Budget discussion call',
    'Closing call - next steps agreed',
  ],
  meeting: [
    'Initial discovery meeting - identified pain points',
    'Technical requirements deep dive',
    'Presented InTime pod structure approach',
    'Meeting with procurement team',
    'Final proposal presentation',
  ],
  linkedin: [
    'Connected on LinkedIn',
    'Shared industry article on staffing trends',
    'Commented on their company post',
    'Sent InMail about our 48-hour placement guarantee',
    'Shared testimonial from similar client',
  ],
  note: [
    'Key decision maker seems interested in our training academy',
    'Noted concern about budget - may need to adjust proposal',
    'Strong alignment with our insurance expertise',
    'Follow up needed on technical requirements',
    'Cross-pillar opportunity identified for bench sales',
  ],
};

// Sample strategies
const strategies = [
  {
    name: 'Enterprise Account Penetration',
    description: 'Focus on building relationships with multiple stakeholders across the organization. Target IT, HR, and Procurement for a multi-threaded approach.',
    approach: 'multi_threaded',
    keyTalkingPoints: [
      'InTime\'s 48-hour placement guarantee',
      'Pod structure with Senior/Junior pairs',
      'Insurance industry expertise and case studies',
    ],
    objectives: ['Secure pilot project', 'Build executive sponsorship', 'Expand to multiple departments'],
  },
  {
    name: 'Technical Validation Strategy',
    description: 'Lead with technical credibility. Focus on demonstrating our candidate quality and screening process.',
    approach: 'technical_focus',
    keyTalkingPoints: [
      'Rigorous 8-week training program',
      'Technical assessment process',
      'Dedicated pod accountability',
    ],
    objectives: ['Technical win with IT team', 'Validate candidate quality', 'Establish trust'],
  },
  {
    name: 'Value-Based Selling',
    description: 'Focus on ROI and business impact. Quantify the cost of unfilled positions and time-to-hire savings.',
    approach: 'value_based',
    keyTalkingPoints: [
      'Cost per bad hire vs our guarantee',
      'Average time-to-fill comparison',
      'Retention rates of our placements',
    ],
    objectives: ['Financial justification', 'C-level buy-in', 'Long-term partnership'],
  },
  {
    name: 'Referral Leverage',
    description: 'Leverage mutual connections and testimonials from similar companies in their industry.',
    approach: 'referral',
    keyTalkingPoints: [
      'Reference calls with similar clients',
      'Industry-specific success stories',
      'Peer network introductions',
    ],
    objectives: ['Build credibility', 'Shorten sales cycle', 'Expand network'],
  },
  {
    name: 'Cross-Pillar Opportunity',
    description: 'Identify and nurture opportunities across multiple InTime pillars - Training, Recruiting, Bench Sales.',
    approach: 'cross_pillar',
    keyTalkingPoints: [
      'End-to-end talent lifecycle',
      'Training-to-placement pipeline',
      'Bench consultant availability',
    ],
    objectives: ['Multiple revenue streams', 'Deeper partnership', 'Account expansion'],
  },
];

// BANT scoring configurations
const bantConfigs = [
  { budget: 22, authority: 20, need: 23, timeline: 18, notes: { budget: 'Confirmed $80k budget for Q1', authority: 'VP-level decision maker', need: 'Urgent hiring needs for 5+ positions', timeline: 'Decision expected in 2 weeks' } },
  { budget: 15, authority: 18, need: 20, timeline: 12, notes: { budget: 'Budget pending approval', authority: 'Reports to CTO', need: 'Moderate expansion planned', timeline: 'Q2 decision' } },
  { budget: 20, authority: 22, need: 18, timeline: 20, notes: { budget: 'Budget allocated', authority: 'Direct decision maker', need: 'Specific technical skills needed', timeline: 'Ready to proceed this month' } },
  { budget: 10, authority: 12, need: 15, timeline: 8, notes: { budget: 'Exploring options', authority: 'Still identifying stakeholders', need: 'Potential future need', timeline: 'Long-term planning' } },
  { budget: 18, authority: 15, need: 22, timeline: 17, notes: { budget: 'Approved with constraints', authority: 'Needs CFO sign-off', need: 'Critical project deadline', timeline: 'Need solution in 30 days' } },
];

async function seedLeads() {
  console.log('Starting lead seeding...');

  // Use main InTime Solutions organization
  const orgId = '00000000-0000-0000-0000-000000000001';
  const creatorId = null; // Will use null for createdBy since we don't have a specific user

  const createdLeads: Array<{ id: string; type: 'company' | 'person' }> = [];

  // Create company leads
  console.log('Creating 5 company leads...');
  for (let i = 0; i < companyLeads.length; i++) {
    const lead = companyLeads[i];
    const bant = bantConfigs[i];
    const id = uuid();

    await db.insert(leads).values({
      id,
      orgId: orgId!,
      leadType: 'company',
      status: 'new',
      companyName: lead.companyName,
      industry: lead.industry,
      companyType: lead.companyType,
      companySize: lead.companySize,
      tier: lead.tier,
      website: lead.website,
      headquarters: lead.headquarters,
      firstName: lead.firstName,
      lastName: lead.lastName,
      // Note: fullName is a GENERATED column - don't insert it
      title: lead.title,
      email: lead.email,
      phone: lead.phone,
      estimatedValue: lead.estimatedValue.toString(),
      source: lead.source,
      bantBudget: bant.budget,
      bantAuthority: bant.authority,
      bantNeed: bant.need,
      bantTimeline: bant.timeline,
      bantBudgetNotes: bant.notes.budget,
      bantAuthorityNotes: bant.notes.authority,
      bantNeedNotes: bant.notes.need,
      bantTimelineNotes: bant.notes.timeline,
      notes: `Initial lead from ${lead.source}. ${lead.companyName} is a ${lead.tier} client in the ${lead.industry} industry.`,
      createdBy: creatorId,
      createdAt: daysAgo(5),
    });

    createdLeads.push({ id, type: 'company' });
    console.log(`  Created: ${lead.companyName}`);
  }

  // Create person leads
  console.log('Creating 5 person leads...');
  for (let i = 0; i < personLeads.length; i++) {
    const lead = personLeads[i];
    const bant = bantConfigs[i];
    const id = uuid();

    await db.insert(leads).values({
      id,
      orgId: orgId!,
      leadType: 'person',
      status: 'new',
      firstName: lead.firstName,
      lastName: lead.lastName,
      // Note: fullName is a GENERATED column - don't insert it
      title: lead.title,
      email: lead.email,
      phone: lead.phone,
      linkedinUrl: lead.linkedinUrl,
      decisionAuthority: lead.decisionAuthority,
      preferredContactMethod: lead.preferredContactMethod,
      estimatedValue: lead.estimatedValue.toString(),
      source: lead.source,
      bantBudget: bant.budget,
      bantAuthority: bant.authority,
      bantNeed: bant.need,
      bantTimeline: bant.timeline,
      bantBudgetNotes: bant.notes.budget,
      bantAuthorityNotes: bant.notes.authority,
      bantNeedNotes: bant.notes.need,
      bantTimelineNotes: bant.notes.timeline,
      notes: `Person lead from ${lead.source}. ${lead.firstName} ${lead.lastName} is a ${lead.title}.`,
      createdBy: creatorId,
      createdAt: daysAgo(5),
    });

    createdLeads.push({ id, type: 'person' });
    console.log(`  Created: ${lead.firstName} ${lead.lastName}`);
  }

  // Create activities for each lead (5 of each type per lead over last 5 days)
  console.log('Creating activities for each lead...');
  for (const leadInfo of createdLeads) {
    for (const actType of activityTypes) {
      for (let day = 0; day < 5; day++) {
        const content = activityContent[actType];
        const body = content[day % content.length];

        await db.insert(activityLog).values({
          id: uuid(),
          orgId: orgId!,
          entityType: 'lead',
          entityId: leadInfo.id,
          activityType: actType,
          subject: `${actType.charAt(0).toUpperCase() + actType.slice(1)} Activity`,
          body,
          direction: actType === 'email' || actType === 'call' ? 'outbound' : undefined,
          outcome: 'completed',
          activityDate: daysAgo(day),
          performedBy: creatorId,
          createdAt: daysAgo(day),
        });
      }
    }
    console.log(`  Created 25 activities for lead ${leadInfo.id.slice(0, 8)}...`);
  }

  // Note: Strategies feature not yet implemented - skipping strategy creation
  console.log('Skipping strategy creation (table not yet created)...');

  // Create tasks for each lead
  console.log('Creating tasks for each lead...');
  const taskTemplates = [
    { title: 'Send follow-up email', priority: 'high', daysFromNow: 1 },
    { title: 'Schedule discovery call', priority: 'high', daysFromNow: 2 },
    { title: 'Prepare proposal document', priority: 'medium', daysFromNow: 3 },
    { title: 'Research company background', priority: 'low', daysFromNow: 0 },
    { title: 'Connect on LinkedIn', priority: 'low', daysFromNow: 1 },
  ];

  for (const leadInfo of createdLeads) {
    for (const task of taskTemplates) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + task.daysFromNow);

      await db.insert(leadTasks).values({
        id: uuid(),
        orgId: orgId!,
        leadId: leadInfo.id,
        title: task.title,
        priority: task.priority,
        dueDate,
        completed: false,
        createdBy: creatorId,
        createdAt: daysAgo(1),
      });
    }
    console.log(`  Created 5 tasks for lead ${leadInfo.id.slice(0, 8)}...`);
  }

  console.log('\n✅ Lead seeding completed!');
  console.log(`Created ${createdLeads.length} leads with activities, strategies, and tasks.`);
  console.log('\nCreated leads:');
  createdLeads.forEach((l, i) => {
    const name = i < 5 ? companyLeads[i].companyName : `${personLeads[i - 5].firstName} ${personLeads[i - 5].lastName}`;
    console.log(`  ${l.type.toUpperCase()}: ${name} (${l.id})`);
  });

  return createdLeads;
}

// Run the seeding
seedLeads()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });

