'use client'

import * as React from 'react'
import { SkillsSection } from '../sections/SkillsSection'
import type { SkillsSectionData, SkillEntry, CertificationEntry } from '@/lib/candidates/types'
import { useCreateCandidateStore, CreateCandidateFormData } from '@/stores/create-candidate-store'
import type { WizardStepComponentProps } from '@/configs/entities/types'

/**
 * SkillsStepWrapper - Bridges wizard props to SkillsSection
 *
 * Uses the Zustand store directly for skills and certifications management
 */
export function SkillsStepWrapper({
  formData,
  errors = {},
}: WizardStepComponentProps<CreateCandidateFormData>) {
  // Get store actions
  const {
    addSkill,
    updateSkill,
    removeSkill,
    addCertification,
    updateCertification,
    removeCertification,
  } = useCreateCandidateStore()

  // Map formData to section data format
  const sectionData: SkillsSectionData = React.useMemo(() => {
    // Map store's SkillEntry to section's SkillEntry format
    const skills: SkillEntry[] = (formData?.skills || []).map((s, index) => ({
      id: `skill-${index}`,
      skillId: `skill-${index}`,
      skillName: s.name,
      skillCategory: null, // Not tracked in store
      proficiencyLevel: s.proficiency === 'beginner' ? 1
        : s.proficiency === 'intermediate' ? 3
        : s.proficiency === 'advanced' ? 4
        : s.proficiency === 'expert' ? 5
        : 3,
      yearsExperience: s.yearsOfExperience ?? null,
      isPrimary: s.isPrimary,
      source: null,
    }))

    // Map store's CertificationEntry to section's format
    const certifications: CertificationEntry[] = (formData?.certifications || []).map((c, index) => ({
      id: `cert-${index}`,
      name: c.name,
      acronym: c.acronym || null,
      issuingOrganization: c.issuingOrganization || null,
      credentialId: c.credentialId || null,
      credentialUrl: c.credentialUrl || null,
      issueDate: c.issueDate || null,
      expiryDate: c.expiryDate || null,
      isLifetime: c.isLifetime,
    }))

    return { skills, certifications }
  }, [formData?.skills, formData?.certifications])

  // Handlers that use store actions
  const handleAddSkill = React.useCallback((entry: Omit<SkillEntry, 'id'>) => {
    const proficiencyMap: Record<number, 'beginner' | 'intermediate' | 'advanced' | 'expert'> = {
      1: 'beginner',
      2: 'beginner',
      3: 'intermediate',
      4: 'advanced',
      5: 'expert',
    }
    addSkill({
      name: entry.skillName,
      proficiency: proficiencyMap[entry.proficiencyLevel] || 'intermediate',
      yearsOfExperience: entry.yearsExperience ?? undefined,
      isPrimary: entry.isPrimary,
      isCertified: false,
    })
  }, [addSkill])

  const handleUpdateSkill = React.useCallback((id: string, entry: Partial<SkillEntry>) => {
    // Extract index from id
    const indexMatch = id.match(/skill-(\d+)/)
    if (indexMatch) {
      const index = parseInt(indexMatch[1], 10)
      const proficiencyMap: Record<number, 'beginner' | 'intermediate' | 'advanced' | 'expert'> = {
        1: 'beginner',
        2: 'beginner',
        3: 'intermediate',
        4: 'advanced',
        5: 'expert',
      }
      updateSkill(index, {
        name: entry.skillName,
        proficiency: entry.proficiencyLevel ? proficiencyMap[entry.proficiencyLevel] : undefined,
        yearsOfExperience: entry.yearsExperience ?? undefined,
        isPrimary: entry.isPrimary,
      })
    }
  }, [updateSkill])

  const handleRemoveSkill = React.useCallback((id: string) => {
    const indexMatch = id.match(/skill-(\d+)/)
    if (indexMatch) {
      const index = parseInt(indexMatch[1], 10)
      removeSkill(index)
    }
  }, [removeSkill])

  const handleAddCertification = React.useCallback((entry: Omit<CertificationEntry, 'id'>) => {
    addCertification({
      name: entry.name,
      acronym: entry.acronym || undefined,
      issuingOrganization: entry.issuingOrganization || undefined,
      credentialId: entry.credentialId || undefined,
      credentialUrl: entry.credentialUrl || undefined,
      issueDate: entry.issueDate || undefined,
      expiryDate: entry.expiryDate || undefined,
      isLifetime: entry.isLifetime,
    })
  }, [addCertification])

  const handleUpdateCertification = React.useCallback((id: string, entry: Partial<CertificationEntry>) => {
    const indexMatch = id.match(/cert-(\d+)/)
    if (indexMatch) {
      const index = parseInt(indexMatch[1], 10)
      updateCertification(index, entry as any)
    }
  }, [updateCertification])

  const handleRemoveCertification = React.useCallback((id: string) => {
    const indexMatch = id.match(/cert-(\d+)/)
    if (indexMatch) {
      const index = parseInt(indexMatch[1], 10)
      removeCertification(index)
    }
  }, [removeCertification])

  return (
    <SkillsSection
      mode="create"
      data={sectionData}
      onAddSkill={handleAddSkill}
      onUpdateSkill={handleUpdateSkill}
      onRemoveSkill={handleRemoveSkill}
      onAddCertification={handleAddCertification}
      onUpdateCertification={handleUpdateCertification}
      onRemoveCertification={handleRemoveCertification}
      errors={errors}
    />
  )
}
