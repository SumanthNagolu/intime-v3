'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCreateJobStore } from '@/stores/create-job-store'
import { Code, Star, Clock, FileText } from 'lucide-react'

export function CreateJobStep2Requirements() {
  const { formData, setFormData, addSkill, removeSkill } = useCreateJobStore()
  const [skillInput, setSkillInput] = useState('')
  const [niceToHaveInput, setNiceToHaveInput] = useState('')

  const handleAddSkill = (isRequired: boolean) => {
    const input = isRequired ? skillInput : niceToHaveInput
    if (!input.trim()) return

    addSkill(input, isRequired)
    if (isRequired) {
      setSkillInput('')
    } else {
      setNiceToHaveInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, isRequired: boolean) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddSkill(isRequired)
    }
  }

  return (
    <div className="space-y-6">
      {/* Required Skills */}
      <div>
        <Label htmlFor="requiredSkills" className="flex items-center gap-2 mb-2">
          <Code className="w-4 h-4" />
          Required Skills *
        </Label>
        <div className="flex gap-2 mb-3 max-w-xl">
          <Input
            id="requiredSkills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, true)}
            placeholder="Type skill and press Enter"
          />
          <Button type="button" variant="outline" onClick={() => handleAddSkill(true)}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-hublot-100 text-hublot-900 rounded-full text-sm font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill, true)}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        {formData.requiredSkills.length === 0 && (
          <p className="text-xs text-charcoal-500 mt-2">Add at least one required skill</p>
        )}
      </div>

      {/* Nice-to-Have Skills */}
      <div>
        <Label htmlFor="niceToHaveSkills" className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4" />
          Nice-to-Have Skills
        </Label>
        <div className="flex gap-2 mb-3 max-w-xl">
          <Input
            id="niceToHaveSkills"
            value={niceToHaveInput}
            onChange={(e) => setNiceToHaveInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, false)}
            placeholder="Type skill and press Enter"
          />
          <Button type="button" variant="outline" onClick={() => handleAddSkill(false)}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.niceToHaveSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-charcoal-100 text-charcoal-700 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill, false)}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Experience Range */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" />
          Experience Level (years)
        </Label>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <Label htmlFor="minExp" className="text-sm text-charcoal-500">Minimum</Label>
            <Input
              id="minExp"
              type="number"
              min={0}
              max={50}
              value={formData.minExperience}
              onChange={(e) => setFormData({ minExperience: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="maxExp" className="text-sm text-charcoal-500">Maximum</Label>
            <Input
              id="maxExp"
              type="number"
              min={0}
              max={50}
              value={formData.maxExperience}
              onChange={(e) => setFormData({ maxExperience: e.target.value })}
              placeholder="10"
            />
          </div>
        </div>
        {formData.minExperience && formData.maxExperience && (
          <p className="text-sm text-charcoal-600 mt-2">
            Looking for {formData.minExperience} to {formData.maxExperience} years of experience
          </p>
        )}
      </div>

      {/* Job Description */}
      <div>
        <Label htmlFor="description" className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4" />
          Job Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ description: e.target.value })}
          placeholder="Enter job description, responsibilities, and requirements..."
          rows={6}
          maxLength={5000}
          className="w-full"
        />
        <p className="text-xs text-charcoal-500 mt-1">{formData.description.length}/5000</p>
      </div>
    </div>
  )
}
