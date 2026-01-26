/**
 * Campaign Data Mappers
 *
 * Transform between API/database format and unified section format.
 * Following the Account pattern for consistent data handling.
 */

import type {
  CampaignSetupSectionData,
  CampaignTargetingSectionData,
  CampaignChannelsSectionData,
  CampaignScheduleSectionData,
  CampaignBudgetSectionData,
  CampaignTeamSectionData,
  CampaignComplianceSectionData,
  CampaignType,
  CampaignGoal,
  CampaignPriority,
  AudienceSource,
  CampaignChannel,
  ClientTier,
  ServiceType,
  WorkAuthorization,
  SendDay,
} from './types'

import {
  DEFAULT_SETUP_DATA,
  DEFAULT_TARGETING_DATA,
  DEFAULT_CHANNELS_DATA,
  DEFAULT_SCHEDULE_DATA,
  DEFAULT_BUDGET_DATA,
  DEFAULT_TEAM_DATA,
  DEFAULT_COMPLIANCE_DATA,
} from './types'

// =============================================================================
// SETUP SECTION MAPPER
// =============================================================================

/**
 * Map campaign data to SetupSectionData
 */
export function mapToSetupData(
  campaign: Record<string, unknown>
): CampaignSetupSectionData {
  // Priority and tags may be stored in target_criteria until dedicated columns added
  const targetCriteria =
    (campaign.targetCriteria as Record<string, unknown>) ||
    (campaign.target_criteria as Record<string, unknown>) ||
    {}

  return {
    name: (campaign.name as string) || DEFAULT_SETUP_DATA.name,
    campaignType:
      (campaign.campaignType as CampaignType) ||
      (campaign.campaign_type as CampaignType) ||
      DEFAULT_SETUP_DATA.campaignType,
    goal:
      (campaign.goal as CampaignGoal) || DEFAULT_SETUP_DATA.goal,
    priority:
      (campaign.priority as CampaignPriority) ||
      (targetCriteria.priority as CampaignPriority) ||
      DEFAULT_SETUP_DATA.priority,
    description:
      (campaign.description as string) || DEFAULT_SETUP_DATA.description,
    tags: Array.isArray(campaign.tags)
      ? (campaign.tags as string[])
      : Array.isArray(targetCriteria.tags)
        ? (targetCriteria.tags as string[])
        : DEFAULT_SETUP_DATA.tags,
  }
}

// =============================================================================
// TARGETING SECTION MAPPER
// =============================================================================

/**
 * Map campaign data to TargetingSectionData
 */
