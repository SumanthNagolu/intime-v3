/**
 * Activity Patterns Seed Configuration - Part 2
 * 
 * Account, Contact, Lead, Deal, Consultant, Vendor, and General patterns
 */

import type { ActivityPatternSeed, Outcome } from './activity-patterns-seed'

// ============================================
// SHARED OUTCOME PRESETS
// ============================================

const INTEREST_OUTCOMES: Outcome[] = [
  { label: 'Interested', value: 'interested', color: 'green', nextAction: 'create_task' },
  { label: 'Not Interested', value: 'not_interested', color: 'red', nextAction: 'log_notes' },
  { label: 'Callback', value: 'callback', color: 'yellow', nextAction: 'schedule_followup' },
]

const MEETING_OUTCOMES: Outcome[] = [
  { label: 'Completed', value: 'completed', color: 'green', nextAction: 'log_notes' },
  { label: 'Rescheduled', value: 'rescheduled', color: 'yellow', nextAction: 'schedule_followup' },
  { label: 'Cancelled', value: 'cancelled', color: 'red', nextAction: 'log_notes' },
]

const REVIEW_OUTCOMES: Outcome[] = [
  { label: 'Approved', value: 'approved', color: 'green', nextAction: 'create_task' },
  { label: 'Rejected', value: 'rejected', color: 'red', nextAction: 'log_notes' },
  { label: 'Revisions Needed', value: 'revisions', color: 'yellow', nextAction: 'create_task' },
]

