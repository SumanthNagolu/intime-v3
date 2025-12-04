

Use the frontend skill and metadata skill.

Wire up all navigation, routing, and user flows to ensure a seamless experience across the application.

## Read First:
- src/lib/navigation/navConfig.ts (Navigation configuration)
- src/components/layout/ (Layout components)
- src/app/employee/workspace/page.tsx (Workspace router)
- src/screens/*/index.ts (Screen registries)

## Current State:
- Workspace routes users to role-specific dashboards
- Navigation exists but needs verification and completion
- Some flows may be broken due to page migrations
- Breadcrumbs are rendered by ScreenRenderer

---

## Task 1: Verify Workspace Router

Check and update `src/app/employee/workspace/page.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/employee');
  }

  // Get user's profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, pod_type')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/employee');
  }

  // Route based on role
  const roleRoutes: Record<string, string> = {
    admin: '/employee/admin/dashboard',
    hr_manager: '/employee/hr/dashboard',
    recruiter: '/employee/recruiting/dashboard',
    recruiting_manager: '/employee/manager/dashboard',
    bench_sales: '/employee/bench/dashboard',
    bench_sales_manager: '/employee/manager/dashboard',
    ta: '/employee/ta/dashboard',
    ta_manager: '/employee/manager/dashboard',
    ceo: '/employee/ceo/dashboard',
    cfo: '/employee/cfo/dashboard',
    coo: '/employee/coo/dashboard',
    regional_director: '/employee/manager/dashboard',
  };

  const targetRoute = roleRoutes[profile.role] ?? '/employee/recruiting/dashboard';
  redirect(targetRoute);
}
```

---

## Task 2: Update Navigation Configuration

Update `src/lib/navigation/navConfig.ts`:

```typescript
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  FileText,
  Building,
  UserPlus,
  ClipboardList,
  Target,
  TrendingUp,
  Settings,
  Shield,
  BarChart3,
  Workflow,
  GraduationCap,
  Heart,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  UserCog,
  Layers,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon?: any;
  badge?: string;
  children?: NavItem[];
  roles?: string[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
  roles?: string[];
}

// Recruiting Navigation
export const recruitingNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/recruiting/dashboard', icon: LayoutDashboard },
      { title: 'Activities', href: '/employee/recruiting/activities', icon: CheckSquare },
    ],
  },
  {
    title: 'Recruiting',
    items: [
      { title: 'Jobs', href: '/employee/recruiting/jobs', icon: Briefcase },
      { title: 'Candidates', href: '/employee/recruiting/candidates', icon: Users },
      { title: 'Submissions', href: '/employee/recruiting/submissions', icon: FileText },
      { title: 'Interviews', href: '/employee/recruiting/interviews', icon: Calendar },
      { title: 'Placements', href: '/employee/recruiting/placements', icon: Target },
    ],
  },
  {
    title: 'CRM',
    items: [
      { title: 'Accounts', href: '/employee/recruiting/accounts', icon: Building },
      { title: 'Contacts', href: '/employee/recruiting/contacts', icon: UserPlus },
      { title: 'Leads', href: '/employee/recruiting/leads', icon: TrendingUp },
      { title: 'Deals', href: '/employee/recruiting/deals', icon: DollarSign },
    ],
  },
];

// Bench Sales Navigation
export const benchSalesNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/bench/dashboard', icon: LayoutDashboard },
      { title: 'Activities', href: '/employee/bench/activities', icon: CheckSquare },
    ],
  },
  {
    title: 'Bench',
    items: [
      { title: 'Consultants', href: '/employee/bench/consultants', icon: Users },
      { title: 'Hotlists', href: '/employee/bench/hotlists', icon: ClipboardList },
      { title: 'Job Orders', href: '/employee/bench/job-orders', icon: Briefcase },
      { title: 'Marketing', href: '/employee/bench/marketing', icon: FileText },
    ],
  },
  {
    title: 'Vendors',
    items: [
      { title: 'Vendors', href: '/employee/bench/vendors', icon: Building },
      { title: 'Placements', href: '/employee/bench/placements', icon: Target },
      { title: 'Commission', href: '/employee/bench/commission', icon: DollarSign },
    ],
  },
  {
    title: 'Immigration',
    items: [
      { title: 'Immigration', href: '/employee/bench/immigration', icon: Shield },
    ],
  },
];

// HR Navigation
export const hrNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/hr/dashboard', icon: LayoutDashboard },
      { title: 'Activities', href: '/employee/hr/activities', icon: CheckSquare },
    ],
  },
  {
    title: 'People',
    items: [
      { title: 'Employees', href: '/employee/hr/employees', icon: Users },
      { title: 'Pods', href: '/employee/hr/pods', icon: Layers },
      { title: 'Org Chart', href: '/employee/hr/org-chart', icon: Workflow },
    ],
  },
  {
    title: 'HR Operations',
    items: [
      { title: 'Onboarding', href: '/employee/hr/onboarding', icon: UserPlus },
      { title: 'Performance', href: '/employee/hr/performance', icon: BarChart3 },
      { title: 'Time Off', href: '/employee/hr/timeoff', icon: Calendar },
      { title: 'Goals', href: '/employee/hr/goals', icon: Target },
    ],
  },
  {
    title: 'Payroll & Benefits',
    items: [
      { title: 'Payroll', href: '/employee/hr/payroll', icon: DollarSign },
      { title: 'Benefits', href: '/employee/hr/benefits', icon: Heart },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { title: 'Compliance', href: '/employee/hr/compliance', icon: Shield },
      { title: 'I-9 Records', href: '/employee/hr/compliance/i9', icon: FileText },
      { title: 'Immigration', href: '/employee/hr/compliance/immigration', icon: Shield },
    ],
  },
  {
    title: 'Reports',
    items: [
      { title: 'Reports', href: '/employee/hr/reports', icon: BarChart3 },
    ],
  },
];

// Manager Navigation
export const managerNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/manager/dashboard', icon: LayoutDashboard },
      { title: 'Activities', href: '/employee/manager/activities', icon: CheckSquare },
    ],
  },
  {
    title: 'Team',
    items: [
      { title: 'Pod Overview', href: '/employee/manager/pod', icon: Users },
      { title: 'Team', href: '/employee/manager/team', icon: UserCog },
      { title: '1-on-1s', href: '/employee/manager/1-on-1s', icon: Calendar },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Pipeline', href: '/employee/manager/pipeline', icon: TrendingUp },
      { title: 'Approvals', href: '/employee/manager/approvals', icon: CheckSquare },
      { title: 'Escalations', href: '/employee/manager/escalations', icon: AlertTriangle },
      { title: 'SLA', href: '/employee/manager/sla', icon: Workflow },
    ],
  },
  {
    title: 'Reports',
    items: [
      { title: 'Metrics', href: '/employee/manager/metrics', icon: BarChart3 },
      { title: 'Reports', href: '/employee/manager/reports', icon: FileText },
    ],
  },
];

// TA Navigation
export const taNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/ta/dashboard', icon: LayoutDashboard },
      { title: 'Activities', href: '/employee/ta/activities', icon: CheckSquare },
    ],
  },
  {
    title: 'Sales',
    items: [
      { title: 'Leads', href: '/employee/ta/leads', icon: TrendingUp },
      { title: 'Deals', href: '/employee/ta/deals', icon: DollarSign },
      { title: 'Campaigns', href: '/employee/ta/campaigns', icon: Target },
    ],
  },
  {
    title: 'Training',
    items: [
      { title: 'Applications', href: '/employee/ta/training', icon: GraduationCap },
      { title: 'Enrollments', href: '/employee/ta/enrollments', icon: ClipboardList },
      { title: 'Placements', href: '/employee/ta/placement-tracker', icon: Target },
    ],
  },
  {
    title: 'Internal',
    items: [
      { title: 'Internal Jobs', href: '/employee/ta/internal-jobs', icon: Briefcase },
      { title: 'Candidates', href: '/employee/ta/internal-candidates', icon: Users },
    ],
  },
  {
    title: 'Reports',
    items: [
      { title: 'Analytics', href: '/employee/ta/analytics', icon: BarChart3 },
    ],
  },
];

// Admin Navigation
export const adminNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'User Management',
    items: [
      { title: 'Users', href: '/employee/admin/users', icon: Users },
      { title: 'Roles', href: '/employee/admin/roles', icon: Shield },
      { title: 'Pods', href: '/employee/admin/pods', icon: Layers },
      { title: 'Permissions', href: '/employee/admin/permissions', icon: Shield },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/employee/admin/settings', icon: Settings },
      { title: 'Integrations', href: '/employee/admin/integrations', icon: Workflow },
      { title: 'Workflows', href: '/employee/admin/workflows', icon: Workflow },
      { title: 'Activity Patterns', href: '/employee/admin/activity-patterns', icon: ClipboardList },
      { title: 'SLA Config', href: '/employee/admin/sla', icon: Workflow },
    ],
  },
  {
    title: 'Data',
    items: [
      { title: 'Data Hub', href: '/employee/admin/data', icon: Layers },
      { title: 'Audit Logs', href: '/employee/admin/audit', icon: FileText },
      { title: 'System Logs', href: '/employee/admin/system-logs', icon: FileText },
    ],
  },
];

// Executive Navigation (CEO/CFO/COO)
export const executiveNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/ceo/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Strategic',
    items: [
      { title: 'Initiatives', href: '/employee/ceo/strategic', icon: Target },
      { title: 'Portfolio', href: '/employee/ceo/portfolio', icon: Layers },
      { title: 'Benchmarking', href: '/employee/ceo/benchmarking', icon: BarChart3 },
    ],
  },
  {
    title: 'Reports',
    items: [
      { title: 'Executive Reports', href: '/employee/ceo/reports', icon: FileText },
    ],
  },
];

export const cfoNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/cfo/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Revenue', href: '/employee/cfo/revenue', icon: TrendingUp },
      { title: 'AR', href: '/employee/cfo/ar', icon: DollarSign },
      { title: 'Margin', href: '/employee/cfo/margin', icon: BarChart3 },
      { title: 'Forecasting', href: '/employee/cfo/forecasting', icon: TrendingUp },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Placements', href: '/employee/cfo/placements', icon: Target },
    ],
  },
  {
    title: 'Reports',
    items: [
      { title: 'Financial Reports', href: '/employee/cfo/reports', icon: FileText },
    ],
  },
];

export const cooNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/employee/coo/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'All Pods', href: '/employee/coo/pods', icon: Layers },
      { title: 'Escalations', href: '/employee/coo/escalations', icon: AlertTriangle },
      { title: 'Process Metrics', href: '/employee/coo/process', icon: Workflow },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { title: 'Analytics', href: '/employee/coo/analytics', icon: BarChart3 },
      { title: 'Cross-Pod', href: '/employee/coo/cross-pod', icon: Layers },
    ],
  },
];

// Client Portal Navigation
export const clientPortalNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Hiring',
    items: [
      { title: 'Jobs', href: '/client/jobs', icon: Briefcase },
      { title: 'Submissions', href: '/client/submissions', icon: FileText },
      { title: 'Interviews', href: '/client/interviews', icon: Calendar },
      { title: 'Placements', href: '/client/placements', icon: Target },
    ],
  },
  {
    title: 'Reports',
    items: [
      { title: 'Reports', href: '/client/reports', icon: BarChart3 },
      { title: 'Settings', href: '/client/settings', icon: Settings },
    ],
  },
];

// Talent Portal Navigation
export const talentPortalNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
      { title: 'Profile', href: '/talent/profile', icon: Users },
    ],
  },
  {
    title: 'Jobs',
    items: [
      { title: 'Search Jobs', href: '/talent/jobs', icon: Briefcase },
      { title: 'Saved Jobs', href: '/talent/saved', icon: Heart },
      { title: 'Applications', href: '/talent/applications', icon: FileText },
    ],
  },
  {
    title: 'Process',
    items: [
      { title: 'Interviews', href: '/talent/interviews', icon: Calendar },
      { title: 'Offers', href: '/talent/offers', icon: FileText },
    ],
  },
];

// Academy Navigation
export const academyNav: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/training/dashboard', icon: LayoutDashboard },
      { title: 'My Learning', href: '/training/my-learning', icon: GraduationCap },
    ],
  },
  {
    title: 'Courses',
    items: [
      { title: 'Catalog', href: '/training/courses', icon: Briefcase },
      { title: 'Certificates', href: '/training/certificates', icon: FileText },
      { title: 'Achievements', href: '/training/achievements', icon: Target },
    ],
  },
];

// Get navigation by role
export function getNavigation(role: string, context?: string): NavSection[] {
  switch (role) {
    case 'admin':
      return adminNav;
    case 'hr_manager':
      return hrNav;
    case 'recruiter':
      return recruitingNav;
    case 'recruiting_manager':
      return managerNav;
    case 'bench_sales':
      return benchSalesNav;
    case 'bench_sales_manager':
      return managerNav;
    case 'ta':
      return taNav;
    case 'ta_manager':
      return managerNav;
    case 'ceo':
      return executiveNav;
    case 'cfo':
      return cfoNav;
    case 'coo':
      return cooNav;
    default:
      return recruitingNav;
  }
}

// Get portal navigation
export function getPortalNavigation(portal: 'client' | 'talent' | 'academy'): NavSection[] {
  switch (portal) {
    case 'client':
      return clientPortalNav;
    case 'talent':
      return talentPortalNav;
    case 'academy':
      return academyNav;
    default:
      return [];
  }
}
```

---

## Task 3: Create Breadcrumb Configuration

Create `src/lib/navigation/breadcrumbs.ts`:

```typescript
import { NavItem } from './navConfig';

export interface Breadcrumb {
  label: string;
  href?: string;
}

// Static breadcrumb mappings
const breadcrumbMappings: Record<string, Breadcrumb[]> = {
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
  // Add more as needed...
};

/**
 * Generate breadcrumbs for a given path
 */
