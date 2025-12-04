/**
 * Role-based navigation configuration for InTime v3
 * Based on spec files for each role's navigation access
 *
 * Navigation Structure:
 * - Each role has specific navigation sections
 * - Managers inherit from their base role
 * - Executives have strategic views
 * - Admin has system-wide access
 */

import {
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  Users,
  Send,
  Award,
  Building2,
  Contact,
  Target,
  DollarSign,
  Mail,
  Users2,
  BarChart3,
  FileText,
  Globe,
  Building,
  UserPlus,
  Clock,
  Heart,
  Shield,
  Network,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Settings,
  Plug,
  MessageSquare,
  Eye,
  Activity,
  Crown,
  Lightbulb,
  PieChart,
  Scale,
  Gauge,
  GraduationCap,
  Megaphone,
  ClipboardList,
  Handshake,
  UserCheck,
  CalendarCheck,
  Calendar,
  Layers,
  Workflow,
  UserCog,
  Bell,
} from 'lucide-react';
import type { NavSection, UserRole } from './types';

// Recruiter navigation - full recruiting workflow + BD
export const recruiterNavSections: NavSection[] = [
  {
    id: 'workspace',
    label: 'My Workspace',
    items: [
      {
        id: 'today',
        label: 'Today',
        icon: LayoutDashboard,
        href: '/employee/workspace',
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: CheckSquare,
        href: '/employee/workspace/tasks',
        badge: 'taskCount',
      },
    ],
  },
  {
    id: 'core',
    label: 'Core',
    items: [
      {
        id: 'jobs',
        label: 'Jobs',
        icon: Briefcase,
        href: '/employee/workspace/jobs',
        badge: 'openJobsCount',
      },
      {
        id: 'candidates',
        label: 'Candidates',
        icon: Users,
        href: '/employee/workspace/candidates',
      },
      {
        id: 'submissions',
        label: 'Submissions',
        icon: Send,
        href: '/employee/workspace/submissions',
        badge: 'pendingSubmissions',
      },
      {
        id: 'placements',
        label: 'Placements',
        icon: Award,
        href: '/employee/workspace/placements',
      },
      {
        id: 'accounts',
        label: 'Accounts',
        icon: Building2,
        href: '/employee/workspace/accounts',
      },
      {
        id: 'contacts',
        label: 'Contacts',
        icon: Contact,
        href: '/employee/workspace/contacts',
      },
      {
        id: 'leads',
        label: 'Leads',
        icon: Target,
        href: '/employee/workspace/leads',
      },
      {
        id: 'deals',
        label: 'Deals',
        icon: DollarSign,
        href: '/employee/workspace/deals',
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: Mail,
        href: '/employee/workspace/campaigns',
      },
    ],
  },
  {
    id: 'manage',
    label: 'Manage',
    permission: 'manager',
    items: [
      {
        id: 'pods',
        label: 'Pods',
        icon: Users2,
        href: '/employee/workspace/pods',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/employee/workspace/analytics',
      },
    ],
  },
];

// Bench Sales navigation - consultant marketing and placement
export const benchSalesNavSections: NavSection[] = [
  {
    id: 'workspace',
    label: 'My Workspace',
    items: [
      {
        id: 'today',
        label: 'Today',
        icon: LayoutDashboard,
        href: '/employee/workspace',
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: CheckSquare,
        href: '/employee/workspace/tasks',
        badge: 'taskCount',
      },
    ],
  },
  {
    id: 'bench',
    label: 'Bench',
    items: [
      {
        id: 'bench-dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        href: '/employee/bench',
      },
      {
        id: 'consultants',
        label: 'Consultants',
        icon: Users,
        href: '/employee/bench/consultants',
        badge: 'onBenchCount',
      },
      {
        id: 'vendor-consultants',
        label: 'Vendor Bench',
        icon: Building2,
        href: '/employee/bench/vendor-consultants',
      },
      {
        id: 'external-jobs',
        label: 'External Jobs',
        icon: Briefcase,
        href: '/employee/bench/jobs',
      },
      {
        id: 'bench-submissions',
        label: 'Submissions',
        icon: Send,
        href: '/employee/bench/submissions',
      },
      {
        id: 'hotlists',
        label: 'Hotlists',
        icon: FileText,
        href: '/employee/bench/hotlists',
      },
      {
        id: 'immigration',
        label: 'Immigration',
        icon: Globe,
        href: '/employee/bench/immigration',
        badge: 'immigrationAlerts',
      },
      {
        id: 'vendors',
        label: 'Vendors',
        icon: Building,
        href: '/employee/bench/vendors',
      },
      {
        id: 'bench-placements',
        label: 'Placements',
        icon: Award,
        href: '/employee/bench/placements',
      },
    ],
  },
];