export function mapToTargetingData(
  campaign: Record<string, unknown>
): CampaignTargetingSectionData {
  // Extract target criteria from JSONB column
  const targetCriteria =
    (campaign.targetCriteria as Record<string, unknown>) ||
    (campaign.target_criteria as Record<string, unknown>) ||
    {}

  // Extract exclusions sub-object
  const exclusions =
    (targetCriteria.exclusions as Record<string, unknown>) || {}

  // Extract candidate-specific criteria
  const candidateCriteria =
    (targetCriteria.candidateCriteria as Record<string, unknown>) ||
    (targetCriteria.candidate_criteria as Record<string, unknown>) ||
    {}

  return {
    audienceSource:
      (targetCriteria.audienceSource as AudienceSource) ||
      (targetCriteria.audience_source as AudienceSource) ||
      DEFAULT_TARGETING_DATA.audienceSource,
    // Client Targeting
    industries: Array.isArray(targetCriteria.industries)
      ? (targetCriteria.industries as string[])
      : DEFAULT_TARGETING_DATA.industries,
    companySizes: Array.isArray(targetCriteria.companySizes)
      ? (targetCriteria.companySizes as string[])
      : Array.isArray(targetCriteria.company_sizes)
        ? (targetCriteria.company_sizes as string[])
        : DEFAULT_TARGETING_DATA.companySizes,
    regions: Array.isArray(targetCriteria.regions)
      ? (targetCriteria.regions as string[])
      : DEFAULT_TARGETING_DATA.regions,
    clientTiers: Array.isArray(targetCriteria.clientTiers)
      ? (targetCriteria.clientTiers as ClientTier[])
      : Array.isArray(targetCriteria.client_tiers)
        ? (targetCriteria.client_tiers as ClientTier[])
        : DEFAULT_TARGETING_DATA.clientTiers,
    serviceTypes: Array.isArray(targetCriteria.serviceTypes)
      ? (targetCriteria.serviceTypes as ServiceType[])
      : Array.isArray(targetCriteria.service_types)
        ? (targetCriteria.service_types as ServiceType[])
        : DEFAULT_TARGETING_DATA.serviceTypes,
    // Candidate Targeting
    targetTitles: Array.isArray(targetCriteria.targetTitles)
      ? (targetCriteria.targetTitles as string[])
      : Array.isArray(targetCriteria.target_titles)
        ? (targetCriteria.target_titles as string[])
        : DEFAULT_TARGETING_DATA.targetTitles,
    targetSkills: Array.isArray(candidateCriteria.skills)
      ? (candidateCriteria.skills as string[])
      : Array.isArray(targetCriteria.targetSkills)
        ? (targetCriteria.targetSkills as string[])
        : DEFAULT_TARGETING_DATA.targetSkills,
    experienceLevels: Array.isArray(candidateCriteria.experienceLevels)
      ? (candidateCriteria.experienceLevels as string[])
      : Array.isArray(candidateCriteria.experience_levels)
        ? (candidateCriteria.experience_levels as string[])
        : DEFAULT_TARGETING_DATA.experienceLevels,
    workAuthorizations: Array.isArray(candidateCriteria.workAuthorizations)
      ? (candidateCriteria.workAuthorizations as WorkAuthorization[])
      : Array.isArray(candidateCriteria.work_authorizations)
        ? (candidateCriteria.work_authorizations as WorkAuthorization[])
        : DEFAULT_TARGETING_DATA.workAuthorizations,
    certifications: Array.isArray(candidateCriteria.certifications)
      ? (candidateCriteria.certifications as string[])
      : DEFAULT_TARGETING_DATA.certifications,
    // Bench-specific
    benchOnly:
      (candidateCriteria.benchOnly as boolean) ??
      (candidateCriteria.bench_only as boolean) ??
      DEFAULT_TARGETING_DATA.benchOnly,
    availableWithinDays:
      typeof candidateCriteria.availableWithinDays === 'number'
        ? candidateCriteria.availableWithinDays
        : typeof candidateCriteria.available_within_days === 'number'
          ? candidateCriteria.available_within_days
          : DEFAULT_TARGETING_DATA.availableWithinDays,
    // Exclusions
    excludeExistingClients:
      (exclusions.existingClients as boolean) ??
      (exclusions.existing_clients as boolean) ??
      DEFAULT_TARGETING_DATA.excludeExistingClients,
    excludeRecentlyContacted:
      typeof exclusions.recentlyContactedDays === 'number'
        ? exclusions.recentlyContactedDays
        : typeof exclusions.recently_contacted_days === 'number'
          ? exclusions.recently_contacted_days
          : DEFAULT_TARGETING_DATA.excludeRecentlyContacted,
    excludeCompetitors:
      (exclusions.competitors as boolean) ??
      DEFAULT_TARGETING_DATA.excludeCompetitors,
    excludeDncList:
      (exclusions.dncList as boolean) ??
      (exclusions.dnc_list as boolean) ??
      DEFAULT_TARGETING_DATA.excludeDncList,
  }
}

// =============================================================================
// CHANNELS SECTION MAPPER
// =============================================================================

/**
 * Map campaign data to ChannelsSectionData
 */
