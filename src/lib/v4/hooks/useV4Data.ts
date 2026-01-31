/**
 * V4 Data Hooks
 *
 * Hooks that connect V4 pages to existing tRPC routers.
 * Transforms data to match V4 expected formats.
 */

'use client'

import { trpc } from '@/lib/trpc/client'
import { useMemo } from 'react'

// ============================================
// Types - V4 Page Expected Formats
// ============================================

export interface V4Job {
  id: string
  title: string
  accountId: string
  accountName: string
  status: 'draft' | 'open' | 'on_hold' | 'filled' | 'closed'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  location: string
  locationType: 'remote' | 'onsite' | 'hybrid'
  rateMin: number
  rateMax: number
  rateType: 'hourly' | 'annual'
  currency: string
  positions: number
  positionsFilled: number
  skills: string[]
  description: string
  requirements: string[]
  owner: { id: string; name: string; avatar?: string }
  submissions: number
  interviews: number
  offers: number
  createdAt: string
  updatedAt: string
  dueDate?: string
  hasIssues: boolean
  issues?: string[]
}

export interface V4Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  title: string
  currentCompany?: string
  location: string
  status: 'active' | 'passive' | 'not_looking' | 'placed' | 'do_not_contact'
  availability: 'immediate' | 'two_weeks' | 'one_month' | 'not_available'
  rate: number
  rateType: 'hourly' | 'annual'
  currency: string
  experience: number
  skills: string[]
  workAuthorization?: string
  linkedinUrl?: string
  resumeUrl?: string
  notes?: string
  submissions: number
  placements: number
  lastContacted?: string
  createdAt: string
  updatedAt: string
  source?: string
  owner: { id: string; name: string; avatar?: string }
}

export interface V4Account {
  id: string
  name: string
  industry?: string
  type: 'enterprise' | 'mid_market' | 'smb' | 'startup'
  status: 'active' | 'inactive' | 'prospect' | 'on_hold'
  website?: string
  phone?: string
  location?: string
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze'
  jobsCount: number
  placementsCount: number
  revenue?: number
  primaryContact?: {
    id: string
    name: string
    email: string
    title?: string
  }
  owner: { id: string; name: string; avatar?: string }
  lastContactDate?: string
  createdAt: string
}

export interface V4Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  title?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurture' | 'converted'
  score: number
  owner: { id: string; name: string; avatar?: string }
  lastContactedAt?: string
  nextFollowUp?: string
  notes?: string
  createdAt: string
  campaign?: { id: string; name: string }
}

export interface V4InboxItem {
  id: string
  type: 'activity' | 'submission' | 'interview' | 'follow_up' | 'approval'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  entityType: 'job' | 'candidate' | 'account' | 'submission'
  entityId: string
  entityName: string
  dueDate?: string
  createdAt: string
  isOverdue: boolean
  isCompleted: boolean
}

// ============================================
// Jobs Hook
// ============================================

export function useV4Jobs(filters?: {
  search?: string
  status?: string
  accountId?: string
  limit?: number
}) {
  const query = trpc.ats.jobs.list.useQuery({
    search: filters?.search,
    status: (filters?.status as 'draft' | 'open' | 'active' | 'on_hold' | 'filled' | 'cancelled' | 'all') || 'all',
    accountId: filters?.accountId,
    limit: filters?.limit || 50,
    offset: 0,
    includeDrafts: true,
  })

  const jobs = useMemo<V4Job[]>(() => {
    if (!query.data?.items) return []

    return query.data.items.map((job: Record<string, unknown>): V4Job => {
      const submissions = Array.isArray(job.submissions) ? job.submissions : []
      const interviews = Array.isArray(job.interviews) ? job.interviews : []
      const company = job.company as { id?: string; name?: string } | null
      const owner = job.owner as { id?: string; full_name?: string; avatar_url?: string } | null

      return {
        id: String(job.id || ''),
        title: String(job.title || 'Untitled'),
        accountId: String(job.company_id || ''),
        accountName: company?.name || 'Unknown',
        status: mapJobStatus(String(job.status || 'draft')),
        priority: mapPriority(String(job.priority || 'normal')),
        location: String(job.location || ''),
        locationType: job.is_remote ? 'remote' : job.is_hybrid ? 'hybrid' : 'onsite',
        rateMin: Number(job.rate_min) || 0,
        rateMax: Number(job.rate_max) || 0,
        rateType: String(job.rate_type || 'hourly') === 'annual' ? 'annual' : 'hourly',
        currency: String(job.currency || 'USD'),
        positions: Number(job.positions_count) || 1,
        positionsFilled: Number(job.positions_filled) || 0,
        skills: Array.isArray(job.required_skills) ? job.required_skills as string[] : [],
        description: String(job.description || ''),
        requirements: [],
        owner: {
          id: owner?.id || '',
          name: owner?.full_name || 'Unassigned',
          avatar: owner?.avatar_url,
        },
        submissions: submissions.length,
        interviews: interviews.length,
        offers: 0, // Would need a separate query
        createdAt: String(job.created_at || ''),
        updatedAt: String(job.updated_at || ''),
        dueDate: job.target_fill_date ? String(job.target_fill_date) : undefined,
        hasIssues: false,
      }
    })
  }, [query.data])

  return {
    jobs,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    total: query.data?.total || 0,
  }
}

