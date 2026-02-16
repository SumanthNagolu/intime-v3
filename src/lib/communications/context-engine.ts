/**
 * Communication Context Engine
 * Phase 2: Communications
 *
 * Auto-links emails and calendar events to InTime entities
 * based on email addresses, domains, names, and content.
 */

import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// Types
// ============================================

export type LinkConfidence = 'high' | 'medium' | 'low'

export interface EntityMatch {
  entityType: string
  entityId: string
  confidence: LinkConfidence
  reason: string
  matchDetails: Record<string, unknown>
}

export interface EmailParticipant {
  email: string
  name?: string
}

export interface ContextLinkResult {
  matches: EntityMatch[]
  suggestions: EntityMatch[]
  errors: string[]
}

// ============================================
// Entity Matchers
// ============================================

/**
 * Find contacts by email address (high confidence)
 */
async function findContactsByEmail(
  orgId: string,
  emails: string[]
): Promise<EntityMatch[]> {
  if (emails.length === 0) return []

  const adminClient = getAdminClient()
  const { data: contacts } = await adminClient
    .from('contacts')
    .select('id, email, first_name, last_name')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .in('email', emails)

  return (contacts ?? []).map((contact) => ({
    entityType: 'contact',
    entityId: contact.id,
    confidence: 'high' as LinkConfidence,
    reason: 'email_match',
    matchDetails: {
      matchedEmail: contact.email,
      contactName: `${contact.first_name} ${contact.last_name}`.trim(),
    },
  }))
}

/**
 * Find candidates by email address (high confidence)
 */
async function findCandidatesByEmail(
  orgId: string,
  emails: string[]
): Promise<EntityMatch[]> {
  if (emails.length === 0) return []

  const adminClient = getAdminClient()
  const { data: candidates } = await adminClient
    .from('candidates')
    .select('id, email, first_name, last_name')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .in('email', emails)

  return (candidates ?? []).map((candidate) => ({
    entityType: 'candidate',
    entityId: candidate.id,
    confidence: 'high' as LinkConfidence,
    reason: 'email_match',
    matchDetails: {
      matchedEmail: candidate.email,
      candidateName: `${candidate.first_name} ${candidate.last_name}`.trim(),
    },
  }))
}

/**
 * Find accounts by email domain (medium confidence)
 */