// HR Manager navigation - internal operations
export const hrManagerNavSections: NavSection[] = [
  {
    id: 'hr',
    label: 'HR',
    items: [
      {
        id: 'hr-dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/employee/hr/dashboard',
      },
      {
        id: 'employees',
        label: 'Employees',
        icon: Users,
        href: '/employee/hr/people',
      },
      {
        id: 'onboarding',
        label: 'Onboarding',
        icon: UserPlus,
        href: '/employee/hr/onboarding',
        badge: 'pendingOnboarding',
      },
      {
        id: 'payroll',
        label: 'Payroll',
        icon: DollarSign,
        href: '/employee/hr/payroll',
      },
      {
        id: 'time',
        label: 'Time & Attendance',
        icon: Clock,
        href: '/employee/hr/time',
      },
      {
        id: 'benefits',
        label: 'Benefits',
        icon: Heart,
        href: '/employee/hr/benefits',
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: Target,
        href: '/employee/hr/performance',
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: Shield,
        href: '/employee/hr/compliance',
      },
      {
        id: 'org-chart',
        label: 'Org Chart',
        icon: Network,
        href: '/employee/hr/org-chart',
      },
      {
        id: 'hr-reports',
        label: 'Reports',
        icon: BarChart3,
        href: '/employee/hr/reports',
      },
    ],
  },
];

