/**
 * Services Index
 *
 * Central export point for all service modules.
 *
 * @module lib/services
 */

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