export function mapToChannelsData(
  campaign: Record<string, unknown>
): CampaignChannelsSectionData {
  // Extract channels array
  const channels = Array.isArray(campaign.channels)
    ? (campaign.channels as CampaignChannel[])
    : DEFAULT_CHANNELS_DATA.channels

  // Extract sequences config from JSONB column
  const sequences =
    (campaign.sequences as Record<string, unknown>) || {}

  // Extract email config
  const emailConfig = (sequences.email as Record<string, unknown>) || {}
  const emailSteps = Array.isArray(emailConfig.steps)
    ? emailConfig.steps.length
    : typeof emailConfig.stepCount === 'number'
      ? emailConfig.stepCount
      : DEFAULT_CHANNELS_DATA.emailSteps
  const emailDaysBetween =
    typeof emailConfig.daysBetween === 'number'
      ? emailConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.emailDaysBetween

  // Extract LinkedIn config
  const linkedinConfig = (sequences.linkedin as Record<string, unknown>) || {}
  const linkedinSteps = Array.isArray(linkedinConfig.steps)
    ? linkedinConfig.steps.length
    : typeof linkedinConfig.stepCount === 'number'
      ? linkedinConfig.stepCount
      : DEFAULT_CHANNELS_DATA.linkedinSteps
  const linkedinDaysBetween =
    typeof linkedinConfig.daysBetween === 'number'
      ? linkedinConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.linkedinDaysBetween

  // Extract phone config
  const phoneConfig = (sequences.phone as Record<string, unknown>) || {}
  const phoneSteps = Array.isArray(phoneConfig.steps)
    ? phoneConfig.steps.length
    : typeof phoneConfig.stepCount === 'number'
      ? phoneConfig.stepCount
      : DEFAULT_CHANNELS_DATA.phoneSteps
  const phoneDaysBetween =
    typeof phoneConfig.daysBetween === 'number'
      ? phoneConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.phoneDaysBetween

  // Extract SMS config
  const smsConfig = (sequences.sms as Record<string, unknown>) || {}
  const smsSteps = Array.isArray(smsConfig.steps)
    ? smsConfig.steps.length
    : typeof smsConfig.stepCount === 'number'
      ? smsConfig.stepCount
      : DEFAULT_CHANNELS_DATA.smsSteps
  const smsDaysBetween =
    typeof smsConfig.daysBetween === 'number'
      ? smsConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.smsDaysBetween

  // Extract Direct Mail config
  const directMailConfig = (sequences.direct_mail as Record<string, unknown>) || {}
  const directMailSteps = Array.isArray(directMailConfig.steps)
    ? directMailConfig.steps.length
    : typeof directMailConfig.stepCount === 'number'
      ? directMailConfig.stepCount
      : DEFAULT_CHANNELS_DATA.directMailSteps
  const directMailDaysBetween =
    typeof directMailConfig.daysBetween === 'number'
      ? directMailConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.directMailDaysBetween

  // Extract Event config
  const eventConfig = (sequences.event as Record<string, unknown>) || {}
  const eventSteps = Array.isArray(eventConfig.steps)
    ? eventConfig.steps.length
    : typeof eventConfig.stepCount === 'number'
      ? eventConfig.stepCount
      : DEFAULT_CHANNELS_DATA.eventSteps
  const eventDaysBetween =
    typeof eventConfig.daysBetween === 'number'
      ? eventConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.eventDaysBetween

  // Extract Job Board config
  const jobBoardConfig = (sequences.job_board as Record<string, unknown>) || {}
  const jobBoardSteps = Array.isArray(jobBoardConfig.steps)
    ? jobBoardConfig.steps.length
    : typeof jobBoardConfig.stepCount === 'number'
      ? jobBoardConfig.stepCount
      : DEFAULT_CHANNELS_DATA.jobBoardSteps
  const jobBoardDaysBetween =
    typeof jobBoardConfig.daysBetween === 'number'
      ? jobBoardConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.jobBoardDaysBetween

  // Extract Referral config
  const referralConfig = (sequences.referral as Record<string, unknown>) || {}
  const referralSteps = Array.isArray(referralConfig.steps)
    ? referralConfig.steps.length
    : typeof referralConfig.stepCount === 'number'
      ? referralConfig.stepCount
      : DEFAULT_CHANNELS_DATA.referralSteps
  const referralDaysBetween =
    typeof referralConfig.daysBetween === 'number'
      ? referralConfig.daysBetween
      : DEFAULT_CHANNELS_DATA.referralDaysBetween

  // Extract automation settings
  const stopConditions =
    (sequences.stopConditions as Record<string, unknown>) || {}

  // Extract A/B testing settings
  const abTesting =
    (sequences.abTesting as Record<string, unknown>) ||
    (sequences.ab_testing as Record<string, unknown>) ||
    {}

  return {
    channels,
    sequenceTemplateIds: Array.isArray(campaign.sequenceTemplateIds)
      ? (campaign.sequenceTemplateIds as string[])
      : Array.isArray(campaign.sequence_template_ids)
        ? (campaign.sequence_template_ids as string[])
        : DEFAULT_CHANNELS_DATA.sequenceTemplateIds,
    emailSteps,
    emailDaysBetween,
    linkedinSteps,
    linkedinDaysBetween,
    phoneSteps,
    phoneDaysBetween,
    smsSteps,
    smsDaysBetween,
    directMailSteps,
    directMailDaysBetween,
    eventSteps,
    eventDaysBetween,
    jobBoardSteps,
    jobBoardDaysBetween,
    referralSteps,
    referralDaysBetween,
    stopOnReply:
      (stopConditions.onReply as boolean) ??
      DEFAULT_CHANNELS_DATA.stopOnReply,
    stopOnBooking:
      (stopConditions.onBooking as boolean) ??
      DEFAULT_CHANNELS_DATA.stopOnBooking,
    stopOnApplication:
      (stopConditions.onApplication as boolean) ??
      DEFAULT_CHANNELS_DATA.stopOnApplication,
    dailyLimit:
      typeof sequences.dailyLimit === 'number'
        ? sequences.dailyLimit
        : typeof sequences.daily_limit === 'number'
          ? sequences.daily_limit
          : DEFAULT_CHANNELS_DATA.dailyLimit,
    enableAbTesting:
      (abTesting.enabled as boolean) ?? DEFAULT_CHANNELS_DATA.enableAbTesting,
    abSplitPercentage:
      typeof abTesting.splitPercentage === 'number'
        ? abTesting.splitPercentage
        : typeof abTesting.split_percentage === 'number'
          ? abTesting.split_percentage
          : DEFAULT_CHANNELS_DATA.abSplitPercentage,
  }
}

