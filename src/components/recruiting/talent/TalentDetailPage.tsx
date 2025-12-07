'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Users,
  Edit2,
  MoreHorizontal,
  Trash2,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Loader2,
  ExternalLink,
  Save,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Star,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'
import { MarketingProfileEditor } from './MarketingProfileEditor'
import { ImmigrationTracker } from './ImmigrationTracker'
import { SubmitToJobDialog } from './SubmitToJobDialog'

interface TalentDetailPageProps {
  talentId: string
}

const statusColors: Record<string, string> = {
  onboarding: 'bg-blue-100 text-blue-800',
  available: 'bg-green-100 text-green-800',
  marketing: 'bg-purple-100 text-purple-800',
  interviewing: 'bg-amber-100 text-amber-800',
  placed: 'bg-teal-100 text-teal-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
}

const marketingStatusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-600',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-amber-100 text-amber-800',
  archived: 'bg-red-100 text-red-800',
}

const submissionStatusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview_requested: 'bg-amber-100 text-amber-800',
  interviewing: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
  offered: 'bg-teal-100 text-teal-800',
  accepted: 'bg-green-100 text-green-800',
  placed: 'bg-emerald-100 text-emerald-800',
}

const visaLabels: Record<string, string> = {
  h1b: 'H-1B',
  h1b_transfer: 'H-1B Transfer',
  l1: 'L1',
  opt: 'OPT',
  opt_stem: 'OPT STEM',
  cpt: 'CPT',
  gc: 'Green Card',
  us_citizen: 'US Citizen',
  ead: 'EAD',
  tn: 'TN',
}