// TA Specialist navigation - talent acquisition workflow
export const taSpecialistNavSections: NavSection[] = [
  {
    id: 'workspace',
    label: 'My Workspace',
    items: [
      {
        id: 'ta-dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/employee/workspace/ta/dashboard',
      },
      {
        id: 'ta-activities',
        label: 'Activities',
        icon: Activity,
        href: '/employee/workspace/ta/activities',
        badge: 'taskCount',
      },
    ],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    items: [
      {
        id: 'ta-leads',
        label: 'Leads',
        icon: Target,
        href: '/employee/workspace/ta/leads',
        badge: 'openLeadsCount',
      },
      {
        id: 'ta-deals',
        label: 'Deals',
        icon: Handshake,
        href: '/employee/workspace/ta/deals',
        badge: 'openDealsCount',
      },
      {
        id: 'ta-campaigns',
        label: 'Campaigns',
        icon: Megaphone,
        href: '/employee/workspace/ta/campaigns',
        badge: 'activeCampaigns',
      },
    ],
  },
  {
    id: 'training',
    label: 'Training Program',
    items: [
      {
        id: 'training-applications',
        label: 'Applications',
        icon: ClipboardList,
        href: '/employee/workspace/ta/training/applications',
        badge: 'pendingApplications',
      },
      {
        id: 'training-enrollments',
        label: 'Enrollments',
        icon: GraduationCap,
        href: '/employee/workspace/ta/training/enrollments',
        badge: 'activeEnrollments',
      },
      {
        id: 'training-placements',
        label: 'Placement Tracker',
        icon: CalendarCheck,
        href: '/employee/workspace/ta/training/placements',
      },
    ],
  },
  {
    id: 'internal-hiring',
    label: 'Internal Hiring',
    items: [
      {
        id: 'internal-jobs',
        label: 'Internal Jobs',
        icon: Briefcase,
        href: '/employee/workspace/ta/internal-jobs',
        badge: 'openInternalJobs',
      },
      {
        id: 'internal-candidates',
        label: 'Candidates',
        icon: UserCheck,
        href: '/employee/workspace/ta/internal-candidates',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      {
        id: 'ta-analytics',
        label: 'TA Analytics',
        icon: BarChart3,
        href: '/employee/workspace/ta/analytics',
      },
    ],
  },
];

// Manager navigation - pod oversight + inherits from role
export const managerNavSections: NavSection[] = [
  {
    id: 'pod-management',
    label: 'Pod Management',
    items: [
      {
        id: 'pod-dashboard',
        label: 'Pod Dashboard',
        icon: LayoutDashboard,
        href: '/employee/manager/dashboard',
      },
      {
        id: 'team',
        label: 'Team',
        icon: Users,
        href: '/employee/manager/team',
      },
      {
        id: 'sprint',
        label: 'Sprint Board',
        icon: Zap,
        href: '/employee/manager/sprint',
      },
      {
        id: '1on1',
        label: '1:1 Meetings',
        icon: MessageSquare,
        href: '/employee/manager/1on1',
      },
      {
        id: 'activities',
        label: 'Activities',
        icon: Activity,
        href: '/employee/manager/activities',
        badge: 'overdueActivities',
      },
    ],
  },
  {
    id: 'oversight',
    label: 'Oversight',
    items: [
      {
        id: 'escalations',
        label: 'Escalations',
        icon: AlertTriangle,
        href: '/employee/manager/escalations',
        badge: 'escalationCount',
      },
      {
        id: 'approvals',
        label: 'Approvals',
        icon: CheckCircle,
        href: '/employee/manager/approvals',
        badge: 'pendingApprovals',
      },
      {
        id: 'raci',
        label: 'RACI Watchlist',
        icon: Eye,
        href: '/employee/manager/raci',
        badge: 'awaitingInput',
      },
      {
        id: 'cross-pod',
        label: 'Cross-Pod',
        icon: Network,
        href: '/employee/manager/cross-pod',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      {
        id: 'manager-metrics',
        label: 'Pod Metrics',
        icon: BarChart3,
        href: '/employee/manager/metrics',
      },
    ],
  },
];

// CFO navigation - executive financial view
export const cfoNavSections: NavSection[] = [
  {
    id: 'executive',
    label: 'Executive',
    items: [
      {
        id: 'cfo-dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/employee/cfo/dashboard',
      },
      {
        id: 'revenue',
        label: 'Revenue',
        icon: DollarSign,
        href: '/employee/cfo/revenue',
      },
      {
        id: 'cfo-placements',
        label: 'Placements',
        icon: Award,
        href: '/employee/cfo/placements',
      },
      {
        id: 'margins',
        label: 'Margins',
        icon: TrendingUp,
        href: '/employee/cfo/margins',
      },
      {
        id: 'ar',
        label: 'Accounts Receivable',
        icon: FileText,
        href: '/employee/cfo/ar',
      },
      {
        id: 'cfo-reports',
        label: 'Reports',
        icon: BarChart3,
        href: '/employee/cfo/reports',
      },
    ],
  },
];

// COO navigation - operations oversight
export const cooNavSections: NavSection[] = [
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'coo-dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/employee/coo/dashboard',
      },
      {
        id: 'all-pods',
        label: 'All Pods',
        icon: Users2,
        href: '/employee/coo/pods',
      },
      {
        id: 'coo-analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/employee/coo/analytics',
      },
      {
        id: 'coo-sla',
        label: 'SLA Dashboard',
        icon: Gauge,
        href: '/employee/coo/sla',
      },
      {
        id: 'coo-metrics',
        label: 'Process Metrics',
        icon: Activity,
        href: '/employee/coo/metrics',
      },
      {
        id: 'coo-escalations',
        label: 'Escalations',
        icon: AlertTriangle,
        href: '/employee/coo/escalations',
        badge: 'escalationCount',
      },
    ],
  },
];

// CEO navigation - strategic oversight
export const ceoNavSections: NavSection[] = [
  {
    id: 'strategic',
    label: 'Strategic',
    items: [
      {
        id: 'ceo-dashboard',
        label: 'Dashboard',
        icon: Crown,
        href: '/employee/ceo/dashboard',
      },
      {
        id: 'ceo-intelligence',
        label: 'Business Intelligence',
        icon: Lightbulb,
        href: '/employee/ceo/intelligence',
      },
      {
        id: 'ceo-initiatives',
        label: 'Strategic Initiatives',
        icon: Target,
        href: '/employee/ceo/initiatives',
      },
      {
        id: 'ceo-portfolio',
        label: 'Portfolio',
        icon: PieChart,
        href: '/employee/ceo/portfolio',
      },
      {
        id: 'ceo-reports',
        label: 'Executive Reports',
        icon: FileText,
        href: '/employee/ceo/reports',
      },
    ],
  },
  {
    id: 'executive-tools',
    label: 'Executive Tools',
    items: [
      {
        id: 'forecasting',
        label: 'Forecasting',
        icon: TrendingUp,
        href: '/employee/executive/forecasting',
      },
      {
        id: 'benchmarks',
        label: 'Benchmarking',
        icon: Scale,
        href: '/employee/executive/benchmarks',
      },
    ],
  },
];

