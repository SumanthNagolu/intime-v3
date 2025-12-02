/**
 * CRM Options Registry
 *
 * Centralized enum options for all CRM entities.
 * Used by screen factories, InputSets, and widgets.
 */

import type { OptionDefinition } from '../types/widget.types';

// ==========================================
// ACCOUNT OPTIONS
// ==========================================

export const ACCOUNT_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'prospect', label: 'Prospect', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'active', label: 'Active', color: 'green', bgColor: 'bg-green-100' },
  { value: 'inactive', label: 'Inactive', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'churned', label: 'Churned', color: 'red', bgColor: 'bg-red-100' },
];

export const ACCOUNT_TIER_OPTIONS: OptionDefinition[] = [
  { value: 'strategic', label: 'Strategic', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'enterprise', label: 'Enterprise', color: 'purple', bgColor: 'bg-purple-100' },
  { value: 'mid_market', label: 'Mid-Market', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'smb', label: 'SMB', color: 'gray', bgColor: 'bg-gray-100' },
];

export const COMPANY_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
  { value: 'msp_vms', label: 'MSP/VMS' },
  { value: 'system_integrator', label: 'System Integrator' },
  { value: 'staffing_agency', label: 'Staffing Agency' },
  { value: 'vendor', label: 'Vendor' },
];

export const INDUSTRY_OPTIONS: OptionDefinition[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'banking', label: 'Banking' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'government', label: 'Government' },
  { value: 'education', label: 'Education' },
  { value: 'energy', label: 'Energy' },
  { value: 'telecommunications', label: 'Telecom' },
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'other', label: 'Other' },
];

export const ADDRESS_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'hq', label: 'Headquarters' },
  { value: 'billing', label: 'Billing' },
  { value: 'office', label: 'Office' },
  { value: 'shipping', label: 'Shipping' },
];

// ==========================================
// CONTACT OPTIONS
// ==========================================

export const CONTACT_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'client_poc', label: 'Client POC', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'candidate', label: 'Candidate', color: 'green', bgColor: 'bg-green-100' },
  { value: 'vendor', label: 'Vendor', color: 'purple', bgColor: 'bg-purple-100' },
  { value: 'partner', label: 'Partner', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'internal', label: 'Internal', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'general', label: 'General', color: 'slate', bgColor: 'bg-slate-100' },
];

export const CONTACT_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'active', label: 'Active', color: 'green', bgColor: 'bg-green-100' },
  { value: 'inactive', label: 'Inactive', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'do_not_contact', label: 'Do Not Contact', color: 'red', bgColor: 'bg-red-100' },
  { value: 'bounced', label: 'Bounced', color: 'orange', bgColor: 'bg-orange-100' },
  { value: 'unsubscribed', label: 'Unsubscribed', color: 'yellow', bgColor: 'bg-yellow-100' },
];

export const DECISION_AUTHORITY_OPTIONS: OptionDefinition[] = [
  { value: 'final_decision_maker', label: 'Final Decision Maker', color: 'purple' },
  { value: 'key_influencer', label: 'Key Influencer', color: 'blue' },
  { value: 'gatekeeper', label: 'Gatekeeper', color: 'amber' },
  { value: 'recommender', label: 'Recommender', color: 'green' },
  { value: 'end_user', label: 'End User', color: 'gray' },
];

export const BUYING_ROLE_OPTIONS: OptionDefinition[] = [
  { value: 'champion', label: 'Champion', color: 'green' },
  { value: 'economic_buyer', label: 'Economic Buyer', color: 'purple' },
  { value: 'technical_buyer', label: 'Technical Buyer', color: 'blue' },
  { value: 'coach', label: 'Coach', color: 'amber' },
  { value: 'blocker', label: 'Blocker', color: 'red' },
];

export const INFLUENCE_LEVEL_OPTIONS: OptionDefinition[] = [
  { value: 'high', label: 'High', color: 'red' },
  { value: 'medium', label: 'Medium', color: 'amber' },
  { value: 'low', label: 'Low', color: 'gray' },
];