// =============================================================================
// SCHEDULE SECTION MAPPER
// =============================================================================

/**
 * Map campaign data to ScheduleSectionData
 */
export function mapToScheduleData(
  campaign: Record<string, unknown>
): CampaignScheduleSectionData {
  // Helper to format date string
  const formatDate = (date: unknown): string => {
    if (!date) return ''
    if (typeof date === 'string') {
      // If already ISO format, extract date part
      return date.split('T')[0]
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]
    }
    return ''
  }

  // Extract send window from individual columns or jsonb
  const sendWindow =
    (campaign.sendWindow as Record<string, unknown>) ||
    (campaign.send_window as Record<string, unknown>) ||
    {}

  // Schedule metadata may be stored in sequences until dedicated columns added
  const sequences =
    (campaign.sequences as Record<string, unknown>) || {}

  return {
    startDate:
      formatDate(campaign.startDate) ||
      formatDate(campaign.start_date) ||
      DEFAULT_SCHEDULE_DATA.startDate,
    endDate:
      formatDate(campaign.endDate) ||
      formatDate(campaign.end_date) ||
      DEFAULT_SCHEDULE_DATA.endDate,
    launchImmediately:
      (campaign.launchImmediately as boolean) ??
      (campaign.launch_immediately as boolean) ??
      (sequences.launchImmediately as boolean) ??
      DEFAULT_SCHEDULE_DATA.launchImmediately,
    // Read from individual columns first, then sendWindow jsonb
    sendWindowStart:
      (campaign.send_window_start as string) ||
      (campaign.sendWindowStart as string) ||
      (sendWindow.start as string) ||
      (sendWindow.startTime as string) ||
      DEFAULT_SCHEDULE_DATA.sendWindowStart,
    sendWindowEnd:
      (campaign.send_window_end as string) ||
      (campaign.sendWindowEnd as string) ||
      (sendWindow.end as string) ||
      (sendWindow.endTime as string) ||
      DEFAULT_SCHEDULE_DATA.sendWindowEnd,
    sendDays: Array.isArray(campaign.send_days)
      ? (campaign.send_days as SendDay[])
      : Array.isArray(campaign.sendDays)
        ? (campaign.sendDays as SendDay[])
        : Array.isArray(sendWindow.days)
          ? (sendWindow.days as SendDay[])
          : DEFAULT_SCHEDULE_DATA.sendDays,
    timezone:
      (campaign.timezone as string) ||
      (sendWindow.timezone as string) ||
      DEFAULT_SCHEDULE_DATA.timezone,
    isRecurring:
      (campaign.isRecurring as boolean) ??
      (campaign.is_recurring as boolean) ??
      (sequences.isRecurring as boolean) ??
      DEFAULT_SCHEDULE_DATA.isRecurring,
    recurringInterval:
      (campaign.recurringInterval as CampaignScheduleSectionData['recurringInterval']) ||
      (campaign.recurring_interval as CampaignScheduleSectionData['recurringInterval']) ||
      (sequences.recurringInterval as CampaignScheduleSectionData['recurringInterval']) ||
      DEFAULT_SCHEDULE_DATA.recurringInterval,
  }
}

