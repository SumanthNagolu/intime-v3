/**
 * Domain Tables - Main Export
 *
 * All domain-specific table components.
 */

// Recruiting
export { JobsTable, createJobColumns, jobFilterDefs, jobQuickFilters } from './JobsTable';
export type { JobRow } from './JobsTable';

export {
  CandidatesTable,
  createCandidateColumns,
  candidateFilterDefs,
} from './CandidatesTable';
export type { CandidateRow } from './CandidatesTable';

export {
  SubmissionsTable,
  createSubmissionColumns,
  submissionFilterDefs,
} from './SubmissionsTable';
export type { SubmissionRow } from './SubmissionsTable';

// CRM
export { AccountsTable, createAccountColumns, accountFilterDefs } from './AccountsTable';
export type { AccountRow } from './AccountsTable';

// Bench Sales
export {
  BenchConsultantsTable,
  createBenchConsultantColumns,
  benchConsultantFilterDefs,
  benchConsultantQuickFilters,
} from './BenchConsultantsTable';
export type { BenchConsultantRow } from './BenchConsultantsTable';

// HR
export { EmployeesTable, createEmployeeColumns, employeeFilterDefs } from './EmployeesTable';
export type { EmployeeRow } from './EmployeesTable';

// Activities
export {
  ActivitiesTable,
  createActivityColumns,
  activityFilterDefs,
} from './ActivitiesTable';
export type { ActivityRow } from './ActivitiesTable';
