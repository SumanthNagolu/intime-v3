/**
 * Breadcrumb configuration and utilities for InTime v3
 *
 * Provides:
 * - Static breadcrumb mappings for known routes
 * - Dynamic breadcrumb generation from path segments
 * - Support for detail pages with IDs
 */

export interface Breadcrumb {
  label: string;
  href?: string;
}

// =====================================================
// STATIC BREADCRUMB MAPPINGS
// =====================================================

const breadcrumbMappings: Record<string, Breadcrumb[]> = {
  // Recruiting
  '/employee/recruiting/dashboard': [
    { label: 'Recruiting' },
    { label: 'Dashboard' },
  ],
  '/employee/recruiting/jobs': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Jobs' },
  ],
  '/employee/recruiting/jobs/new': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Jobs', href: '/employee/recruiting/jobs' },
    { label: 'New Job' },
  ],
  '/employee/recruiting/candidates': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Candidates' },
  ],
  '/employee/recruiting/candidates/new': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Candidates', href: '/employee/recruiting/candidates' },
    { label: 'New Candidate' },
  ],
  '/employee/recruiting/submissions': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Submissions' },
  ],
  '/employee/recruiting/interviews': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Interviews' },
  ],
  '/employee/recruiting/placements': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Placements' },
  ],
  '/employee/recruiting/accounts': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Accounts' },
  ],
  '/employee/recruiting/accounts/new': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Accounts', href: '/employee/recruiting/accounts' },
    { label: 'New Account' },
  ],
  '/employee/recruiting/contacts': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Contacts' },
  ],
  '/employee/recruiting/leads': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Leads' },
  ],
  '/employee/recruiting/deals': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Deals' },
  ],
  '/employee/recruiting/activities': [
    { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
    { label: 'Activities' },
  ],

  // Bench Sales
  '/employee/bench/dashboard': [
    { label: 'Bench Sales' },
    { label: 'Dashboard' },
  ],
  '/employee/bench/consultants': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Consultants' },
  ],
  '/employee/bench/hotlists': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Hotlists' },
  ],
  '/employee/bench/job-orders': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Job Orders' },
  ],
  '/employee/bench/marketing': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Marketing' },
  ],
  '/employee/bench/vendors': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Vendors' },
  ],
  '/employee/bench/placements': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Placements' },
  ],
  '/employee/bench/commission': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Commission' },
  ],
  '/employee/bench/immigration': [
    { label: 'Bench Sales', href: '/employee/bench/dashboard' },
    { label: 'Immigration' },
  ],

  // HR
  '/employee/hr/dashboard': [
    { label: 'HR' },
    { label: 'Dashboard' },
  ],
  '/employee/hr/employees': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Employees' },
  ],
  '/employee/hr/pods': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Pods' },
  ],
  '/employee/hr/org-chart': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Org Chart' },
  ],
  '/employee/hr/onboarding': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Onboarding' },
  ],
  '/employee/hr/performance': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Performance' },
  ],
  '/employee/hr/timeoff': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Time Off' },
  ],
  '/employee/hr/goals': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Goals' },
  ],
  '/employee/hr/payroll': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Payroll' },
  ],
  '/employee/hr/benefits': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Benefits' },
  ],
  '/employee/hr/compliance': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Compliance' },
  ],
  '/employee/hr/compliance/i9': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Compliance', href: '/employee/hr/compliance' },
    { label: 'I-9 Records' },
  ],
  '/employee/hr/compliance/immigration': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Compliance', href: '/employee/hr/compliance' },
    { label: 'Immigration' },
  ],
  '/employee/hr/reports': [
    { label: 'HR', href: '/employee/hr/dashboard' },
    { label: 'Reports' },
  ],

  // Manager
  '/employee/manager/dashboard': [
    { label: 'Manager' },
    { label: 'Dashboard' },
  ],
  '/employee/manager/pod': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'Pod Overview' },
  ],
  '/employee/manager/team': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'Team' },
  ],
  '/employee/manager/1-on-1s': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: '1-on-1s' },
  ],
  '/employee/manager/pipeline': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'Pipeline' },
  ],
  '/employee/manager/approvals': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'Approvals' },
  ],
  '/employee/manager/escalations': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'Escalations' },
  ],
  '/employee/manager/sla': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'SLA' },
  ],
  '/employee/manager/metrics': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'Metrics' },
  ],
  '/employee/manager/reports': [
    { label: 'Manager', href: '/employee/manager/dashboard' },
    { label: 'Reports' },
  ],

  // TA
  '/employee/ta/dashboard': [
    { label: 'Talent Acquisition' },
    { label: 'Dashboard' },
  ],
  '/employee/ta/leads': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Leads' },
  ],
  '/employee/ta/deals': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Deals' },
  ],
  '/employee/ta/campaigns': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Campaigns' },
  ],
  '/employee/ta/training': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Training Applications' },
  ],
  '/employee/ta/enrollments': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Enrollments' },
  ],
  '/employee/ta/placement-tracker': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Placement Tracker' },
  ],
  '/employee/ta/internal-jobs': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Internal Jobs' },
  ],
  '/employee/ta/internal-candidates': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Internal Candidates' },
  ],
  '/employee/ta/analytics': [
    { label: 'TA', href: '/employee/ta/dashboard' },
    { label: 'Analytics' },
  ],

  // Admin
  '/employee/admin/dashboard': [
    { label: 'Admin' },
    { label: 'Dashboard' },
  ],
  '/employee/admin/users': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Users' },
  ],
  '/employee/admin/users/invite': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Users', href: '/employee/admin/users' },
    { label: 'Invite User' },
  ],
  '/employee/admin/pending-invitations': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Pending Invitations' },
  ],
  '/employee/admin/roles': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Roles' },
  ],
  '/employee/admin/pods': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Pods' },
  ],
  '/employee/admin/pods/new': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Pods', href: '/employee/admin/pods' },
    { label: 'New Pod' },
  ],
  '/employee/admin/permissions': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Permissions' },
  ],
  '/employee/admin/settings': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Settings' },
  ],
  '/employee/admin/settings/org': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Organization' },
  ],
  '/employee/admin/settings/security': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Security' },
  ],
  '/employee/admin/settings/email': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Email' },
  ],
  '/employee/admin/settings/api': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'API' },
  ],
  '/employee/admin/integrations': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Integrations' },
  ],
  '/employee/admin/workflows': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Workflows' },
  ],
  '/employee/admin/activity-patterns': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Activity Patterns' },
  ],
  '/employee/admin/sla': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'SLA Config' },
  ],
  '/employee/admin/data': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Data Hub' },
  ],
  '/employee/admin/data/import': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Data Hub', href: '/employee/admin/data' },
    { label: 'Import' },
  ],
  '/employee/admin/data/export': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Data Hub', href: '/employee/admin/data' },
    { label: 'Export' },
  ],
  '/employee/admin/data/duplicates': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Data Hub', href: '/employee/admin/data' },
    { label: 'Duplicate Detection' },
  ],
  '/employee/admin/data/reassign': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Data Hub', href: '/employee/admin/data' },
    { label: 'Bulk Reassign' },
  ],
  '/employee/admin/audit': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Audit Logs' },
  ],
  '/employee/admin/system-logs': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'System Logs' },
  ],
  '/employee/admin/notifications': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Notification Rules' },
  ],
  '/employee/admin/feature-flags': [
    { label: 'Admin', href: '/employee/admin/dashboard' },
    { label: 'Feature Flags' },
  ],

  // Executive - CEO
  '/employee/ceo/dashboard': [
    { label: 'CEO' },
    { label: 'Dashboard' },
  ],
  '/employee/ceo/strategic': [
    { label: 'CEO', href: '/employee/ceo/dashboard' },
    { label: 'Strategic Initiatives' },
  ],
  '/employee/ceo/portfolio': [
    { label: 'CEO', href: '/employee/ceo/dashboard' },
    { label: 'Portfolio' },
  ],
  '/employee/ceo/benchmarking': [
    { label: 'CEO', href: '/employee/ceo/dashboard' },
    { label: 'Benchmarking' },
  ],
  '/employee/ceo/reports': [
    { label: 'CEO', href: '/employee/ceo/dashboard' },
    { label: 'Executive Reports' },
  ],

  // Executive - CFO
  '/employee/cfo/dashboard': [
    { label: 'CFO' },
    { label: 'Dashboard' },
  ],
  '/employee/cfo/revenue': [
    { label: 'CFO', href: '/employee/cfo/dashboard' },
    { label: 'Revenue' },
  ],
  '/employee/cfo/ar': [
    { label: 'CFO', href: '/employee/cfo/dashboard' },
    { label: 'Accounts Receivable' },
  ],
  '/employee/cfo/margin': [
    { label: 'CFO', href: '/employee/cfo/dashboard' },
    { label: 'Margin' },
  ],
  '/employee/cfo/forecasting': [
    { label: 'CFO', href: '/employee/cfo/dashboard' },
    { label: 'Forecasting' },
  ],
  '/employee/cfo/placements': [
    { label: 'CFO', href: '/employee/cfo/dashboard' },
    { label: 'Placements' },
  ],
  '/employee/cfo/reports': [
    { label: 'CFO', href: '/employee/cfo/dashboard' },
    { label: 'Financial Reports' },
  ],

  // Executive - COO
  '/employee/coo/dashboard': [
    { label: 'COO' },
    { label: 'Dashboard' },
  ],
  '/employee/coo/pods': [
    { label: 'COO', href: '/employee/coo/dashboard' },
    { label: 'All Pods' },
  ],
  '/employee/coo/escalations': [
    { label: 'COO', href: '/employee/coo/dashboard' },
    { label: 'Escalations' },
  ],
  '/employee/coo/process': [
    { label: 'COO', href: '/employee/coo/dashboard' },
    { label: 'Process Metrics' },
  ],
  '/employee/coo/analytics': [
    { label: 'COO', href: '/employee/coo/dashboard' },
    { label: 'Analytics' },
  ],
  '/employee/coo/cross-pod': [
    { label: 'COO', href: '/employee/coo/dashboard' },
    { label: 'Cross-Pod' },
  ],

  // Client Portal
  '/client/dashboard': [
    { label: 'Client Portal' },
    { label: 'Dashboard' },
  ],
  '/client/jobs': [
    { label: 'Client Portal', href: '/client/dashboard' },
    { label: 'Jobs' },
  ],
  '/client/submissions': [
    { label: 'Client Portal', href: '/client/dashboard' },
    { label: 'Submissions' },
  ],
  '/client/interviews': [
    { label: 'Client Portal', href: '/client/dashboard' },
    { label: 'Interviews' },
  ],
  '/client/placements': [
    { label: 'Client Portal', href: '/client/dashboard' },
    { label: 'Placements' },
  ],
  '/client/reports': [
    { label: 'Client Portal', href: '/client/dashboard' },
    { label: 'Reports' },
  ],
  '/client/settings': [
    { label: 'Client Portal', href: '/client/dashboard' },
    { label: 'Settings' },
  ],

  // Talent Portal
  '/talent/dashboard': [
    { label: 'Talent Portal' },
    { label: 'Dashboard' },
  ],
  '/talent/profile': [
    { label: 'Talent Portal', href: '/talent/dashboard' },
    { label: 'Profile' },
  ],
  '/talent/jobs': [
    { label: 'Talent Portal', href: '/talent/dashboard' },
    { label: 'Search Jobs' },
  ],
  '/talent/saved': [
    { label: 'Talent Portal', href: '/talent/dashboard' },
    { label: 'Saved Jobs' },
  ],
  '/talent/applications': [
    { label: 'Talent Portal', href: '/talent/dashboard' },
    { label: 'Applications' },
  ],
  '/talent/interviews': [
    { label: 'Talent Portal', href: '/talent/dashboard' },
    { label: 'Interviews' },
  ],
  '/talent/offers': [
    { label: 'Talent Portal', href: '/talent/dashboard' },
    { label: 'Offers' },
  ],

  // Academy
  '/training/dashboard': [
    { label: 'Academy' },
    { label: 'Dashboard' },
  ],
  '/training/my-learning': [
    { label: 'Academy', href: '/training/dashboard' },
    { label: 'My Learning' },
  ],
  '/training/courses': [
    { label: 'Academy', href: '/training/dashboard' },
    { label: 'Courses' },
  ],
  '/training/certificates': [
    { label: 'Academy', href: '/training/dashboard' },
    { label: 'Certificates' },
  ],
  '/training/achievements': [
    { label: 'Academy', href: '/training/dashboard' },
    { label: 'Achievements' },
  ],
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if string is a UUID or numeric ID
 */