export function TalentDetailPage({ talentId }: TalentDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [editMode, setEditMode] = useState(false)
  const [addSkillOpen, setAddSkillOpen] = useState(false)
  const [submitToJobOpen, setSubmitToJobOpen] = useState(false)

  // Edit form state
  const [editStatus, setEditStatus] = useState('')
  const [editVisaType, setEditVisaType] = useState('')
  const [editVisaExpiry, setEditVisaExpiry] = useState('')
  const [editMinRate, setEditMinRate] = useState('')
  const [editTargetRate, setEditTargetRate] = useState('')
  const [editMarketingStatus, setEditMarketingStatus] = useState('')
  const [editWillingRelocate, setEditWillingRelocate] = useState(false)
  const [editPreferredLocations, setEditPreferredLocations] = useState('')

  // New skill form state
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillProficiency, setNewSkillProficiency] = useState('3')
  const [newSkillYears, setNewSkillYears] = useState('')
  const [newSkillCertified, setNewSkillCertified] = useState(false)
  const [newSkillCertName, setNewSkillCertName] = useState('')

  // Fetch talent data
  const talentQuery = trpc.bench.talent.getById.useQuery({ id: talentId })

  // Fetch submissions
  const submissionsQuery = trpc.bench.submissions.listByConsultant.useQuery({ consultantId: talentId })

  // Mutations
  const updateMutation = trpc.bench.talent.update.useMutation({
    onSuccess: () => {
      toast.success('Talent updated successfully')
      utils.bench.talent.getById.invalidate({ id: talentId })
      setEditMode(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update talent')
    },
  })

  const deleteMutation = trpc.bench.talent.delete.useMutation({
    onSuccess: () => {
      toast.success('Talent removed from bench')
      router.push('/employee/recruiting/talent')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove talent')
    },
  })

  const addSkillMutation = trpc.bench.talent.addSkill.useMutation({
    onSuccess: () => {
      toast.success('Skill added successfully')
      utils.bench.talent.getById.invalidate({ id: talentId })
      setAddSkillOpen(false)
      resetSkillForm()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add skill')
    },
  })

  const removeSkillMutation = trpc.bench.talent.removeSkill.useMutation({
    onSuccess: () => {
      toast.success('Skill removed successfully')
      utils.bench.talent.getById.invalidate({ id: talentId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove skill')
    },
  })

  const talent = talentQuery.data
  const submissions = submissionsQuery.data || []
  const candidate = talent?.candidate as { id: string; full_name: string; email?: string; phone?: string; avatar_url?: string; location?: string } | null
  const skills = talent?.skills as Array<{ id: string; skill_name: string; proficiency_level: number; years_experience?: number; is_certified?: boolean; certification_name?: string }> | null

  // Initialize edit form
  const startEdit = () => {
    if (talent) {
      setEditStatus(talent.status)
      setEditVisaType(talent.visa_type || '')
      setEditVisaExpiry(talent.visa_expiry_date || '')
      setEditMinRate(talent.min_acceptable_rate?.toString() || '')
      setEditTargetRate(talent.target_rate?.toString() || '')
      setEditMarketingStatus(talent.marketing_status)
      setEditWillingRelocate(talent.willing_relocate || false)
      setEditPreferredLocations(talent.preferred_locations?.join(', ') || '')
    }
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
  }

  const saveEdit = () => {
    updateMutation.mutate({
      id: talentId,
      status: editStatus as 'onboarding' | 'available' | 'marketing' | 'interviewing' | 'placed' | 'inactive',
      visaType: editVisaType || undefined,
      visaExpiryDate: editVisaExpiry || undefined,
      minAcceptableRate: editMinRate ? parseFloat(editMinRate) : undefined,
      targetRate: editTargetRate ? parseFloat(editTargetRate) : undefined,
      marketingStatus: editMarketingStatus as 'draft' | 'active' | 'paused' | 'archived',
      willingRelocate: editWillingRelocate,
      preferredLocations: editPreferredLocations ? editPreferredLocations.split(',').map(s => s.trim()) : undefined,
    })
  }

  const resetSkillForm = () => {
    setNewSkillName('')
    setNewSkillProficiency('3')
    setNewSkillYears('')
    setNewSkillCertified(false)
    setNewSkillCertName('')
  }

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Skill name is required')
      return
    }

    addSkillMutation.mutate({
      consultantId: talentId,
      skillName: newSkillName,
      proficiencyLevel: parseInt(newSkillProficiency),
      yearsExperience: newSkillYears ? parseFloat(newSkillYears) : undefined,
      isCertified: newSkillCertified,
      certificationName: newSkillCertName || undefined,
    })
  }

  // Calculate visa expiry alert
  const visaExpiryAlert = talent?.visa_expiry_date
    ? differenceInDays(new Date(talent.visa_expiry_date), new Date())
    : null

  if (talentQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!talent) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-900">Talent not found</h3>
          <p className="text-charcoal-500 mb-4">The talent you are looking for does not exist.</p>
          <Link href="/employee/recruiting/talent">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Talent
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employee/recruiting/talent">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
                {candidate?.full_name || 'Unknown Talent'}
              </h1>
              <Badge className={cn(statusColors[talent.status])}>{talent.status}</Badge>
              <Badge className={cn(marketingStatusColors[talent.marketing_status])}>
                {talent.marketing_status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-charcoal-500 mt-1">
              {candidate?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {candidate.email}
                </span>
              )}
              {candidate?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {candidate.phone}
                </span>
              )}
              {candidate?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {candidate.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={cancelEdit} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSubmitToJobOpen(true)}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Submit to Job
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAddSkillOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => deleteMutation.mutate({ id: talentId })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove from Bench
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Visa Expiry Alert */}
      {visaExpiryAlert !== null && visaExpiryAlert <= 90 && (
        <Card className={cn(
          "border-2",
          visaExpiryAlert <= 30 ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"
        )}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn(
                "w-5 h-5",
                visaExpiryAlert <= 30 ? "text-red-600" : "text-amber-600"
              )} />
              <div>
                <p className={cn(
                  "font-medium",
                  visaExpiryAlert <= 30 ? "text-red-800" : "text-amber-800"
                )}>
                  Visa expires in {visaExpiryAlert} days
                </p>
                <p className={cn(
                  "text-sm",
                  visaExpiryAlert <= 30 ? "text-red-600" : "text-amber-600"
                )}>
                  {talent.visa_type && visaLabels[talent.visa_type]} expires on {format(new Date(talent.visa_expiry_date!), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills ({skills?.length || 0})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Profile</TabsTrigger>
          <TabsTrigger value="immigration">Immigration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Talent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="placed">Placed</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-marketing">Marketing Status</Label>
                    <Select value={editMarketingStatus} onValueChange={setEditMarketingStatus}>
                      <SelectTrigger id="edit-marketing">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-visa">Visa Type</Label>
                    <Select value={editVisaType} onValueChange={setEditVisaType}>
                      <SelectTrigger id="edit-visa">
                        <SelectValue placeholder="Select visa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us_citizen">US Citizen</SelectItem>
                        <SelectItem value="gc">Green Card</SelectItem>
                        <SelectItem value="h1b">H-1B</SelectItem>
                        <SelectItem value="h1b_transfer">H-1B Transfer</SelectItem>
                        <SelectItem value="l1">L1</SelectItem>
                        <SelectItem value="opt">OPT</SelectItem>
                        <SelectItem value="opt_stem">OPT STEM</SelectItem>
                        <SelectItem value="cpt">CPT</SelectItem>
                        <SelectItem value="ead">EAD</SelectItem>
                        <SelectItem value="tn">TN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-visa-expiry">Visa Expiry</Label>
                    <Input
                      id="edit-visa-expiry"
                      type="date"
                      value={editVisaExpiry}
                      onChange={(e) => setEditVisaExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-min-rate">Min Rate ($/hr)</Label>
                    <Input
                      id="edit-min-rate"
                      type="number"
                      step="0.01"
                      value={editMinRate}
                      onChange={(e) => setEditMinRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-target-rate">Target Rate ($/hr)</Label>
                    <Input
                      id="edit-target-rate"
                      type="number"
                      step="0.01"
                      value={editTargetRate}
                      onChange={(e) => setEditTargetRate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="edit-relocate"
                      checked={editWillingRelocate}
                      onChange={(e) => setEditWillingRelocate(e.target.checked)}
                      className="rounded border-charcoal-300"
                    />
                    <Label htmlFor="edit-relocate">Willing to Relocate</Label>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-locations">Preferred Locations</Label>
                    <Input
                      id="edit-locations"
                      value={editPreferredLocations}
                      onChange={(e) => setEditPreferredLocations(e.target.value)}
                      placeholder="Comma-separated"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Authorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-charcoal-500">Visa Type</Label>
                    <p className="text-charcoal-900 font-medium">
                      {talent.visa_type ? visaLabels[talent.visa_type] : 'Not specified'}
                    </p>
                  </div>
                  {talent.visa_expiry_date && (
                    <div>
                      <Label className="text-charcoal-500">Expiry Date</Label>
                      <p className="text-charcoal-900">
                        {format(new Date(talent.visa_expiry_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {talent.work_auth_status && (
                    <div>
                      <Label className="text-charcoal-500">Status</Label>
                      <p className="text-charcoal-900">{talent.work_auth_status}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rate Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <Label className="text-charcoal-500">Minimum Rate</Label>
                      <p className="text-xl font-bold text-charcoal-900">
                        {talent.min_acceptable_rate ? `$${talent.min_acceptable_rate}/hr` : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-charcoal-500">Target Rate</Label>
                      <p className="text-xl font-bold text-green-600">
                        {talent.target_rate ? `$${talent.target_rate}/hr` : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-charcoal-500">Relocation</Label>
                    <p className="text-charcoal-900">
                      {talent.willing_relocate ? 'Willing to relocate' : 'Not willing to relocate'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-charcoal-500">Preferred Locations</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {talent.preferred_locations && talent.preferred_locations.length > 0 ? (
                        talent.preferred_locations.map((loc: string) => (
                          <Badge key={loc} variant="outline">{loc}</Badge>
                        ))
                      ) : (
                        <span className="text-charcoal-400">Not specified</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Stats */}
          {!editMode && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-500">On Bench Since</p>
                      <p className="text-lg font-bold text-charcoal-900">
                        {formatDistanceToNow(new Date(talent.bench_start_date), { addSuffix: true })}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-charcoal-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-500">Total Submissions</p>
                      <p className="text-lg font-bold text-charcoal-900">{submissions.length}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-charcoal-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-500">Active Submissions</p>
                      <p className="text-lg font-bold text-green-600">
                        {submissions.filter(s => !['rejected', 'placed'].includes(s.status)).length}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-green-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-500">Skills</p>
                      <p className="text-lg font-bold text-charcoal-900">{skills?.length || 0}</p>
                    </div>
                    <Star className="w-8 h-8 text-charcoal-300" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Skills Matrix</CardTitle>
                <CardDescription>Technical skills and proficiency levels</CardDescription>
              </div>
              <Button onClick={() => setAddSkillOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </CardHeader>
            <CardContent>
              {skills && skills.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Proficiency</TableHead>
                      <TableHead>Years</TableHead>
                      <TableHead>Certified</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.skill_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={cn(
                                  "w-4 h-4 rounded-full",
                                  level <= skill.proficiency_level
                                    ? "bg-gold-500"
                                    : "bg-charcoal-200"
                                )}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{skill.years_experience || '-'}</TableCell>
                        <TableCell>
                          {skill.is_certified ? (
                            <Badge className="bg-green-100 text-green-800">
                              {skill.certification_name || 'Certified'}
                            </Badge>
                          ) : (
                            <span className="text-charcoal-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkillMutation.mutate({ skillId: skill.id })}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal-900">No skills added</h3>
                  <p className="text-charcoal-500 mb-4">Add skills to improve matching</p>
                  <Button onClick={() => setAddSkillOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>Job order submissions for this talent</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Order</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => {
                      const jobOrder = submission.job_order as { id: string; title: string; vendor?: { id: string; name: string } } | null
                      return (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {jobOrder?.title || 'Unknown'}
                          </TableCell>
                          <TableCell>{jobOrder?.vendor?.name || '-'}</TableCell>
                          <TableCell>
                            {submission.submitted_rate ? `$${submission.submitted_rate}/hr` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(submissionStatusColors[submission.status] || 'bg-charcoal-100')}>
                              {submission.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-charcoal-500">
                            {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Link href={`/employee/recruiting/job-orders/${jobOrder?.id}`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal-900">No submissions yet</h3>
                  <p className="text-charcoal-500">Submit this talent to job orders to start tracking</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Profile Tab */}
        <TabsContent value="marketing" className="space-y-6">
          <MarketingProfileEditor
            consultantId={talentId}
            talentName={candidate?.full_name || 'Talent'}
            skills={skills?.map(s => ({ id: s.id, skill_name: s.skill_name, proficiency_level: s.proficiency_level }))}
          />
        </TabsContent>

        {/* Immigration Tab */}
        <TabsContent value="immigration" className="space-y-6">
          <ImmigrationTracker
            consultantId={talentId}
            visaType={talent.visa_type || undefined}
            visaExpiryDate={talent.visa_expiry_date || undefined}
            workAuthStatus={talent.work_auth_status || undefined}
            onUpdate={(data) => {
              updateMutation.mutate({
                id: talentId,
                visaType: data.visaType as any,
                visaExpiryDate: data.visaExpiryDate,
              })
            }}
            isUpdating={updateMutation.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* Add Skill Dialog */}
      <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>
              Add a technical skill with proficiency level
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g., React, Python, AWS"
              />
            </div>
            <div>
              <Label htmlFor="skill-proficiency">Proficiency Level (1-5)</Label>
              <Select value={newSkillProficiency} onValueChange={setNewSkillProficiency}>
                <SelectTrigger id="skill-proficiency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Elementary</SelectItem>
                  <SelectItem value="3">3 - Intermediate</SelectItem>
                  <SelectItem value="4">4 - Advanced</SelectItem>
                  <SelectItem value="5">5 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skill-years">Years of Experience</Label>
              <Input
                id="skill-years"
                type="number"
                step="0.5"
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(e.target.value)}
                placeholder="e.g., 3.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skill-certified"
                checked={newSkillCertified}
                onChange={(e) => setNewSkillCertified(e.target.checked)}
                className="rounded border-charcoal-300"
              />
              <Label htmlFor="skill-certified">Certified</Label>
            </div>
            {newSkillCertified && (
              <div>
                <Label htmlFor="skill-cert-name">Certification Name</Label>
                <Input
                  id="skill-cert-name"
                  value={newSkillCertName}
                  onChange={(e) => setNewSkillCertName(e.target.value)}
                  placeholder="e.g., AWS Solutions Architect"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={addSkillMutation.isPending}>
              {addSkillMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit to Job Dialog */}
      <SubmitToJobDialog
        open={submitToJobOpen}
        onOpenChange={setSubmitToJobOpen}
        consultantId={talentId}
        talentName={talent?.candidate?.full_name || 'Talent'}
        targetRate={talent?.target_rate || undefined}
      />
    </div>
  )
}
