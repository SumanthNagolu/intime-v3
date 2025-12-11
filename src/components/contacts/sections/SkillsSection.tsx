'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Code,
  Loader2,
  Star,
  CheckCircle,
  Plus,
  TrendingUp,
  Shield
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { AddSkillInlineForm } from './AddSkillInlineForm'
import { SkillInlinePanel } from './SkillInlinePanel'
import { BulkAddSkillsDialog } from './BulkAddSkillsDialog'

interface SkillsSectionProps {
  contactId: string
  entityType?: string
  showRequiredColumn?: boolean
}

const proficiencyLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Beginner', color: 'bg-charcoal-100 text-charcoal-700' },
  2: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Intermediate', color: 'bg-green-100 text-green-700' },
  4: { label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  5: { label: 'Expert', color: 'bg-gold-100 text-gold-700' },
}

export function SkillsSection({
  contactId,
  entityType = 'contact',
  showRequiredColumn = false
}: SkillsSectionProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBulkAdd, setShowBulkAdd] = useState(false)

  const skillsQuery = trpc.entitySkills.listByEntity.useQuery({
    entityType,
    entityId: contactId,
  })

  const statsQuery = trpc.entitySkills.statsByEntity.useQuery({
    entityType,
    entityId: contactId,
  })

  const skills = skillsQuery.data ?? []
  const stats = statsQuery.data

  const handleSkillClick = (skillId: string) => {
    setSelectedSkillId(skillId)
  }

  const handleClosePanel = () => {
    setSelectedSkillId(null)
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    skillsQuery.refetch()
    statsQuery.refetch()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Skills
              {stats && stats.total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.total}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Technical skills, proficiency levels, and years of experience
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkAdd(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Add
            </Button>
          </div>
        </div>
        {/* Stats bar */}
        {stats && stats.total > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-charcoal-600">
            <div className="flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              <span>{stats.total} skills</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{stats.verified} verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-gold-500" />
              <span>{stats.primary} primary</span>
            </div>
            {showRequiredColumn && stats.required > 0 && (
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-red-500" />
                <span>{stats.required} required</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Skills list */}
          <div className={cn(
            'flex-1 transition-all duration-300',
            selectedSkillId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
          )}>
            {/* Inline Add Form */}
            <div className="mb-4">
              {showAddForm ? (
                <AddSkillInlineForm
                  entityType={entityType}
                  entityId={contactId}
                  showRequiredField={showRequiredColumn}
                  onSuccess={handleAddSuccess}
                  onCancel={() => setShowAddForm(false)}
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              )}
            </div>

            {/* Loading State */}
            {skillsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : skills.length === 0 ? (
              /* Empty State */
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No skills added yet</p>
                <p className="text-sm text-charcoal-400 mt-2">
                  Click &quot;Add Skill&quot; to add skills with proficiency levels
                </p>
              </div>
            ) : (
              /* Skills List */
              <div className="space-y-2">
                {skills.map((skill) => {
                  const proficiency = skill.proficiencyLevel
                    ? proficiencyLabels[skill.proficiencyLevel]
                    : null

                  return (
                    <div
                      key={skill.id}
                      onClick={() => handleSkillClick(skill.id)}
                      className={cn(
                        'p-3 border rounded-lg cursor-pointer transition-colors',
                        skill.isPrimary && selectedSkillId !== skill.id && 'border-gold-300 bg-gold-50/50',
                        selectedSkillId === skill.id
                          ? 'border-hublot-500 bg-hublot-50'
                          : 'hover:border-charcoal-300 hover:bg-charcoal-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {String(skill.skillName)}
                            </span>
                            {skill.isPrimary && (
                              <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                            )}
                            {skill.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {skill.isRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-charcoal-600">
                            {typeof skill.skillCategory === 'string' && (
                              <span className="capitalize">
                                {skill.skillCategory.replace(/_/g, ' ')}
                              </span>
                            )}
                            {skill.yearsExperience && (
                              <span>{skill.yearsExperience} years</span>
                            )}
                            {skill.lastUsedDate && (
                              <span>
                                Last used {formatDistanceToNow(new Date(skill.lastUsedDate as string), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          {proficiency && (
                            <Badge className={cn('text-xs', proficiency.color)}>
                              {proficiency.label}
                            </Badge>
                          )}
                          {skill.source === 'resume_parsed' && (
                            <span title="Parsed from resume">
                              <TrendingUp className="w-4 h-4 text-blue-500" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Inline detail panel */}
          {selectedSkillId && (
            <SkillInlinePanel
              entitySkillId={selectedSkillId}
              entityType={entityType}
              entityId={contactId}
              onClose={handleClosePanel}
              onUpdate={() => {
                skillsQuery.refetch()
                statsQuery.refetch()
              }}
            />
          )}
        </div>
      </CardContent>

      {/* Bulk Add Dialog */}
      <BulkAddSkillsDialog
        open={showBulkAdd}
        onOpenChange={setShowBulkAdd}
        entityType={entityType}
        entityId={contactId}
        showRequiredField={showRequiredColumn}
        onSuccess={() => {
          setShowBulkAdd(false)
          skillsQuery.refetch()
          statsQuery.refetch()
        }}
      />
    </Card>
  )
}