function isId(str: string): boolean {
  // UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return true;
  }
  // Numeric ID
  if (/^\d+$/.test(str)) {
    return true;
  }
  return false;
}

/**
 * Format path segment as label
 */
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate breadcrumbs from path segments (fallback)
 */
function generateFromPath(segments: string[]): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += '/' + segment;

    // Skip common prefixes
    if (segment === 'employee' || segment === 'client' || segment === 'talent') {
      continue;
    }

    // Skip IDs
    if (isId(segment)) {
      crumbs.push({ label: 'Details' });
      continue;
    }

    const label = formatSegment(segment);
    const isLast = i === segments.length - 1;

    crumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return crumbs;
}

// =====================================================
// MAIN EXPORT
// =====================================================

/**
 * Generate breadcrumbs for a given path
 *
 * @param path - The URL path
 * @returns Array of breadcrumb objects
 *
 * @example
 * generateBreadcrumbs('/employee/recruiting/jobs/123')
 * // Returns: [
 * //   { label: 'Recruiting', href: '/employee/recruiting/dashboard' },
 * //   { label: 'Jobs', href: '/employee/recruiting/jobs' },
 * //   { label: 'Details' }
 * // ]
 */
export function generateBreadcrumbs(path: string): Breadcrumb[] {
  // Check for exact match first
  if (breadcrumbMappings[path]) {
    return breadcrumbMappings[path];
  }

  // Handle dynamic routes (detail pages with IDs)
  const segments = path.split('/').filter(Boolean);

  // Check for pattern matches (pages with IDs)
  // Try removing last segment if it's an ID
  const lastSegment = segments[segments.length - 1];
  if (isId(lastSegment)) {
    const basePattern = segments.slice(0, -1).join('/');
    const basePath = '/' + basePattern;

    if (breadcrumbMappings[basePath]) {
      const base = breadcrumbMappings[basePath];
      return [
        ...base.map((b, i) =>
          i === base.length - 1 ? { ...b, href: basePath } : b
        ),
        { label: 'Details' },
      ];
    }
  }

  // Try special patterns like /jobs/[id]/edit
  if (segments.length >= 3 && isId(segments[segments.length - 2])) {
    const action = segments[segments.length - 1]; // e.g., 'edit'
    const entityPath = '/' + segments.slice(0, -2).join('/');

    if (breadcrumbMappings[entityPath]) {
      const base = breadcrumbMappings[entityPath];
      const detailPath = '/' + segments.slice(0, -1).join('/');

      return [
        ...base.map((b, i) =>
          i === base.length - 1 ? { ...b, href: entityPath } : b
        ),
        { label: 'Details', href: detailPath },
        { label: formatSegment(action) },
      ];
    }
  }

  // Fallback: generate from path segments
  return generateFromPath(segments);
}

/**
 * Get breadcrumb label for a specific path (for screen definitions)
 */
export function getBreadcrumbLabel(path: string): string {
  const crumbs = generateBreadcrumbs(path);
  return crumbs.length > 0 ? crumbs[crumbs.length - 1].label : '';
}

/**
 * Check if a path has a defined breadcrumb mapping
 */
export function hasBreadcrumbMapping(path: string): boolean {
  return path in breadcrumbMappings;
}