export const PREFERRED_CONTACT_METHOD_OPTIONS: OptionDefinition[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'text', label: 'Text/SMS' },
];

// ==========================================
// LEAD OPTIONS
// ==========================================

export const LEAD_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'company', label: 'Company' },
  { value: 'person', label: 'Person' },
];

export const LEAD_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'new', label: 'New', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'warm', label: 'Warm', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'hot', label: 'Hot', color: 'red', bgColor: 'bg-red-100' },
  { value: 'cold', label: 'Cold', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'converted', label: 'Converted', color: 'green', bgColor: 'bg-green-100' },
  { value: 'lost', label: 'Lost', color: 'slate', bgColor: 'bg-slate-100' },
];

export const LEAD_SOURCE_OPTIONS: OptionDefinition[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
  { value: 'ad_campaign', label: 'Ad Campaign' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
];

export const COMPANY_SIZE_OPTIONS: OptionDefinition[] = [
  { value: 'small', label: 'Small (1-50)' },
  { value: 'medium', label: 'Medium (51-200)' },
  { value: 'large', label: 'Large (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' },
];

// ==========================================
// DEAL OPTIONS
// ==========================================

export const DEAL_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'new_business', label: 'New Business', color: 'green' },
  { value: 'expansion', label: 'Expansion', color: 'blue' },
  { value: 'renewal', label: 'Renewal', color: 'purple' },
  { value: 'upsell', label: 'Upsell', color: 'amber' },
];

export const DEAL_STAGE_OPTIONS: OptionDefinition[] = [
  { value: 'discovery', label: 'Discovery', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'qualification', label: 'Qualification', color: 'cyan', bgColor: 'bg-cyan-100' },
  { value: 'proposal', label: 'Proposal', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'negotiation', label: 'Negotiation', color: 'orange', bgColor: 'bg-orange-100' },
  { value: 'closed_won', label: 'Closed Won', color: 'green', bgColor: 'bg-green-100' },
  { value: 'closed_lost', label: 'Closed Lost', color: 'red', bgColor: 'bg-red-100' },
];

export const DEAL_PROBABILITY_BY_STAGE: Record<string, number> = {
  discovery: 10,
  qualification: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0,
};

export const STAKEHOLDER_ROLE_OPTIONS: OptionDefinition[] = [
  { value: 'decision_maker', label: 'Decision Maker', color: 'purple' },
  { value: 'influencer', label: 'Influencer', color: 'blue' },
  { value: 'champion', label: 'Champion', color: 'green' },
  { value: 'blocker', label: 'Blocker', color: 'red' },
  { value: 'gatekeeper', label: 'Gatekeeper', color: 'amber' },
  { value: 'end_user', label: 'End User', color: 'gray' },
];

export const SENTIMENT_OPTIONS: OptionDefinition[] = [
  { value: 'positive', label: 'Positive', color: 'green' },
  { value: 'neutral', label: 'Neutral', color: 'gray' },
  { value: 'negative', label: 'Negative', color: 'red' },
  { value: 'unknown', label: 'Unknown', color: 'slate' },
];

export const THREAT_LEVEL_OPTIONS: OptionDefinition[] = [
  { value: 'high', label: 'High', color: 'red' },
  { value: 'medium', label: 'Medium', color: 'amber' },
  { value: 'low', label: 'Low', color: 'green' },
];

export const DEAL_PRODUCT_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'staffing', label: 'Staffing' },
  { value: 'training', label: 'Training' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'subscription', label: 'Subscription' },
];

// ==========================================
// CAMPAIGN OPTIONS
// ==========================================

export const CAMPAIGN_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'email', label: 'Email', color: 'blue' },
  { value: 'linkedin', label: 'LinkedIn', color: 'cyan' },
  { value: 'event', label: 'Event', color: 'purple' },
  { value: 'webinar', label: 'Webinar', color: 'green' },
  { value: 'content', label: 'Content', color: 'amber' },
  { value: 'outbound_call', label: 'Outbound Call', color: 'red' },
];

