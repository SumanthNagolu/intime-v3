/**
 * Role-based navigation configuration for InTime v3
 * Based on spec files for each role's navigation access
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
        href: '/employee/workspace/bench',
      },
      {
        id: 'consultants',
        label: 'Consultants',
        icon: Users,
        href: '/employee/workspace/bench/consultants',
        badge: 'onBenchCount',
      },
      {
        id: 'vendor-consultants',
        label: 'Vendor Bench',
        icon: Building2,
        href: '/employee/workspace/bench/vendor-consultants',
      },
      {
        id: 'external-jobs',
        label: 'External Jobs',
        icon: Briefcase,
        href: '/employee/workspace/bench/jobs',
      },
      {
        id: 'bench-submissions',
        label: 'Submissions',
        icon: Send,
        href: '/employee/workspace/bench/submissions',
      },
      {
        id: 'hotlists',
        label: 'Hotlists',
        icon: FileText,
        href: '/employee/workspace/bench/hotlists',
      },
      {
        id: 'immigration',
        label: 'Immigration',
        icon: Globe,
        href: '/employee/workspace/bench/immigration',
        badge: 'immigrationAlerts',
      },
      {
        id: 'vendors',
        label: 'Vendors',
        icon: Building,
        href: '/employee/workspace/bench/vendors',
      },
      {
        id: 'bench-placements',
        label: 'Placements',
        icon: Award,
        href: '/employee/workspace/bench/placements',
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
    id: 'admin',
    label: 'Admin',
    items: [
      {
        id: 'admin-users',
        label: 'Users',
        icon: Users,
        href: '/admin/users',
      },
      {
        id: 'admin-pods',
        label: 'Pods',
        icon: Users2,
        href: '/admin/pods',
      },
      {
        id: 'admin-settings',
        label: 'Settings',
        icon: Settings,
        href: '/admin/settings',
      },
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Plug,
        href: '/admin/integrations',
      },
      {
        id: 'audit',
        label: 'Audit Log',
        icon: FileText,
        href: '/admin/audit',
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
