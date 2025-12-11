'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
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
import {
  X,
  Loader2,
  Star,
  CheckCircle,
  Shield,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface SkillInlinePanelProps {
  entitySkillId: string
  entityType: string
  entityId: string
  onClose: () => void
  onUpdate: () => void
}

const proficiencyLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Beginner', color: 'bg-charcoal-100 text-charcoal-700' },
  2: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Intermediate', color: 'bg-green-100 text-green-700' },
  4: { label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  5: { label: 'Expert', color: 'bg-gold-100 text-gold-700' },
}

const verificationMethods = [
  { value: 'self_reported', label: 'Self Reported' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'endorsement', label: 'Endorsement' },
  { value: 'certification', label: 'Certification' },
  { value: 'interview', label: 'Interview' },
  { value: 'resume_parsed', label: 'Resume Parsed' },
]

export function SkillInlinePanel({
  entitySkillId,
  entityType,
  entityId: _entityId,
  onClose,
  onUpdate,
}: SkillInlinePanelProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState('assessment')

  // Form state for editing
  const [editProficiency, setEditProficiency] = useState<string>('')
  const [editYears, setEditYears] = useState('')
  const [editIsPrimary, setEditIsPrimary] = useState(false)
  const [editIsRequired, setEditIsRequired] = useState(false)

  // Query skill details
  const skillQuery = trpc.entitySkills.getById.useQuery({ id: entitySkillId })
  const skill = skillQuery.data

  // Mutations
  const updateMutation = trpc.entitySkills.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Skill updated' })
      setIsEditing(false)
      skillQuery.refetch()
      onUpdate()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const removeMutation = trpc.entitySkills.remove.useMutation({
    onSuccess: () => {
      toast({ title: 'Skill removed' })
      onClose()
      onUpdate()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const verifyMutation = trpc.entitySkills.verify.useMutation({
    onSuccess: () => {
      toast({ title: 'Skill verified' })
      setShowVerifyDialog(false)
      skillQuery.refetch()
      onUpdate()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const unverifyMutation = trpc.entitySkills.unverify.useMutation({
    onSuccess: () => {
      toast({ title: 'Verification removed' })
      skillQuery.refetch()
      onUpdate()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const togglePrimaryMutation = trpc.entitySkills.togglePrimary.useMutation({
    onSuccess: () => {
      toast({ title: skill?.isPrimary ? 'Removed as primary skill' : 'Set as primary skill' })
      skillQuery.refetch()
      onUpdate()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const handleStartEdit = () => {
    if (skill) {
      setEditProficiency(skill.proficiencyLevel?.toString() ?? '')
      setEditYears(skill.yearsExperience?.toString() ?? '')
      setEditIsPrimary(skill.isPrimary)
      setEditIsRequired(skill.isRequired ?? false)
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    updateMutation.mutate({
      id: entitySkillId,
      proficiencyLevel: editProficiency ? parseInt(editProficiency) : undefined,
      yearsExperience: editYears ? parseFloat(editYears) : undefined,
      isPrimary: editIsPrimary,
      isRequired: editIsRequired,
    })
  }

  const handleVerify = () => {
    verifyMutation.mutate({
      id: entitySkillId,
      verificationMethod: verificationMethod as 'self_reported' | 'assessment' | 'endorsement' | 'certification' | 'interview' | 'resume_parsed',
    })
  }

  if (skillQuery.isLoading) {
    return (
      <div className="w-[480px] bg-white border rounded-lg shadow-lg p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="w-[480px] bg-white border rounded-lg shadow-lg p-6">
        <p className="text-charcoal-500">Skill not found</p>
      </div>
    )
  }

  const proficiency = skill.proficiencyLevel ? proficiencyLabels[skill.proficiencyLevel] : null

  return (
    <div className="w-[480px] bg-white border rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{String(skill.skillName)}</h3>
          {skill.isPrimary && <Star className="w-4 h-4 text-gold-500 fill-gold-500" />}
          {skill.isVerified && <CheckCircle className="w-4 h-4 text-green-600" />}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Proficiency Level</Label>
              <Select value={editProficiency} onValueChange={setEditProficiency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(proficiencyLabels).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">Years Experience</Label>
              <Input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={editYears}
                onChange={(e) => setEditYears(e.target.value)}
                placeholder="e.g., 3.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="editIsPrimary"
                checked={editIsPrimary}
                onCheckedChange={setEditIsPrimary}
              />
              <Label htmlFor="editIsPrimary" className="cursor-pointer">
                Primary skill
              </Label>
            </div>

            {entityType === 'job' && (
              <div className="flex items-center gap-2">
                <Switch
                  id="editIsRequired"
                  checked={editIsRequired}
                  onCheckedChange={setEditIsRequired}
                />
                <Label htmlFor="editIsRequired" className="cursor-pointer">
                  Required skill
                </Label>
              </div>
            )}
          </div>
        ) : (
          /* View Mode */
          <>
            {/* Skill Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-charcoal-500">Category</Label>
                <p className="capitalize">
                  {typeof skill.skillCategory === 'string' ? skill.skillCategory.replace(/_/g, ' ') : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-charcoal-500">Domain</Label>
                <p className="capitalize">
                  {typeof skill.skillDomain === 'string' ? skill.skillDomain.replace(/_/g, ' ') : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-charcoal-500">Proficiency</Label>
                <div className="mt-1">
                  {proficiency ? (
                    <Badge className={cn('text-xs', proficiency.color)}>
                      {proficiency.label}
                    </Badge>
                  ) : (
                    <span className="text-charcoal-500">Not set</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-charcoal-500">Experience</Label>
                <p>{skill.yearsExperience ? `${skill.yearsExperience} years` : 'Not set'}</p>
              </div>
              {skill.lastUsedDate && (
                <div>
                  <Label className="text-xs text-charcoal-500">Last Used</Label>
                  <p>{format(new Date(skill.lastUsedDate), 'MMM yyyy')}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-charcoal-500">Source</Label>
                <p className="capitalize">{skill.source?.replace(/_/g, ' ') ?? 'Manual'}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skill.isPrimary && (
                <Badge className="bg-gold-100 text-gold-700">
                  <Star className="w-3 h-3 mr-1" />
                  Primary
                </Badge>
              )}
              {skill.isRequired && (
                <Badge variant="destructive">
                  <Shield className="w-3 h-3 mr-1" />
                  Required
                </Badge>
              )}
              {skill.isVerified ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-charcoal-500">
                  <XCircle className="w-3 h-3 mr-1" />
                  Unverified
                </Badge>
              )}
            </div>

            {/* Verification Details */}
            {skill.isVerified && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-xs text-green-700 font-medium">Verification Details</Label>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <span className="text-charcoal-500">Method:</span>{' '}
                    <span className="capitalize">{skill.verificationMethod?.replace(/_/g, ' ')}</span>
                  </p>
                  {skill.verifiedByUser && (
                    <p>
                      <span className="text-charcoal-500">Verified by:</span>{' '}
                      {skill.verifiedByUser.fullName}
                    </p>
                  )}
                  {skill.verifiedAt && (
                    <p>
                      <span className="text-charcoal-500">Verified:</span>{' '}
                      {formatDistanceToNow(new Date(skill.verifiedAt), { addSuffix: true })}
                    </p>
                  )}
                  {skill.confidenceScore && (
                    <p>
                      <span className="text-charcoal-500">Confidence:</span>{' '}
                      {Math.round(skill.confidenceScore * 100)}%
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              <Label className="text-xs text-charcoal-500">Quick Actions</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePrimaryMutation.mutate({
                    id: entitySkillId,
                    isPrimary: !skill.isPrimary,
                  })}
                  disabled={togglePrimaryMutation.isPending}
                >
                  <Star className={cn('w-4 h-4 mr-1', skill.isPrimary && 'fill-gold-500 text-gold-500')} />
                  {skill.isPrimary ? 'Remove Primary' : 'Set Primary'}
                </Button>
                {skill.isVerified ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unverifyMutation.mutate({ id: entitySkillId })}
                    disabled={unverifyMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Remove Verification
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerifyDialog(true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verify Skill
                  </Button>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t text-xs text-charcoal-500">
              <p>Added {formatDistanceToNow(new Date(skill.createdAt), { addSuffix: true })}</p>
              <p>Updated {formatDistanceToNow(new Date(skill.updatedAt), { addSuffix: true })}</p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex items-center justify-between">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{String(skill.skillName)}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeMutation.mutate({ id: entitySkillId })}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Choose the verification method for &quot;{String(skill.skillName)}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="mb-1.5 block">Verification Method</Label>
            <Select value={verificationMethod} onValueChange={setVerificationMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {verificationMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerify}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