export const CAMPAIGN_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'draft', label: 'Draft', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'active', label: 'Active', color: 'green', bgColor: 'bg-green-100' },
  { value: 'paused', label: 'Paused', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'completed', label: 'Completed', color: 'purple', bgColor: 'bg-purple-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'red', bgColor: 'bg-red-100' },
];

export const CAMPAIGN_TARGET_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'opened', label: 'Opened', color: 'cyan' },
  { value: 'clicked', label: 'Clicked', color: 'amber' },
  { value: 'responded', label: 'Responded', color: 'green' },
  { value: 'converted', label: 'Converted', color: 'purple' },
  { value: 'bounced', label: 'Bounced', color: 'red' },
  { value: 'unsubscribed', label: 'Unsubscribed', color: 'orange' },
];

export const CAMPAIGN_CONTENT_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'email', label: 'Email Template' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'linkedin_message', label: 'LinkedIn Message' },
  { value: 'call_script', label: 'Call Script' },
  { value: 'asset', label: 'Asset/Attachment' },
];

// ==========================================
// CONTRACT OPTIONS
// ==========================================

export const CONTRACT_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'msa', label: 'MSA' },
  { value: 'sow', label: 'SOW' },
  { value: 'nda', label: 'NDA' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'addendum', label: 'Addendum' },
];

export const CONTRACT_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'draft', label: 'Draft', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'pending_review', label: 'Pending Review', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'active', label: 'Active', color: 'green', bgColor: 'bg-green-100' },
  { value: 'expired', label: 'Expired', color: 'red', bgColor: 'bg-red-100' },
  { value: 'terminated', label: 'Terminated', color: 'slate', bgColor: 'bg-slate-100' },
];

// ==========================================
// ACTIVITY OPTIONS
// ==========================================

export const ACTIVITY_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'call', label: 'Call', color: 'blue' },
  { value: 'email', label: 'Email', color: 'green' },
  { value: 'meeting', label: 'Meeting', color: 'purple' },
  { value: 'note', label: 'Note', color: 'gray' },
  { value: 'task', label: 'Task', color: 'amber' },
  { value: 'linkedin', label: 'LinkedIn', color: 'cyan' },
  { value: 'event', label: 'Event', color: 'red' },
];

export const ACTIVITY_DIRECTION_OPTIONS: OptionDefinition[] = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
];

export const ACTIVITY_PRIORITY_OPTIONS: OptionDefinition[] = [
  { value: 'urgent', label: 'Urgent', color: 'red' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'low', label: 'Low', color: 'gray' },
];

export const ACTIVITY_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

export const ACTIVITY_OUTCOME_OPTIONS: OptionDefinition[] = [
  { value: 'positive', label: 'Positive', color: 'green' },
  { value: 'neutral', label: 'Neutral', color: 'gray' },
  { value: 'negative', label: 'Negative', color: 'red' },
  { value: 'no_response', label: 'No Response', color: 'amber' },
];

// ==========================================
// TEAM ROLE OPTIONS
// ==========================================

export const ACCOUNT_TEAM_ROLE_OPTIONS: OptionDefinition[] = [
  { value: 'owner', label: 'Owner', color: 'purple' },
  { value: 'secondary', label: 'Secondary', color: 'blue' },
  { value: 'support', label: 'Support', color: 'green' },
  { value: 'recruiter', label: 'Recruiter', color: 'amber' },
  { value: 'account_manager', label: 'Account Manager', color: 'cyan' },
];

// ==========================================
// WORK PREFERENCES OPTIONS
// ==========================================

export const WORK_MODE_OPTIONS: OptionDefinition[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const RATE_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

export const VISA_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'USC', label: 'US Citizen' },
  { value: 'GC', label: 'Green Card' },
  { value: 'H1B', label: 'H1-B' },
  { value: 'H4_EAD', label: 'H4 EAD' },
  { value: 'L1', label: 'L1' },
  { value: 'L2_EAD', label: 'L2 EAD' },
  { value: 'OPT', label: 'OPT' },
  { value: 'OPT_STEM', label: 'OPT STEM' },
  { value: 'CPT', label: 'CPT' },
  { value: 'TN', label: 'TN Visa' },
  { value: 'OTHER', label: 'Other' },
];

