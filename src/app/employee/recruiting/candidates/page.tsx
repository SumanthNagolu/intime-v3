'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  Filter,
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

export default function CandidatesListPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus>('all')
  const [visaFilter, setVisaFilter] = useState<VisaStatus>('all')
  const [showHotlistOnly, setShowHotlistOnly] = useState(false)

  // Fetch candidates
  const candidatesQuery = trpc.ats.candidates.advancedSearch.useQuery({
    search: search || undefined,
    statuses: statusFilter !== 'all' ? [statusFilter] : undefined,
    visaStatuses: visaFilter !== 'all' ? [visaFilter] : undefined,
    isOnHotlist: showHotlistOnly ? true : undefined,
    limit: 50,
    offset: 0,
  })

  // Fetch stats
  const statsQuery = trpc.ats.candidates.getSourcingStats.useQuery({})

  // Fetch saved searches
  const savedSearchesQuery = trpc.ats.candidates.getSavedSearches.useQuery()

  const candidates = candidatesQuery.data?.items || []
  const total = candidatesQuery.data?.total || 0
  const stats = statsQuery.data

  const handleCandidateClick = (candidateId: string) => {
    router.push(`/employee/recruiting/candidates/${candidateId}`)
  }

  return (
    <div className="min-h-screen bg-cream">
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
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CandidateStatus)}>
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
            {candidatesQuery.isLoading ? 'Loading...' : `${total} candidates found`}
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
                  {savedSearchesQuery.data.map((search) => (
                    <DropdownMenuItem
                      key={search.id}
                      onClick={() => {
                        // Apply saved search filters
                        const filters = search.filters as any
                        if (filters.search) setSearch(filters.search)
                        if (filters.statuses?.[0]) setStatusFilter(filters.statuses[0])
                        if (filters.visaStatuses?.[0]) setVisaFilter(filters.visaStatuses[0])
                        if (filters.isOnHotlist) setShowHotlistOnly(filters.isOnHotlist)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {search.is_default && <Star className="w-3 h-3 text-gold-500" />}
                        <span>{search.name}</span>
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
        {candidatesQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
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
                          {candidate.experience_years !== undefined && (
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
                            {skills.map((skill: any) => (
                              <span
                                key={skill.skill_name}
                                className="px-2 py-0.5 bg-charcoal-50 text-charcoal-600 text-xs rounded"
                              >
                                {skill.skill_name}
                              </span>
                            ))}
                            {candidate.skills?.length > 4 && (
                              <span className="text-xs text-charcoal-400">
                                +{candidate.skills.length - 4} more
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
        {candidatesQuery.data && candidates.length > 0 && (
          <p className="text-sm text-charcoal-500 mt-4">
            Showing {candidates.length} of {total} candidates
          </p>
        )}
      </div>
    </div>
  )
}
