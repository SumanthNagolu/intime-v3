import {
  LayoutDashboard,
  Users,
  Network,
  Shield,
  Settings,
  Workflow,
  FileText,
  Bell,
  Building2,
  Globe,
  Zap,
  Mail,
  Key,
  HardDrive,
  Server,
  Flag,
  Lock,
  UserPlus,
  UserMinus,
  ClipboardList,
  Receipt,
  Wallet,
  DollarSign,
  Plus,
  Sparkles,
  Activity,
  Briefcase,
  Calendar,
  Target,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { ModuleSidebarConfig } from './list-view-sidebar.types'

/**
 * Module Navigation Configurations
 *
 * Used by:
 * 1. ModuleSidebar.tsx - Left sidebar on module pages (Admin, HR, Finance)
 * 2. top-navigation.ts - Dropdown menus in top nav
 *
 * Structure:
 * - quickLinks: Top 3 items shown prominently in dropdown
 * - sections: Collapsible groups in sidebar
 * - actions: Create/Add actions at bottom of dropdown
 */

// =============================================================================
// ADMIN MODULE
// =============================================================================
export const adminModuleConfig: ModuleSidebarConfig = {
  id: 'admin',
  title: 'Admin',
  icon: Settings,
  basePath: '/employee/admin',
  quickLinks: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/admin/dashboard' },
    { id: 'users', label: 'Users', icon: Users, href: '/employee/admin/users' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/employee/admin/settings' },
  ],
  sections: [
    {
      id: 'organization',
      label: 'Organization',
      defaultOpen: true,
      items: [
        { id: 'company-settings', label: 'Company Settings', icon: Building2, href: '/employee/admin/settings/organization' },
        { id: 'groups', label: 'Groups', icon: Network, href: '/employee/admin/groups' },
        { id: 'regions', label: 'Regions', icon: Globe, href: '/employee/admin/regions' },
      ],
    },
    {
      id: 'people-access',
      label: 'People & Access',
      defaultOpen: true,
      items: [
        { id: 'users', label: 'Users', icon: Users, href: '/employee/admin/users' },
        { id: 'pods', label: 'Pods', icon: Network, href: '/employee/admin/pods' },
        { id: 'roles', label: 'Roles', icon: Shield, href: '/employee/admin/roles' },
        { id: 'permissions', label: 'Permissions', icon: Lock, href: '/employee/admin/permissions' },
      ],
    },
    {
      id: 'automation',
      label: 'Automation',
      defaultOpen: true,
      items: [
        { id: 'workflows', label: 'Workflows', icon: Workflow, href: '/employee/admin/workflows' },
        { id: 'activity-patterns', label: 'Activity Patterns', icon: Sparkles, href: '/employee/admin/activity-patterns' },
        { id: 'email-templates', label: 'Email Templates', icon: Mail, href: '/employee/admin/email-templates' },
      ],
    },
    {
      id: 'platform',
      label: 'Platform',
      defaultOpen: false,
      items: [
        { id: 'integrations', label: 'Integrations', icon: Zap, href: '/employee/admin/integrations' },
        { id: 'email-config', label: 'Email Config', icon: Mail, href: '/employee/admin/email-config' },
        { id: 'api-settings', label: 'API Settings', icon: Settings, href: '/employee/admin/api-settings' },
        { id: 'api-tokens', label: 'API Tokens', icon: Key, href: '/employee/admin/api-tokens' },
        { id: 'file-storage', label: 'File Storage', icon: HardDrive, href: '/employee/admin/file-storage' },
        { id: 'system', label: 'System', icon: Server, href: '/employee/admin/system' },
        { id: 'feature-flags', label: 'Feature Flags', icon: Flag, href: '/employee/admin/feature-flags' },
      ],
    },
    {
      id: 'security',
      label: 'Security & Compliance',
      defaultOpen: false,
      items: [
        { id: 'audit-logs', label: 'Audit Logs', icon: FileText, href: '/employee/admin/audit' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/employee/admin/notifications' },
        { id: 'security-settings', label: 'Security Settings', icon: Shield, href: '/employee/admin/security' },
      ],
    },
  ],
  actions: [
    { id: 'add-user', label: 'Add User', icon: UserPlus, href: '/employee/admin/users/new' },
  ],
}

// =============================================================================
// OPERATIONS MODULE (Merged HR + Finance)
// =============================================================================
export const operationsModuleConfig: ModuleSidebarConfig = {
  id: 'operations',
  title: 'Operations',
  icon: Settings,
  basePath: '/employee/operations',
  quickLinks: [
    { id: 'employees', label: 'Employees', icon: Users, href: '/employee/operations/employees' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, href: '/employee/operations/invoices' },
    { id: 'payroll', label: 'Payroll', icon: Wallet, href: '/employee/operations/payroll' },
  ],
  sections: [
    {
      id: 'people',
      label: 'People',
      defaultOpen: true,
      items: [
        { id: 'employees', label: 'Employees', icon: Users, href: '/employee/operations/employees' },
        { id: 'departments', label: 'Departments', icon: Building2, href: '/employee/operations/departments' },
        { id: 'positions', label: 'Positions', icon: Briefcase, href: '/employee/operations/positions' },
        { id: 'pods', label: 'Pods', icon: Network, href: '/employee/operations/pods' },
        { id: 'org-chart', label: 'Org Chart', icon: Network, href: '/employee/operations/org-chart' },
      ],
    },
    {
      id: 'lifecycle',
      label: 'Employee Lifecycle',
      defaultOpen: true,
      items: [
        { id: 'onboarding', label: 'Onboarding', icon: UserPlus, href: '/employee/operations/onboarding' },
        { id: 'offboarding', label: 'Offboarding', icon: UserMinus, href: '/employee/operations/offboarding' },
        { id: 'leave', label: 'Leave', icon: Calendar, href: '/employee/operations/leave' },
        { id: 'leave-calendar', label: 'Team Calendar', icon: Calendar, href: '/employee/operations/leave/calendar' },
        { id: 'compensation', label: 'Compensation', icon: TrendingUp, href: '/employee/operations/compensation' },
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      defaultOpen: true,
      items: [
        { id: 'review-cycles', label: 'Review Cycles', icon: Clock, href: '/employee/operations/performance' },
        { id: 'reviews', label: 'Reviews', icon: FileText, href: '/employee/operations/performance/reviews' },
        { id: 'calibration', label: 'Calibration', icon: Activity, href: '/employee/operations/performance/calibration' },
        { id: 'goals', label: 'Goals & OKRs', icon: Target, href: '/employee/operations/goals' },
        { id: '1-on-1s', label: '1:1 Meetings', icon: MessageSquare, href: '/employee/operations/performance/1-on-1s' },
      ],
    },
    {
      id: 'finance',
      label: 'Finance',
      defaultOpen: true,
      items: [
        { id: 'invoices', label: 'Invoices', icon: Receipt, href: '/employee/operations/invoices' },
        { id: 'payments', label: 'Payments', icon: DollarSign, href: '/employee/operations/payments' },
        { id: 'credits', label: 'Credits', icon: DollarSign, href: '/employee/operations/credits' },
      ],
    },
    {
      id: 'payroll',
      label: 'Payroll & Time',
      defaultOpen: true,
      items: [
        { id: 'payroll', label: 'Payroll', icon: Wallet, href: '/employee/operations/payroll' },
        { id: 'timesheets', label: 'Timesheets', icon: FileText, href: '/employee/operations/timesheets' },
        { id: 'expenses', label: 'Expenses', icon: Receipt, href: '/employee/operations/expenses' },
      ],
    },
    {
      id: 'reporting',
      label: 'Reporting',
      defaultOpen: true,
      items: [
        { id: 'hr-analytics', label: 'HR Analytics', icon: BarChart3, href: '/employee/operations/analytics' },
        { id: 'reports', label: 'Reports', icon: FileText, href: '/employee/operations/reports' },
      ],
    },
  ],
  actions: [
    { id: 'add-employee', label: 'Add Employee', icon: UserPlus, href: '/employee/operations/employees/new' },
    { id: 'create-invoice', label: 'Create Invoice', icon: Plus, href: '/employee/operations/invoices/new' },
  ],
}

// Legacy aliases for backwards compatibility
export const hrModuleConfig = operationsModuleConfig
export const financeModuleConfig = operationsModuleConfig

// Export all module configs
export const moduleConfigs: Record<string, ModuleSidebarConfig> = {
  admin: adminModuleConfig,
  operations: operationsModuleConfig,
  // Legacy aliases - redirect to operations
  hr: operationsModuleConfig,
  finance: operationsModuleConfig,
}