// Admin navigation - system administration
export const adminNavSections: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'admin-dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/employee/admin/dashboard',
      },
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    items: [
      {
        id: 'admin-users',
        label: 'Users',
        icon: Users,
        href: '/employee/admin/users',
      },
      {
        id: 'admin-roles',
        label: 'Roles',
        icon: Shield,
        href: '/employee/admin/roles',
      },
      {
        id: 'admin-pods',
        label: 'Pods',
        icon: Layers,
        href: '/employee/admin/pods',
      },
      {
        id: 'admin-permissions',
        label: 'Permissions',
        icon: Shield,
        href: '/employee/admin/permissions',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'admin-settings',
        label: 'Settings',
        icon: Settings,
        href: '/employee/admin/settings',
      },
      {
        id: 'admin-integrations',
        label: 'Integrations',
        icon: Workflow,
        href: '/employee/admin/integrations',
      },
      {
        id: 'admin-workflows',
        label: 'Workflows',
        icon: Workflow,
        href: '/employee/admin/workflows',
      },
      {
        id: 'admin-activity-patterns',
        label: 'Activity Patterns',
        icon: ClipboardList,
        href: '/employee/admin/activity-patterns',
      },
      {
        id: 'admin-sla',
        label: 'SLA Config',
        icon: Workflow,
        href: '/employee/admin/sla',
      },
      {
        id: 'admin-notifications',
        label: 'Notifications',
        icon: Bell,
        href: '/employee/admin/notifications',
      },
      {
        id: 'admin-feature-flags',
        label: 'Feature Flags',
        icon: Zap,
        href: '/employee/admin/feature-flags',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      {
        id: 'admin-data',
        label: 'Data Hub',
        icon: Layers,
        href: '/employee/admin/data',
      },
      {
        id: 'admin-audit',
        label: 'Audit Logs',
        icon: FileText,
        href: '/employee/admin/audit',
      },
      {
        id: 'admin-system-logs',
        label: 'System Logs',
        icon: FileText,
        href: '/employee/admin/system-logs',
      },
    ],
  },
];

/**
 * Get navigation sections for a specific role
 * Managers inherit from their base role (recruiting or bench_sales)
 */
export function getNavSectionsForRole(
  role: UserRole,
  baseRole?: 'recruiter' | 'bench_sales'
): NavSection[] {
  switch (role) {
    case 'recruiter':
      return recruiterNavSections;
    case 'bench_sales':
      return benchSalesNavSections;
    case 'hr_manager':
      return hrManagerNavSections;
    case 'ta_specialist':
      return taSpecialistNavSections;
    case 'manager':
      // Managers inherit from their base role plus manager sections
      const baseSections = baseRole === 'bench_sales'
        ? benchSalesNavSections
        : recruiterNavSections;
      return [...baseSections, ...managerNavSections];
    case 'cfo':
      return cfoNavSections;
    case 'coo':
      return cooNavSections;
    case 'ceo':
      return ceoNavSections;
    case 'admin':
      // Admin sees everything
      return [
        ...recruiterNavSections,
        ...benchSalesNavSections.filter(s => s.id !== 'workspace'),
        ...hrManagerNavSections,
        ...taSpecialistNavSections.filter(s => s.id !== 'workspace'),
        ...managerNavSections,
        ...cfoNavSections,
        ...cooNavSections,
        ...ceoNavSections,
        ...adminNavSections,
      ];
    default:
      return recruiterNavSections;
  }
}

/**
 * Navigation configuration by role
 */
export const navConfig: Record<UserRole, NavSection[]> = {
  recruiter: recruiterNavSections,
  bench_sales: benchSalesNavSections,
  hr_manager: hrManagerNavSections,
  ta_specialist: taSpecialistNavSections,
  manager: [...recruiterNavSections, ...managerNavSections],
  cfo: cfoNavSections,
  coo: cooNavSections,
  ceo: ceoNavSections,
  admin: adminNavSections,
};