// ==========================================
// TIMEZONE OPTIONS
// ==========================================

export const TIMEZONE_OPTIONS: OptionDefinition[] = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (AZ)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'UTC', label: 'UTC' },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get option by value from options array
 */
export function getOption(options: OptionDefinition[], value: string): OptionDefinition | undefined {
  return options.find(o => o.value === value);
}

/**
 * Get option label by value
 */
export function getOptionLabel(options: OptionDefinition[], value: string): string {
  return getOption(options, value)?.label ?? value;
}

/**
 * Get option color by value
 */
export function getOptionColor(options: OptionDefinition[], value: string): string | undefined {
  return getOption(options, value)?.color;
}

/**
 * Convert options to badge colors map
 */
export function toBadgeColorsMap(options: OptionDefinition[]): Record<string, string> {
  return options.reduce((acc, opt) => {
    if (opt.color) {
      acc[opt.value] = opt.color;
    }
    return acc;
  }, {} as Record<string, string>);
}

// ==========================================
// CENTRALIZED OPTIONS REGISTRY
// ==========================================

export const CRM_OPTIONS = {
  // Account
  accountStatus: ACCOUNT_STATUS_OPTIONS,
  accountTier: ACCOUNT_TIER_OPTIONS,
  companyType: COMPANY_TYPE_OPTIONS,
  industry: INDUSTRY_OPTIONS,
  addressType: ADDRESS_TYPE_OPTIONS,

  // Contact
  contactType: CONTACT_TYPE_OPTIONS,
  contactStatus: CONTACT_STATUS_OPTIONS,
  decisionAuthority: DECISION_AUTHORITY_OPTIONS,
  buyingRole: BUYING_ROLE_OPTIONS,
  influenceLevel: INFLUENCE_LEVEL_OPTIONS,
  preferredContactMethod: PREFERRED_CONTACT_METHOD_OPTIONS,

  // Lead
  leadType: LEAD_TYPE_OPTIONS,
  leadStatus: LEAD_STATUS_OPTIONS,
  leadSource: LEAD_SOURCE_OPTIONS,
  companySize: COMPANY_SIZE_OPTIONS,

  // Deal
  dealType: DEAL_TYPE_OPTIONS,
  dealStage: DEAL_STAGE_OPTIONS,
  stakeholderRole: STAKEHOLDER_ROLE_OPTIONS,
  sentiment: SENTIMENT_OPTIONS,
  threatLevel: THREAT_LEVEL_OPTIONS,
  dealProductType: DEAL_PRODUCT_TYPE_OPTIONS,

  // Campaign
  campaignType: CAMPAIGN_TYPE_OPTIONS,
  campaignStatus: CAMPAIGN_STATUS_OPTIONS,
  campaignTargetStatus: CAMPAIGN_TARGET_STATUS_OPTIONS,
  campaignContentType: CAMPAIGN_CONTENT_TYPE_OPTIONS,

  // Contract
  contractType: CONTRACT_TYPE_OPTIONS,
  contractStatus: CONTRACT_STATUS_OPTIONS,

  // Activity
  activityType: ACTIVITY_TYPE_OPTIONS,
  activityDirection: ACTIVITY_DIRECTION_OPTIONS,
  activityPriority: ACTIVITY_PRIORITY_OPTIONS,
  activityStatus: ACTIVITY_STATUS_OPTIONS,
  activityOutcome: ACTIVITY_OUTCOME_OPTIONS,

  // Team
  accountTeamRole: ACCOUNT_TEAM_ROLE_OPTIONS,

  // Work Preferences
  workMode: WORK_MODE_OPTIONS,
  rateType: RATE_TYPE_OPTIONS,
  visaType: VISA_TYPE_OPTIONS,
  timezone: TIMEZONE_OPTIONS,
} as const;

export type CrmOptionsKey = keyof typeof CRM_OPTIONS;