// =============================================================================
// BUDGET SECTION MAPPER
// =============================================================================

/**
 * Map campaign data to BudgetSectionData
 */
export function mapToBudgetData(
  campaign: Record<string, unknown>
): CampaignBudgetSectionData {
  // Extract budget and targets
  const budget =
    (campaign.budget as Record<string, unknown>) || {}

  // Targets may be stored in sequences until dedicated column added
  const sequences =
    (campaign.sequences as Record<string, unknown>) || {}

  const targets =
    (campaign.targets as Record<string, unknown>) ||
    (campaign.targetMetrics as Record<string, unknown>) ||
    (campaign.target_metrics as Record<string, unknown>) ||
    (sequences.targets as Record<string, unknown>) ||
    {}

  return {
    budgetTotal:
      typeof campaign.budgetTotal === 'number'
        ? String(campaign.budgetTotal)
        : typeof campaign.budget_total === 'number'
          ? String(campaign.budget_total)
          : typeof budget.total === 'number'
            ? String(budget.total)
            : DEFAULT_BUDGET_DATA.budgetTotal,
    budgetCurrency:
      (budget.currency as string) ||
      (campaign.budgetCurrency as string) ||
      (campaign.budget_currency as string) ||
      DEFAULT_BUDGET_DATA.budgetCurrency,
    targetContacts:
      typeof targets.contacts === 'number'
        ? String(targets.contacts)
        : typeof campaign.targetContacts === 'number'
          ? String(campaign.targetContacts)
          : DEFAULT_BUDGET_DATA.targetContacts,
    targetResponses:
      typeof targets.responses === 'number'
        ? String(targets.responses)
        : typeof campaign.targetResponses === 'number'
          ? String(campaign.targetResponses)
          : DEFAULT_BUDGET_DATA.targetResponses,
    targetLeads:
      typeof campaign.targetLeads === 'number'
        ? String(campaign.targetLeads)
        : typeof campaign.target_leads === 'number'
          ? String(campaign.target_leads)
          : typeof targets.leads === 'number'
            ? String(targets.leads)
            : DEFAULT_BUDGET_DATA.targetLeads,
    targetMeetings:
      typeof campaign.targetMeetings === 'number'
        ? String(campaign.targetMeetings)
        : typeof campaign.target_meetings === 'number'
          ? String(campaign.target_meetings)
          : typeof targets.meetings === 'number'
            ? String(targets.meetings)
            : DEFAULT_BUDGET_DATA.targetMeetings,
    targetRevenue:
      typeof campaign.targetRevenue === 'number'
        ? String(campaign.targetRevenue)
        : typeof campaign.target_revenue === 'number'
          ? String(campaign.target_revenue)
          : typeof targets.revenue === 'number'
            ? String(targets.revenue)
            : DEFAULT_BUDGET_DATA.targetRevenue,
    // Staffing-specific targets
    targetSubmissions:
      typeof targets.submissions === 'number'
        ? String(targets.submissions)
        : typeof campaign.targetSubmissions === 'number'
          ? String(campaign.targetSubmissions)
          : DEFAULT_BUDGET_DATA.targetSubmissions,
    targetInterviews:
      typeof targets.interviews === 'number'
        ? String(targets.interviews)
        : typeof campaign.targetInterviews === 'number'
          ? String(campaign.targetInterviews)
          : DEFAULT_BUDGET_DATA.targetInterviews,
    targetPlacements:
      typeof targets.placements === 'number'
        ? String(targets.placements)
        : typeof campaign.targetPlacements === 'number'
          ? String(campaign.targetPlacements)
          : DEFAULT_BUDGET_DATA.targetPlacements,
    // Expected rates
    expectedResponseRate:
      typeof targets.expectedResponseRate === 'number'
        ? String(targets.expectedResponseRate)
        : typeof campaign.expectedResponseRate === 'number'
          ? String(campaign.expectedResponseRate)
          : DEFAULT_BUDGET_DATA.expectedResponseRate,
    expectedConversionRate:
      typeof targets.expectedConversionRate === 'number'
        ? String(targets.expectedConversionRate)
        : typeof campaign.expectedConversionRate === 'number'
          ? String(campaign.expectedConversionRate)
          : DEFAULT_BUDGET_DATA.expectedConversionRate,
  }
}

