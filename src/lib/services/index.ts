/**
 * Services Index
 *
 * Central export point for all service modules.
 *
 * @module lib/services
 */

// History Service (Entity Biography)
export { HistoryService, historyService } from './history-service'
export type {
  ChangeType,
  HistoryContext,
  RelatedEntity,
  RecordChangeOptions,
} from './history-service'
export { ENTITY_FIELD_CONFIGS, getEntityTypeLabel } from './history-configs'
export type { EntityFieldConfig } from './history-configs'

// Rate Resolution Service
export { RateResolver, rateResolver } from './rate-resolver'
export type {
  RateSnapshot,
  OvertimeRules,
  CalculatedAmounts,
} from './rate-resolver'

// Pay Period Service
export { PayPeriodService, payPeriodService, DEFAULT_CONFIGS } from './pay-period-service'
export type {
  PeriodType,
  PeriodStatus,
  PayPeriodConfig,
  PayPeriod,
} from './pay-period-service'

// Timesheet → Invoice Automation Service
export { TimesheetInvoicer, timesheetInvoicer } from './timesheet-invoicer'
export type {
  TimesheetForInvoice,
  InvoiceGenerationOptions,
  GeneratedInvoice,
  InvoiceLineItemData,
  EligibleTimesheetsResult,
} from './timesheet-invoicer'

// Timesheet → Payroll Automation Service
export { TimesheetPayroll, timesheetPayroll } from './timesheet-payroll'
export type {
  TimesheetForPayroll,
  PayItemData,
  PayrollCalculationOptions,
  CalculatedPayRun,
  EligibleTimesheetsResult as PayrollEligibleTimesheetsResult,
} from './timesheet-payroll'
