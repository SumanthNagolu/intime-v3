/**
 * HR Screens Index
 *
 * Exports all HR-related screen definitions.
 * These screens are used by the ScreenRenderer to create metadata-driven UIs.
 *
 * @see docs/specs/20-USER-ROLES/05-hr/
 */

// Dashboard
export { hrDashboardScreen } from './hr-dashboard.screen';

// Employee Screens
export { employeeListScreen } from './employee-list.screen';
export { employeeDetailScreen } from './employee-detail.screen';
export { employeeOnboardFormScreen } from './employee-onboard-form.screen';
export { employeeBenefitsScreen } from './employee-benefits.screen';

// Onboarding Screens
export { onboardingListScreen } from './onboarding-list.screen';
export { onboardingDetailScreen } from './onboarding-detail.screen';

// Time Off & Attendance Screens
export { timeoffListScreen } from './timeoff-list.screen';
export { timeoffDetailScreen } from './timeoff-detail.screen';
export { attendanceListScreen } from './attendance-list.screen';
export { timesheetApprovalScreen } from './timesheet-approval.screen';

// Payroll Screens
export { payrollDashboardScreen } from './payroll-dashboard.screen';
export { payrollDetailScreen } from './payroll-detail.screen';

// Benefits Screens
export { benefitsListScreen } from './benefits-list.screen';
export { benefitsEnrollmentScreen } from './benefits-enrollment.screen';

// Performance Screens
export { performanceListScreen } from './performance-list.screen';
export { performanceDetailScreen } from './performance-detail.screen';
export { goalsListScreen } from './goals-list.screen';

// Compliance Screens
export { complianceDashboardScreen } from './compliance-dashboard.screen';
export { i9ListScreen } from './i9-list.screen';
export { immigrationListScreen } from './immigration-list.screen';

// Pod/Team Screens
export { podListScreen } from './pod-list.screen';
export { podDetailScreen } from './pod-detail.screen';

// Reports
export { reportsScreen } from './reports.screen';

// Organization
export { orgChartScreen } from './org-chart.screen';

// HR Activities
export { hrActivitiesScreen } from './hr-activities.screen';

// Screen Registry Entry
export const hrScreens = {
  // Dashboard
  'hr-dashboard': () => import('./hr-dashboard.screen').then(m => m.hrDashboardScreen),

  // Employee
  'employee-list': () => import('./employee-list.screen').then(m => m.employeeListScreen),
  'employee-detail': () => import('./employee-detail.screen').then(m => m.employeeDetailScreen),
  'employee-onboard-form': () => import('./employee-onboard-form.screen').then(m => m.employeeOnboardFormScreen),
  'employee-benefits': () => import('./employee-benefits.screen').then(m => m.employeeBenefitsScreen),

  // Onboarding
  'onboarding-list': () => import('./onboarding-list.screen').then(m => m.onboardingListScreen),
  'onboarding-detail': () => import('./onboarding-detail.screen').then(m => m.onboardingDetailScreen),

  // Time Off & Attendance
  'timeoff-list': () => import('./timeoff-list.screen').then(m => m.timeoffListScreen),
  'timeoff-detail': () => import('./timeoff-detail.screen').then(m => m.timeoffDetailScreen),
  'attendance-list': () => import('./attendance-list.screen').then(m => m.attendanceListScreen),
  'timesheet-approval': () => import('./timesheet-approval.screen').then(m => m.timesheetApprovalScreen),

  // Payroll
  'payroll-dashboard': () => import('./payroll-dashboard.screen').then(m => m.payrollDashboardScreen),
  'payroll-detail': () => import('./payroll-detail.screen').then(m => m.payrollDetailScreen),

  // Benefits
  'benefits-list': () => import('./benefits-list.screen').then(m => m.benefitsListScreen),
  'benefits-enrollment': () => import('./benefits-enrollment.screen').then(m => m.benefitsEnrollmentScreen),

  // Performance
  'performance-list': () => import('./performance-list.screen').then(m => m.performanceListScreen),
  'performance-detail': () => import('./performance-detail.screen').then(m => m.performanceDetailScreen),
  'goals-list': () => import('./goals-list.screen').then(m => m.goalsListScreen),

  // Compliance
  'compliance-dashboard': () => import('./compliance-dashboard.screen').then(m => m.complianceDashboardScreen),
  'i9-list': () => import('./i9-list.screen').then(m => m.i9ListScreen),
  'immigration-list': () => import('./immigration-list.screen').then(m => m.immigrationListScreen),

  // Pods
  'pod-list': () => import('./pod-list.screen').then(m => m.podListScreen),
  'pod-detail': () => import('./pod-detail.screen').then(m => m.podDetailScreen),

  // Reports
  'hr-reports': () => import('./reports.screen').then(m => m.reportsScreen),

  // Organization
  'org-chart': () => import('./org-chart.screen').then(m => m.orgChartScreen),

  // HR Activities
  'hr-activities': () => import('./hr-activities.screen').then(m => m.hrActivitiesScreen),
} as const;

export type HRScreenId = keyof typeof hrScreens;