export function useV4Job(id: string) {
  const query = trpc.ats.jobs.getById.useQuery({ id }, { enabled: !!id })

  const job = useMemo<V4Job | null>(() => {
    if (!query.data) return null
    const j = query.data as Record<string, unknown>
    const company = j.company as { id?: string; name?: string } | null
    const owner = j.owner as { id?: string; full_name?: string; avatar_url?: string } | null

    return {
      id: String(j.id || ''),
      title: String(j.title || 'Untitled'),
      accountId: String(j.company_id || ''),
      accountName: company?.name || 'Unknown',
      status: mapJobStatus(String(j.status || 'draft')),
      priority: mapPriority(String(j.priority || 'normal')),
      location: String(j.location || ''),
      locationType: j.is_remote ? 'remote' : j.is_hybrid ? 'hybrid' : 'onsite',
      rateMin: Number(j.rate_min) || 0,
      rateMax: Number(j.rate_max) || 0,
      rateType: String(j.rate_type || 'hourly') === 'annual' ? 'annual' : 'hourly',
      currency: String(j.currency || 'USD'),
      positions: Number(j.positions_count) || 1,
      positionsFilled: Number(j.positions_filled) || 0,
      skills: Array.isArray(j.required_skills) ? j.required_skills as string[] : [],
      description: String(j.description || ''),
      requirements: [],
      owner: {
        id: owner?.id || '',
        name: owner?.full_name || 'Unassigned',
        avatar: owner?.avatar_url,
      },
      submissions: 0,
      interviews: 0,
      offers: 0,
      createdAt: String(j.created_at || ''),
      updatedAt: String(j.updated_at || ''),
      dueDate: j.target_fill_date ? String(j.target_fill_date) : undefined,
      hasIssues: false,
    }
  }, [query.data])

  return { job, isLoading: query.isLoading, error: query.error }
}

// ============================================
// Candidates Hook
// ============================================

export function useV4Candidates(filters?: {
  search?: string
  status?: string
  skills?: string[]
  limit?: number
}) {
  // Use the search procedure which returns candidates based on query
  // If no search query, we'll use a wide search to get all candidates
  const query = trpc.ats.candidates.search.useQuery({
    query: filters?.search || '%', // Use % to match all if no search
    status: filters?.status,
    skills: filters?.skills,
    limit: filters?.limit || 50,
  }, {
    // Enable even without search query by using wildcard
    enabled: true,
  })

  const candidates = useMemo<V4Candidate[]>(() => {
    if (!query.data) return []

    // The search procedure returns a simple array with basic fields
    return query.data.map((c: Record<string, unknown>): V4Candidate => {
      const name = String(c.name || '')
      const [firstName, ...lastNameParts] = name.split(' ')

      return {
        id: String(c.id || ''),
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: String(c.email || ''),
        phone: c.phone ? String(c.phone) : undefined,
        avatar: undefined,
        title: String(c.title || ''),
        currentCompany: undefined,
        location: String(c.location || ''),
        status: mapCandidateStatus(String(c.status || 'active')),
        availability: 'not_available',
        rate: 0,
        rateType: 'hourly',
        currency: 'USD',
        experience: 0,
        skills: c.skills ? String(c.skills).split(',').map(s => s.trim()).filter(Boolean) : [],
        workAuthorization: undefined,
        linkedinUrl: undefined,
        submissions: 0,
        placements: 0,
        createdAt: '',
        updatedAt: '',
        owner: {
          id: '',
          name: 'Unassigned',
        },
      }
    })
  }, [query.data])

  return {
    candidates,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    total: candidates.length,
  }
}

// ============================================
// Accounts Hook
// ============================================

