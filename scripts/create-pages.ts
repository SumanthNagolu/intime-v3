#!/usr/bin/env tsx
/**
 * Auto-generate Next.js pages from route definitions
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

// Route definitions matching App.tsx structure
const routes: Array<{ path: string; component: string; layout?: string; showMentor?: boolean }> = [
  // Public routes
  { path: 'page.tsx', component: 'Home', layout: 'AppLayout' },
  { path: 'login/page.tsx', component: 'LoginPage' },
  { path: 'academy/page.tsx', component: 'PublicAcademy', layout: 'AppLayout' },
  { path: 'clients/page.tsx', component: 'ClientLanding', layout: 'AppLayout' },

  // Academy (Student Portal)
  { path: 'academy/portal/page.tsx', component: 'StudentWelcome', layout: 'AppLayout', showMentor: true },
  { path: 'academy/dashboard/page.tsx', component: 'Dashboard', layout: 'AppLayout', showMentor: true },
  { path: 'academy/assistant/page.tsx', component: 'AIAssistantPage', layout: 'AppLayout', showMentor: true },
  { path: 'academy/modules/page.tsx', component: 'ModulesList', layout: 'AppLayout', showMentor: true },
  { path: 'academy/lesson/[moduleId]/[lessonId]/page.tsx', component: 'LessonView', layout: 'AppLayout', showMentor: true },
  { path: 'academy/identity/page.tsx', component: 'PersonaView', layout: 'AppLayout', showMentor: true },
  { path: 'academy/profile/page.tsx', component: 'ProfileView', layout: 'AppLayout', showMentor: true },
  { path: 'academy/notifications/page.tsx', component: 'NotificationsView', layout: 'AppLayout', showMentor: true },
  { path: 'academy/blueprint/page.tsx', component: 'BlueprintView', layout: 'AppLayout', showMentor: true },
  { path: 'academy/dojo/page.tsx', component: 'InterviewStudio', layout: 'AppLayout', showMentor: true },
  { path: 'academy/studio/page.tsx', component: 'MediaStudio', layout: 'AppLayout', showMentor: true },

  // Client Portal
  { path: 'client/page.tsx', component: 'ClientWelcome', layout: 'AppLayout' },
  { path: 'client/dashboard/page.tsx', component: 'client/ClientDashboard', layout: 'AppLayout' },

  // Talent Portal
  { path: 'talent/page.tsx', component: 'BenchWelcome', layout: 'AppLayout' },
  { path: 'talent/dashboard/page.tsx', component: 'talent/TalentDashboard', layout: 'AppLayout' },
  { path: 'talent/profile/page.tsx', component: 'ProfileView', layout: 'AppLayout' },

  // Employee - Recruiting
  { path: 'employee/recruiting/dashboard/page.tsx', component: 'recruiting/RecruiterDashboard', layout: 'AppLayout' },
  { path: 'employee/recruiting/analytics/page.tsx', component: 'recruiting/RecruiterAnalytics', layout: 'AppLayout' },

  // Employee - Bench
  { path: 'employee/bench/dashboard/page.tsx', component: 'bench/BenchDashboard', layout: 'AppLayout' },
  { path: 'employee/bench/analytics/page.tsx', component: 'bench/BenchAnalytics', layout: 'AppLayout' },
  { path: 'employee/bench/outreach/page.tsx', component: 'bench/ClientOutreach', layout: 'AppLayout' },
  { path: 'employee/bench/collector/page.tsx', component: 'bench/JobCollector', layout: 'AppLayout' },
  { path: 'employee/bench/hotlist/page.tsx', component: 'bench/HotlistBuilder', layout: 'AppLayout' },

  // Employee - TA (Sales)
  { path: 'employee/ta/dashboard/page.tsx', component: 'sales/TADashboard', layout: 'AppLayout' },
  { path: 'employee/ta/analytics/page.tsx', component: 'sales/SalesAnalytics', layout: 'AppLayout' },
  { path: 'employee/ta/prospects/page.tsx', component: 'sales/AccountProspects', layout: 'AppLayout' },
  { path: 'employee/ta/candidates/page.tsx', component: 'sales/SourcedCandidates', layout: 'AppLayout' },

  // Employee - HR
  { path: 'employee/hr/dashboard/page.tsx', component: 'hr/HRDashboard', layout: 'AppLayout' },

  // Employee - Executive
  { path: 'employee/ceo/dashboard/page.tsx', component: 'executive/CEODashboard', layout: 'AppLayout' },

  // Employee - Immigration
  { path: 'employee/immigration/dashboard/page.tsx', component: 'immigration/CrossBorderDashboard', layout: 'AppLayout' },

  // Employee - Admin
  { path: 'employee/admin/dashboard/page.tsx', component: 'admin/AdminDashboard', layout: 'AppLayout' },
];

function generatePageContent(component: string, layout?: string, showMentor?: boolean): string {
  const importPath = component.includes('/') ? `@/components/${component}` : `@/components/${component}`;
  const componentName = component.split('/').pop()!;

  if (layout) {
    return `import { ${componentName} } from '${importPath}';
import { ${layout} } from '@/components/${layout}';

export default function Page() {
  return (
    <${layout}${showMentor ? ' showMentor' : ''}>
      <${componentName} />
    </${layout}>
  );
}
`;
  }

  return `import { ${componentName} } from '${importPath}';

export default function Page() {
  return <${componentName} />;
}
`;
}

// Create all pages
for (const route of routes) {
  const fullPath = join('src/app', route.path);
  const dir = dirname(fullPath);

  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, generatePageContent(route.component, route.layout, route.showMentor));
    console.log(`✓ Created: ${fullPath}`);
  } catch (error) {
    console.error(`✗ Error creating ${fullPath}:`, error);
  }
}

console.log('\n✅ All pages created!');