async function findAccountsByDomain(
  orgId: string,
  domains: string[]
): Promise<EntityMatch[]> {
  if (domains.length === 0) return []

  // Filter out common email providers
  const commonProviders = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'protonmail.com', 'mail.com',
  ]
  const corporateDomains = domains.filter((d) => !commonProviders.includes(d.toLowerCase()))

  if (corporateDomains.length === 0) return []

  const adminClient = getAdminClient()
  const { data: accounts } = await adminClient
    .from('accounts')
    .select('id, name, website')
    .eq('org_id', orgId)
    .is('deleted_at', null)

  // Match accounts by website domain
  const matches: EntityMatch[] = []
  for (const account of accounts ?? []) {
    if (!account.website) continue

    try {
      const websiteUrl = new URL(
        account.website.startsWith('http') ? account.website : `https://${account.website}`
      )
      const accountDomain = websiteUrl.hostname.replace(/^www\./, '')

      if (corporateDomains.some((d) => d.toLowerCase() === accountDomain.toLowerCase())) {
        matches.push({
          entityType: 'account',
          entityId: account.id,
          confidence: 'medium',
          reason: 'domain_match',
          matchDetails: {
            matchedDomain: accountDomain,
            accountName: account.name,
          },
        })
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return matches
}

/**
 * Find jobs by account (when account is matched, suggest related jobs)
 */
async function findJobsByAccount(
  orgId: string,
  accountIds: string[]
): Promise<EntityMatch[]> {
  if (accountIds.length === 0) return []

  const adminClient = getAdminClient()
  const { data: jobs } = await adminClient
    .from('jobs')
    .select('id, title, account_id')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .in('account_id', accountIds)
    .in('status', ['open', 'on_hold'])

  return (jobs ?? []).map((job) => ({
    entityType: 'job',
    entityId: job.id,
    confidence: 'low' as LinkConfidence,
    reason: 'account_job',
    matchDetails: {
      jobTitle: job.title,
      accountId: job.account_id,
    },
  }))
}

/**
 * Find submissions by candidate (when candidate is matched)
 */
async function findSubmissionsByCandidate(
  orgId: string,
  candidateIds: string[]
): Promise<EntityMatch[]> {
  if (candidateIds.length === 0) return []

  const adminClient = getAdminClient()
  const { data: submissions } = await adminClient
    .from('submissions')
    .select('id, job_id, candidate_id, status')
    .eq('org_id', orgId)
    .in('candidate_id', candidateIds)
    .not('status', 'in', '(rejected,withdrawn)')

  return (submissions ?? []).map((sub) => ({
    entityType: 'submission',
    entityId: sub.id,
    confidence: 'medium' as LinkConfidence,
    reason: 'candidate_submission',
    matchDetails: {
      submissionStatus: sub.status,
      jobId: sub.job_id,
    },
  }))
}

/**
 * Find entities by name matching in content (low confidence)
 */
async function findEntitiesByNameInContent(
  orgId: string,
  content: string
): Promise<EntityMatch[]> {
  if (!content || content.length < 10) return []

  const adminClient = getAdminClient()
  const matches: EntityMatch[] = []

  // Get active candidates to check for name mentions
  const { data: candidates } = await adminClient
    .from('candidates')
    .select('id, first_name, last_name')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .limit(500) // Limit for performance

  const contentLower = content.toLowerCase()

  for (const candidate of candidates ?? []) {
    const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase()
    if (fullName.length > 5 && contentLower.includes(fullName)) {
      matches.push({
        entityType: 'candidate',
        entityId: candidate.id,
        confidence: 'low',
        reason: 'name_in_content',
        matchDetails: {
          matchedName: `${candidate.first_name} ${candidate.last_name}`,
        },
      })
    }
  }

  return matches.slice(0, 5) // Limit suggestions
}

// ============================================
// Main Context Engine Functions
// ============================================

/**
 * Extract email addresses and domains from participants
 */
function extractEmailInfo(participants: EmailParticipant[]): {
  emails: string[]
  domains: string[]
} {
  const emails = participants.map((p) => p.email.toLowerCase())
  const domains = [...new Set(emails.map((e) => e.split('@')[1]))]
  return { emails, domains }
}

/**
 * Analyze email and find entity matches
 */
export async function analyzeEmailForEntities(
  orgId: string,
  options: {
    fromEmail: string
    fromName?: string
    toEmails: EmailParticipant[]
    ccEmails?: EmailParticipant[]
    subject?: string
    bodyText?: string
  }
): Promise<ContextLinkResult> {
  const errors: string[] = []

  try {
    // Collect all participants
    const allParticipants: EmailParticipant[] = [
      { email: options.fromEmail, name: options.fromName },
      ...options.toEmails,
      ...(options.ccEmails ?? []),
    ]

    const { emails, domains } = extractEmailInfo(allParticipants)

    // Run matchers in parallel
    const [
      contactMatches,
      candidateMatches,
      accountMatches,
    ] = await Promise.all([
      findContactsByEmail(orgId, emails).catch((e) => {
        errors.push(`Contact matching failed: ${e.message}`)
        return []
      }),
      findCandidatesByEmail(orgId, emails).catch((e) => {
        errors.push(`Candidate matching failed: ${e.message}`)
        return []
      }),
      findAccountsByDomain(orgId, domains).catch((e) => {
        errors.push(`Account matching failed: ${e.message}`)
        return []
      }),
    ])

    // Get related entities
    const matchedAccountIds = accountMatches.map((m) => m.entityId)
    const matchedCandidateIds = candidateMatches.map((m) => m.entityId)

    const [jobSuggestions, submissionSuggestions] = await Promise.all([
      findJobsByAccount(orgId, matchedAccountIds).catch(() => []),
      findSubmissionsByCandidate(orgId, matchedCandidateIds).catch(() => []),
    ])

    // Content-based suggestions (if we have body text)
    let contentSuggestions: EntityMatch[] = []
    if (options.bodyText) {
      contentSuggestions = await findEntitiesByNameInContent(orgId, options.bodyText).catch(() => [])
    }

    // Deduplicate and categorize
    const highConfidenceMatches = [
      ...contactMatches,
      ...candidateMatches,
    ].filter((m) => m.confidence === 'high')

    const mediumConfidenceMatches = [
      ...accountMatches,
      ...submissionSuggestions,
    ].filter((m) => m.confidence === 'medium')

    // Suggestions are lower confidence matches
    const suggestions = [
      ...mediumConfidenceMatches.filter((m) => m.confidence !== 'high'),
      ...jobSuggestions,
      ...contentSuggestions,
    ]

    // Deduplicate by entity type + id
    const seen = new Set<string>()
    const deduplicatedMatches = [...highConfidenceMatches, ...mediumConfidenceMatches]
      .filter((m) => {
        const key = `${m.entityType}:${m.entityId}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

    const deduplicatedSuggestions = suggestions.filter((m) => {
      const key = `${m.entityType}:${m.entityId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return {
      matches: deduplicatedMatches,
      suggestions: deduplicatedSuggestions,
      errors,
    }
  } catch (error) {
    return {
      matches: [],
      suggestions: [],
      errors: [`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}

/**
 * Analyze calendar event and find entity matches
 */
export async function analyzeCalendarEventForEntities(
  orgId: string,
  options: {
    organizerEmail: string
    organizerName?: string
    attendees: EmailParticipant[]
    title?: string
    description?: string
  }
): Promise<ContextLinkResult> {
  const errors: string[] = []

  try {
    // Similar to email analysis
    const allParticipants: EmailParticipant[] = [
      { email: options.organizerEmail, name: options.organizerName },
      ...options.attendees,
    ]

    const { emails, domains } = extractEmailInfo(allParticipants)

    const [
      contactMatches,
      candidateMatches,
      accountMatches,
    ] = await Promise.all([
      findContactsByEmail(orgId, emails).catch((e) => {
        errors.push(`Contact matching failed: ${e.message}`)
        return []
      }),
      findCandidatesByEmail(orgId, emails).catch((e) => {
        errors.push(`Candidate matching failed: ${e.message}`)
        return []
      }),
      findAccountsByDomain(orgId, domains).catch((e) => {
        errors.push(`Account matching failed: ${e.message}`)
        return []
      }),
    ])

    // Get related entities
    const matchedAccountIds = accountMatches.map((m) => m.entityId)
    const matchedCandidateIds = candidateMatches.map((m) => m.entityId)

    const [jobSuggestions, submissionSuggestions] = await Promise.all([
      findJobsByAccount(orgId, matchedAccountIds).catch(() => []),
      findSubmissionsByCandidate(orgId, matchedCandidateIds).catch(() => []),
    ])

    // Check title/description for interview keywords
    const titleLower = (options.title ?? '').toLowerCase()
    const isInterview = titleLower.includes('interview') ||
      titleLower.includes('screen') ||
      titleLower.includes('call with')

    // If it looks like an interview, prioritize candidate and submission matches
    const matches: EntityMatch[] = []
    const suggestions: EntityMatch[] = []

    // High confidence: direct email matches
    matches.push(...contactMatches)
    matches.push(...candidateMatches)

    // Medium confidence: domain matches
    suggestions.push(...accountMatches)

    // If interview-like, add submissions as matches
    if (isInterview && submissionSuggestions.length > 0) {
      matches.push(...submissionSuggestions.map((s) => ({
        ...s,
        confidence: 'high' as LinkConfidence,
        reason: 'interview_submission',
      })))
    } else {
      suggestions.push(...submissionSuggestions)
    }

    suggestions.push(...jobSuggestions)

    // Deduplicate
    const seen = new Set<string>()
    const deduplicatedMatches = matches.filter((m) => {
      const key = `${m.entityType}:${m.entityId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const deduplicatedSuggestions = suggestions.filter((m) => {
      const key = `${m.entityType}:${m.entityId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return {
      matches: deduplicatedMatches,
      suggestions: deduplicatedSuggestions,
      errors,
    }
  } catch (error) {
    return {
      matches: [],
      suggestions: [],
      errors: [`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}

/**
 * Auto-link communication to entities based on analysis
 */
export async function autoLinkCommunication(
  orgId: string,
  userId: string,
  options: {
    type: 'email_thread' | 'email_message' | 'calendar_event'
    id: string
    matches: EntityMatch[]
    linkHighConfidenceOnly?: boolean
  }
): Promise<{ created: number; skipped: number }> {
  const adminClient = getAdminClient()

  const toLink = options.linkHighConfidenceOnly
    ? options.matches.filter((m) => m.confidence === 'high')
    : options.matches

  let created = 0
  let skipped = 0

  for (const match of toLink) {
    try {
      const linkData: Record<string, unknown> = {
        org_id: orgId,
        entity_type: match.entityType,
        entity_id: match.entityId,
        link_type: match.confidence === 'high' ? 'primary' : 'related',
        confidence: match.confidence,
        linked_by: 'auto',
        link_reason: match.reason,
        match_details: match.matchDetails,
        linked_by_user_id: userId,
      }

      if (options.type === 'email_thread') {
        linkData.thread_id = options.id
      } else if (options.type === 'email_message') {
        linkData.message_id = options.id
      }

      const table = options.type === 'calendar_event'
        ? 'calendar_entity_links'
        : 'email_entity_links'

      if (options.type === 'calendar_event') {
        linkData.event_id = options.id
      }

      const { error } = await adminClient.from(table).insert(linkData)

      if (error) {
        if (error.code === '23505') {
          // Duplicate, skip
          skipped++
        } else {
          throw error
        }
      } else {
        created++
      }
    } catch {
      skipped++
    }
  }

  return { created, skipped }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get communication history for an entity
 */
export async function getEntityCommunicationHistory(
  orgId: string,
  entityType: string,
  entityId: string,
  options?: {
    limit?: number
    includeEmails?: boolean
    includeCalendar?: boolean
  }
): Promise<{
  emails: Array<{ id: string; subject: string; date: string; direction: string }>
  events: Array<{ id: string; title: string; date: string; type: string }>
}> {
  const adminClient = getAdminClient()
  const limit = options?.limit ?? 20

  const results = {
    emails: [] as Array<{ id: string; subject: string; date: string; direction: string }>,
    events: [] as Array<{ id: string; title: string; date: string; type: string }>,
  }

  if (options?.includeEmails !== false) {
    const { data: emailLinks } = await adminClient
      .from('email_entity_links')
      .select('email_threads(id, subject, last_message_at), email_messages(id, subject, sent_at, direction)')
      .eq('org_id', orgId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit)

    for (const link of emailLinks ?? []) {
      if ((link as any).email_threads) {
        results.emails.push({
          id: (link as any).email_threads.id,
          subject: (link as any).email_threads.subject,
          date: (link as any).email_threads.last_message_at,
          direction: 'thread',
        })
      }
      if ((link as any).email_messages) {
        results.emails.push({
          id: (link as any).email_messages.id,
          subject: (link as any).email_messages.subject,
          date: (link as any).email_messages.sent_at,
          direction: (link as any).email_messages.direction,
        })
      }
    }
  }

  if (options?.includeCalendar !== false) {
    const { data: calendarLinks } = await adminClient
      .from('calendar_entity_links')
      .select('calendar_events(id, title, start_time, recruiting_event_type)')
      .eq('org_id', orgId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit)

    for (const link of calendarLinks ?? []) {
      if ((link as any).calendar_events) {
        results.events.push({
          id: (link as any).calendar_events.id,
          title: (link as any).calendar_events.title,
          date: (link as any).calendar_events.start_time,
          type: (link as any).calendar_events.recruiting_event_type ?? 'other',
        })
      }
    }
  }

  return results
}