export function useV4Accounts(filters?: {
  search?: string
  status?: string
  type?: string
  limit?: number
}) {
  const query = trpc.crm.accounts.list.useQuery({
    search: filters?.search,
    status: (filters?.status as 'active' | 'inactive' | 'prospect' | 'on_hold' | 'all') || 'all',
    type: filters?.type as 'enterprise' | 'mid_market' | 'smb' | 'startup' | undefined,
    limit: filters?.limit || 50,
    offset: 0,
  })

  const accounts = useMemo<V4Account[]>(() => {
    if (!query.data?.items) return []

    return query.data.items.map((a: Record<string, unknown>): V4Account => {
      const owner = a.owner as { id?: string; full_name?: string; avatar_url?: string } | null

      return {
        id: String(a.id || ''),
        name: String(a.name || ''),
        industry: a.industry ? String(a.industry) : undefined,
        type: mapAccountType(String(a.type || a.company_type || 'smb')),
        status: mapAccountStatus(String(a.status || 'active')),
        website: a.website ? String(a.website) : undefined,
        phone: a.phone ? String(a.phone) : undefined,
        location: [a.city, a.state].filter(Boolean).join(', ') || undefined,
        tier: a.tier ? mapTier(String(a.tier)) : undefined,
        jobsCount: Number(a.jobs_count) || 0,
        placementsCount: Number(a.placements_count) || 0,
        owner: {
          id: owner?.id || '',
          name: owner?.full_name || 'Unassigned',
          avatar: owner?.avatar_url,
        },
        lastContactDate: a.last_contact_date ? String(a.last_contact_date) : undefined,
        createdAt: String(a.created_at || ''),
      }
    })
  }, [query.data])

  return {
    accounts,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    total: query.data?.total || 0,
  }
}

// ============================================
// Leads Hook
// ============================================