// =====================================================
// RECRUITING NAVIGATION (Updated paths for metadata-driven screens)
// =====================================================
export const recruitingNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/recruiting/dashboard' },
      { id: 'activities', label: 'Activities', icon: CheckSquare, href: '/employee/recruiting/activities' },
    ],
  },
  {
    id: 'recruiting',
    label: 'Recruiting',
    items: [
      { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/employee/recruiting/jobs' },
      { id: 'candidates', label: 'Candidates', icon: Users, href: '/employee/recruiting/candidates' },
      { id: 'submissions', label: 'Submissions', icon: FileText, href: '/employee/recruiting/submissions' },
      { id: 'interviews', label: 'Interviews', icon: Calendar, href: '/employee/recruiting/interviews' },
      { id: 'placements', label: 'Placements', icon: Target, href: '/employee/recruiting/placements' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    items: [
      { id: 'accounts', label: 'Accounts', icon: Building, href: '/employee/recruiting/accounts' },
      { id: 'contacts', label: 'Contacts', icon: UserPlus, href: '/employee/recruiting/contacts' },
      { id: 'leads', label: 'Leads', icon: TrendingUp, href: '/employee/recruiting/leads' },
      { id: 'deals', label: 'Deals', icon: DollarSign, href: '/employee/recruiting/deals' },
    ],
  },
];

// =====================================================
// BENCH SALES NAVIGATION
// =====================================================
export const benchSalesNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/bench/dashboard' },
      { id: 'activities', label: 'Activities', icon: CheckSquare, href: '/employee/bench/activities' },
    ],
  },
  {
    id: 'bench',
    label: 'Bench',
    items: [
      { id: 'consultants', label: 'Consultants', icon: Users, href: '/employee/bench/consultants' },
      { id: 'hotlists', label: 'Hotlists', icon: ClipboardList, href: '/employee/bench/hotlists' },
      { id: 'job-orders', label: 'Job Orders', icon: Briefcase, href: '/employee/bench/job-orders' },
      { id: 'marketing', label: 'Marketing', icon: FileText, href: '/employee/bench/marketing' },
    ],
  },
  {
    id: 'vendors',
    label: 'Vendors',
    items: [
      { id: 'vendors', label: 'Vendors', icon: Building, href: '/employee/bench/vendors' },
      { id: 'placements', label: 'Placements', icon: Target, href: '/employee/bench/placements' },
      { id: 'commission', label: 'Commission', icon: DollarSign, href: '/employee/bench/commission' },
    ],
  },
  {
    id: 'immigration',
    label: 'Immigration',
    items: [
      { id: 'immigration', label: 'Immigration', icon: Shield, href: '/employee/bench/immigration' },
    ],
  },
];

