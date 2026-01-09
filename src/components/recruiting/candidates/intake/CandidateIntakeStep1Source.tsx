'use client'

import { Upload, Linkedin } from 'lucide-react'
import { useCreateCandidateStore, SOURCE_TYPES } from '@/stores/create-candidate-store'
import { Section, RadioOptionCard, ValidationBanner } from './shared'
import { ResumeUploadParser } from '@/components/recruiting/ResumeUploadParser'
import type { ParsedResumeData } from '@/lib/services/resume-parser'

export function CandidateIntakeStep1Source() {
  const { formData, setFormData, setResumeFile } = useCreateCandidateStore()

  // Handle resume parsed - update store with all extracted data
  const handleResumeParsed = (data: ParsedResumeData, file: File) => {
    // Store the file and parsed data for upload during submission
    setResumeFile(file, data)

    // Update form with extracted data
    setFormData({
      // Mark as parsed
      resumeParsed: true,
      // Basic Info (Step 2)
      firstName: data.firstName || formData.firstName,
      lastName: data.lastName || formData.lastName,
      email: data.email || formData.email,
      phone: data.phone || formData.phone,
      linkedinProfile: data.linkedinProfile || formData.linkedinProfile,
      // Professional (Step 3)
      professionalHeadline: data.professionalHeadline || formData.professionalHeadline,
      professionalSummary: data.professionalSummary || formData.professionalSummary,
      skills: data.skills?.length ? data.skills : formData.skills,
      experienceYears: data.experienceYears ?? formData.experienceYears,
      // Authorization (Step 4)
      visaStatus: data.visaStatus || formData.visaStatus,
      locationCity: data.locationCity || formData.locationCity,
      locationState: data.locationState || formData.locationState,
      locationCountry: data.locationCountry || formData.locationCountry,
      location: data.locationCity && data.locationState
        ? `${data.locationCity}, ${data.locationState}`
        : formData.location,
    })
  }

  // Handle resume error - just reset parsed flag
  const handleResumeError = (_error: string) => {
    setFormData({ resumeParsed: false })
    setResumeFile(null, null)
  }

  const sourceIcons: Record<string, React.ReactNode> = {
    manual: <span className="text-2xl">✏️</span>,
    resume: <Upload className="w-6 h-6 text-gold-600" />,
    linkedin: <Linkedin className="w-6 h-6 text-blue-600" />,
  }

  // Build validation items
  const validationItems: string[] = []
  if (!formData.sourceType) validationItems.push('Select how you are adding this candidate')

  return (
    <div className="space-y-8">
      <Section
        icon={Upload}
        title="Source"
        subtitle="How are you adding this candidate?"
      >
        <div className="space-y-4">
          {SOURCE_TYPES.map((type) => (
            <RadioOptionCard
              key={type.value}
              selected={formData.sourceType === type.value}
              onClick={() => setFormData({ sourceType: type.value as 'manual' | 'resume' | 'linkedin' })}
              icon={sourceIcons[type.value]}
              label={type.label}
              description={type.description}
              disabled={'disabled' in type ? type.disabled : false}
            />
          ))}
        </div>
      </Section>

      {/* Resume Upload Section - shown when resume is selected */}
      {formData.sourceType === 'resume' && (
        <Section
          icon={Upload}
          title="Upload Resume"
          subtitle="Upload a PDF resume to automatically extract candidate information"
        >
          <ResumeUploadParser
            onParsed={handleResumeParsed}
            onError={handleResumeError}
            disabled={formData.resumeParsed}
          />
        </Section>
      )}

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
