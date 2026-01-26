/**
 * Deal Data Mappers - Transform between API and UI data structures
 *
 * These functions handle:
 * - snake_case ↔ camelCase conversion
 * - Null/undefined normalization
 * - Nested object transformation
 * - Default value population
 */

import type {
  DetailsSectionData,
  StakeholdersSectionData,
  TimelineSectionData,
  CompetitorsSectionData,
  ProposalSectionData,
  TeamSectionData,
  DealStakeholder,
  DealRoleBreakdown,
  DealBillingContact,
  DEFAULT_DETAILS_DATA,
  DEFAULT_STAKEHOLDERS_DATA,
  DEFAULT_TIMELINE_DATA,
  DEFAULT_COMPETITORS_DATA,
  DEFAULT_PROPOSAL_DATA,
  DEFAULT_TEAM_DATA,
  DEFAULT_BILLING_CONTACT,
} from './types'

// ============ DETAILS SECTION MAPPER ============

/**
 * Map API deal data to Details section data
 */
export function mapToDetailsData(deal: Record<string, unknown>): DetailsSectionData {
  return {
    title: (deal.title as string) ?? '',
    description: (deal.description as string) ?? '',
    value: (deal.value as number) ?? 0,
    probability: (deal.probability as number) ?? 0,
    valueBasis: (deal.value_basis as string) ?? (deal.valueBasis as string) ?? '',
    currency: (deal.currency as string) ?? '',
    stage: (deal.stage as DetailsSectionData['stage']) ?? 'discovery',
    expectedCloseDate: (deal.expected_close_date as string) ?? (deal.expectedCloseDate as string) ?? null,
    estimatedPlacements: (deal.estimated_placements as number) ?? (deal.estimatedPlacements as number) ?? null,
    avgBillRate: (deal.avg_bill_rate as number) ?? (deal.avgBillRate as number) ?? null,
    contractLengthMonths: (deal.contract_length_months as number) ?? (deal.contractLengthMonths as number) ?? null,
    hiringNeeds: (deal.hiring_needs as string) ?? (deal.hiringNeeds as string) ?? '',
    servicesRequired: (deal.services_required as string[]) ?? (deal.servicesRequired as string[]) ?? [],
    healthStatus: (deal.health_status as string) ?? (deal.healthStatus as string) ?? '',
  }
}

/**
 * Map Details section data to API format
 */
export function mapDetailsToApi(data: DetailsSectionData): Record<string, unknown> {
  return {
    title: data.title,
    description: data.description || null,
    value: data.value,
    probability: data.probability,
    value_basis: data.valueBasis,
    currency: data.currency,
    stage: data.stage,
    expected_close_date: data.expectedCloseDate || null,
    estimated_placements: data.estimatedPlacements || null,
    avg_bill_rate: data.avgBillRate || null,
    contract_length_months: data.contractLengthMonths || null,
    hiring_needs: data.hiringNeeds || null,
    services_required: data.servicesRequired.length > 0 ? data.servicesRequired : null,
    health_status: data.healthStatus,
  }
}

// ============ STAKEHOLDERS SECTION MAPPER ============

/**
 * Map API stakeholder data to section format
 */
export function mapToStakeholdersData(stakeholders: unknown[]): StakeholdersSectionData {
  const mapped: DealStakeholder[] = (stakeholders ?? []).map((s: unknown) => {
    const stakeholder = s as Record<string, unknown>
    return {
      id: (stakeholder.id as string) ?? crypto.randomUUID(),
      contactId: (stakeholder.contact_id as string) ?? (stakeholder.contactId as string) ?? null,
      name: (stakeholder.name as string) ?? '',
      title: (stakeholder.title as string) ?? '',
      email: (stakeholder.email as string) ?? '',
      phone: (stakeholder.phone as string) ?? '',
      role: (stakeholder.role as string) ?? '',
      influenceLevel: (stakeholder.influence_level as string) ?? (stakeholder.influenceLevel as string) ?? '',
      sentiment: (stakeholder.sentiment as string) ?? '',
      engagementNotes: (stakeholder.engagement_notes as string) ?? (stakeholder.engagementNotes as string) ?? '',
      isPrimary: (stakeholder.is_primary as boolean) ?? (stakeholder.isPrimary as boolean) ?? false,
      isActive: (stakeholder.is_active as boolean) ?? (stakeholder.isActive as boolean) ?? true,
    }
  })

  return { stakeholders: mapped }
}

