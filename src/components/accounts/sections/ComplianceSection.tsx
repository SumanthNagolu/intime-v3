'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ShieldCheck,
  FileCheck,
  UserCheck,
  FlaskConical,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { SectionWrapper } from '../layouts/SectionHeader'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import { FieldGrid } from '../layouts/FieldGrid'
import { BACKGROUND_CHECK_LEVELS, getLabel } from '@/lib/accounts/constants'
import type { SectionMode, ComplianceSectionData } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'

// ============ INSURANCE TYPES ============

const INSURANCE_ITEMS = [
  {
    key: 'generalLiability',
    label: 'General Liability',
    description: 'Coverage for third-party bodily injury and property damage',
    icon: ShieldCheck,
  },
  {
    key: 'professionalLiability',
    label: 'Professional Liability (E&O)',
    description: 'Errors and omissions coverage for professional services',
    icon: FileCheck,
  },
  {
    key: 'workersComp',
    label: "Workers' Compensation",
    description: 'Coverage for employee work-related injuries',
    icon: UserCheck,
  },
  {
    key: 'cyberLiability',
    label: 'Cyber Liability',
    description: 'Coverage for data breaches and cyber incidents',
    icon: ShieldCheck,
  },
] as const

// ============ PROPS ============

interface ComplianceSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: ComplianceSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * ComplianceSection - Unified component for Compliance Requirements
 *
 * Handles all three modes:
 * - create: Full form for wizard step (Step 6)
 * - view: Read-only card grid for detail page with in-place editing
 * - edit: Same layout as view but fields are editable
 */
