'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Code2,
  ExternalLink,
  Flame,
  Github,
  Globe,
  GraduationCap,
  Layers,
  Linkedin,
  MapPin,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  useProfileStore,
  type SkillLevel,
  type SkillCategory,
  type ProfileSkill,
  type Certification,
  type Project,
  type Implementation,
} from '@/lib/academy/profile-store'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { TOTAL_LESSONS, CHAPTERS } from '@/lib/academy/curriculum'

// ============================================================
// Constants
// ============================================================

const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'guidewire-core', label: 'Guidewire Core' },
  { value: 'guidewire-development', label: 'Development' },
  { value: 'guidewire-config', label: 'Configuration' },
  { value: 'integration', label: 'Integration' },
  { value: 'methodology', label: 'Methodology' },
  { value: 'general', label: 'General' },
]

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']

const IMPL_CATEGORIES = [
  'UI Customization',
  'Business Rules',
  'Data Model',
  'Integration',
  'Rating',
  'Workflow',
  'Reporting',
  'Performance',
  'Migration',
  'Other',
]

// ============================================================
// Helpers
// ============================================================

function useProfileCompletion() {
  const store = useProfileStore()
  const fields = [
    store.name,
    store.title,
    store.summary,
    store.location,
    store.yearsExperience,
  ]
  const filledFields = fields.filter(Boolean).length
  const hasSkills = store.skills.length > 0
  const hasCerts = store.certifications.length > 0
  const hasProjects = store.projects.length > 0
  const hasSocial = !!(store.linkedinUrl || store.githubUrl || store.portfolioUrl)

  const total = 9 // 5 fields + skills + certs + projects + social
  const filled = filledFields + (hasSkills ? 1 : 0) + (hasCerts ? 1 : 0) + (hasProjects ? 1 : 0) + (hasSocial ? 1 : 0)
  return Math.round((filled / total) * 100)
}

function useIsProfileEmpty() {
  const store = useProfileStore()
  return !store.name && !store.title && !store.summary && store.skills.length === 0 && store.projects.length === 0
}

// ============================================================
// Main Component
// ============================================================