// =====================================================
// HR NAVIGATION
// =====================================================
export const hrNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/hr/dashboard' },
      { id: 'activities', label: 'Activities', icon: CheckSquare, href: '/employee/hr/activities' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      { id: 'employees', label: 'Employees', icon: Users, href: '/employee/hr/employees' },
      { id: 'pods', label: 'Pods', icon: Layers, href: '/employee/hr/pods' },
      { id: 'org-chart', label: 'Org Chart', icon: Workflow, href: '/employee/hr/org-chart' },
    ],
  },
  {
    id: 'hr-ops',
    label: 'HR Operations',
    items: [
      { id: 'onboarding', label: 'Onboarding', icon: UserPlus, href: '/employee/hr/onboarding' },
      { id: 'performance', label: 'Performance', icon: BarChart3, href: '/employee/hr/performance' },
      { id: 'timeoff', label: 'Time Off', icon: Calendar, href: '/employee/hr/timeoff' },
      { id: 'goals', label: 'Goals', icon: Target, href: '/employee/hr/goals' },
    ],
  },
  {
    id: 'payroll-benefits',
    label: 'Payroll & Benefits',
    items: [
      { id: 'payroll', label: 'Payroll', icon: DollarSign, href: '/employee/hr/payroll' },
      { id: 'benefits', label: 'Benefits', icon: Heart, href: '/employee/hr/benefits' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    items: [
      { id: 'compliance', label: 'Compliance', icon: Shield, href: '/employee/hr/compliance' },
      { id: 'i9', label: 'I-9 Records', icon: FileText, href: '/employee/hr/compliance/i9' },
      { id: 'immigration', label: 'Immigration', icon: Shield, href: '/employee/hr/compliance/immigration' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/employee/hr/reports' },
    ],
  },
];

// =====================================================
// MANAGER NAVIGATION
// =====================================================
export const managerNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/manager/dashboard' },
      { id: 'activities', label: 'Activities', icon: CheckSquare, href: '/employee/manager/activities' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    items: [
      { id: 'pod', label: 'Pod Overview', icon: Users, href: '/employee/manager/pod' },
      { id: 'team', label: 'Team', icon: UserCog, href: '/employee/manager/team' },
      { id: '1-on-1s', label: '1-on-1s', icon: Calendar, href: '/employee/manager/1-on-1s' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'pipeline', label: 'Pipeline', icon: TrendingUp, href: '/employee/manager/pipeline' },
      { id: 'approvals', label: 'Approvals', icon: CheckSquare, href: '/employee/manager/approvals' },
      { id: 'escalations', label: 'Escalations', icon: AlertTriangle, href: '/employee/manager/escalations' },
      { id: 'sla', label: 'SLA', icon: Workflow, href: '/employee/manager/sla' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'metrics', label: 'Metrics', icon: BarChart3, href: '/employee/manager/metrics' },
      { id: 'reports', label: 'Reports', icon: FileText, href: '/employee/manager/reports' },
    ],
  },
];

// =====================================================
// TA NAVIGATION
// =====================================================
export const taNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/ta/dashboard' },
      { id: 'activities', label: 'Activities', icon: CheckSquare, href: '/employee/ta/activities' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    items: [
      { id: 'leads', label: 'Leads', icon: TrendingUp, href: '/employee/ta/leads' },
      { id: 'deals', label: 'Deals', icon: DollarSign, href: '/employee/ta/deals' },
      { id: 'campaigns', label: 'Campaigns', icon: Target, href: '/employee/ta/campaigns' },
    ],
  },
  {
    id: 'training',
    label: 'Training',
    items: [
      { id: 'applications', label: 'Applications', icon: GraduationCap, href: '/employee/ta/training' },
      { id: 'enrollments', label: 'Enrollments', icon: ClipboardList, href: '/employee/ta/enrollments' },
      { id: 'placements', label: 'Placements', icon: Target, href: '/employee/ta/placement-tracker' },
    ],
  },
  {
    id: 'internal',
    label: 'Internal',
    items: [
      { id: 'internal-jobs', label: 'Internal Jobs', icon: Briefcase, href: '/employee/ta/internal-jobs' },
      { id: 'candidates', label: 'Candidates', icon: Users, href: '/employee/ta/internal-candidates' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/employee/ta/analytics' },
    ],
  },
];

// =====================================================
// ADMIN NAVIGATION
// =====================================================
export const adminNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/admin/dashboard' },
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    items: [
      { id: 'users', label: 'Users', icon: Users, href: '/employee/admin/users' },
      { id: 'roles', label: 'Roles', icon: Shield, href: '/employee/admin/roles' },
      { id: 'pods', label: 'Pods', icon: Layers, href: '/employee/admin/pods' },
      { id: 'permissions', label: 'Permissions', icon: Shield, href: '/employee/admin/permissions' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '/employee/admin/settings' },
      { id: 'integrations', label: 'Integrations', icon: Workflow, href: '/employee/admin/integrations' },
      { id: 'workflows', label: 'Workflows', icon: Workflow, href: '/employee/admin/workflows' },
      { id: 'activity-patterns', label: 'Activity Patterns', icon: ClipboardList, href: '/employee/admin/activity-patterns' },
      { id: 'sla', label: 'SLA Config', icon: Workflow, href: '/employee/admin/sla' },
      { id: 'notifications', label: 'Notifications', icon: Bell, href: '/employee/admin/notifications' },
      { id: 'feature-flags', label: 'Feature Flags', icon: Zap, href: '/employee/admin/feature-flags' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { id: 'data', label: 'Data Hub', icon: Layers, href: '/employee/admin/data' },
      { id: 'audit', label: 'Audit Logs', icon: FileText, href: '/employee/admin/audit' },
      { id: 'system-logs', label: 'System Logs', icon: FileText, href: '/employee/admin/system-logs' },
    ],
  },
];

// =====================================================
// EXECUTIVE NAVIGATION
// =====================================================
export const executiveNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/ceo/dashboard' },
    ],
  },
  {
    id: 'strategic',
    label: 'Strategic',
    items: [
      { id: 'initiatives', label: 'Initiatives', icon: Target, href: '/employee/ceo/strategic' },
      { id: 'portfolio', label: 'Portfolio', icon: Layers, href: '/employee/ceo/portfolio' },
      { id: 'benchmarking', label: 'Benchmarking', icon: BarChart3, href: '/employee/ceo/benchmarking' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Executive Reports', icon: FileText, href: '/employee/ceo/reports' },
    ],
  },
];