// =============================================================================
// TEAM SECTION MAPPER
// =============================================================================

/**
 * Map campaign data to TeamSectionData
 */
export function mapToTeamData(
  campaign: Record<string, unknown>
): CampaignTeamSectionData {
  // Team metadata may be stored in sequences until dedicated columns added
  const sequences =
    (campaign.sequences as Record<string, unknown>) || {}

  // Extract team assignments from campaign or sequences
  const teamAssignment =
    (campaign.teamAssignment as Record<string, unknown>) ||
    (campaign.team_assignment as Record<string, unknown>) ||
    (sequences.teamAssignment as Record<string, unknown>) ||
    {}

  // Extract approval settings
  const approval =
    (campaign.approval as Record<string, unknown>) ||
    (teamAssignment.approval as Record<string, unknown>) ||
    {}

  // Extract notification settings from campaign or sequences
  const notifications =
    (campaign.notifications as Record<string, unknown>) ||
    (campaign.notificationSettings as Record<string, unknown>) ||
    (campaign.notification_settings as Record<string, unknown>) ||
    (sequences.notifications as Record<string, unknown>) ||
    {}

  // Check approval_status column for requires approval
  const approvalStatus = campaign.approval_status as string
  const requiresApproval =
    (approval.required as boolean) ??
    (campaign.requiresApproval as boolean) ??
    (campaign.requires_approval as boolean) ??
    (approvalStatus === 'pending' || approvalStatus === 'approved' || approvalStatus === 'rejected') ??
    DEFAULT_TEAM_DATA.requiresApproval

  return {
    ownerId:
      (campaign.ownerId as string) ||
      (campaign.owner_id as string) ||
      (teamAssignment.ownerId as string) ||
      DEFAULT_TEAM_DATA.ownerId,
    teamId:
      (campaign.teamId as string) ||
      (campaign.team_id as string) ||
      (teamAssignment.teamId as string) ||
      (sequences.teamId as string) ||
      DEFAULT_TEAM_DATA.teamId,
    collaboratorIds: Array.isArray(teamAssignment.collaboratorIds)
      ? (teamAssignment.collaboratorIds as string[])
      : Array.isArray(teamAssignment.collaborator_ids)
        ? (teamAssignment.collaborator_ids as string[])
        : Array.isArray(campaign.collaboratorIds)
          ? (campaign.collaboratorIds as string[])
          : DEFAULT_TEAM_DATA.collaboratorIds,
    requiresApproval,
    approverIds: Array.isArray(approval.approverIds)
      ? (approval.approverIds as string[])
      : Array.isArray(approval.approver_ids)
        ? (approval.approver_ids as string[])
        : Array.isArray(campaign.approverIds)
          ? (campaign.approverIds as string[])
          : DEFAULT_TEAM_DATA.approverIds,
    notifyOnResponse:
      (notifications.onResponse as boolean) ??
      (notifications.on_response as boolean) ??
      DEFAULT_TEAM_DATA.notifyOnResponse,
    notifyOnConversion:
      (notifications.onConversion as boolean) ??
      (notifications.on_conversion as boolean) ??
      DEFAULT_TEAM_DATA.notifyOnConversion,
    notifyOnCompletion:
      (notifications.onCompletion as boolean) ??
      (notifications.on_completion as boolean) ??
      DEFAULT_TEAM_DATA.notifyOnCompletion,
  }
}

// =============================================================================
// COMPLIANCE SECTION MAPPER
// =============================================================================

/**
 * Map campaign data to ComplianceSectionData
 */
