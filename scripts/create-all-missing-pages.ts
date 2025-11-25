#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const pages = [
  // Client Portal Pages
  { path: 'client/portal', component: 'ClientPortal', showMentor: false },
  { path: 'client/jobs', component: 'ClientJobsList', showMentor: false },
  { path: 'client/jobs/[id]', component: 'ClientJobDetail', showMentor: false },
  { path: 'client/pipeline', component: 'ClientPipeline', showMentor: false },
  { path: 'client/post', component: 'PostJobOrder', showMentor: false },
  { path: 'client/candidate/[id]', component: 'CandidateDetail', showMentor: false, folder: 'recruiting' },

  // Talent Portal Pages
  { path: 'talent/portal', component: 'TalentPortal', showMentor: false },
  { path: 'talent/jobs', component: 'TalentJobsList', showMentor: false },
  { path: 'talent/jobs/[id]', component: 'TalentJobDetail', showMentor: false },

  // Recruiting Pages
  { path: 'employee/recruiting/jobs', component: 'RecruitingJobsList', showMentor: true },
  { path: 'employee/recruiting/jobs/[id]', component: 'JobDetail', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/leads', component: 'LeadsList', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/leads/[id]', component: 'LeadDetail', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/deals', component: 'DealsPipeline', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/deals/[id]', component: 'DealDetail', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/pipeline', component: 'PipelineView', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/accounts', component: 'AccountsList', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/accounts/[id]', component: 'AccountDetail', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/post', component: 'PostJobOrder', showMentor: true },
  { path: 'employee/recruiting/sourcing/[candidateId]/[jobId]', component: 'SourcingRoom', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/screening/[candidateId]/[jobId]', component: 'ScreeningRoom', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/submission/[candidateId]/[jobId]', component: 'SubmissionBuilder', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/placement/[candidateId]/[jobId]', component: 'PlacementWorkflow', showMentor: true, folder: 'recruiting' },
  { path: 'employee/recruiting/offer/[candidateId]/[jobId]', component: 'OfferBuilder', showMentor: true, folder: 'recruiting' },

  // Bench Sales Pages
  { path: 'employee/bench/talent', component: 'BenchTalentList', showMentor: true, folder: 'bench' },
  { path: 'employee/bench/talent/[id]', component: 'BenchTalentDetail', showMentor: true, folder: 'bench' },
  { path: 'employee/bench/deals', component: 'DealsPipeline', showMentor: true, folder: 'recruiting' },
  { path: 'employee/bench/leads', component: 'LeadsList', showMentor: true, folder: 'recruiting' },
  { path: 'employee/bench/pipeline', component: 'PipelineView', showMentor: true, folder: 'recruiting' },
  { path: 'employee/bench/outreach/[id]', component: 'ClientOutreach', showMentor: true, folder: 'bench' },
  { path: 'employee/bench/jobs/[id]', component: 'JobHuntRoom', showMentor: true, folder: 'bench' },

  // TA/Sales Pages
  { path: 'employee/ta/leads', component: 'LeadsList', showMentor: true, folder: 'recruiting' },
  { path: 'employee/ta/deals', component: 'DealsPipeline', showMentor: true, folder: 'recruiting' },
  { path: 'employee/ta/campaigns', component: 'CampaignManager', showMentor: true, folder: 'sales' },
  { path: 'employee/ta/campaigns/new', component: 'CampaignBuilder', showMentor: true, folder: 'sales' },
  { path: 'employee/ta/candidates/[id]', component: 'SourcedCandidateDetail', showMentor: true, folder: 'sales' },
  { path: 'employee/ta/prospects/[id]', component: 'AccountProspects', showMentor: true, folder: 'sales' },

  // HR Pages
  { path: 'employee/hr/people', component: 'PeopleDirectory', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/org', component: 'OrgChart', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/time', component: 'TimeAttendance', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/payroll', component: 'PayrollDashboard', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/documents', component: 'Documents', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/performance', component: 'PerformanceReviews', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/learning', component: 'LearningAdmin', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/recruitment', component: 'Recruitment', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/analytics', component: 'Analytics', showMentor: true, folder: 'hr' },
  { path: 'employee/hr/profile/[id]', component: 'EmployeeProfile', showMentor: true, folder: 'hr' },

  // Academy Admin Pages
  { path: 'employee/academy/admin/cohorts', component: 'CohortsList', showMentor: true, folder: 'academy' },
  { path: 'employee/academy/admin/cohorts/[id]', component: 'CohortDetail', showMentor: true, folder: 'academy' },
  { path: 'employee/academy/admin/certificates', component: 'CertificateManager', showMentor: true, folder: 'academy' },
  { path: 'employee/academy/admin/students', component: 'StudentInstructorView', showMentor: true, folder: 'academy' },

  // Shared Employee Pages
  { path: 'employee/shared/talent', component: 'SharedTalentPool', showMentor: true },
  { path: 'employee/shared/jobs', component: 'SharedJobBoard', showMentor: true },
  { path: 'employee/shared/combined', component: 'CombinedView', showMentor: true },
];

for (const page of pages) {
  const dir = join(process.cwd(), 'src/app', page.path);
  mkdirSync(dir, { recursive: true });

  const folder = page.folder || page.path.split('/')[0];
  const componentPath = `@/components/${folder}/${page.component}`;

  const content = `import { ${page.component} } from '${componentPath}';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={${page.showMentor}}>
      <${page.component} />
    </AppLayout>
  );
}
`;

  writeFileSync(join(dir, 'page.tsx'), content);
  console.log(`✅ Created ${page.path}/page.tsx`);
}

console.log(`\n✅ Created ${pages.length} pages!`);
