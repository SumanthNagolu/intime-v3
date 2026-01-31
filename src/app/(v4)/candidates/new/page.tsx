'use client'

/**
 * New Candidate Page - V4 Linear-style Form
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4CandidateMutations } from '@/lib/v4/hooks/useV4Mutations'

export default function NewCandidatePage() {
  const router = useRouter()
  const { createCandidate, isCreating } = useV4CandidateMutations()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    professionalHeadline: '',
    experienceYears: '',
    skills: '',
    linkedinUrl: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.experienceYears) newErrors.experienceYears = 'Experience is required'
    if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Parse skills from comma-separated string
    const skillsList = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, proficiency: 'intermediate' as const, yearsOfExperience: 1 }))

    try {
      await createCandidate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        professionalHeadline: formData.professionalHeadline || undefined,
        experienceYears: Number(formData.experienceYears),
        skills: skillsList,
        linkedinUrl: formData.linkedinUrl || undefined,
        employmentTypes: ['full_time', 'contract'],
        workModes: ['on_site', 'remote'],
        workHistory: [],
        education: [],
        certifications: [],
      })
      router.push('/candidates')
    } catch (err) {
      // Error handled by mutation
    }
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header */}
      <header className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-10 h-10 rounded-lg bg-neutral-800 items-center justify-center">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">New Candidate</h1>
                <p className="hidden sm:block text-sm text-neutral-500">Add a new candidate to your pipeline</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Create Candidate</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value })
                  setErrors({ ...errors, firstName: '' })
                }}
                placeholder="John"
                className={cn(
                  'w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder:text-neutral-500',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  errors.firstName ? 'border-red-500' : 'border-neutral-700'
                )}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value })
                  setErrors({ ...errors, lastName: '' })
                }}
                placeholder="Doe"
                className={cn(
                  'w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder:text-neutral-500',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  errors.lastName ? 'border-red-500' : 'border-neutral-700'
                )}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setErrors({ ...errors, email: '' })
                  }}
                  placeholder="john@example.com"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder:text-neutral-500',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    errors.email ? 'border-red-500' : 'border-neutral-700'
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Professional */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Professional Headline
            </label>
            <input
              type="text"
              value={formData.professionalHeadline}
              onChange={(e) => setFormData({ ...formData, professionalHeadline: e.target.value })}
              placeholder="e.g., Senior React Developer with 8 years experience"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Years of Experience *
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.experienceYears}
              onChange={(e) => {
                setFormData({ ...formData, experienceYears: e.target.value })
                setErrors({ ...errors, experienceYears: '' })
              }}
              placeholder="5"
              className={cn(
                'w-32 px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder:text-neutral-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                errors.experienceYears ? 'border-red-500' : 'border-neutral-700'
              )}
            />
            {errors.experienceYears && (
              <p className="mt-1 text-sm text-red-400">{errors.experienceYears}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Skills * <span className="text-neutral-500 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => {
                setFormData({ ...formData, skills: e.target.value })
                setErrors({ ...errors, skills: '' })
              }}
              placeholder="e.g., React, TypeScript, Node.js, AWS"
              className={cn(
                'w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder:text-neutral-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                errors.skills ? 'border-red-500' : 'border-neutral-700'
              )}
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-400">{errors.skills}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/johndoe"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </div>

      {/* Footer - hidden on mobile */}
      <footer className="hidden sm:block flex-shrink-0 px-6 py-2 border-t border-neutral-800">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">Esc</kbd> Cancel
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">Cmd+Enter</kbd> Save
          </span>
        </div>
      </footer>
    </div>
  )
}