/**
 * API Stakeholder type for mutation
 */
interface ApiStakeholder {
  id?: string
  contact_id?: string | null
  name: string
  title?: string | null
  email?: string | null
  phone?: string | null
  role: string
  influence_level?: string
  sentiment?: string
  engagement_notes?: string | null
  is_primary?: boolean
  is_active?: boolean
}

/**
 * Map Stakeholders section data to API format
 */
export function mapStakeholdersToApi(data: StakeholdersSectionData): ApiStakeholder[] {
  return data.stakeholders.map((s) => ({
    id: s.id,
    contact_id: s.contactId || null,
    name: s.name,
    title: s.title || null,
    email: s.email || null,
    phone: s.phone || null,
    role: s.role,
    influence_level: s.influenceLevel,
    sentiment: s.sentiment,
    engagement_notes: s.engagementNotes || null,
    is_primary: s.isPrimary,
    is_active: s.isActive,
  }))
}

// ============ TIMELINE SECTION MAPPER ============

/**
 * Map API deal data to Timeline section data
 */
export function mapToTimelineData(deal: Record<string, unknown>): TimelineSectionData {
  return {
    // Note: Database columns are next_action/next_action_date, not next_step
    nextStep: (deal.next_action as string) ?? (deal.nextStep as string) ?? '',
    nextStepDate: (deal.next_action_date as string) ?? (deal.nextStepDate as string) ?? null,
    expectedCloseDate: (deal.expected_close_date as string) ?? (deal.expectedCloseDate as string) ?? null,
    actualCloseDate: (deal.actual_close_date as string) ?? (deal.actualCloseDate as string) ?? null,
    contractSignedDate: (deal.contract_signed_date as string) ?? (deal.contractSignedDate as string) ?? null,
    contractStartDate: (deal.contract_start_date as string) ?? (deal.contractStartDate as string) ?? null,
    milestones: [],
  }
}

/**
 * Map Timeline section data to API format
 */
export function mapTimelineToApi(data: TimelineSectionData): Record<string, unknown> {
  return {
    // Note: Database columns are next_action/next_action_date, not next_step
    next_action: data.nextStep || null,
    next_action_date: data.nextStepDate || null,
    expected_close_date: data.expectedCloseDate || null,
    actual_close_date: data.actualCloseDate || null,
    contract_signed_date: data.contractSignedDate || null,
    contract_start_date: data.contractStartDate || null,
  }
}

// ============ COMPETITORS SECTION MAPPER ============

/**
 * Map API deal data to Competitors section data
 */
export function mapToCompetitorsData(deal: Record<string, unknown>): CompetitorsSectionData {
  return {
    competitors: (deal.competitors as string[]) ?? [],
    competitiveAdvantage: (deal.competitive_advantage as string) ?? (deal.competitiveAdvantage as string) ?? '',
    winReason: (deal.win_reason as string) ?? (deal.winReason as string) ?? '',
    winDetails: (deal.win_details as string) ?? (deal.winDetails as string) ?? '',
    competitorsBeat: (deal.competitors_beat as string[]) ?? (deal.competitorsBeat as string[]) ?? [],
    lossReason: (deal.loss_reason as string) ?? (deal.lossReason as string) ?? '',
    lossReasonCategory: (deal.loss_reason_category as string) ?? (deal.lossReasonCategory as string) ?? '',
    lossDetails: (deal.loss_details as string) ?? (deal.lossDetails as string) ?? '',
    competitorWon: (deal.competitor_won as string) ?? (deal.competitorWon as string) ?? '',
    competitorPrice: (deal.competitor_price as number) ?? (deal.competitorPrice as number) ?? null,
    futurePotential: (deal.future_potential as string) ?? (deal.futurePotential as string) ?? '',
    reengagementDate: (deal.reengagement_date as string) ?? (deal.reengagementDate as string) ?? null,
    lessonsLearned: (deal.lessons_learned as string) ?? (deal.lessonsLearned as string) ?? '',
  }
}

