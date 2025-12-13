/**
 * Campaign Module Exports
 *
 * This module provides campaign automation capabilities:
 * - CampaignAutomationEngine: Core engine for processing sequence steps
 * - Activity templates for campaign-related activities
 *
 * Issue: CAMPAIGNS-01 Phase 4
 */

// Campaign Automation Engine
export {
  CampaignAutomationEngine,
  campaignAutomation,
  processScheduledCampaignSteps,
  processEnrollment,
} from './campaign-automation-engine'

// Activity Templates
export { campaignActivityTemplates } from './activity-templates'
