'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Plus,
  Save,
  Edit2,
  X,
  Eye,
  Download,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface MarketingProfileEditorProps {
  consultantId: string
  talentName: string
  skills?: Array<{ id: string; skill_name: string; proficiency_level: number }>
}

const statusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-600',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
}

export function MarketingProfileEditor({ consultantId, talentName, skills = [] }: MarketingProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    headline: '',
    summary: '',
    highlightedSkills: [] as string[],
    experienceYears: '',
    availability: '',
    noticePeriod: '',
    customSections: '',
  })

  // Fetch existing marketing profile
  const profileQuery = trpc.bench.marketing.getProfile.useQuery({ consultantId })

  const utils = trpc.useUtils()
  const upsertMutation = trpc.bench.marketing.upsertProfile.useMutation({
    onSuccess: () => {
      toast.success('Marketing profile saved successfully')
      utils.bench.marketing.getProfile.invalidate({ consultantId })
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save marketing profile')
    }
  })

  const updateStatusMutation = trpc.bench.marketing.updateProfileStatus.useMutation({
    onSuccess: () => {
      toast.success('Profile status updated')
      utils.bench.marketing.getProfile.invalidate({ consultantId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    }
  })

  const profile = profileQuery.data

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        headline: profile.headline || '',
        summary: profile.summary || '',
        highlightedSkills: profile.highlights || [],
        experienceYears: '',
        availability: '',
        noticePeriod: '',
        customSections: '',
      })
    }
  }, [profile])

  const handleSave = () => {
    upsertMutation.mutate({
      consultantId,
      headline: formData.headline || undefined,
      summary: formData.summary || undefined,
      highlights: formData.highlightedSkills.length > 0 ? formData.highlightedSkills : undefined,
    })
  }

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({
      consultantId,
      status: newStatus as 'draft' | 'pending_approval' | 'approved' | 'published'
    })
  }

  const toggleSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      highlightedSkills: prev.highlightedSkills.includes(skillName)
        ? prev.highlightedSkills.filter(s => s !== skillName)
        : [...prev.highlightedSkills, skillName]
    }))
  }

  if (profileQuery.isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // No profile yet - show create form
  if (!profile && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketing Profile</CardTitle>
          <CardDescription>Create a polished marketing profile for client presentations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900">No Marketing Profile Yet</h3>
            <p className="text-charcoal-500 mb-4">
              Create a professional profile to market {talentName} to clients
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Edit mode
  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Edit Marketing Profile</CardTitle>
            <CardDescription>Update the marketing profile for client presentations</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Headline */}
          <div className="space-y-2">
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g., Senior Full Stack Developer with 8+ Years Experience"
            />
            <p className="text-xs text-charcoal-500">
              A catchy one-liner that summarizes the talent's expertise
            </p>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Write a compelling summary highlighting key achievements, expertise, and value proposition..."
              rows={6}
            />
          </div>

          {/* Highlighted Skills */}
          <div className="space-y-2">
            <Label>Highlighted Skills</Label>
            <p className="text-xs text-charcoal-500 mb-2">
              Select skills to highlight in the marketing profile
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => {
                  const isSelected = formData.highlightedSkills.includes(skill.skill_name)
                  return (
                    <Badge
                      key={skill.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-gold-500 hover:bg-gold-600' : 'hover:bg-charcoal-100'
                      }`}
                      onClick={() => toggleSkill(skill.skill_name)}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3 mr-1" />}
                      {skill.skill_name}
                    </Badge>
                  )
                })
              ) : (
                <p className="text-charcoal-400 text-sm">No skills added yet. Add skills to the talent profile first.</p>
              )}
            </div>
          </div>

          {/* Experience & Availability */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Total Experience (Years)</Label>
              <Input
                id="experienceYears"
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                placeholder="e.g., 8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData({ ...formData, availability: value })}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="1_week">1 Week</SelectItem>
                  <SelectItem value="2_weeks">2 Weeks</SelectItem>
                  <SelectItem value="1_month">1 Month</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="noticePeriod">Notice Period</Label>
              <Input
                id="noticePeriod"
                value={formData.noticePeriod}
                onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                placeholder="e.g., 2 weeks"
              />
            </div>
          </div>

          {/* Custom Sections (JSON) */}
          <div className="space-y-2">
            <Label htmlFor="customSections">Custom Sections (JSON)</Label>
            <Textarea
              id="customSections"
              value={formData.customSections}
              onChange={(e) => setFormData({ ...formData, customSections: e.target.value })}
              placeholder='{"certifications": ["AWS Solutions Architect"], "projects": [{"name": "Project X", "description": "..."}]}'
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-charcoal-500">
              Add custom sections as JSON for additional profile information
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // View mode (profile exists)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Marketing Profile</CardTitle>
            <CardDescription>Profile used for marketing to clients</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[profile.status] || 'bg-charcoal-100'}>
              {profile.status}
            </Badge>
            <Select value={profile.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Headline */}
          {profile.headline && (
            <div>
              <Label className="text-charcoal-500">Professional Headline</Label>
              <p className="text-lg font-medium text-charcoal-900 mt-1">{profile.headline}</p>
            </div>
          )}

          {/* Summary */}
          {profile.summary && (
            <div>
              <Label className="text-charcoal-500">Professional Summary</Label>
              <p className="text-charcoal-700 mt-1 whitespace-pre-line">{profile.summary}</p>
            </div>
          )}

          {/* Highlighted Skills */}
          {profile.highlights && profile.highlights.length > 0 && (
            <div>
              <Label className="text-charcoal-500">Highlighted Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.highlights.map((skill: string, index: number) => (
                  <Badge key={index} className="bg-gold-100 text-gold-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.info('Preview functionality coming soon')}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Profile
            </Button>
            <Button variant="outline" onClick={() => toast.info('Export functionality coming soon')}>
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={() => toast.info('Send functionality coming soon')}>
              <Send className="w-4 h-4 mr-2" />
              Send to Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Status Card */}
      <Card className={profile.status === 'published' ? 'border-green-200 bg-green-50' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {profile.status === 'published' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="font-medium text-charcoal-900">
                {profile.status === 'published'
                  ? 'Profile is published and ready for marketing'
                  : `Profile is ${profile.status?.replace('_', ' ')} - update status to start marketing`}
              </p>
              <p className="text-sm text-charcoal-600">
                Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
