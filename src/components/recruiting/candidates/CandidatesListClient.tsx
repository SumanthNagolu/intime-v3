'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Users,
  MapPin,
  Star,
  Clock,
  ChevronRight,
  Download,
  MoreVertical,
  UserCheck,
  Bookmark,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

type CandidateStatus = 'all' | 'active' | 'sourced' | 'screening' | 'bench' | 'placed' | 'inactive'
type VisaStatus = 'all' | 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  sourced: { label: 'Sourced', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  screening: { label: 'Screening', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  bench: { label: 'Bench', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  placed: { label: 'Placed', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  inactive: { label: 'Inactive', color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200' },
  archived: { label: 'Archived', color: 'bg-charcoal-100 text-charcoal-500 border-charcoal-200' },
}

const VISA_CONFIG: Record<string, { label: string; color: string }> = {
  us_citizen: { label: 'US Citizen', color: 'bg-green-100 text-green-700' },
  green_card: { label: 'Green Card', color: 'bg-green-100 text-green-700' },
  h1b: { label: 'H1B', color: 'bg-blue-100 text-blue-700' },
  l1: { label: 'L1', color: 'bg-blue-100 text-blue-700' },
  tn: { label: 'TN', color: 'bg-purple-100 text-purple-700' },
  opt: { label: 'OPT', color: 'bg-amber-100 text-amber-700' },
  cpt: { label: 'CPT', color: 'bg-amber-100 text-amber-700' },
  ead: { label: 'EAD', color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Other', color: 'bg-charcoal-100 text-charcoal-600' },
}

interface Candidate {
  id: string
  first_name: string
  last_name: string
  status: string
  visa_status: string
  headline?: string | null
  location?: string | null
  experience_years?: number | null
  desired_rate?: number | null
  created_at?: string | null
  is_on_hotlist?: boolean
  skills?: Array<{ skill_name: string }> | null
}

interface SavedSearch {
  id: string
  name: string
  filters: unknown
  is_default: boolean
}

interface CandidatesListClientProps {
  initialCandidates: Candidate[]
  initialTotal: number
  initialStats: {
    total: number
    active: number
    hotlist: number
    addedThisWeek: number
  } | null
  initialSavedSearches: SavedSearch[]
  initialSearch: string
  initialStatus: string
  initialSource: string
}

export function CandidatesListClient({
  initialCandidates,
  initialTotal,
  initialStats,
  initialSavedSearches,
  initialSearch,
  initialStatus,
  initialSource,
}: CandidatesListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<CandidateStatus>((initialStatus as CandidateStatus) || 'all')
  const [visaFilter, setVisaFilter] = useState<VisaStatus>('all')
  const [showHotlistOnly, setShowHotlistOnly] = useState(false)

  // Use server data as initial, allow client refetch for mutations
  const candidatesQuery = trpc.ats.candidates.advancedSearch.useQuery(
    {
      query: search || undefined,
      status: statusFilter !== 'all' ? [statusFilter] : undefined,
      source: initialSource ? [initialSource] : undefined,
      limit: 50,
      offset: 0,
    },
    {
      initialData: { items: initialCandidates, total: initialTotal },
      enabled: search !== initialSearch || statusFilter !== (initialStatus || 'all'),
    }
  )

  const statsQuery = trpc.ats.candidates.getSourcingStats.useQuery(undefined, {
    initialData: initialStats,
    staleTime: 60 * 1000,
  })

  const savedSearchesQuery = trpc.ats.candidates.getSavedSearches.useQuery(undefined, {
    initialData: initialSavedSearches,
    staleTime: 60 * 1000,
  })

  const candidates = candidatesQuery.data?.items || initialCandidates
  const total = candidatesQuery.data?.total || initialTotal
  const stats = statsQuery.data || initialStats

  const handleCandidateClick = (candidateId: string) => {
    router.push(`/employee/recruiting/candidates/${candidateId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  const handleStatusChange = (value: CandidateStatus) => {
    setStatusFilter(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== 'all') {
        params.set('status', value)
      } else {
        params.delete('status')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="min-h-screen bg-cream" data-testid="page-content">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-charcoal-900">Candidates</h1>
            <p className="text-charcoal-500 mt-1">
              Search and manage your talent pipeline
            </p>
          </div>
          <Button onClick={() => router.push('/employee/recruiting/candidates/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.total ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm text-charcoal-500">Active</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.active ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-gold-500" />
                <span className="text-sm text-charcoal-500">Hotlist</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.hotlist ?? '-'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-charcoal-500">This Week</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.addedThisWeek ?? '-'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search by name, email, skills, location..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="sourced">Sourced</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="bench">Bench</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={visaFilter} onValueChange={(v) => setVisaFilter(v as VisaStatus)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Visa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visa</SelectItem>
              <SelectItem value="us_citizen">US Citizen</SelectItem>
              <SelectItem value="green_card">Green Card</SelectItem>
              <SelectItem value="h1b">H1B</SelectItem>
              <SelectItem value="l1">L1</SelectItem>
              <SelectItem value="tn">TN</SelectItem>
              <SelectItem value="opt">OPT</SelectItem>
              <SelectItem value="cpt">CPT</SelectItem>
              <SelectItem value="ead">EAD</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showHotlistOnly ? 'default' : 'outline'}
            onClick={() => setShowHotlistOnly(!showHotlistOnly)}
            className={showHotlistOnly ? 'bg-gold-500 hover:bg-gold-600 text-white' : ''}
          >
            <Star className={cn('w-4 h-4 mr-1', showHotlistOnly && 'fill-white')} />
            Hotlist
          </Button>
        </div>

        {/* Results Count & Actions */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-charcoal-500">
            {`${total} candidates found`}
          </p>
          <div className="flex items-center gap-2">
            {savedSearchesQuery.data && savedSearchesQuery.data.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-1" />
                    Saved Searches
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {savedSearchesQuery.data.map((savedSearch) => (
                    <DropdownMenuItem
                      key={savedSearch.id}
                      onClick={() => {
                        const filters = savedSearch.filters as Record<string, unknown>
                        if (filters.search) setSearch(filters.search as string)
                        if ((filters.statuses as string[])?.[0]) setStatusFilter((filters.statuses as string[])[0] as CandidateStatus)
                        if ((filters.visaStatuses as string[])?.[0]) setVisaFilter((filters.visaStatuses as string[])[0] as VisaStatus)
                        if (filters.isOnHotlist) setShowHotlistOnly(filters.isOnHotlist as boolean)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {savedSearch.is_default && <Star className="w-3 h-3 text-gold-500" />}
                        <span>{savedSearch.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Candidates List */}
        {candidates.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">No candidates found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || statusFilter !== 'all' || visaFilter !== 'all' || showHotlistOnly
                  ? 'Try adjusting your filters'
                  : 'Add your first candidate to get started'}
              </p>
              {!search && statusFilter === 'all' && !showHotlistOnly && (
                <Button onClick={() => router.push('/employee/recruiting/candidates/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => {
              const statusConfig = STATUS_CONFIG[candidate.status] || STATUS_CONFIG.active
              const visaConfig = VISA_CONFIG[candidate.visa_status] || VISA_CONFIG.other
              const skills = candidate.skills?.slice(0, 4) || []

              return (
                <Card
                  key={candidate.id}
                  className="bg-white cursor-pointer hover:shadow-elevation-sm transition-all duration-300"
                  onClick={() => handleCandidateClick(candidate.id)}
                  onMouseEnter={() => router.prefetch(`/employee/recruiting/candidates/${candidate.id}`)}
                  data-testid="candidate-row"
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-hublot-900 font-semibold">
                          {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                        </span>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-charcoal-900 truncate">
                            {candidate.first_name} {candidate.last_name}
                          </h3>
                          {candidate.is_on_hotlist && (
                            <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                          )}
                          <Badge className={cn('text-xs', statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                          <Badge className={cn('text-xs', visaConfig.color)}>
                            {visaConfig.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-charcoal-600 mb-2 truncate">
                          {candidate.headline || 'No headline'}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500">
                          {candidate.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {candidate.location}
                            </span>
                          )}
                          {candidate.experience_years !== undefined && candidate.experience_years !== null && (
                            <span>{candidate.experience_years} yrs exp</span>
                          )}
                          {candidate.desired_rate && (
                            <span>${candidate.desired_rate}/hr</span>
                          )}
                          {candidate.created_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Added {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {skills.map((skill) => (
                              <span
                                key={skill.skill_name}
                                className="px-2 py-0.5 bg-charcoal-50 text-charcoal-600 text-xs rounded"
                              >
                                {skill.skill_name}
                              </span>
                            ))}
                            {(candidate.skills?.length || 0) > 4 && (
                              <span className="text-xs text-charcoal-400">
                                +{(candidate.skills?.length || 0) - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/employee/recruiting/candidates/${candidate.id}`)
                            }}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              Submit to Job
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {candidate.is_on_hotlist ? (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                Remove from Hotlist
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                Add to Hotlist
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronRight className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Results count */}
        {candidates.length > 0 && (
          <p className="text-sm text-charcoal-500 mt-4">
            Showing {candidates.length} of {total} candidates
          </p>
        )}
      </div>
    </div>
  )
}
