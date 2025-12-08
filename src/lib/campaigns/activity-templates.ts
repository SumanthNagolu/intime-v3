/**
 * Campaign Activity Templates
 * 
 * Predefined templates for common campaign activities with auto-creation triggers
 */

export interface ActivityTemplate {
  id: string
  name: string
  activity_type: 'note' | 'task' | 'call' | 'email' | 'meeting'
  subject_template: string
  description_template: string
  auto_create: boolean
  trigger?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export const campaignActivityTemplates: ActivityTemplate[] = [
  // Campaign Lifecycle Events
  {
    id: 'campaign_launched',
    name: 'Campaign Launched',
    activity_type: 'note',
    subject_template: 'Campaign "{campaign_name}" launched',
    description_template: 'Campaign started with {prospect_count} prospects across {channels_count} channels: {channels_list}',
    auto_create: true,
    trigger: 'campaign.status_changed.active',
  },
  {
    id: 'campaign_paused',
    name: 'Campaign Paused',
    activity_type: 'note',
    subject_template: 'Campaign "{campaign_name}" paused',
    description_template: 'Campaign paused by {user_name}. Current metrics: {leads_count} leads, {meetings_count} meetings',
    auto_create: true,
    trigger: 'campaign.status_changed.paused',
  },
  {
    id: 'campaign_resumed',
    name: 'Campaign Resumed',
    activity_type: 'note',
    subject_template: 'Campaign "{campaign_name}" resumed',
    description_template: 'Campaign resumed by {user_name}',
    auto_create: true,
    trigger: 'campaign.status_changed.active_from_paused',
  },
  {
    id: 'campaign_completed',
    name: 'Campaign Completed',
    activity_type: 'note',
    subject_template: 'Campaign "{campaign_name}" completed',
    description_template: 'Campaign completed with outcome: {outcome}. Final metrics: {leads_count}/{target_leads} leads ({leads_percentage}%), {meetings_count}/{target_meetings} meetings ({meetings_percentage}%)',
    auto_create: true,
    trigger: 'campaign.status_changed.completed',
  },

  // Milestone Events
  {
    id: 'milestone_50_percent_leads',
    name: '50% Lead Target Reached',
    activity_type: 'note',
    subject_template: 'Milestone: 50% of lead target reached',
    description_template: 'Campaign "{campaign_name}" has reached 50% of target leads ({leads_count}/{target_leads})',
    auto_create: true,
    trigger: 'campaign.milestone.leads_50_percent',
  },
  {
    id: 'milestone_target_leads_met',
    name: 'Lead Target Met',
    activity_type: 'note',
    subject_template: 'Target achieved: {target_leads} leads generated',
    description_template: 'Campaign "{campaign_name}" has met its lead generation target of {target_leads} leads',
    auto_create: true,
    trigger: 'campaign.milestone.leads_target_met',
  },
  {
    id: 'milestone_target_leads_exceeded',
    name: 'Lead Target Exceeded',
    activity_type: 'note',
    subject_template: 'Target exceeded: {leads_count} leads generated',
    description_template: 'Campaign "{campaign_name}" has exceeded its lead target! Generated {leads_count} leads (target: {target_leads})',
    auto_create: true,
    trigger: 'campaign.milestone.leads_target_exceeded',
  },

  // High-Value Prospect Events
  {
    id: 'high_engagement_prospect',
    name: 'High Engagement Prospect Identified',
    activity_type: 'task',
    subject_template: 'Follow up with {prospect_name} from {company_name}',
    description_template: 'Prospect {prospect_name} has high engagement score ({engagement_score}/100). Last action: {last_action}. Recommended next step: {next_step}',
    auto_create: true,
    trigger: 'prospect.engagement_score.above_80',
    priority: 'high',
  },
  {
    id: 'prospect_responded_positive',
    name: 'Positive Response Received',
    activity_type: 'task',
    subject_template: 'Positive response from {prospect_name}',
    description_template: '{prospect_name} from {company_name} responded positively. Response: "{response_preview}". Next step: {recommended_action}',
    auto_create: true,
    trigger: 'prospect.responded.positive',
    priority: 'urgent',
  },
  {
    id: 'meeting_requested',
    name: 'Meeting Requested by Prospect',
    activity_type: 'task',
    subject_template: 'Schedule meeting with {prospect_name}',
    description_template: '{prospect_name} from {company_name} requested a meeting. Response: "{response_preview}"',
    auto_create: true,
    trigger: 'prospect.meeting_requested',
    priority: 'urgent',
  },

  // Performance Alerts
  {
    id: 'low_open_rate_alert',
    name: 'Low Open Rate Alert',
    activity_type: 'task',
    subject_template: 'Action needed: Low open rate on {campaign_name}',
    description_template: 'Campaign open rate ({open_rate}%) is below target (35%). Consider reviewing subject lines or send times.',
    auto_create: true,
    trigger: 'campaign.alert.low_open_rate',
    priority: 'high',
  },
  {
    id: 'low_response_rate_alert',
    name: 'Low Response Rate Alert',
    activity_type: 'task',
    subject_template: 'Action needed: Low response rate on {campaign_name}',
    description_template: 'Campaign response rate ({response_rate}%) is below target (8%). Consider reviewing messaging or targeting criteria.',
    auto_create: true,
    trigger: 'campaign.alert.low_response_rate',
    priority: 'high',
  },

  // Budget Alerts
  {
    id: 'budget_50_percent_spent',
    name: '50% Budget Spent',
    activity_type: 'note',
    subject_template: 'Budget alert: 50% spent on {campaign_name}',
    description_template: 'Campaign has spent ${budget_spent} of ${budget_total} budget (50%). Current ROI: {roi}x',
    auto_create: true,
    trigger: 'campaign.budget.50_percent_spent',
  },
  {
    id: 'budget_90_percent_spent',
    name: '90% Budget Spent',
    activity_type: 'task',
    subject_template: 'Budget alert: 90% spent on {campaign_name}',
    description_template: 'Campaign has spent ${budget_spent} of ${budget_total} budget (90%). Review remaining budget allocation.',
    auto_create: true,
    trigger: 'campaign.budget.90_percent_spent',
    priority: 'high',
  },

  // Manual Activity Templates
  {
    id: 'manual_prospect_research',
    name: 'Prospect Research',
    activity_type: 'note',
    subject_template: 'Research on {prospect_name} from {company_name}',
    description_template: 'Conducted research on prospect. Key findings:\n\n[Add your notes here]',
    auto_create: false,
  },
  {
    id: 'manual_campaign_review',
    name: 'Campaign Review',
    activity_type: 'note',
    subject_template: 'Weekly campaign review for {campaign_name}',
    description_template: 'Campaign performance review:\n\nWins:\n- [Add wins]\n\nChallenges:\n- [Add challenges]\n\nNext steps:\n- [Add action items]',
    auto_create: false,
  },
  {
    id: 'manual_sequence_adjustment',
    name: 'Sequence Adjustment',
    activity_type: 'note',
    subject_template: 'Adjusted sequence for {channel} channel',
    description_template: 'Made adjustments to {channel} sequence:\n\nChanges made:\n- [Describe changes]\n\nExpected impact:\n- [Describe expected results]',
    auto_create: false,
  },
  {
    id: 'manual_ab_test_results',
    name: 'A/B Test Results',
    activity_type: 'note',
    subject_template: 'A/B test results for {test_name}',
    description_template: 'A/B test completed:\n\nVariant A: {variant_a_metric}\nVariant B: {variant_b_metric}\n\nWinner: {winner}\nNext action: [Describe next steps]',
    auto_create: false,
  },
]

/**
 * Get activity templates filtered by type
 */
export function getTemplatesByType(activityType: string): ActivityTemplate[] {
  return campaignActivityTemplates.filter(
    (template) => template.activity_type === activityType
  )
}

/**
 * Get auto-create templates only
 */
export function getAutoCreateTemplates(): ActivityTemplate[] {
  return campaignActivityTemplates.filter((template) => template.auto_create)
}

/**
 * Get manual templates only
 */
export function getManualTemplates(): ActivityTemplate[] {
  return campaignActivityTemplates.filter((template) => !template.auto_create)
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ActivityTemplate | undefined {
  return campaignActivityTemplates.find((template) => template.id === id)
}

/**
 * Format activity from template with data
 */
export function formatActivityFromTemplate(
  template: ActivityTemplate,
  data: Record<string, any>
): { subject: string; description: string } {
  let subject = template.subject_template
  let description = template.description_template

  // Replace all placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    subject = subject.replace(new RegExp(placeholder, 'g'), String(value || ''))
    description = description.replace(new RegExp(placeholder, 'g'), String(value || ''))
  })

  return { subject, description }
}