const VERIFY_OUTCOMES: Outcome[] = [
  { label: 'Verified', value: 'verified', color: 'green', nextAction: 'none' },
  { label: 'Not Verified', value: 'not_verified', color: 'red', nextAction: 'create_task' },
  { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' },
]

const RESEARCH_OUTCOMES: Outcome[] = [
  { label: 'Completed', value: 'completed', color: 'green', nextAction: 'log_notes' },
  { label: 'Needs More Research', value: 'more_research', color: 'yellow', nextAction: 'create_task' },
]

const CHECKIN_OUTCOMES: Outcome[] = [
  { label: 'Going Well', value: 'going_well', color: 'green', nextAction: 'log_notes' },
  { label: 'Issues', value: 'issues', color: 'orange', nextAction: 'create_task' },
  { label: 'Escalate', value: 'escalate', color: 'red', nextAction: 'create_task' },
]

const RESPONSE_OUTCOMES: Outcome[] = [
  { label: 'Responded', value: 'responded', color: 'green', nextAction: 'log_notes' },
  { label: 'No Response', value: 'no_response', color: 'gray', nextAction: 'retry_later' },
]

// ============================================
// ACCOUNT PATTERNS
// ============================================

export const ACCOUNT_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'acct_intro_call', name: 'Introduction Call', description: 'Initial introduction call with prospect', category: 'communication', entityType: 'account', icon: '📞', color: 'blue', targetDays: 1, priority: 'high', outcomes: INTEREST_OUTCOMES, points: 15, displayOrder: 10 },
  { code: 'acct_needs_assessment', name: 'Needs Assessment', description: 'Assess client staffing needs', category: 'communication', entityType: 'account', icon: '📋', color: 'blue', targetDays: 3, priority: 'high', outcomes: [{ label: 'Needs Identified', value: 'identified', color: 'green', nextAction: 'create_task' }], points: 15, displayOrder: 20 },
  { code: 'acct_relationship_checkin', name: 'Relationship Check-in', description: 'Regular relationship maintenance call', category: 'communication', entityType: 'account', icon: '🤝', color: 'blue', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Strong', value: 'strong', color: 'green', nextAction: 'log_notes' }, { label: 'Needs Attention', value: 'attention', color: 'yellow', nextAction: 'create_task' }], points: 5, displayOrder: 30 },
  { code: 'acct_escalation_call', name: 'Escalation Call', description: 'Handle account escalation', category: 'communication', entityType: 'account', icon: '⚠️', color: 'red', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Resolved', value: 'resolved', color: 'green', nextAction: 'log_notes' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }, { label: 'Escalate Further', value: 'escalate', color: 'red', nextAction: 'create_task' }], points: 15, displayOrder: 40 },
  { code: 'acct_renewal_discussion', name: 'Renewal Discussion', description: 'Discuss contract renewal', category: 'communication', entityType: 'account', icon: '🔄', color: 'blue', targetDays: 30, priority: 'high', outcomes: [{ label: 'Renewing', value: 'renewing', color: 'green', nextAction: 'create_task' }, { label: 'At Risk', value: 'at_risk', color: 'yellow', nextAction: 'create_task' }, { label: 'Lost', value: 'lost', color: 'red', nextAction: 'log_notes' }], points: 15, displayOrder: 50 },
  { code: 'acct_win_back', name: 'Win-back Outreach', description: 'Attempt to win back lost account', category: 'communication', entityType: 'account', icon: '🎯', color: 'blue', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Re-engaged', value: 'reengaged', color: 'green', nextAction: 'create_task' }, { label: 'Not Interested', value: 'not_interested', color: 'red', nextAction: 'log_notes' }], points: 10, displayOrder: 60 },
  
  // Calendar
  { code: 'acct_qbr', name: 'Quarterly Business Review', description: 'Quarterly business review meeting', category: 'calendar', entityType: 'account', icon: '📊', color: 'teal', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Positive', value: 'positive', color: 'green', nextAction: 'log_notes' }, { label: 'Action Items', value: 'action_items', color: 'yellow', nextAction: 'create_task' }], points: 20, displayOrder: 100 },
  { code: 'acct_kickoff', name: 'Account Kickoff', description: 'New account kickoff meeting', category: 'calendar', entityType: 'account', icon: '🚀', color: 'teal', targetDays: 3, priority: 'urgent', outcomes: [{ label: 'Launched', value: 'launched', color: 'green', nextAction: 'create_task' }], points: 25, displayOrder: 110 },
  { code: 'acct_strategy_session', name: 'Strategy Session', description: 'Account strategy planning session', category: 'calendar', entityType: 'account', icon: '🎯', color: 'teal', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Strategy Defined', value: 'defined', color: 'green', nextAction: 'log_notes' }], points: 15, displayOrder: 120 },
  { code: 'acct_executive_meeting', name: 'Executive Meeting', description: 'Executive stakeholder meeting', category: 'calendar', entityType: 'account', icon: '👔', color: 'teal', targetDays: 30, priority: 'high', outcomes: [{ label: 'Relationship Strengthened', value: 'strengthened', color: 'green', nextAction: 'log_notes' }], points: 20, displayOrder: 130 },
  
  // Workflow
  { code: 'acct_onboarding', name: 'Account Onboarding', description: 'Complete account onboarding', category: 'workflow', entityType: 'account', icon: '📋', color: 'violet', targetDays: 5, priority: 'urgent', outcomes: [{ label: 'Onboarded', value: 'onboarded', color: 'green', nextAction: 'none' }], points: 20, displayOrder: 200 },
  { code: 'acct_tier_review', name: 'Tier Review', description: 'Review account tier classification', category: 'workflow', entityType: 'account', icon: '⭐', color: 'violet', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Upgraded', value: 'upgraded', color: 'green', nextAction: 'log_notes' }, { label: 'Downgraded', value: 'downgraded', color: 'red', nextAction: 'log_notes' }, { label: 'Maintained', value: 'maintained', color: 'gray', nextAction: 'none' }], points: 5, displayOrder: 210 },
  { code: 'acct_health_assessment', name: 'Health Assessment', description: 'Assess account health score', category: 'workflow', entityType: 'account', icon: '💚', color: 'violet', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Healthy', value: 'healthy', color: 'green', nextAction: 'none' }, { label: 'At Risk', value: 'at_risk', color: 'yellow', nextAction: 'create_task' }, { label: 'Critical', value: 'critical', color: 'red', nextAction: 'create_task' }], points: 5, displayOrder: 220 },
  { code: 'acct_nps_survey', name: 'NPS Survey', description: 'Send and track NPS survey', category: 'workflow', entityType: 'account', icon: '📈', color: 'violet', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Promoter', value: 'promoter', color: 'green', nextAction: 'log_notes' }, { label: 'Passive', value: 'passive', color: 'yellow', nextAction: 'log_notes' }, { label: 'Detractor', value: 'detractor', color: 'red', nextAction: 'create_task' }], points: 5, displayOrder: 230 },
  
  // Documentation
  { code: 'acct_msa_review', name: 'MSA Review', description: 'Review Master Service Agreement', category: 'documentation', entityType: 'account', icon: '📄', color: 'gray', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Current', value: 'current', color: 'green', nextAction: 'none' }, { label: 'Needs Update', value: 'needs_update', color: 'yellow', nextAction: 'create_task' }], points: 5, displayOrder: 300 },
  { code: 'acct_rate_card_update', name: 'Rate Card Update', description: 'Update account rate card', category: 'documentation', entityType: 'account', icon: '💵', color: 'gray', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Updated', value: 'updated', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 310 },
  { code: 'acct_credit_check', name: 'Credit Check', description: 'Perform credit check', category: 'documentation', entityType: 'account', icon: '💳', color: 'gray', targetDays: 5, priority: 'high', outcomes: REVIEW_OUTCOMES, points: 5, displayOrder: 320 },
  { code: 'acct_compliance_review', name: 'Compliance Review', description: 'Review account compliance', category: 'documentation', entityType: 'account', icon: '✅', color: 'gray', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Compliant', value: 'compliant', color: 'green', nextAction: 'none' }, { label: 'Non-Compliant', value: 'non_compliant', color: 'red', nextAction: 'create_task' }], points: 8, displayOrder: 330 },
  
  // Research
  { code: 'acct_market_research', name: 'Market Research', description: 'Research account market position', category: 'research', entityType: 'account', icon: '🔍', color: 'amber', targetDays: 5, priority: 'normal', outcomes: [{ label: 'Growth', value: 'growth', color: 'green', nextAction: 'log_notes' }, { label: 'Stable', value: 'stable', color: 'gray', nextAction: 'log_notes' }, { label: 'Decline', value: 'decline', color: 'red', nextAction: 'log_notes' }], points: 8, displayOrder: 400 },
  { code: 'acct_org_chart', name: 'Org Chart Mapping', description: 'Map account organization chart', category: 'research', entityType: 'account', icon: '🗺️', color: 'amber', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Mapped', value: 'mapped', color: 'green', nextAction: 'log_notes' }, { label: 'Incomplete', value: 'incomplete', color: 'yellow', nextAction: 'schedule_followup' }], points: 10, displayOrder: 410 },
  { code: 'acct_competitive_intel', name: 'Competitive Intel', description: 'Gather competitive intelligence', category: 'research', entityType: 'account', icon: '🔎', color: 'amber', targetDays: 7, priority: 'normal', outcomes: RESEARCH_OUTCOMES, points: 8, displayOrder: 420 },
]

// ============================================
// CONTACT PATTERNS
// ============================================

export const CONTACT_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'con_intro_email', name: 'Introduction Email', description: 'Send introduction email', category: 'communication', entityType: 'contact', icon: '📧', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Opened', value: 'opened', color: 'green', nextAction: 'schedule_followup' }, { label: 'No Response', value: 'no_response', color: 'gray', nextAction: 'retry_later' }], points: 3, displayOrder: 10 },
  { code: 'con_linkedin_connect', name: 'LinkedIn Connection', description: 'Send LinkedIn connection request', category: 'communication', entityType: 'contact', icon: '💼', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Connected', value: 'connected', color: 'green', nextAction: 'log_notes' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'none' }], points: 2, displayOrder: 20 },
  { code: 'con_followup_call', name: 'Follow-up Call', description: 'Follow-up phone call', category: 'communication', entityType: 'contact', icon: '📞', color: 'blue', targetDays: 2, priority: 'normal', outcomes: [{ label: 'Connected', value: 'connected', color: 'green', nextAction: 'log_notes' }, { label: 'Voicemail', value: 'voicemail', color: 'yellow', nextAction: 'schedule_followup' }, { label: 'No Answer', value: 'no_answer', color: 'orange', nextAction: 'retry_later' }], points: 5, displayOrder: 30 },
  { code: 'con_thank_you', name: 'Thank You Note', description: 'Send thank you note', category: 'communication', entityType: 'contact', icon: '🙏', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Sent', value: 'sent', color: 'green', nextAction: 'none' }], points: 2, displayOrder: 40 },
  { code: 'con_birthday', name: 'Birthday Outreach', description: 'Send birthday wishes', category: 'communication', entityType: 'contact', icon: '🎂', color: 'blue', targetDays: 0, priority: 'low', outcomes: [{ label: 'Sent', value: 'sent', color: 'green', nextAction: 'none' }], points: 2, displayOrder: 50 },
  { code: 'con_role_change', name: 'Role Change Congrats', description: 'Congratulate on role change', category: 'communication', entityType: 'contact', icon: '🎉', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Sent', value: 'sent', color: 'green', nextAction: 'none' }], points: 2, displayOrder: 60 },
  
  // Workflow
  { code: 'con_data_enrichment', name: 'Data Enrichment', description: 'Enrich contact data', category: 'workflow', entityType: 'contact', icon: '📊', color: 'violet', targetDays: 2, priority: 'normal', outcomes: [{ label: 'Enriched', value: 'enriched', color: 'green', nextAction: 'none' }, { label: 'Needs Manual Review', value: 'manual', color: 'yellow', nextAction: 'create_task' }], points: 3, displayOrder: 100 },
  { code: 'con_duplicate_merge', name: 'Duplicate Merge', description: 'Merge duplicate contacts', category: 'workflow', entityType: 'contact', icon: '🔗', color: 'violet', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Merged', value: 'merged', color: 'green', nextAction: 'none' }], points: 3, displayOrder: 110 },
  { code: 'con_opt_out', name: 'Opt-out Processing', description: 'Process opt-out request', category: 'workflow', entityType: 'contact', icon: '🚫', color: 'violet', targetDays: 1, priority: 'high', outcomes: [{ label: 'Opted Out', value: 'opted_out', color: 'red', nextAction: 'none' }], points: 2, displayOrder: 120 },
]

// ============================================
// LEAD/DEAL PATTERNS (CRM)
// ============================================

export const LEAD_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'lead_cold_call', name: 'Cold Call', description: 'Cold outreach call', category: 'communication', entityType: 'lead', icon: '📞', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Qualified', value: 'qualified', color: 'green', nextAction: 'create_task' }, { label: 'Not Qualified', value: 'not_qualified', color: 'red', nextAction: 'log_notes' }, { label: 'Callback', value: 'callback', color: 'yellow', nextAction: 'schedule_followup' }], points: 10, displayOrder: 10 },
  { code: 'lead_cold_email', name: 'Cold Email', description: 'Cold outreach email', category: 'communication', entityType: 'lead', icon: '📧', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Opened', value: 'opened', color: 'green', nextAction: 'schedule_followup' }, { label: 'Clicked', value: 'clicked', color: 'green', nextAction: 'create_task' }, { label: 'No Response', value: 'no_response', color: 'gray', nextAction: 'retry_later' }], points: 5, displayOrder: 20 },
  { code: 'lead_discovery_call', name: 'Discovery Call', description: 'Initial discovery call', category: 'communication', entityType: 'lead', icon: '🔍', color: 'blue', targetDays: 2, priority: 'high', outcomes: [{ label: 'Opportunity', value: 'opportunity', color: 'green', nextAction: 'create_task' }, { label: 'No Opportunity', value: 'no_opportunity', color: 'red', nextAction: 'log_notes' }], points: 15, displayOrder: 30 },
  { code: 'lead_demo_followup', name: 'Demo Follow-up', description: 'Follow up after demo', category: 'communication', entityType: 'lead', icon: '📱', color: 'blue', targetDays: 1, priority: 'high', outcomes: INTEREST_OUTCOMES, points: 10, displayOrder: 40 },
  
  // Calendar
  { code: 'lead_demo', name: 'Demo Meeting', description: 'Product/service demonstration', category: 'calendar', entityType: 'lead', icon: '🖥️', color: 'teal', targetDays: 5, priority: 'high', outcomes: [{ label: 'Demo Completed', value: 'completed', color: 'green', nextAction: 'schedule_followup' }], points: 20, displayOrder: 100 },
  
  // Workflow
  { code: 'lead_qualification', name: 'Lead Qualification', description: 'Qualify lead as MQL/SQL', category: 'workflow', entityType: 'lead', icon: '✅', color: 'violet', targetDays: 1, priority: 'high', outcomes: [{ label: 'MQL', value: 'mql', color: 'blue', nextAction: 'log_notes' }, { label: 'SQL', value: 'sql', color: 'green', nextAction: 'create_task' }, { label: 'Disqualified', value: 'disqualified', color: 'red', nextAction: 'log_notes' }], points: 10, displayOrder: 200 },
  { code: 'lead_nurture', name: 'Nurture Sequence', description: 'Nurture sequence touchpoint', category: 'workflow', entityType: 'lead', icon: '🌱', color: 'violet', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Engaged', value: 'engaged', color: 'green', nextAction: 'log_notes' }, { label: 'Unengaged', value: 'unengaged', color: 'gray', nextAction: 'none' }], points: 3, displayOrder: 210 },
]

export const DEAL_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'deal_negotiation', name: 'Deal Negotiation', description: 'Negotiate deal terms', category: 'communication', entityType: 'deal', icon: '🤝', color: 'blue', targetDays: 2, priority: 'high', outcomes: [{ label: 'Progressing', value: 'progressing', color: 'green', nextAction: 'log_notes' }, { label: 'Stalled', value: 'stalled', color: 'yellow', nextAction: 'create_task' }, { label: 'Lost', value: 'lost', color: 'red', nextAction: 'log_notes' }], points: 15, displayOrder: 10 },
  { code: 'deal_closing', name: 'Closing Call', description: 'Final closing call', category: 'communication', entityType: 'deal', icon: '🎯', color: 'blue', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Won', value: 'won', color: 'green', nextAction: 'create_task' }, { label: 'Lost', value: 'lost', color: 'red', nextAction: 'log_notes' }, { label: 'Extended', value: 'extended', color: 'yellow', nextAction: 'schedule_followup' }], points: 25, displayOrder: 20 },
  
  // Calendar
  { code: 'deal_proposal_review', name: 'Proposal Review', description: 'Review proposal with client', category: 'calendar', entityType: 'deal', icon: '📋', color: 'teal', targetDays: 3, priority: 'high', outcomes: [{ label: 'Accepted', value: 'accepted', color: 'green', nextAction: 'create_task' }, { label: 'Revisions', value: 'revisions', color: 'yellow', nextAction: 'create_task' }], points: 15, displayOrder: 100 },
  { code: 'deal_contract_meeting', name: 'Contract Meeting', description: 'Contract review meeting', category: 'calendar', entityType: 'deal', icon: '📝', color: 'teal', targetDays: 3, priority: 'high', outcomes: [{ label: 'Ready to Sign', value: 'ready', color: 'green', nextAction: 'create_task' }, { label: 'Issues', value: 'issues', color: 'yellow', nextAction: 'create_task' }], points: 15, displayOrder: 110 },
  
  // Workflow
  { code: 'deal_stage_advance', name: 'Stage Advance', description: 'Advance deal to next stage', category: 'workflow', entityType: 'deal', icon: '📈', color: 'violet', targetDays: 0, priority: 'normal', outcomes: [{ label: 'Advanced', value: 'advanced', color: 'green', nextAction: 'none' }, { label: 'Stalled', value: 'stalled', color: 'yellow', nextAction: 'create_task' }], points: 5, displayOrder: 200 },
  { code: 'deal_proposal_creation', name: 'Create Proposal', description: 'Create deal proposal', category: 'workflow', entityType: 'deal', icon: '📄', color: 'violet', targetDays: 3, priority: 'high', outcomes: [{ label: 'Created', value: 'created', color: 'green', nextAction: 'schedule_followup' }], points: 15, displayOrder: 210 },
  { code: 'deal_win_process', name: 'Deal Won Process', description: 'Process won deal', category: 'workflow', entityType: 'deal', icon: '🏆', color: 'violet', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Start Onboarding', value: 'onboarding', color: 'green', nextAction: 'create_task' }], points: 30, displayOrder: 220 },
  { code: 'deal_loss_debrief', name: 'Loss Debrief', description: 'Debrief on lost deal', category: 'workflow', entityType: 'deal', icon: '📝', color: 'violet', targetDays: 2, priority: 'normal', outcomes: [{ label: 'Completed', value: 'completed', color: 'green', nextAction: 'log_notes' }], points: 5, displayOrder: 230 },
]

// ============================================
// CONSULTANT/BENCH PATTERNS (Ceipal-style)
// ============================================

export const CONSULTANT_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'bench_availability', name: 'Availability Check', description: 'Check bench consultant availability', category: 'communication', entityType: 'consultant', icon: '📞', color: 'blue', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Available', value: 'available', color: 'green', nextAction: 'log_notes' }, { label: 'Interviewing', value: 'interviewing', color: 'yellow', nextAction: 'log_notes' }, { label: 'Placed', value: 'placed', color: 'blue', nextAction: 'none' }], points: 5, displayOrder: 10 },
  { code: 'bench_marketing', name: 'Marketing Outreach', description: 'Market consultant to client', category: 'communication', entityType: 'consultant', icon: '📣', color: 'blue', targetDays: 1, priority: 'high', outcomes: [{ label: 'Submitted', value: 'submitted', color: 'green', nextAction: 'log_notes' }, { label: 'No Fit', value: 'no_fit', color: 'gray', nextAction: 'none' }], points: 8, displayOrder: 20 },
  { code: 'bench_rate_review', name: 'Rate Review', description: 'Review consultant rate', category: 'communication', entityType: 'consultant', icon: '💰', color: 'blue', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Rate Adjusted', value: 'adjusted', color: 'green', nextAction: 'log_notes' }, { label: 'Maintained', value: 'maintained', color: 'gray', nextAction: 'none' }], points: 3, displayOrder: 30 },
  { code: 'bench_relocation', name: 'Relocation Discussion', description: 'Discuss relocation willingness', category: 'communication', entityType: 'consultant', icon: '🚚', color: 'blue', targetDays: 5, priority: 'normal', outcomes: [{ label: 'Will Relocate', value: 'relocate', color: 'green', nextAction: 'log_notes' }, { label: 'Local Only', value: 'local', color: 'gray', nextAction: 'none' }], points: 5, displayOrder: 40 },
  { code: 'bench_visa_check', name: 'Visa Status Check', description: 'Check visa status', category: 'communication', entityType: 'consultant', icon: '🛂', color: 'blue', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Valid', value: 'valid', color: 'green', nextAction: 'none' }, { label: 'Expiring', value: 'expiring', color: 'yellow', nextAction: 'create_task' }, { label: 'Transfer Needed', value: 'transfer', color: 'orange', nextAction: 'create_task' }], points: 5, displayOrder: 50 },
  
  // Workflow
  { code: 'bench_profile_update', name: 'Profile Update', description: 'Update consultant profile', category: 'workflow', entityType: 'consultant', icon: '📝', color: 'violet', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Updated', value: 'updated', color: 'green', nextAction: 'none' }], points: 3, displayOrder: 100 },
  { code: 'bench_hotlist', name: 'Add to Hotlist', description: 'Add to marketing hotlist', category: 'workflow', entityType: 'consultant', icon: '🔥', color: 'violet', targetDays: 0, priority: 'normal', outcomes: [{ label: 'Added', value: 'added', color: 'green', nextAction: 'none' }], points: 2, displayOrder: 110 },
  { code: 'bench_marketing_blast', name: 'Marketing Blast', description: 'Send marketing blast', category: 'workflow', entityType: 'consultant', icon: '📨', color: 'violet', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Sent', value: 'sent', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 120 },
  { code: 'bench_interview_prep', name: 'Interview Prep', description: 'Prepare for interview', category: 'workflow', entityType: 'consultant', icon: '🎯', color: 'violet', targetDays: 1, priority: 'high', outcomes: [{ label: 'Prepped', value: 'prepped', color: 'green', nextAction: 'none' }], points: 8, displayOrder: 130 },
  { code: 'bench_aging_alert', name: 'Bench Aging Alert', description: 'Address bench aging', category: 'workflow', entityType: 'consultant', icon: '⚠️', color: 'violet', targetDays: 7, priority: 'high', outcomes: [{ label: 'Action Taken', value: 'action', color: 'green', nextAction: 'log_notes' }, { label: 'Escalate', value: 'escalate', color: 'red', nextAction: 'create_task' }], points: 5, displayOrder: 140 },
  
  // Documentation
  { code: 'bench_resume_refresh', name: 'Resume Refresh', description: 'Refresh consultant resume', category: 'documentation', entityType: 'consultant', icon: '📄', color: 'gray', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Refreshed', value: 'refreshed', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 200 },
  { code: 'bench_skills_matrix', name: 'Skills Matrix Update', description: 'Update skills matrix', category: 'documentation', entityType: 'consultant', icon: '📊', color: 'gray', targetDays: 14, priority: 'normal', outcomes: [{ label: 'Updated', value: 'updated', color: 'green', nextAction: 'none' }], points: 3, displayOrder: 210 },
  { code: 'bench_training', name: 'Training Assignment', description: 'Assign training course', category: 'documentation', entityType: 'consultant', icon: '🎓', color: 'gray', targetDays: 5, priority: 'normal', outcomes: [{ label: 'Assigned', value: 'assigned', color: 'green', nextAction: 'schedule_followup' }, { label: 'Completed', value: 'completed', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 220 },
]

// ============================================
// VENDOR PATTERNS
// ============================================

export const VENDOR_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'vend_intro', name: 'Vendor Introduction', description: 'Initial vendor introduction', category: 'communication', entityType: 'vendor', icon: '🤝', color: 'blue', targetDays: 2, priority: 'normal', outcomes: [{ label: 'Partnership Interest', value: 'interest', color: 'green', nextAction: 'create_task' }, { label: 'No Interest', value: 'no_interest', color: 'red', nextAction: 'log_notes' }], points: 10, displayOrder: 10 },
  { code: 'vend_rate_negotiation', name: 'Rate Negotiation', description: 'Negotiate vendor rates', category: 'communication', entityType: 'vendor', icon: '💰', color: 'blue', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Rates Agreed', value: 'agreed', color: 'green', nextAction: 'log_notes' }, { label: 'Negotiating', value: 'negotiating', color: 'yellow', nextAction: 'schedule_followup' }], points: 8, displayOrder: 20 },
  { code: 'vend_performance', name: 'Performance Review', description: 'Review vendor performance', category: 'communication', entityType: 'vendor', icon: '📊', color: 'blue', targetDays: 30, priority: 'normal', outcomes: CHECKIN_OUTCOMES, points: 10, displayOrder: 30 },
  { code: 'vend_compliance', name: 'Compliance Discussion', description: 'Discuss compliance requirements', category: 'communication', entityType: 'vendor', icon: '📋', color: 'blue', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Compliant', value: 'compliant', color: 'green', nextAction: 'none' }, { label: 'Action Needed', value: 'action', color: 'yellow', nextAction: 'create_task' }], points: 5, displayOrder: 40 },
  
  // Workflow
  { code: 'vend_onboarding', name: 'Vendor Onboarding', description: 'Onboard new vendor', category: 'workflow', entityType: 'vendor', icon: '📋', color: 'violet', targetDays: 7, priority: 'high', outcomes: [{ label: 'Onboarded', value: 'onboarded', color: 'green', nextAction: 'none' }], points: 15, displayOrder: 100 },
  { code: 'vend_tier_review', name: 'Tier Assessment', description: 'Assess vendor tier', category: 'workflow', entityType: 'vendor', icon: '⭐', color: 'violet', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Preferred', value: 'preferred', color: 'green', nextAction: 'none' }, { label: 'Standard', value: 'standard', color: 'gray', nextAction: 'none' }, { label: 'Probation', value: 'probation', color: 'red', nextAction: 'create_task' }], points: 5, displayOrder: 110 },
  { code: 'vend_scorecard', name: 'Scorecard Update', description: 'Update vendor scorecard', category: 'workflow', entityType: 'vendor', icon: '📈', color: 'violet', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Updated', value: 'updated', color: 'green', nextAction: 'none' }], points: 3, displayOrder: 120 },
  
  // Documentation
  { code: 'vend_agreement', name: 'Agreement Review', description: 'Review vendor agreement', category: 'documentation', entityType: 'vendor', icon: '📝', color: 'gray', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Current', value: 'current', color: 'green', nextAction: 'none' }, { label: 'Needs Renewal', value: 'renewal', color: 'yellow', nextAction: 'create_task' }], points: 5, displayOrder: 200 },
  { code: 'vend_insurance', name: 'Insurance Verification', description: 'Verify vendor insurance', category: 'documentation', entityType: 'vendor', icon: '🛡️', color: 'gray', targetDays: 90, priority: 'normal', outcomes: VERIFY_OUTCOMES, points: 5, displayOrder: 210 },
  { code: 'vend_compliance_audit', name: 'Compliance Audit', description: 'Audit vendor compliance', category: 'documentation', entityType: 'vendor', icon: '✅', color: 'gray', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Compliant', value: 'compliant', color: 'green', nextAction: 'none' }, { label: 'Non-Compliant', value: 'non_compliant', color: 'red', nextAction: 'create_task' }], points: 8, displayOrder: 220 },
]

// ============================================
// GENERAL PATTERNS
// ============================================

export const GENERAL_PATTERNS: ActivityPatternSeed[] = [
  // Administrative
  { code: 'gen_data_cleanup', name: 'Data Cleanup', description: 'Clean up data records', category: 'administrative', entityType: 'general', icon: '🧹', color: 'slate', targetDays: 3, priority: 'low', outcomes: [{ label: 'Cleaned', value: 'cleaned', color: 'green', nextAction: 'none' }], points: 3, displayOrder: 10 },
  { code: 'gen_report', name: 'Report Generation', description: 'Generate report', category: 'administrative', entityType: 'general', icon: '📊', color: 'slate', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Generated', value: 'generated', color: 'green', nextAction: 'none' }], points: 3, displayOrder: 20 },
  { code: 'gen_system_update', name: 'System Update', description: 'Update system records', category: 'administrative', entityType: 'general', icon: '🔧', color: 'slate', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Updated', value: 'updated', color: 'green', nextAction: 'none' }], points: 2, displayOrder: 30 },
  { code: 'gen_training', name: 'Training Completion', description: 'Complete training module', category: 'administrative', entityType: 'general', icon: '🎓', color: 'slate', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Completed', value: 'completed', color: 'green', nextAction: 'none' }], points: 10, displayOrder: 40 },
  { code: 'gen_meeting_notes', name: 'Meeting Notes', description: 'Enter meeting notes', category: 'administrative', entityType: 'general', icon: '📝', color: 'slate', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Entered', value: 'entered', color: 'green', nextAction: 'none' }], points: 2, displayOrder: 50 },
  { code: 'gen_expense', name: 'Expense Submission', description: 'Submit expense report', category: 'administrative', entityType: 'general', icon: '💳', color: 'slate', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Submitted', value: 'submitted', color: 'green', nextAction: 'none' }, { label: 'Rejected', value: 'rejected', color: 'red', nextAction: 'create_task' }], points: 2, displayOrder: 60 },
]