export function mapToComplianceData(
  campaign: Record<string, unknown>
): CampaignComplianceSectionData {
  // Extract compliance settings from JSONB column
  const complianceSettings =
    (campaign.complianceSettings as Record<string, unknown>) ||
    (campaign.compliance_settings as Record<string, unknown>) ||
    {}

  // Extract email settings
  const emailSettings =
    (complianceSettings.email as Record<string, unknown>) || {}

  // Extract DNC settings
  const dncSettings =
    (complianceSettings.dnc as Record<string, unknown>) ||
    (complianceSettings.doNotContact as Record<string, unknown>) ||
    {}

  // Extract data handling settings
  const dataHandling =
    (complianceSettings.dataHandling as Record<string, unknown>) ||
    (complianceSettings.data_handling as Record<string, unknown>) ||
    {}

  return {
    gdpr:
      (complianceSettings.gdpr as boolean) ??
      DEFAULT_COMPLIANCE_DATA.gdpr,
    canSpam:
      (complianceSettings.canSpam as boolean) ??
      (complianceSettings.can_spam as boolean) ??
      DEFAULT_COMPLIANCE_DATA.canSpam,
    casl:
      (complianceSettings.casl as boolean) ??
      DEFAULT_COMPLIANCE_DATA.casl,
    ccpa:
      (complianceSettings.ccpa as boolean) ??
      DEFAULT_COMPLIANCE_DATA.ccpa,
    includeUnsubscribe:
      (complianceSettings.includeUnsubscribe as boolean) ??
      (complianceSettings.include_unsubscribe as boolean) ??
      (emailSettings.includeUnsubscribe as boolean) ??
      DEFAULT_COMPLIANCE_DATA.includeUnsubscribe,
    includePhysicalAddress:
      (complianceSettings.includePhysicalAddress as boolean) ??
      (complianceSettings.include_physical_address as boolean) ??
      (emailSettings.includePhysicalAddress as boolean) ??
      DEFAULT_COMPLIANCE_DATA.includePhysicalAddress,
    respectDncList:
      (dncSettings.respectList as boolean) ??
      (complianceSettings.respectDncList as boolean) ??
      DEFAULT_COMPLIANCE_DATA.respectDncList,
    respectPreviousOptOuts:
      (dncSettings.respectOptOuts as boolean) ??
      (complianceSettings.respectPreviousOptOuts as boolean) ??
      DEFAULT_COMPLIANCE_DATA.respectPreviousOptOuts,
    collectConsent:
      (dataHandling.collectConsent as boolean) ??
      (complianceSettings.collectConsent as boolean) ??
      DEFAULT_COMPLIANCE_DATA.collectConsent,
    dataRetentionDays:
      typeof dataHandling.retentionDays === 'number'
        ? dataHandling.retentionDays
        : typeof complianceSettings.dataRetentionDays === 'number'
          ? complianceSettings.dataRetentionDays
          : DEFAULT_COMPLIANCE_DATA.dataRetentionDays,
  }
}

// =============================================================================
// REVERSE MAPPERS (Section Data → API Format)
// =============================================================================

/**
 * Convert SetupSectionData to API mutation format
 */
export function setupDataToApi(data: CampaignSetupSectionData) {
  return {
    name: data.name,
    campaignType: data.campaignType || undefined,
    goal: data.goal || undefined,
    priority: data.priority,
    description: data.description || undefined,
    tags: data.tags.length > 0 ? data.tags : undefined,
  }
}

/**
 * Convert TargetingSectionData to API mutation format
 */
export function targetingDataToApi(data: CampaignTargetingSectionData) {
  return {
    targetCriteria: {
      audienceSource: data.audienceSource || undefined,
      // Client targeting
      industries: data.industries.length > 0 ? data.industries : undefined,
      companySizes: data.companySizes.length > 0 ? data.companySizes : undefined,
      regions: data.regions.length > 0 ? data.regions : undefined,
      clientTiers: data.clientTiers.length > 0 ? data.clientTiers : undefined,
      serviceTypes: data.serviceTypes.length > 0 ? data.serviceTypes : undefined,
      targetTitles: data.targetTitles.length > 0 ? data.targetTitles : undefined,
      // Candidate targeting
      candidateCriteria: {
        skills: data.targetSkills.length > 0 ? data.targetSkills : undefined,
        experienceLevels: data.experienceLevels.length > 0 ? data.experienceLevels : undefined,
        workAuthorizations: data.workAuthorizations.length > 0 ? data.workAuthorizations : undefined,
        certifications: data.certifications.length > 0 ? data.certifications : undefined,
        benchOnly: data.benchOnly,
        availableWithinDays: data.availableWithinDays,
      },
      // Exclusions
      exclusions: {
        existingClients: data.excludeExistingClients,
        recentlyContactedDays: data.excludeRecentlyContacted,
        competitors: data.excludeCompetitors,
        dncList: data.excludeDncList,
      },
    },
  }
}

/**
 * Convert ChannelsSectionData to API mutation format
 */