export function useV4Leads(filters?: {
  search?: string
  status?: string
  limit?: number
}) {
  const query = trpc.crm.leads.list.useQuery({
    search: filters?.search,
    status: (filters?.status as 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurture' | 'converted' | 'all') || 'all',
    limit: filters?.limit || 50,
    offset: 0,
  })

  const leads = useMemo<V4Lead[]>(() => {
    if (!query.data?.items) return []

    return query.data.items.map((l: Record<string, unknown>): V4Lead => {
      const owner = l.owner as { id?: string; full_name?: string; avatar_url?: string } | null
      const campaign = l.campaign as { id?: string; name?: string } | null

      return {
        id: String(l.id || ''),
        firstName: String(l.first_name || ''),
        lastName: String(l.last_name || ''),
        email: String(l.email || ''),
        phone: l.phone ? String(l.phone) : undefined,
        company: String(l.company_name || ''),
        title: l.title ? String(l.title) : undefined,
        source: String(l.source || 'unknown'),
        status: mapLeadStatus(String(l.status || 'new')),
        score: Number(l.bant_total_score) || 0,
        owner: {
          id: owner?.id || '',
          name: owner?.full_name || 'Unassigned',
          avatar: owner?.avatar_url,
        },
        lastContactedAt: l.last_contacted_at ? String(l.last_contacted_at) : undefined,
        nextFollowUp: l.next_follow_up ? String(l.next_follow_up) : undefined,
        createdAt: String(l.created_at || ''),
        campaign: campaign ? { id: campaign.id || '', name: campaign.name || '' } : undefined,
      }
    })
  }, [query.data])

  return {
    leads,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    total: query.data?.total || 0,
  }
}

// ============================================
// Inbox/Work Queue Hook
// ============================================

export function useV4Inbox() {
  // Fetch activities that need attention
  const activitiesQuery = trpc.activities.list.useQuery({
    status: 'pending',
    limit: 50,
  })

  // Fetch submissions needing review
  const submissionsQuery = trpc.ats.submissions.list.useQuery({
    status: 'submitted',
    limit: 20,
  })

  const items = useMemo<V4InboxItem[]>(() => {
    const result: V4InboxItem[] = []
    const now = new Date()

    // Add activities
    if (activitiesQuery.data?.items) {
      for (const a of activitiesQuery.data.items as Record<string, unknown>[]) {
        const dueDate = a.due_date ? new Date(String(a.due_date)) : null
        result.push({
          id: String(a.id || ''),
          type: 'activity',
          priority: mapActivityPriority(String(a.priority || 'normal')),
          title: String(a.subject || 'Activity'),
          description: String(a.description || ''),
          entityType: String(a.entity_type || 'job') as 'job' | 'candidate' | 'account' | 'submission',
          entityId: String(a.entity_id || ''),
          entityName: String(a.entity_name || ''),
          dueDate: a.due_date ? String(a.due_date) : undefined,
          createdAt: String(a.created_at || ''),
          isOverdue: dueDate ? dueDate < now : false,
          isCompleted: String(a.status) === 'completed',
        })
      }
    }

    // Add submissions needing review
    if (submissionsQuery.data?.items) {
      for (const s of submissionsQuery.data.items as Record<string, unknown>[]) {
        const job = s.job as { id?: string; title?: string } | null
        const candidate = s.candidate as { first_name?: string; last_name?: string } | null
        result.push({
          id: String(s.id || ''),
          type: 'submission',
          priority: 'high',
          title: `Review: ${candidate?.first_name || ''} ${candidate?.last_name || ''} → ${job?.title || 'Job'}`,
          description: `Submission needs review`,
          entityType: 'submission',
          entityId: String(s.id || ''),
          entityName: `${candidate?.first_name || ''} ${candidate?.last_name || ''}`,
          createdAt: String(s.created_at || ''),
          isOverdue: false,
          isCompleted: false,
        })
      }
    }

    // Sort by priority and due date
    return result.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      const aPriority = priorityOrder[a.priority] ?? 2
      const bPriority = priorityOrder[b.priority] ?? 2
      if (aPriority !== bPriority) return aPriority - bPriority
      if (a.isOverdue && !b.isOverdue) return -1
      if (!a.isOverdue && b.isOverdue) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [activitiesQuery.data, submissionsQuery.data])

  return {
    items,
    isLoading: activitiesQuery.isLoading || submissionsQuery.isLoading,
    error: activitiesQuery.error || submissionsQuery.error,
    refetch: () => {
      activitiesQuery.refetch()
      submissionsQuery.refetch()
    },
  }
}

// ============================================
// Status Mappers
// ============================================

function mapJobStatus(status: string): V4Job['status'] {
  const map: Record<string, V4Job['status']> = {
    draft: 'draft',
    open: 'open',
    active: 'open',
    on_hold: 'on_hold',
    filled: 'filled',
    closed: 'closed',
    cancelled: 'closed',
  }
  return map[status] || 'draft'
}

function mapPriority(priority: string): V4Job['priority'] {
  const map: Record<string, V4Job['priority']> = {
    critical: 'urgent',
    urgent: 'urgent',
    high: 'high',
    normal: 'medium',
    medium: 'medium',
    low: 'low',
  }
  return map[priority] || 'medium'
}

function mapCandidateStatus(status: string): V4Candidate['status'] {
  const map: Record<string, V4Candidate['status']> = {
    active: 'active',
    passive: 'passive',
    available: 'active',
    interviewing: 'active',
    placed: 'placed',
    not_looking: 'not_looking',
    do_not_contact: 'do_not_contact',
    inactive: 'not_looking',
  }
  return map[status] || 'active'
}

function mapAvailability(availability: string): V4Candidate['availability'] {
  const map: Record<string, V4Candidate['availability']> = {
    immediate: 'immediate',
    two_weeks: 'two_weeks',
    '2_weeks': 'two_weeks',
    one_month: 'one_month',
    '1_month': 'one_month',
    not_available: 'not_available',
  }
  return map[availability] || 'not_available'
}

function mapAccountType(type: string): V4Account['type'] {
  const map: Record<string, V4Account['type']> = {
    enterprise: 'enterprise',
    mid_market: 'mid_market',
    midmarket: 'mid_market',
    smb: 'smb',
    startup: 'startup',
  }
  return map[type] || 'smb'
}

function mapAccountStatus(status: string): V4Account['status'] {
  const map: Record<string, V4Account['status']> = {
    active: 'active',
    inactive: 'inactive',
    prospect: 'prospect',
    on_hold: 'on_hold',
  }
  return map[status] || 'active'
}

function mapTier(tier: string): V4Account['tier'] {
  const map: Record<string, V4Account['tier']> = {
    platinum: 'platinum',
    gold: 'gold',
    silver: 'silver',
    bronze: 'bronze',
  }
  return map[tier] || 'bronze'
}

function mapLeadStatus(status: string): V4Lead['status'] {
  const map: Record<string, V4Lead['status']> = {
    new: 'new',
    contacted: 'contacted',
    qualified: 'qualified',
    unqualified: 'unqualified',
    nurture: 'nurture',
    converted: 'converted',
  }
  return map[status] || 'new'
}

function mapActivityPriority(priority: string): V4InboxItem['priority'] {
  const map: Record<string, V4InboxItem['priority']> = {
    critical: 'urgent',
    urgent: 'urgent',
    high: 'high',
    normal: 'medium',
    medium: 'medium',
    low: 'low',
  }
  return map[priority] || 'medium'
}