export function ComplianceSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: ComplianceSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleInsuranceChange = (key: string, checked: boolean) => {
    onChange?.('compliance', {
      ...data.compliance,
      insurance: {
        ...data.compliance.insurance,
        [key]: checked,
      },
    })
  }

  const handleBackgroundCheckChange = (field: string, value: unknown) => {
    onChange?.('compliance', {
      ...data.compliance,
      backgroundCheck: {
        ...data.compliance.backgroundCheck,
        [field]: value,
      },
    })
  }

  const handleDrugTestChange = (required: boolean) => {
    onChange?.('compliance', {
      ...data.compliance,
      drugTest: {
        required,
      },
    })
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const isEditable = mode === 'create' || isEditing

  // Count active requirements
  const insuranceCount = Object.values(data.compliance.insurance).filter(Boolean).length
  const hasBackgroundCheck = data.compliance.backgroundCheck.required
  const hasDrugTest = data.compliance.drugTest.required

  // Convert constants to options
  const backgroundCheckOptions = BACKGROUND_CHECK_LEVELS.map(l => ({ value: l.value, label: l.label }))

  // ============ CREATE MODE ============
  if (mode === 'create') {
    return (
      <div className={cn('space-y-10', className)}>
        {/* Insurance Requirements */}
        <SectionWrapper
          icon={ShieldCheck}
          title="Insurance Requirements"
          subtitle="Required insurance coverage for contractors"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INSURANCE_ITEMS.map((item) => {
              const isChecked =
                data.compliance.insurance[item.key as keyof typeof data.compliance.insurance]
              return (
                <label
                  key={item.key}
                  className={cn(
                    'flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    isChecked
                      ? 'border-gold-400 bg-gradient-to-r from-gold-50 to-amber-50'
                      : 'border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleInsuranceChange(item.key, !!checked)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-charcoal-500" />
                      <span className="text-sm font-semibold text-charcoal-800">{item.label}</span>
                    </div>
                    <span className="text-xs text-charcoal-500 block mt-1">{item.description}</span>
                  </div>
                  {isChecked && <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0" />}
                </label>
              )
            })}
          </div>
        </SectionWrapper>

        {/* Background Check */}
        <SectionWrapper
          icon={UserCheck}
          title="Background Check"
          subtitle="Pre-employment screening requirements"
        >
          <div className="space-y-6">
            <label
              className={cn(
                'flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300',
                data.compliance.backgroundCheck.required
                  ? 'border-gold-400 bg-gradient-to-r from-gold-50 to-amber-50'
                  : 'border-charcoal-200 hover:border-charcoal-300'
              )}
            >
              <Checkbox
                checked={data.compliance.backgroundCheck.required}
                onCheckedChange={(checked) => handleBackgroundCheckChange('required', !!checked)}
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-charcoal-800 block">
                  Background Check Required
                </span>
                <span className="text-xs text-charcoal-500">
                  All contractors must pass a background check before starting
                </span>
              </div>
              {data.compliance.backgroundCheck.required && (
                <CheckCircle2 className="w-5 h-5 text-gold-500" />
              )}
            </label>

            {data.compliance.backgroundCheck.required && (
              <div className="animate-fade-in pl-4 border-l-2 border-gold-200">
                <div className="space-y-2">
                  <Label className="text-charcoal-700 font-medium">Background Check Level</Label>
                  <Select
                    value={data.compliance.backgroundCheck.level}
                    onValueChange={(v) => handleBackgroundCheckChange('level', v)}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white max-w-md">
                      <SelectValue placeholder="Select check level" />
                    </SelectTrigger>
                    <SelectContent>
                      {BACKGROUND_CHECK_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </SectionWrapper>

        {/* Drug Test */}
        <SectionWrapper
          icon={FlaskConical}
          title="Drug Screening"
          subtitle="Pre-employment drug testing requirements"
        >
          <label
            className={cn(
              'flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300',
              data.compliance.drugTest.required
                ? 'border-gold-400 bg-gradient-to-r from-gold-50 to-amber-50'
                : 'border-charcoal-200 hover:border-charcoal-300'
            )}
          >
            <Checkbox
              checked={data.compliance.drugTest.required}
              onCheckedChange={(checked) => handleDrugTestChange(!!checked)}
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-charcoal-800 block">
                Drug Test Required
              </span>
              <span className="text-xs text-charcoal-500">
                All contractors must pass a drug screening before starting
              </span>
            </div>
            {data.compliance.drugTest.required && (
              <CheckCircle2 className="w-5 h-5 text-gold-500" />
            )}
          </label>
        </SectionWrapper>
      </div>
    )
  }

  // ============ VIEW/EDIT MODE - In-Place Editing ============
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header with Edit/Save/Cancel */}
      <SectionHeader
        title="Compliance"
        subtitle="Insurance, background check, and screening requirements"
        mode={isEditing ? 'edit' : 'view'}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insurance Requirements Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle className="text-base font-heading">Insurance Requirements</CardTitle>
              </div>
              <Badge variant={insuranceCount > 0 ? 'success' : 'secondary'}>
                {insuranceCount} / {INSURANCE_ITEMS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {INSURANCE_ITEMS.map((item) => {
              const isRequired =
                data.compliance.insurance[item.key as keyof typeof data.compliance.insurance]
              return (
                <div key={item.key} className="flex items-center justify-between">
                  {isEditable ? (
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <Checkbox
                        checked={isRequired}
                        onCheckedChange={(checked) => handleInsuranceChange(item.key, !!checked)}
                      />
                      <span className="text-sm text-charcoal-700">{item.label}</span>
                    </label>
                  ) : (
                    <>
                      <span className="text-sm text-charcoal-700">{item.label}</span>
                      {isRequired ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Not Required
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Screening Requirements Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <UserCheck className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Screening Requirements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Background Check */}
            <div className="space-y-2">
              <UnifiedField
                label="Background Check Required"
                type="switch"
                value={hasBackgroundCheck}
                onChange={(v) => handleBackgroundCheckChange('required', v)}
                editable={isEditable}
                helpText="Contractors must pass screening before starting"
              />
              {hasBackgroundCheck && (
                <div className="ml-4 pl-4 border-l-2 border-charcoal-200">
                  <UnifiedField
                    label="Check Level"
                    type="select"
                    options={backgroundCheckOptions}
                    value={data.compliance.backgroundCheck.level}
                    onChange={(v) => handleBackgroundCheckChange('level', v)}
                    editable={isEditable}
                  />
                </div>
              )}
            </div>

            {/* Drug Test */}
            <UnifiedField
              label="Drug Test Required"
              type="switch"
              value={hasDrugTest}
              onChange={(v) => handleDrugTestChange(Boolean(v))}
              editable={isEditable}
              helpText="Contractors must pass drug screening before starting"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ComplianceSection