export function channelsDataToApi(data: CampaignChannelsSectionData) {
  const sequences: Record<string, unknown> = {
    stopConditions: {
      onReply: data.stopOnReply,
      onBooking: data.stopOnBooking,
      onApplication: data.stopOnApplication,
    },
    dailyLimit: data.dailyLimit,
    abTesting: {
      enabled: data.enableAbTesting,
      splitPercentage: data.abSplitPercentage,
    },
  }

  // Only add channel configs if not using templates
  if (data.sequenceTemplateIds.length === 0) {
    if (data.channels.includes('email')) {
      sequences.email = {
        stepCount: data.emailSteps,
        daysBetween: data.emailDaysBetween,
      }
    }
    if (data.channels.includes('linkedin')) {
      sequences.linkedin = {
        stepCount: data.linkedinSteps,
        daysBetween: data.linkedinDaysBetween,
      }
    }
    if (data.channels.includes('phone')) {
      sequences.phone = {
        stepCount: data.phoneSteps,
        daysBetween: data.phoneDaysBetween,
      }
    }
  }

  return {
    channels: data.channels,
    sequenceTemplateIds:
      data.sequenceTemplateIds.length > 0 ? data.sequenceTemplateIds : undefined,
    sequences,
  }
}

/**
 * Convert ScheduleSectionData to API mutation format
 */
export function scheduleDataToApi(data: CampaignScheduleSectionData) {
  return {
    startDate: data.startDate || undefined,
    endDate: data.endDate || undefined,
    launchImmediately: data.launchImmediately,
    sendWindow: {
      start: data.sendWindowStart,
      end: data.sendWindowEnd,
      days: data.sendDays,
      timezone: data.timezone,
    },
    isRecurring: data.isRecurring,
    recurringInterval: data.recurringInterval || undefined,
  }
}

/**
 * Convert BudgetSectionData to API mutation format
 */
export function budgetDataToApi(data: CampaignBudgetSectionData) {
  return {
    budgetTotal: data.budgetTotal ? parseFloat(data.budgetTotal) : undefined,
    budgetCurrency: data.budgetCurrency,
    targets: {
      contacts: data.targetContacts ? parseInt(data.targetContacts, 10) : undefined,
      responses: data.targetResponses ? parseInt(data.targetResponses, 10) : undefined,
      leads: data.targetLeads ? parseInt(data.targetLeads, 10) : undefined,
      meetings: data.targetMeetings ? parseInt(data.targetMeetings, 10) : undefined,
      revenue: data.targetRevenue ? parseFloat(data.targetRevenue) : undefined,
      // Staffing-specific
      submissions: data.targetSubmissions ? parseInt(data.targetSubmissions, 10) : undefined,
      interviews: data.targetInterviews ? parseInt(data.targetInterviews, 10) : undefined,
      placements: data.targetPlacements ? parseInt(data.targetPlacements, 10) : undefined,
      // Rates
      expectedResponseRate: data.expectedResponseRate ? parseFloat(data.expectedResponseRate) : undefined,
      expectedConversionRate: data.expectedConversionRate ? parseFloat(data.expectedConversionRate) : undefined,
    },
  }
}

/**
 * Convert TeamSectionData to API mutation format
 */
export function teamDataToApi(data: CampaignTeamSectionData) {
  return {
    ownerId: data.ownerId || undefined,
    teamId: data.teamId || undefined,
    teamAssignment: {
      collaboratorIds: data.collaboratorIds.length > 0 ? data.collaboratorIds : undefined,
    },
    approval: {
      required: data.requiresApproval,
      approverIds: data.approverIds.length > 0 ? data.approverIds : undefined,
    },
    notifications: {
      onResponse: data.notifyOnResponse,
      onConversion: data.notifyOnConversion,
      onCompletion: data.notifyOnCompletion,
    },
  }
}

/**
 * Convert ComplianceSectionData to API mutation format
 */
export function complianceDataToApi(data: CampaignComplianceSectionData) {
  return {
    complianceSettings: {
      gdpr: data.gdpr,
      canSpam: data.canSpam,
      casl: data.casl,
      ccpa: data.ccpa,
      email: {
        includeUnsubscribe: data.includeUnsubscribe,
        includePhysicalAddress: data.includePhysicalAddress,
      },
      dnc: {
        respectList: data.respectDncList,
        respectOptOuts: data.respectPreviousOptOuts,
      },
      dataHandling: {
        collectConsent: data.collectConsent,
        retentionDays: data.dataRetentionDays,
      },
    },
  }
}