export const cfoNav2: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/cfo/dashboard' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      { id: 'revenue', label: 'Revenue', icon: TrendingUp, href: '/employee/cfo/revenue' },
      { id: 'ar', label: 'AR', icon: DollarSign, href: '/employee/cfo/ar' },
      { id: 'margin', label: 'Margin', icon: BarChart3, href: '/employee/cfo/margin' },
      { id: 'forecasting', label: 'Forecasting', icon: TrendingUp, href: '/employee/cfo/forecasting' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'placements', label: 'Placements', icon: Target, href: '/employee/cfo/placements' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Financial Reports', icon: FileText, href: '/employee/cfo/reports' },
    ],
  },
];

export const cooNav2: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/coo/dashboard' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'pods', label: 'All Pods', icon: Layers, href: '/employee/coo/pods' },
      { id: 'escalations', label: 'Escalations', icon: AlertTriangle, href: '/employee/coo/escalations' },
      { id: 'process', label: 'Process Metrics', icon: Workflow, href: '/employee/coo/process' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/employee/coo/analytics' },
      { id: 'cross-pod', label: 'Cross-Pod', icon: Layers, href: '/employee/coo/cross-pod' },
    ],
  },
];

// Aliases to match spec naming (cfoNav, cooNav)
export const cfoNav = cfoNav2;
export const cooNav = cooNav2;

// =====================================================
// CLIENT PORTAL NAVIGATION
// =====================================================
export const clientPortalNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/client/dashboard' },
    ],
  },
  {
    id: 'hiring',
    label: 'Hiring',
    items: [
      { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/client/jobs' },
      { id: 'submissions', label: 'Submissions', icon: FileText, href: '/client/submissions' },
      { id: 'interviews', label: 'Interviews', icon: Calendar, href: '/client/interviews' },
      { id: 'placements', label: 'Placements', icon: Target, href: '/client/placements' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/client/reports' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/client/settings' },
    ],
  },
];

// =====================================================
// TALENT PORTAL NAVIGATION
// =====================================================
export const talentPortalNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/talent/dashboard' },
      { id: 'profile', label: 'Profile', icon: Users, href: '/talent/profile' },
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    items: [
      { id: 'search', label: 'Search Jobs', icon: Briefcase, href: '/talent/jobs' },
      { id: 'saved', label: 'Saved Jobs', icon: Heart, href: '/talent/saved' },
      { id: 'applications', label: 'Applications', icon: FileText, href: '/talent/applications' },
    ],
  },
  {
    id: 'process',
    label: 'Process',
    items: [
      { id: 'interviews', label: 'Interviews', icon: Calendar, href: '/talent/interviews' },
      { id: 'offers', label: 'Offers', icon: FileText, href: '/talent/offers' },
    ],
  },
];

// =====================================================
// ACADEMY NAVIGATION
// =====================================================
export const academyNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/training/dashboard' },
      { id: 'my-learning', label: 'My Learning', icon: GraduationCap, href: '/training/my-learning' },
    ],
  },
  {
    id: 'courses',
    label: 'Courses',
    items: [
      { id: 'catalog', label: 'Catalog', icon: Briefcase, href: '/training/courses' },
      { id: 'certificates', label: 'Certificates', icon: FileText, href: '/training/certificates' },
      { id: 'achievements', label: 'Achievements', icon: Target, href: '/training/achievements' },
    ],
  },
];

// =====================================================
// NAVIGATION GETTERS
// =====================================================

/**
 * Get navigation for a specific role
 */
export function getNavigation(role: string, context?: string): NavSection[] {
  switch (role) {
    case 'admin':
      return adminNav;
    case 'hr_manager':
    case 'hr':
      return hrNav;
    case 'recruiter':
    case 'recruiting':
      return recruitingNav;
    case 'recruiting_manager':
      return managerNav;
    case 'bench_sales':
    case 'bench':
      return benchSalesNav;
    case 'bench_sales_manager':
    case 'bench_manager':
      return managerNav;
    case 'ta':
    case 'ta_specialist':
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

/**
 * Get portal navigation
 */
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