export function AcademyProfileView() {
  const store = useProfileStore()
  const { isEditMode } = store
  const isEmpty = useIsProfileEmpty()
  const completion = useProfileCompletion()

  // Auto-enable edit mode on first visit (empty profile)
  useEffect(() => {
    if (isEmpty && !isEditMode) {
      store.setEditMode(true)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-heading font-bold text-charcoal-900 tracking-tight">
              Developer Profile
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Build your professional Guidewire portfolio
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Completion meter */}
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-24 h-1.5 rounded-full bg-charcoal-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-charcoal-500 tabular-nums">
                {completion}%
              </span>
            </div>
            <div className="flex items-center gap-2.5 pl-4 border-l border-charcoal-200">
              <span className="text-xs font-medium text-charcoal-500">
                {isEditMode ? 'Editing' : 'Viewing'}
              </span>
              <Switch
                checked={isEditMode}
                onCheckedChange={(v) => store.setEditMode(v)}
              />
            </div>
          </div>
        </div>

        {/* Onboarding Banner - shows when profile is empty and in edit mode */}
        {isEmpty && isEditMode && (
          <div className="rounded-xl border border-gold-200 bg-gradient-to-r from-gold-50 to-amber-50 p-5 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900 text-sm">
                  Welcome to your Developer Profile
                </h3>
                <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                  This is your living portfolio. Start by adding your name and title above,
                  then document your project experience, skills, and certifications.
                  Everything saves automatically to your browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <ProfileHeaderCard />

        {/* Academy Badges Strip */}
        <AcademyBadgesStrip />

        {/* Technical Skills */}
        <TechnicalSkillsSection />

        {/* Certifications */}
        <CertificationsSection />

        {/* Project Experience */}
        <ProjectExperienceSection />
      </div>
    </div>
  )
}

// ============================================================
// Profile Header Card (dark bg with gradient)
// ============================================================

function ProfileHeaderCard() {
  const store = useProfileStore()
  const { isEditMode } = store

  const initials = store.name
    ? store.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'GW'

  const hasSocialLinks = !!(store.linkedinUrl || store.githubUrl || store.portfolioUrl)

  return (
    <div className="rounded-xl overflow-hidden shadow-elevation-md animate-fade-in" style={{ animationDelay: '75ms' }}>
      {/* Gradient top accent */}
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600" />
      <div className="bg-charcoal-900 text-white relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-800/50 via-transparent to-gold-900/10" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-2xl font-heading font-bold text-charcoal-900 shrink-0 shadow-lg shadow-gold-500/20">
                {initials}
              </div>
              {isEditMode && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center shadow-sm">
                  <Pencil className="w-3 h-3 text-charcoal-900" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <InlineEditableField
                  value={store.name}
                  onChange={(v) => store.setField('name', v)}
                  placeholder="Your Full Name"
                  viewPlaceholder="Add your name"
                  editing={isEditMode}
                  className="text-xl font-heading font-bold text-white"
                  placeholderClassName="text-xl font-heading font-bold text-white/30 italic"
                  inputClassName="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg"
                />
                <InlineEditableField
                  value={store.title}
                  onChange={(v) => store.setField('title', v)}
                  placeholder="e.g. Guidewire Developer / PolicyCenter Specialist"
                  viewPlaceholder="Add your professional title"
                  editing={isEditMode}
                  className="text-sm text-charcoal-400 mt-1"
                  placeholderClassName="text-sm text-white/20 italic mt-1"
                  inputClassName="bg-white/10 border-white/20 text-charcoal-300 placeholder:text-white/30"
                />
              </div>
              <InlineEditableTextarea
                value={store.summary}
                onChange={(v) => store.setField('summary', v)}
                placeholder="Brief professional summary highlighting your Guidewire expertise and career goals..."
                viewPlaceholder="Add a professional summary to introduce yourself..."
                editing={isEditMode}
                className="text-sm text-charcoal-300 leading-relaxed"
                placeholderClassName="text-sm text-white/20 italic leading-relaxed"
                inputClassName="bg-white/10 border-white/20 text-charcoal-300 placeholder:text-white/30"
                rows={2}
              />
            </div>

            {/* Meta */}
            <div className="sm:text-right space-y-2 shrink-0">
              <div className="flex items-center gap-2 sm:justify-end text-sm text-charcoal-400">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <InlineEditableField
                  value={store.location}
                  onChange={(v) => store.setField('location', v)}
                  placeholder="City, Country"
                  viewPlaceholder="Location"
                  editing={isEditMode}
                  className="text-sm text-charcoal-400"
                  placeholderClassName="text-sm text-white/20 italic"
                  inputClassName="bg-white/10 border-white/20 text-charcoal-300 placeholder:text-white/30 w-32"
                />
              </div>
              <div className="flex items-center gap-2 sm:justify-end text-sm text-charcoal-400">
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <InlineEditableField
                  value={store.yearsExperience}
                  onChange={(v) => store.setField('yearsExperience', v)}
                  placeholder="e.g. 3 years"
                  viewPlaceholder="Experience"
                  editing={isEditMode}
                  className="text-sm text-charcoal-400"
                  placeholderClassName="text-sm text-white/20 italic"
                  inputClassName="bg-white/10 border-white/20 text-charcoal-300 placeholder:text-white/30 w-28"
                />
              </div>
            </div>
          </div>

          {/* Social Links - only show divider when there's content or in edit mode */}
          {(isEditMode || hasSocialLinks) && (
            <div className="mt-5 pt-5 border-t border-white/10 flex flex-wrap gap-4">
              <SocialLink
                icon={Linkedin}
                value={store.linkedinUrl}
                onChange={(v) => store.setField('linkedinUrl', v)}
                placeholder="LinkedIn URL"
                editing={isEditMode}
              />
              <SocialLink
                icon={Github}
                value={store.githubUrl}
                onChange={(v) => store.setField('githubUrl', v)}
                placeholder="GitHub URL"
                editing={isEditMode}
              />
              <SocialLink
                icon={Globe}
                value={store.portfolioUrl}
                onChange={(v) => store.setField('portfolioUrl', v)}
                placeholder="Portfolio URL"
                editing={isEditMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Academy Badges Strip
// ============================================================

function AcademyBadgesStrip() {
  const { lessons, readinessIndex, streak } = useAcademyStore()
  const completedCount = Object.values(lessons).filter(
    (l) => l.status === 'completed'
  ).length
  const chaptersStarted = new Set(
    Object.keys(lessons)
      .filter((id) => lessons[id].status !== 'locked')
      .map((id) => id.split('-')[0])
  ).size

  const badges = [
    {
      label: 'Readiness',
      value: `${readinessIndex}%`,
      icon: Target,
      color: readinessIndex >= 50 ? 'text-green-600' : readinessIndex >= 20 ? 'text-amber-600' : 'text-charcoal-500',
      bgColor: readinessIndex >= 50 ? 'bg-green-50' : readinessIndex >= 20 ? 'bg-amber-50' : 'bg-charcoal-100',
    },
    {
      label: 'Completed',
      value: `${completedCount}/${TOTAL_LESSONS}`,
      icon: CheckCircle,
      color: 'text-charcoal-500',
      bgColor: 'bg-charcoal-100',
    },
    {
      label: 'Chapters',
      value: `${chaptersStarted}/${CHAPTERS.length}`,
      icon: BookOpen,
      color: 'text-charcoal-500',
      bgColor: 'bg-charcoal-100',
    },
    {
      label: 'Streak',
      value: `${streak}d`,
      icon: Flame,
      color: streak > 0 ? 'text-orange-500' : 'text-charcoal-500',
      bgColor: streak > 0 ? 'bg-orange-50' : 'bg-charcoal-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
      {badges.map((b, idx) => (
        <div
          key={b.label}
          className="group rounded-xl border border-charcoal-200/60 bg-white p-3.5 flex items-center gap-3 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors', b.bgColor)}>
            <b.icon className={cn('w-4 h-4 transition-colors', b.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">
              {b.label}
            </p>
            <p className="text-lg font-bold text-charcoal-900 tabular-nums leading-tight">
              {b.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Technical Skills Section
// ============================================================

function TechnicalSkillsSection() {
  const store = useProfileStore()
  const { skills, isEditMode } = store
  const [showAdd, setShowAdd] = useState(false)

  const grouped = SKILL_CATEGORIES.map((cat) => ({
    ...cat,
    skills: skills.filter((s) => s.category === cat.value),
  })).filter((g) => g.skills.length > 0)

  return (
    <SectionCard
      title="Technical Skills"
      icon={Code2}
      count={skills.length}
      delay={225}
      rightAction={
        isEditMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => store.syncSkillsFromProgress()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gold-700 bg-gold-50 hover:bg-gold-100 border border-gold-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync from Academy
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        ) : undefined
      }
    >
      {skills.length === 0 ? (
        <EmptyState
          icon={Code2}
          message="No skills added yet"
          hint={isEditMode ? 'Click "Sync from Academy" to auto-populate skills from your training progress, or add them manually.' : 'Enable edit mode to add your technical skills.'}
          action={isEditMode ? { label: 'Sync from Academy', onClick: () => store.syncSkillsFromProgress(), icon: RefreshCw } : undefined}
        />
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.value}>
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-3">
                {group.label}
              </p>
              <div className="space-y-2.5">
                {group.skills.map((skill) => (
                  <SkillBar
                    key={skill.id}
                    skill={skill}
                    editing={isEditMode}
                    onRemove={() => store.removeSkill(skill.id)}
                    onLevelChange={(level) =>
                      store.updateSkill(skill.id, { level })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddSkillForm
          onAdd={(skill) => {
            store.addSkill(skill)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </SectionCard>
  )
}

// ============================================================
// Certifications Section
// ============================================================

function CertificationsSection() {
  const store = useProfileStore()
  const { certifications, isEditMode } = store
  const [showAdd, setShowAdd] = useState(false)

  return (
    <SectionCard
      title="Certifications"
      icon={Award}
      count={certifications.length}
      delay={300}
      rightAction={
        isEditMode ? (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:bg-charcoal-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        ) : undefined
      }
    >
      {certifications.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          message="No certifications added"
          hint={isEditMode ? 'Add your Guidewire certifications, cloud credentials, or other relevant qualifications.' : 'Enable edit mode to add certifications.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certifications.map((cert) => (
            <CertificationCard
              key={cert.id}
              cert={cert}
              editing={isEditMode}
              onRemove={() => store.removeCertification(cert.id)}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddCertificationForm
          onAdd={(cert) => {
            store.addCertification(cert)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </SectionCard>
  )
}

// ============================================================
// Project Experience Section
// ============================================================

function ProjectExperienceSection() {
  const store = useProfileStore()
  const { projects, isEditMode } = store
  const [showAdd, setShowAdd] = useState(false)

  return (
    <SectionCard
      title="Project Experience"
      icon={Briefcase}
      count={projects.length}
      delay={375}
      rightAction={
        isEditMode ? (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:bg-charcoal-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </button>
        ) : undefined
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          icon={Layers}
          message="No projects documented"
          hint={isEditMode
            ? 'Document your Guidewire implementations, including the problems you solved, your technical approach, and the business impact.'
            : 'Enable edit mode to document your project experience.'}
          action={isEditMode ? { label: 'Add First Project', onClick: () => setShowAdd(true), icon: Plus } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddProjectForm
          onAdd={(project) => {
            store.addProject(project)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </SectionCard>
  )
}

// ============================================================
// Project Card (collapsible)
// ============================================================

function ProjectCard({ project }: { project: Project }) {
  const store = useProfileStore()
  const { isEditMode } = store
  const [isOpen, setIsOpen] = useState(false)
  const [showAddImpl, setShowAddImpl] = useState(false)

  const duration = project.isCurrent
    ? `${project.startDate} - Present`
    : `${project.startDate}${project.endDate ? ` - ${project.endDate}` : ''}`

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-charcoal-200/60 bg-white overflow-hidden hover:border-charcoal-300/60 transition-colors">
        <CollapsibleTrigger className="w-full text-left p-4 flex items-start gap-3 hover:bg-charcoal-50/40 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center shrink-0 mt-0.5">
            <Briefcase className="w-4 h-4 text-charcoal-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-charcoal-900 text-sm">
                  {project.name || 'Untitled Project'}
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {project.client && <span className="font-medium">{project.client}</span>}
                  {project.client && project.role && <span> &middot; </span>}
                  {project.role && <span>{project.role}</span>}
                  {(project.client || project.role) && <span> &middot; </span>}
                  <span className="text-charcoal-400">{duration}</span>
                </p>
                {/* Quick stats */}
                <div className="flex items-center gap-3 mt-1.5">
                  {project.technologies.length > 0 && (
                    <span className="text-[10px] text-charcoal-400">
                      {project.technologies.length} technologies
                    </span>
                  )}
                  {project.implementations.length > 0 && (
                    <span className="text-[10px] text-charcoal-400">
                      {project.implementations.length} implementations
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      store.removeProject(project.id)
                    }}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronRight
                  className={cn(
                    'w-4 h-4 text-charcoal-400 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-90'
                  )}
                />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-5 pl-[60px] space-y-4 border-t border-charcoal-100">
            <div className="pt-4" />

            {/* Description */}
            <div>
              <Label>Description</Label>
              {isEditMode ? (
                <textarea
                  value={project.description}
                  onChange={(e) =>
                    store.updateProject(project.id, {
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the project scope and your contribution..."
                  className="w-full mt-1.5 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm text-charcoal-700 resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                  {project.description || <span className="italic text-charcoal-400">No description provided.</span>}
                </p>
              )}
            </div>

            {/* Responsibilities */}
            <div>
              <Label>Key Responsibilities</Label>
              {isEditMode ? (
                <EditableList
                  items={project.responsibilities}
                  onChange={(items) =>
                    store.updateProject(project.id, {
                      responsibilities: items,
                    })
                  }
                  placeholder="Add a responsibility"
                />
              ) : project.responsibilities.length > 0 ? (
                <ul className="mt-1.5 space-y-1.5">
                  {project.responsibilities.map((r, i) => (
                    <li
                      key={i}
                      className="text-sm text-charcoal-600 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-charcoal-400 mt-1 italic">
                  No responsibilities listed.
                </p>
              )}
            </div>

            {/* Technologies */}
            <div>
              <Label>Technologies Used</Label>
              {isEditMode ? (
                <TagInput
                  tags={project.technologies}
                  onChange={(tags) =>
                    store.updateProject(project.id, { technologies: tags })
                  }
                  placeholder="e.g. PolicyCenter, Gosu, PCF..."
                />
              ) : project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {project.technologies.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[11px] bg-charcoal-100 text-charcoal-600 border-0 px-2.5 py-0.5"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Key Implementations */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-gold-500" />
                  <Label>Key Implementations</Label>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => setShowAddImpl(true)}
                    className="flex items-center gap-1 text-xs font-medium text-gold-700 bg-gold-50 hover:bg-gold-100 px-2.5 py-1 rounded-lg border border-gold-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>

              {project.implementations.length === 0 && !showAddImpl ? (
                <p className="text-sm text-charcoal-400 italic pl-5">
                  {isEditMode
                    ? 'Document the key technical solutions you built in this project.'
                    : 'No implementations documented.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {project.implementations.map((impl) => (
                    <ImplementationCard
                      key={impl.id}
                      impl={impl}
                      projectId={project.id}
                    />
                  ))}
                </div>
              )}

              {showAddImpl && (
                <AddImplementationForm
                  onAdd={(impl) => {
                    store.addImplementation(project.id, impl)
                    setShowAddImpl(false)
                  }}
                  onCancel={() => setShowAddImpl(false)}
                />
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

// ============================================================
// Implementation Card (collapsible)
// ============================================================

function ImplementationCard({
  impl,
  projectId,
}: {
  impl: Implementation
  projectId: string
}) {
  const store = useProfileStore()
  const { isEditMode } = store
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-charcoal-200/40 bg-charcoal-50/30 overflow-hidden">
        <CollapsibleTrigger className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-charcoal-50/60 transition-colors">
          <ChevronRight
            className={cn(
              'w-3.5 h-3.5 text-charcoal-400 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-90'
            )}
          />
          <Badge
            variant="outline"
            className="text-[10px] border-charcoal-200 text-charcoal-500 shrink-0 font-medium"
          >
            {impl.category}
          </Badge>
          <span className="text-sm font-medium text-charcoal-800 truncate">
            {impl.title || 'Untitled Implementation'}
          </span>
          {isEditMode && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                store.removeImplementation(projectId, impl.id)
              }}
              className="ml-auto p-1 rounded text-charcoal-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 pl-8 space-y-3 border-t border-charcoal-200/40">
            <div className="pt-3" />
            <ImplField
              label="Problem"
              value={impl.problem}
              editing={isEditMode}
              onChange={(v) =>
                store.updateImplementation(projectId, impl.id, { problem: v })
              }
              placeholder="What challenge did you face?"
            />
            <ImplField
              label="Solution"
              value={impl.solution}
              editing={isEditMode}
              onChange={(v) =>
                store.updateImplementation(projectId, impl.id, { solution: v })
              }
              placeholder="How did you solve it?"
            />
            <ImplField
              label="Technical Details"
              value={impl.technicalDetails}
              editing={isEditMode}
              onChange={(v) =>
                store.updateImplementation(projectId, impl.id, {
                  technicalDetails: v,
                })
              }
              placeholder="Gosu, PCF, entity extensions, plugins used..."
            />
            <ImplField
              label="Impact"
              value={impl.impact}
              editing={isEditMode}
              onChange={(v) =>
                store.updateImplementation(projectId, impl.id, { impact: v })
              }
              placeholder="What was the business or technical impact?"
            />

            {/* Technologies */}
            <div>
              <Label>Technologies</Label>
              {isEditMode ? (
                <TagInput
                  tags={impl.technologies}
                  onChange={(tags) =>
                    store.updateImplementation(projectId, impl.id, {
                      technologies: tags,
                    })
                  }
                  placeholder="Add technology"
                />
              ) : impl.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {impl.technologies.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px] bg-charcoal-100 text-charcoal-600 border-0"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

// ============================================================
// Sub-components: Inline Editable Field / Textarea
// ============================================================

function InlineEditableField({
  value,
  onChange,
  placeholder,
  viewPlaceholder,
  editing,
  className,
  placeholderClassName,
  inputClassName,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  viewPlaceholder?: string
  editing: boolean
  className?: string
  placeholderClassName?: string
  inputClassName?: string
}) {
  if (editing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-2.5 py-1.5 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/20',
          inputClassName
        )}
      />
    )
  }
  if (!value) {
    if (viewPlaceholder) {
      return <p className={placeholderClassName}>{viewPlaceholder}</p>
    }
    return null
  }
  return <p className={className}>{value}</p>
}

function InlineEditableTextarea({
  value,
  onChange,
  placeholder,
  viewPlaceholder,
  editing,
  className,
  placeholderClassName,
  inputClassName,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  viewPlaceholder?: string
  editing: boolean
  className?: string
  placeholderClassName?: string
  inputClassName?: string
  rows?: number
}) {
  if (editing) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full px-2.5 py-1.5 rounded-lg border text-sm bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20',
          inputClassName
        )}
      />
    )
  }
  if (!value) {
    if (viewPlaceholder) {
      return <p className={placeholderClassName}>{viewPlaceholder}</p>
    }
    return null
  }
  return <p className={className}>{value}</p>
}

// ============================================================
// Sub-components: Misc helpers
// ============================================================

function SocialLink({
  icon: Icon,
  value,
  onChange,
  placeholder,
  editing,
}: {
  icon: React.ElementType
  value: string
  onChange: (v: string) => void
  placeholder: string
  editing: boolean
}) {
  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-charcoal-400" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="px-2.5 py-1.5 rounded-lg border border-white/20 bg-white/10 text-sm text-charcoal-300 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500/20 w-48"
        />
      </div>
    )
  }
  if (!value) return null
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-gold-400 transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span className="truncate max-w-[160px]">
        {value.replace(/^https?:\/\/(www\.)?/, '')}
      </span>
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

function SectionCard({
  title,
  icon: Icon,
  count,
  delay = 0,
  rightAction,
  children,
}: {
  title: string
  icon: React.ElementType
  count?: number
  delay?: number
  rightAction?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-charcoal-600" />
          </div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-semibold text-charcoal-900">{title}</h3>
            {count !== undefined && count > 0 && (
              <span className="text-xs tabular-nums text-charcoal-400 bg-charcoal-100 px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
        </div>
        {rightAction}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
      {children}
    </p>
  )
}

function EmptyState({
  icon: Icon,
  message,
  hint,
  action,
}: {
  icon: React.ElementType
  message: string
  hint: string
  action?: { label: string; onClick: () => void; icon: React.ElementType }
}) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-charcoal-400" />
      </div>
      <p className="text-sm font-medium text-charcoal-600">{message}</p>
      <p className="text-xs text-charcoal-400 mt-1.5 max-w-xs mx-auto leading-relaxed">{hint}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors"
        >
          <action.icon className="w-3.5 h-3.5" />
          {action.label}
        </button>
      )}
    </div>
  )
}

function ImplField({
  label,
  value,
  editing,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm text-charcoal-700 resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        />
      ) : (
        <p className="text-sm text-charcoal-600 mt-0.5 leading-relaxed">
          {value || <span className="italic text-charcoal-400">-</span>}
        </p>
      )}
    </div>
  )
}

// ============================================================
// Skill Bar
// ============================================================

function SkillBar({
  skill,
  editing,
  onRemove,
  onLevelChange,
}: {
  skill: ProfileSkill
  editing: boolean
  onRemove: () => void
  onLevelChange: (level: SkillLevel) => void
}) {
  const levelIdx = SKILL_LEVELS.indexOf(skill.level)

  return (
    <div className="flex items-center gap-3 group py-0.5">
      <span className="text-sm text-charcoal-700 w-52 truncate shrink-0 font-medium">
        {skill.name}
      </span>
      <div className="flex gap-1.5 flex-1 max-w-[200px]">
        {SKILL_LEVELS.map((lvl, i) => (
          <button
            key={lvl}
            disabled={!editing}
            onClick={() => editing && onLevelChange(lvl)}
            title={lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            className={cn(
              'h-2.5 flex-1 rounded-sm transition-all duration-200',
              i <= levelIdx
                ? 'bg-gradient-to-r from-gold-500 to-gold-400'
                : 'bg-charcoal-200',
              editing && 'cursor-pointer hover:scale-y-150'
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-charcoal-400 capitalize w-20 text-right font-medium">
        {skill.level}
      </span>
      {editing && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-400 hover:text-red-500 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ============================================================
// Certification Card
// ============================================================

function CertificationCard({
  cert,
  editing,
  onRemove,
}: {
  cert: Certification
  editing: boolean
  onRemove: () => void
}) {
  return (
    <div className="rounded-lg border border-charcoal-200/60 bg-white p-4 flex items-start gap-3 group hover:shadow-elevation-sm transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center shrink-0">
        <GraduationCap className="w-5 h-5 text-gold-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-charcoal-900 truncate">
          {cert.name}
        </h4>
        <p className="text-xs text-charcoal-500 mt-0.5">
          {cert.issuer} &middot; {cert.dateObtained}
        </p>
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 mt-1.5 font-medium"
          >
            View credential
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      {editing && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ============================================================
// Tag Input
// ============================================================

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
}) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[11px] bg-charcoal-100 text-charcoal-600 border-0 gap-1 pr-1 pl-2.5"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-0.5 p-0.5 rounded hover:bg-charcoal-200 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        />
        <button
          onClick={addTag}
          disabled={!input.trim()}
          className="px-3 py-1.5 rounded-lg bg-charcoal-100 text-xs font-medium text-charcoal-600 hover:bg-charcoal-200 transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Editable List (for responsibilities)
// ============================================================

function EditableList({
  items,
  onChange,
  placeholder,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  const [input, setInput] = useState('')

  const addItem = () => {
    const trimmed = input.trim()
    if (trimmed) {
      onChange([...items, trimmed])
      setInput('')
    }
  }

  return (
    <div className="mt-1.5 space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 shrink-0" />
          <span className="flex-1 text-sm text-charcoal-600">{item}</span>
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-charcoal-400 hover:text-red-500 transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        />
        <button
          onClick={addItem}
          disabled={!input.trim()}
          className="px-3 py-1.5 rounded-lg bg-charcoal-100 text-xs font-medium text-charcoal-600 hover:bg-charcoal-200 transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Add Forms
// ============================================================

function AddSkillForm({
  onAdd,
  onCancel,
}: {
  onAdd: (skill: Omit<ProfileSkill, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<SkillLevel>('beginner')
  const [category, setCategory] = useState<SkillCategory>('general')

  return (
    <div className="mt-4 p-4 rounded-lg border border-gold-200 bg-gold-50/50 space-y-3">
      <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
        Add Skill
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Skill name (e.g. Gosu Programming)"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        autoFocus
      />
      <div className="flex gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          {SKILL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as SkillLevel)}
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (name.trim()) onAdd({ name: name.trim(), level, category })
          }}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
        >
          Add Skill
        </button>
      </div>
    </div>
  )
}

function AddCertificationForm({
  onAdd,
  onCancel,
}: {
  onAdd: (cert: Omit<Certification, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [date, setDate] = useState('')
  const [url, setUrl] = useState('')

  return (
    <div className="mt-4 p-4 rounded-lg border border-gold-200 bg-gold-50/50 space-y-3">
      <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
        Add Certification
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Guidewire Certified Associate"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        autoFocus
      />
      <div className="flex gap-3">
        <input
          type="text"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="Issuing organization"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="e.g. Jan 2025"
          className="w-36 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
      </div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Credential URL (optional)"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (name.trim() && issuer.trim() && date.trim())
              onAdd({
                name: name.trim(),
                issuer: issuer.trim(),
                dateObtained: date.trim(),
                credentialUrl: url.trim() || undefined,
              })
          }}
          disabled={!name.trim() || !issuer.trim() || !date.trim()}
          className="px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
        >
          Add Certification
        </button>
      </div>
    </div>
  )
}

function AddProjectForm({
  onAdd,
  onCancel,
}: {
  onAdd: (
    project: Omit<Project, 'id' | 'implementations' | 'sortOrder'>
  ) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [role, setRole] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [description, setDescription] = useState('')

  return (
    <div className="mt-4 p-4 rounded-lg border border-gold-200 bg-gold-50/50 space-y-3">
      <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
        Add Project
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. PolicyCenter Cloud Migration"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        autoFocus
      />
      <div className="flex gap-3">
        <input
          type="text"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Client / Company"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. GW Developer"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
      </div>
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start (e.g. Jan 2024)"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
        {!isCurrent && (
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End (e.g. Dec 2024)"
            className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        )}
        <label className="flex items-center gap-2 text-xs text-charcoal-600 shrink-0 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="rounded border-charcoal-300"
          />
          Current
        </label>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the project scope, your role, and key outcomes..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (name.trim())
              onAdd({
                name: name.trim(),
                client: client.trim(),
                role: role.trim(),
                startDate: startDate.trim(),
                endDate: endDate.trim() || undefined,
                isCurrent,
                description: description.trim(),
                responsibilities: [],
                technologies: [],
              })
          }}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
        >
          Add Project
        </button>
      </div>
    </div>
  )
}

function AddImplementationForm({
  onAdd,
  onCancel,
}: {
  onAdd: (impl: Omit<Implementation, 'id' | 'sortOrder'>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(IMPL_CATEGORIES[0])
  const [problem, setProblem] = useState('')
  const [solution, setSolution] = useState('')

  return (
    <div className="mt-3 p-3 rounded-lg border border-gold-200 bg-gold-50/50 space-y-2">
      <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
        Add Implementation
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Custom Rating Algorithm"
          className="flex-1 px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          autoFocus
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          {IMPL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="What was the problem or requirement?"
        rows={2}
        className="w-full px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />
      <textarea
        value={solution}
        onChange={(e) => setSolution(e.target.value)}
        placeholder="How did you solve it?"
        rows={2}
        className="w-full px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (title.trim())
              onAdd({
                title: title.trim(),
                category,
                problem: problem.trim(),
                solution: solution.trim(),
                technicalDetails: '',
                impact: '',
                technologies: [],
              })
          }}
          disabled={!title.trim()}
          className="px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
        >
          Add Implementation
        </button>
      </div>
    </div>
  )
}