/**
 * Map Competitors section data to API format
 */
export function mapCompetitorsToApi(data: CompetitorsSectionData): Record<string, unknown> {
  return {
    competitors: data.competitors.length > 0 ? data.competitors : null,
    competitive_advantage: data.competitiveAdvantage || null,
    win_reason: data.winReason || null,
    win_details: data.winDetails || null,
    competitors_beat: data.competitorsBeat.length > 0 ? data.competitorsBeat : null,
    loss_reason: data.lossReason || null,
    loss_reason_category: data.lossReasonCategory || null,
    loss_details: data.lossDetails || null,
    competitor_won: data.competitorWon || null,
    competitor_price: data.competitorPrice || null,
    future_potential: data.futurePotential || null,
    reengagement_date: data.reengagementDate || null,
    lessons_learned: data.lessonsLearned || null,
  }
}

// ============ PROPOSAL SECTION MAPPER ============

/**
 * Map API deal data to Proposal section data
 */
export function mapToProposalData(deal: Record<string, unknown>): ProposalSectionData {
  // Map roles breakdown
  const rolesRaw = (deal.roles_breakdown as unknown[]) ?? (deal.rolesBreakdown as unknown[]) ?? []
  const rolesBreakdown: DealRoleBreakdown[] = rolesRaw.map((r: unknown) => {
    const role = r as Record<string, unknown>
    return {
      id: (role.id as string) ?? crypto.randomUUID(),
      title: (role.title as string) ?? '',
      count: (role.count as number) ?? 0,
      billRate: (role.bill_rate as number) ?? (role.billRate as number) ?? null,
      startDate: (role.start_date as string) ?? (role.startDate as string) ?? null,
    }
  })

  // Map billing contact
  const billingRaw = (deal.billing_contact as Record<string, unknown>) ?? (deal.billingContact as Record<string, unknown>)
  const billingContact: DealBillingContact = billingRaw
    ? {
        name: (billingRaw.name as string) ?? '',
        email: (billingRaw.email as string) ?? '',
        phone: (billingRaw.phone as string) ?? '',
        addressLine1: (billingRaw.addressLine1 as string) ?? (billingRaw.address_line_1 as string) ?? '',
        addressLine2: (billingRaw.addressLine2 as string) ?? (billingRaw.address_line_2 as string) ?? '',
        city: (billingRaw.city as string) ?? '',
        stateProvince: (billingRaw.stateProvince as string) ?? (billingRaw.state_province as string) ?? '',
        postalCode: (billingRaw.postalCode as string) ?? (billingRaw.postal_code as string) ?? '',
        countryCode: (billingRaw.countryCode as string) ?? (billingRaw.country_code as string) ?? 'US',
      }
    : { name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', stateProvince: '', postalCode: '', countryCode: 'US' }

  // Map confirmed roles
  const confirmedRaw = (deal.confirmed_roles as unknown[]) ?? (deal.confirmedRoles as unknown[]) ?? []
  const confirmedRoles = confirmedRaw.map((r: unknown) => {
    const role = r as Record<string, unknown>
    return {
      id: (role.id as string) ?? crypto.randomUUID(),
      title: (role.title as string) ?? '',
      count: (role.count as number) ?? 0,
      billRate: (role.bill_rate as number) ?? (role.billRate as number) ?? 0,
      startDate: (role.start_date as string) ?? (role.startDate as string) ?? null,
    }
  })

  return {
    rolesBreakdown,
    contractType: (deal.contract_type as string) ?? (deal.contractType as string) ?? '',
    contractDurationMonths: (deal.contract_duration_months as number) ?? (deal.contractDurationMonths as number) ?? null,
    paymentTerms: (deal.payment_terms as string) ?? (deal.paymentTerms as string) ?? '',
    billingFrequency: (deal.billing_frequency as string) ?? (deal.billingFrequency as string) ?? '',
    billingContact,
    confirmedRoles,
  }
}

/**
 * Map Proposal section data to API format
 */
export function mapProposalToApi(data: ProposalSectionData): Record<string, unknown> {
  return {
    roles_breakdown: data.rolesBreakdown.length > 0
      ? data.rolesBreakdown.map((r) => ({
          title: r.title,
          count: r.count,
          bill_rate: r.billRate,
          start_date: r.startDate,
        }))
      : null,
    contract_type: data.contractType || null,
    contract_duration_months: data.contractDurationMonths || null,
    payment_terms: data.paymentTerms || null,
    billing_frequency: data.billingFrequency || null,
    billing_contact: data.billingContact.name
      ? {
          name: data.billingContact.name,
          email: data.billingContact.email,
          phone: data.billingContact.phone,
          address_line_1: data.billingContact.addressLine1,
          address_line_2: data.billingContact.addressLine2,
          city: data.billingContact.city,
          state_province: data.billingContact.stateProvince,
          postal_code: data.billingContact.postalCode,
          country_code: data.billingContact.countryCode,
        }
      : null,
    confirmed_roles: data.confirmedRoles.length > 0
      ? data.confirmedRoles.map((r) => ({
          title: r.title,
          count: r.count,
          bill_rate: r.billRate,
          start_date: r.startDate,
        }))
      : null,
  }
}

// ============ TEAM SECTION MAPPER ============

/**
 * Map API deal data to Team section data
 */
export function mapToTeamData(deal: Record<string, unknown>): TeamSectionData {
  const owner = deal.owner as Record<string, unknown> | null
  const podManager = (deal.pod_manager ?? deal.podManager) as Record<string, unknown> | null
  const secondaryOwner = (deal.secondary_owner ?? deal.secondaryOwner) as Record<string, unknown> | null

  return {
    ownerId: (deal.owner_id as string) ?? (owner?.id as string) ?? '',
    ownerName: (owner?.full_name as string) ?? (owner?.fullName as string) ?? '',
    podManagerId: (deal.pod_manager_id as string) ?? (podManager?.id as string) ?? '',
    podManagerName: (podManager?.full_name as string) ?? (podManager?.fullName as string) ?? '',
    secondaryOwnerId: (deal.secondary_owner_id as string) ?? (secondaryOwner?.id as string) ?? '',
    secondaryOwnerName: (secondaryOwner?.full_name as string) ?? (secondaryOwner?.fullName as string) ?? '',
  }
}

/**
 * Map Team section data to API format
 */
export function mapTeamToApi(data: TeamSectionData): Record<string, unknown> {
  return {
    owner_id: data.ownerId || null,
    pod_manager_id: data.podManagerId || null,
    secondary_owner_id: data.secondaryOwnerId || null,
  }
}

// ============ FULL DEAL MAPPER ============

/**
 * Map full deal data to all section data
 */
export function mapToAllSections(deal: Record<string, unknown>, stakeholders: unknown[] = []) {
  return {
    details: mapToDetailsData(deal),
    stakeholders: mapToStakeholdersData(stakeholders),
    timeline: mapToTimelineData(deal),
    competitors: mapToCompetitorsData(deal),
    proposal: mapToProposalData(deal),
    team: mapToTeamData(deal),
  }
}

/**
 * Merge all section data to API format for saving
 */
export function mergeAllSectionsToApi(sections: {
  details: DetailsSectionData
  stakeholders: StakeholdersSectionData
  timeline: TimelineSectionData
  competitors: CompetitorsSectionData
  proposal: ProposalSectionData
  team: TeamSectionData
}): Record<string, unknown> {
  return {
    ...mapDetailsToApi(sections.details),
    ...mapTimelineToApi(sections.timeline),
    ...mapCompetitorsToApi(sections.competitors),
    ...mapProposalToApi(sections.proposal),
    ...mapTeamToApi(sections.team),
    // Stakeholders are saved separately via junction table
  }
}
