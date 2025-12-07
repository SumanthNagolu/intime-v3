'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Save,
  Download,
  FileText,
  Eye,
  Edit,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Star,
  Briefcase,
  GraduationCap,
  Code,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ProfileBuilderProps {
  candidateId: string
  jobId?: string
  candidateName: string
  onClose: () => void
  onSave?: () => void
  existingProfileId?: string
}

interface SkillMatrix {
  skill: string
  years: number
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  job_match?: boolean
}

interface Experience {
  company: string
  role: string
  duration: string
  achievements: string[]
}

interface ProfileData {
  summary: string
  keyHighlights: string[]
  skillsMatrix: SkillMatrix[]
  experience: Experience[]
  whyThisCandidate: string
  education: string
}

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

const TEMPLATE_TYPES = [
  { value: 'standard', label: 'Standard', description: 'Clean, professional format' },
  { value: 'client_custom', label: 'Client Custom', description: 'Tailored for specific client' },
  { value: 'minimal', label: 'Minimal', description: 'Concise, focused on essentials' },
]

export function ProfileBuilder({
  candidateId,
  jobId,
  candidateName,
  onClose,
  onSave,
  existingProfileId,
}: ProfileBuilderProps) {
  const { toast } = useToast()
  const [templateType, setTemplateType] = useState<'standard' | 'client_custom' | 'minimal'>('standard')
  const [activeSection, setActiveSection] = useState<string>('summary')
  const [isSaving, setIsSaving] = useState(false)

  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    summary: '',
    keyHighlights: ['', '', ''],
    skillsMatrix: [],
    experience: [],
    whyThisCandidate: '',
    education: '',
  })

  // Query candidate data to pre-fill
  const candidateQuery = trpc.ats.candidates.getById.useQuery({ id: candidateId })

  // Query existing profile if editing
  const profileQuery = trpc.ats.candidates.getProfile.useQuery(
    { profileId: existingProfileId! },
    { enabled: !!existingProfileId }
  )

  // Mutations
  const createProfileMutation = trpc.ats.candidates.createProfile.useMutation({
    onSuccess: () => {
      toast({ title: 'Profile created successfully' })
      onSave?.()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const updateProfileMutation = trpc.ats.candidates.updateProfile.useMutation({
    onSuccess: () => {
      toast({ title: 'Profile updated successfully' })
      onSave?.()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const finalizeProfileMutation = trpc.ats.candidates.finalizeProfile.useMutation({
    onSuccess: () => {
      toast({ title: 'Profile finalized and ready for export' })
      onSave?.()
      onClose()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Pre-fill from candidate data
  useEffect(() => {
    if (candidateQuery.data && !existingProfileId) {
      const candidate = candidateQuery.data
      setProfileData((prev) => ({
        ...prev,
        summary: candidate.summary || '',
        skillsMatrix: (candidate.skills || []).map((s: { skill_name: string; years_experience?: number }) => ({
          skill: s.skill_name,
          years: s.years_experience || 1,
          level: 'intermediate' as const,
          job_match: true,
        })),
      }))
    }
  }, [candidateQuery.data, existingProfileId])

  // Load existing profile data
  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data
      setProfileData({
        summary: profile.summary || '',
        keyHighlights: profile.key_highlights || ['', '', ''],
        skillsMatrix: profile.skills_matrix || [],
        experience: profile.experience_summary || [],
        whyThisCandidate: profile.why_this_candidate || '',
        education: typeof profile.education === 'string' ? profile.education : JSON.stringify(profile.education) || '',
      })
      setTemplateType(profile.template_type as typeof templateType)
    }
  }, [profileQuery.data])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (existingProfileId) {
        // Update only the editable fields
        await updateProfileMutation.mutateAsync({
          profileId: existingProfileId,
          summary: profileData.summary,
          keyHighlights: profileData.keyHighlights.filter(Boolean),
          whyThisCandidate: profileData.whyThisCandidate,
        })
      } else {
        // First create the profile (just creates the record)
        const result = await createProfileMutation.mutateAsync({
          candidateId,
          jobId,
          templateType,
        })
        // Then update with the content if we have a profileId
        if (result?.profileId) {
          await updateProfileMutation.mutateAsync({
            profileId: result.profileId,
            summary: profileData.summary,
            keyHighlights: profileData.keyHighlights.filter(Boolean),
            whyThisCandidate: profileData.whyThisCandidate,
          })
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalize = () => {
    if (!existingProfileId) {
      toast({ title: 'Please save the profile first', variant: 'error' })
      return
    }
    finalizeProfileMutation.mutate({ profileId: existingProfileId })
  }

  const addHighlight = () => {
    setProfileData((prev) => ({
      ...prev,
      keyHighlights: [...prev.keyHighlights, ''],
    }))
  }

  const updateHighlight = (index: number, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      keyHighlights: prev.keyHighlights.map((h, i) => (i === index ? value : h)),
    }))
  }

  const removeHighlight = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      keyHighlights: prev.keyHighlights.filter((_, i) => i !== index),
    }))
  }

  const addSkill = () => {
    setProfileData((prev) => ({
      ...prev,
      skillsMatrix: [...prev.skillsMatrix, { skill: '', years: 1, level: 'intermediate', job_match: true }],
    }))
  }

  const updateSkill = (index: number, field: keyof SkillMatrix, value: string | number | boolean) => {
    setProfileData((prev) => ({
      ...prev,
      skillsMatrix: prev.skillsMatrix.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }))
  }

  const removeSkill = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      skillsMatrix: prev.skillsMatrix.filter((_, i) => i !== index),
    }))
  }

  const addExperience = () => {
    setProfileData((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', duration: '', achievements: [''] }],
    }))
  }

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      ),
    }))
  }

  const removeExperience = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  const sections = [
    { id: 'summary', label: 'Summary', icon: User },
    { id: 'highlights', label: 'Key Highlights', icon: Star },
    { id: 'skills', label: 'Skills Matrix', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'why', label: 'Why This Candidate', icon: CheckCircle },
    { id: 'education', label: 'Education', icon: GraduationCap },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-bold text-charcoal-900">
                Profile Builder
              </h1>
              <p className="text-charcoal-500">
                Preparing profile for <strong>{candidateName}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={finalizeProfileMutation.isPending || !existingProfileId}
              className="bg-green-600 hover:bg-green-700"
            >
              {finalizeProfileMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Finalize
            </Button>
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <Card className="bg-white mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Template:</Label>
              <div className="flex gap-2">
                {TEMPLATE_TYPES.map((template) => (
                  <button
                    key={template.value}
                    onClick={() => setTemplateType(template.value as typeof templateType)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm transition-all',
                      templateType === template.value
                        ? 'border-hublot-900 bg-hublot-50 text-hublot-900'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="space-y-4">
            {/* Section Navigation */}
            <Card className="bg-white">
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                        activeSection === section.id
                          ? 'bg-hublot-900 text-white'
                          : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                      )}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Section */}
            {activeSection === 'summary' && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profileData.summary}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder="Write a compelling professional summary..."
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-charcoal-400 mt-2">
                    Tip: Focus on key achievements and unique value proposition
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Highlights Section */}
            {activeSection === 'highlights' && (
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Key Highlights
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={addHighlight}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileData.keyHighlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        placeholder={`Highlight ${index + 1}...`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeHighlight(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills Matrix Section */}
            {activeSection === 'skills' && (
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Skills Matrix
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={addSkill}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Skill
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.skillsMatrix.map((skill, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 bg-charcoal-50 rounded-lg">
                      <Input
                        value={skill.skill}
                        onChange={(e) => updateSkill(index, 'skill', e.target.value)}
                        placeholder="Skill name"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={skill.years}
                        onChange={(e) => updateSkill(index, 'years', parseInt(e.target.value) || 0)}
                        placeholder="Years"
                        className="w-20"
                      />
                      <Select
                        value={skill.level}
                        onValueChange={(value) => updateSkill(index, 'level', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSkill(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {profileData.skillsMatrix.length === 0 && (
                    <p className="text-charcoal-400 text-center py-4">No skills added yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experience Summary
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={addExperience}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Position
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.experience.map((exp, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <Input
                            value={exp.role}
                            onChange={(e) => updateExperience(index, 'role', e.target.value)}
                            placeholder="Role/Title"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              placeholder="Company"
                            />
                            <Input
                              value={exp.duration}
                              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                              placeholder="Duration (e.g., 2020-2023)"
                            />
                          </div>
                          <Textarea
                            value={exp.achievements.join('\n')}
                            onChange={(e) =>
                              updateExperience(index, 'achievements', e.target.value.split('\n'))
                            }
                            placeholder="Key achievements (one per line)"
                            className="min-h-[80px]"
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeExperience(index)}
                          className="text-red-500 hover:text-red-600 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {profileData.experience.length === 0 && (
                    <p className="text-charcoal-400 text-center py-4">No experience added yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Why This Candidate Section */}
            {activeSection === 'why' && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Why This Candidate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profileData.whyThisCandidate}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, whyThisCandidate: e.target.value }))
                    }
                    placeholder="Explain why this candidate is the right fit..."
                    className="min-h-[150px]"
                  />
                </CardContent>
              </Card>
            )}

            {/* Education Section */}
            {activeSection === 'education' && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profileData.education}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, education: e.target.value }))
                    }
                    placeholder="Education details..."
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Preview */}
          <div>
            <Card className="bg-white sticky top-6">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <Badge variant="outline">{templateType}</Badge>
              </CardHeader>
              <CardContent className="p-6">
                {/* Preview Content */}
                <div className="space-y-6 text-sm">
                  {/* Header */}
                  <div className="text-center pb-4 border-b">
                    <h2 className="text-xl font-bold text-charcoal-900">{candidateName}</h2>
                    <p className="text-charcoal-500">Candidate Profile</p>
                  </div>

                  {/* Summary */}
                  {profileData.summary && (
                    <div>
                      <h3 className="font-bold text-charcoal-900 mb-2 uppercase text-xs tracking-wider">
                        Professional Summary
                      </h3>
                      <p className="text-charcoal-700 whitespace-pre-wrap">{profileData.summary}</p>
                    </div>
                  )}

                  {/* Key Highlights */}
                  {profileData.keyHighlights.filter(Boolean).length > 0 && (
                    <div>
                      <h3 className="font-bold text-charcoal-900 mb-2 uppercase text-xs tracking-wider">
                        Key Highlights
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-charcoal-700">
                        {profileData.keyHighlights.filter(Boolean).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {profileData.skillsMatrix.length > 0 && (
                    <div>
                      <h3 className="font-bold text-charcoal-900 mb-2 uppercase text-xs tracking-wider">
                        Technical Skills
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {profileData.skillsMatrix.map((skill, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-charcoal-50 rounded"
                          >
                            <span className="font-medium">{skill.skill}</span>
                            <span className="text-xs text-charcoal-500">
                              {skill.years}y • {skill.level}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {profileData.experience.length > 0 && (
                    <div>
                      <h3 className="font-bold text-charcoal-900 mb-2 uppercase text-xs tracking-wider">
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {profileData.experience.map((exp, i) => (
                          <div key={i}>
                            <div className="font-medium text-charcoal-900">{exp.role}</div>
                            <div className="text-charcoal-500">
                              {exp.company} • {exp.duration}
                            </div>
                            {exp.achievements.filter(Boolean).length > 0 && (
                              <ul className="list-disc list-inside mt-1 text-charcoal-700">
                                {exp.achievements.filter(Boolean).map((a, j) => (
                                  <li key={j}>{a}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Why This Candidate */}
                  {profileData.whyThisCandidate && (
                    <div>
                      <h3 className="font-bold text-charcoal-900 mb-2 uppercase text-xs tracking-wider">
                        Why This Candidate
                      </h3>
                      <p className="text-charcoal-700 whitespace-pre-wrap">
                        {profileData.whyThisCandidate}
                      </p>
                    </div>
                  )}

                  {/* Education */}
                  {profileData.education && (
                    <div>
                      <h3 className="font-bold text-charcoal-900 mb-2 uppercase text-xs tracking-wider">
                        Education
                      </h3>
                      <p className="text-charcoal-700 whitespace-pre-wrap">{profileData.education}</p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!profileData.summary &&
                    !profileData.keyHighlights.filter(Boolean).length &&
                    !profileData.skillsMatrix.length &&
                    !profileData.experience.length && (
                      <div className="text-center py-8 text-charcoal-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Start filling in the sections to see a preview</p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
