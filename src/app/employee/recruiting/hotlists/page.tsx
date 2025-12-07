'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  Star,
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  Send,
  Clock,
  Edit2,
  Save,
  X,
  Trash2,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

const AVAILABILITY_CONFIG: Record<string, string> = {
  immediate: 'Immediate',
  '2_weeks': '2 Weeks',
  '30_days': '30 Days',
  not_available: 'Not Available',
}

export default function HotlistPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date_added' | 'name' | 'experience'>('date_added')
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [editingNotesValue, setEditingNotesValue] = useState('')
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [candidateToRemove, setCandidateToRemove] = useState<{ id: string; name: string } | null>(null)

  const utils = trpc.useUtils()

  // Query
  const hotlistQuery = trpc.ats.candidates.getHotlist.useQuery({
    sortBy,
    limit: 100,
  })

  // Mutations
  const updateNotesMutation = trpc.ats.candidates.updateHotlistNotes.useMutation({
    onSuccess: () => {
      utils.ats.candidates.getHotlist.invalidate()
      setEditingNotesId(null)
      toast({ title: 'Notes updated' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const removeFromHotlistMutation = trpc.ats.candidates.removeFromHotlist.useMutation({
    onSuccess: () => {
      utils.ats.candidates.getHotlist.invalidate()
      setRemoveDialogOpen(false)
      setCandidateToRemove(null)
      toast({ title: 'Removed from hotlist' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const candidates = hotlistQuery.data?.items ?? []
  const total = hotlistQuery.data?.total ?? 0

  // Filter candidates by search term
  const filteredCandidates = candidates.filter((candidate: {
    first_name: string
    last_name: string
    email: string
    headline?: string
    skills?: { skill_name: string }[]
  }) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase()
    const email = candidate.email?.toLowerCase() || ''
    const headline = candidate.headline?.toLowerCase() || ''
    const skills = (candidate.skills || []).map((s: { skill_name: string }) => s.skill_name.toLowerCase()).join(' ')
    return fullName.includes(searchLower) ||
           email.includes(searchLower) ||
           headline.includes(searchLower) ||
           skills.includes(searchLower)
  })

  const handleSaveNotes = (candidateId: string) => {
    updateNotesMutation.mutate({
      candidateId,
      notes: editingNotesValue,
    })
  }

  const handleRemoveClick = (id: string, name: string) => {
    setCandidateToRemove({ id, name })
    setRemoveDialogOpen(true)
  }

  const handleConfirmRemove = () => {
    if (candidateToRemove) {
      removeFromHotlistMutation.mutate({ candidateId: candidateToRemove.id })
    }
  }

  if (hotlistQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-10 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8 text-gold-500 fill-gold-500" />
              <h1 className="text-3xl font-heading font-bold text-charcoal-900">Hotlist</h1>
            </div>
            <p className="text-charcoal-500">
              Your top-tier candidates ready for quick submission
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gold-100 text-gold-700 border-gold-200 px-3 py-1.5">
              <Star className="w-4 h-4 mr-1 fill-gold-500 text-gold-500" />
              {total} candidates
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <Input
                    placeholder="Search by name, skill, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_added">Date Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Star className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">
                {searchTerm ? 'No matching candidates' : 'No candidates on hotlist'}
              </h3>
              <p className="text-charcoal-500 mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Add top candidates to your hotlist for quick access'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/employee/recruiting/candidates')}>
                  <Users className="w-4 h-4 mr-2" />
                  Browse Candidates
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate: {
              id: string
              first_name: string
              last_name: string
              email: string
              phone: string
              headline: string
              location: string
              visa_status: string
              availability: string
              experience_years: number
              desired_rate: number
              hotlist_notes: string
              hotlist_added_at: string
              is_remote_ok: boolean
              skills?: { skill_name: string }[]
              submissions?: { id: string; status: string }[]
            }) => {
              const isEditing = editingNotesId === candidate.id
              const visaConfig = VISA_CONFIG[candidate.visa_status] || VISA_CONFIG.other

              return (
                <Card key={candidate.id} className="bg-white border-l-4 border-l-gold-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-700 font-bold">
                          {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                        </span>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className="font-medium text-charcoal-900 cursor-pointer hover:text-hublot-900 transition-colors"
                                onClick={() => router.push(`/employee/recruiting/candidates/${candidate.id}`)}
                              >
                                {candidate.first_name} {candidate.last_name}
                              </h3>
                              <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                            </div>
                            <p className="text-sm text-charcoal-600 mb-2">
                              {candidate.headline || 'No headline'}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/employee/recruiting/candidates/${candidate.id}`)}
                            >
                              View
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            <Button size="sm">
                              <Send className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveClick(candidate.id, `${candidate.first_name} ${candidate.last_name}`)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Info Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500 mb-3">
                          {candidate.email && (
                            <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-hublot-900">
                              <Mail className="w-3.5 h-3.5" />
                              {candidate.email}
                            </a>
                          )}
                          {candidate.phone && (
                            <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 hover:text-hublot-900">
                              <Phone className="w-3.5 h-3.5" />
                              {candidate.phone}
                            </a>
                          )}
                          {candidate.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {candidate.location}
                              {candidate.is_remote_ok && ' (Remote OK)'}
                            </span>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <Badge className={visaConfig.color}>
                            {visaConfig.label}
                          </Badge>
                          <Badge variant="outline">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {candidate.experience_years ?? 0} years
                          </Badge>
                          {candidate.desired_rate && (
                            <Badge variant="outline">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${candidate.desired_rate}/hr
                            </Badge>
                          )}
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {AVAILABILITY_CONFIG[candidate.availability] || 'Unknown'}
                          </Badge>
                          {(candidate.submissions?.length ?? 0) > 0 && (
                            <Badge className="bg-blue-100 text-blue-700">
                              {candidate.submissions?.length} submissions
                            </Badge>
                          )}
                        </div>

                        {/* Skills */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {candidate.skills.slice(0, 8).map((skill: { skill_name: string }) => (
                              <Badge key={skill.skill_name} variant="secondary" className="text-xs">
                                {skill.skill_name}
                              </Badge>
                            ))}
                            {candidate.skills.length > 8 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.skills.length - 8} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Hotlist Notes */}
                        <div className="mt-4 pt-4 border-t border-charcoal-100">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-2">
                              <Star className="w-3 h-3 text-gold-500" />
                              Added to hotlist {formatDistanceToNow(new Date(candidate.hotlist_added_at), { addSuffix: true })}
                            </div>
                            {!isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => {
                                  setEditingNotesId(candidate.id)
                                  setEditingNotesValue(candidate.hotlist_notes || '')
                                }}
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit Notes
                              </Button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingNotesValue}
                                onChange={(e) => setEditingNotesValue(e.target.value)}
                                placeholder="Add notes about why this candidate is on the hotlist..."
                                className="min-h-[80px]"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveNotes(candidate.id)}
                                  disabled={updateNotesMutation.isPending}
                                >
                                  {updateNotesMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4 mr-1" />
                                  )}
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingNotesId(null)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : candidate.hotlist_notes ? (
                            <p className="text-sm text-charcoal-600 bg-gold-50 rounded-lg p-3 border border-gold-200">
                              {candidate.hotlist_notes}
                            </p>
                          ) : (
                            <p className="text-sm text-charcoal-400 italic">
                              No notes added
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Remove Confirmation Dialog */}
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Hotlist?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <strong>{candidateToRemove?.name}</strong> from your hotlist?
                You can always add them back later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRemove}
                className="bg-red-600 hover:bg-red-700"
              >
                {removeFromHotlistMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