export function generateBreadcrumbs(path: string): Breadcrumb[] {
  // Check for exact match first
  if (breadcrumbMappings[path]) {
    return breadcrumbMappings[path];
  }

  // Handle dynamic routes
  const segments = path.split('/').filter(Boolean);

  // Check for pattern matches (detail pages)
  const basePattern = segments.slice(0, -1).join('/');
  const basePath = '/' + basePattern;

  if (breadcrumbMappings[basePath]) {
    const base = breadcrumbMappings[basePath];
    const lastSegment = segments[segments.length - 1];

    // If it's a UUID or ID, it's a detail page
    if (isId(lastSegment)) {
      return [
        ...base.map((b, i) =>
          i === base.length - 1 ? { ...b, href: basePath } : b
        ),
        { label: 'Details' },
      ];
    }
  }

  // Fallback: generate from path segments
  return generateFromPath(segments);
}

/**
 * Check if string is an ID
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
 * Generate breadcrumbs from path segments
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

/**
 * Format path segment as label
 */
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

---

## Task 4: Update Layout Components

Update `src/components/layout/AppLayout.tsx` to include navigation:

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUser } from '@/hooks/useUser';
import { getNavigation, getPortalNavigation } from '@/lib/navigation/navConfig';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, profile } = useUser();

  // Determine which navigation to use
  const navigation = React.useMemo(() => {
    if (pathname.startsWith('/client')) {
      return getPortalNavigation('client');
    }
    if (pathname.startsWith('/talent')) {
      return getPortalNavigation('talent');
    }
    if (pathname.startsWith('/training') || pathname.startsWith('/academy')) {
      return getPortalNavigation('academy');
    }
    if (profile?.role) {
      return getNavigation(profile.role);
    }
    return [];
  }, [pathname, profile?.role]);

  return (
    <div className="flex h-screen">
      <Sidebar navigation={navigation} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Task 5: Update Sidebar Component

Update `src/components/layout/Sidebar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavSection, NavItem } from '@/lib/navigation/navConfig';

interface SidebarProps {
  navigation: NavSection[];
}

export function Sidebar({ navigation }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">InTime</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <UserMenu />
      </div>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <span>{item.title}</span>
        {item.badge && (
          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-white">
            {item.badge}
          </span>
        )}
      </Link>
      {item.children && isActive && (
        <ul className="ml-6 mt-1 space-y-1">
          {item.children.map((child) => (
            <NavLink key={child.href} item={child} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}

function UserMenu() {
  // Implement user menu with profile, settings, logout
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-gray-200" />
      <div className="flex-1 truncate">
        <div className="text-sm font-medium">User Name</div>
        <div className="text-xs text-gray-500">Role</div>
      </div>
    </div>
  );
}
```

---

## Task 6: Verify All Routes Work

Create a script to test all routes:

```bash
# Check all pages exist and compile
find src/app -name "page.tsx" | while read page; do
  echo "Checking: $page"
done

# Run type check
pnpm tsc --noEmit

# Run build to verify all routes
pnpm build
```

---

## Task 7: Add Quick Actions

Create `src/components/QuickActions.tsx` for common actions:

```typescript
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown } from 'lucide-react';

const quickActions: Record<string, { label: string; href: string }[]> = {
  '/employee/recruiting': [
    { label: 'New Job', href: '/employee/recruiting/jobs/new' },
    { label: 'Add Candidate', href: '/employee/recruiting/candidates/new' },
    { label: 'Create Submission', href: '/employee/recruiting/submissions/new' },
  ],
  '/employee/bench': [
    { label: 'Onboard Consultant', href: '/employee/bench/consultants/onboard' },
    { label: 'Create Hotlist', href: '/employee/bench/hotlists/new' },
    { label: 'New Job Order', href: '/employee/bench/job-orders/new' },
  ],
  '/employee/hr': [
    { label: 'Add Employee', href: '/employee/hr/employees/new' },
    { label: 'Start Onboarding', href: '/employee/hr/onboarding/new' },
    { label: 'Create Review', href: '/employee/hr/performance/new' },
  ],
  '/employee/ta': [
    { label: 'New Lead', href: '/employee/ta/leads/new' },
    { label: 'Create Campaign', href: '/employee/ta/campaigns/new' },
    { label: 'Internal Job', href: '/employee/ta/internal-jobs/new' },
  ],
};

export function QuickActions() {
  const pathname = usePathname();
  const router = useRouter();

  // Find matching quick actions
  const matchingPath = Object.keys(quickActions).find((path) =>
    pathname.startsWith(path)
  );

  const actions = matchingPath ? quickActions[matchingPath] : [];

  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.href}
            onClick={() => router.push(action.href)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Validation Checklist

After completion:

```bash
# 1. Verify all routes compile
pnpm tsc --noEmit

# 2. Build application
pnpm build

# 3. Start and manually test navigation
pnpm dev

# Test each role:
# - Login as recruiter → verify routing to /employee/recruiting/dashboard
# - Login as bench sales → verify routing to /employee/bench/dashboard
# - Login as HR → verify routing to /employee/hr/dashboard
# - Login as manager → verify routing to /employee/manager/dashboard
# - Login as admin → verify routing to /employee/admin/dashboard
# - Test client portal
# - Test talent portal
# - Test academy
```

## Requirements:
- All navigation items must link to existing pages
- Breadcrumbs must render correctly on all pages
- Role-based routing must work correctly
- Quick actions must navigate to correct pages
- Mobile navigation must be responsive
- Active states must highlight correctly
