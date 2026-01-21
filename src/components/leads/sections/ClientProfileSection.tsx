'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Server,
  CreditCard,
  FileCheck,
  Shield,
  Building2,
  Users,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  VMS_PLATFORMS,
  VMS_ACCESS_STATUSES,
  PROGRAM_TYPES,
  MSA_STATUSES,
  NDA_STATUSES,
  PAYMENT_TERMS,
  INVOICE_FORMATS,
  BILLING_CYCLES,
  INSURANCE_TYPES,
  ACCOUNT_TIERS,
  REVENUE_RANGES,
  COMPANY_SIZES,
} from '@/lib/leads/constants'
import type { SectionMode, ClientProfileSectionData } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface ClientProfileSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: ClientProfileSectionData
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
 * ClientProfileSection - VMS/MSP, Payment Terms, and Compliance Requirements
 *
 * Enterprise client profile covering:
 * - VMS/MSP information (platform, access status)
 * - Contract & legal (MSA, NDA)
 * - Payment terms and billing
 * - Compliance requirements (insurance)
 * - Account classification
 */
export function ClientProfileSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: ClientProfileSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
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

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Convert constants to option format
  const vmsPlatformOptions = VMS_PLATFORMS.map(v => ({ value: v.value, label: `${v.icon} ${v.label}` }))
  const vmsAccessOptions = VMS_ACCESS_STATUSES.map(v => ({ value: v.value, label: v.label }))
  const programTypeOptions = PROGRAM_TYPES.map(p => ({ value: p.value, label: p.label }))
  const msaStatusOptions = MSA_STATUSES.map(m => ({ value: m.value, label: m.label }))
  const ndaStatusOptions = NDA_STATUSES.map(n => ({ value: n.value, label: n.label }))
  const paymentTermsOptions = PAYMENT_TERMS.map(p => ({ value: p.value, label: p.label }))
  const invoiceFormatOptions = INVOICE_FORMATS.map(i => ({ value: i.value, label: i.label }))
  const billingCycleOptions = BILLING_CYCLES.map(b => ({ value: b.value, label: b.label }))
  const insuranceTypeOptions = INSURANCE_TYPES.map(i => ({ value: i.value, label: i.label }))
  const accountTierOptions = ACCOUNT_TIERS.map(a => ({ value: a.value, label: a.label }))
  const revenueRangeOptions = REVENUE_RANGES.map(r => ({ value: r.value, label: r.label }))
  const companySizeOptions = COMPANY_SIZES.map(c => ({ value: c.value, label: c.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Client Profile"
          subtitle="VMS/MSP, payment terms, and compliance"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VMS/MSP Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Server className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">VMS/MSP Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Uses VMS"
              value={data.usesVms}
              onChange={(v) => handleChange('usesVms', v)}
              editable={isEditable}
              type="switch"
            />
            {data.usesVms && (
              <>
                <UnifiedField
                  label="VMS Platform"
                  value={data.vmsPlatform}
                  onChange={(v) => handleChange('vmsPlatform', v)}
                  editable={isEditable}
                  type="select"
                  options={vmsPlatformOptions}
                  placeholder="Select VMS platform"
                />
                {data.vmsPlatform === 'other' && (
                  <UnifiedField
                    label="Other VMS Name"
                    value={data.vmsOther}
                    onChange={(v) => handleChange('vmsOther', v)}
                    editable={isEditable}
                    placeholder="Enter VMS name"
                  />
                )}
                <UnifiedField
                  label="VMS Access Status"
                  value={data.vmsAccessStatus}
                  onChange={(v) => handleChange('vmsAccessStatus', v)}
                  editable={isEditable}
                  type="select"
                  options={vmsAccessOptions}
                  placeholder="Select access status"
                />
              </>
            )}
            <UnifiedField
              label="Has MSP"
              value={data.hasMsp}
              onChange={(v) => handleChange('hasMsp', v)}
              editable={isEditable}
              type="switch"
            />
            {data.hasMsp && (
              <>
                <UnifiedField
                  label="MSP Name"
                  value={data.mspName}
                  onChange={(v) => handleChange('mspName', v)}
                  editable={isEditable}
                  placeholder="e.g., Randstad, Allegis"
                />
                <UnifiedField
                  label="Program Type"
                  value={data.programType}
                  onChange={(v) => handleChange('programType', v)}
                  editable={isEditable}
                  type="select"
                  options={programTypeOptions}
                  placeholder="Select program type"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Contract & Legal Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <FileCheck className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Contract & Legal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="MSA Status"
              value={data.msaStatus}
              onChange={(v) => handleChange('msaStatus', v)}
              editable={isEditable}
              type="select"
              options={msaStatusOptions}
              placeholder="Select MSA status"
            />
            {data.msaStatus && data.msaStatus !== 'none' && (
              <UnifiedField
                label="MSA Expiration Date"
                value={data.msaExpirationDate}
                onChange={(v) => handleChange('msaExpirationDate', v)}
                editable={isEditable}
                type="date"
              />
            )}
            <UnifiedField
              label="NDA Required"
              value={data.ndaRequired}
              onChange={(v) => handleChange('ndaRequired', v)}
              editable={isEditable}
              type="switch"
            />
            {data.ndaRequired && (
              <UnifiedField
                label="NDA Status"
                value={data.ndaStatus}
                onChange={(v) => handleChange('ndaStatus', v)}
                editable={isEditable}
                type="select"
                options={ndaStatusOptions}
                placeholder="Select NDA status"
              />
            )}
          </CardContent>
        </Card>

        {/* Payment Terms Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <CreditCard className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Payment Terms</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Payment Terms"
              value={data.paymentTerms}
              onChange={(v) => handleChange('paymentTerms', v)}
              editable={isEditable}
              type="select"
              options={paymentTermsOptions}
              placeholder="Select payment terms"
            />
            <UnifiedField
              label="PO Required"
              value={data.poRequired}
              onChange={(v) => handleChange('poRequired', v)}
              editable={isEditable}
              type="switch"
            />
            <UnifiedField
              label="Invoice Format"
              value={data.invoiceFormat}
              onChange={(v) => handleChange('invoiceFormat', v)}
              editable={isEditable}
              type="select"
              options={invoiceFormatOptions}
              placeholder="Select invoice format"
            />
            <UnifiedField
              label="Billing Cycle"
              value={data.billingCycle}
              onChange={(v) => handleChange('billingCycle', v)}
              editable={isEditable}
              type="select"
              options={billingCycleOptions}
              placeholder="Select billing cycle"
            />
          </CardContent>
        </Card>

        {/* Insurance & Compliance Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Shield className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Insurance & Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Insurance Required"
              value={data.insuranceRequired}
              onChange={(v) => handleChange('insuranceRequired', v)}
              editable={isEditable}
              type="switch"
            />
            {data.insuranceRequired && (
              <>
                <UnifiedField
                  label="Required Insurance Types"
                  value={data.insuranceTypes}
                  onChange={(v) => handleChange('insuranceTypes', v)}
                  editable={isEditable}
                  type="multiSelect"
                  options={insuranceTypeOptions}
                  placeholder="Select insurance types"
                />
                <UnifiedField
                  label="Minimum Coverage"
                  value={data.minimumInsuranceCoverage}
                  onChange={(v) => handleChange('minimumInsuranceCoverage', v)}
                  editable={isEditable}
                  placeholder="e.g., $1M per occurrence"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Classification Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Building2 className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Account Classification</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <UnifiedField
                label="Account Tier"
                value={data.accountTier}
                onChange={(v) => handleChange('accountTier', v)}
                editable={isEditable}
                type="select"
                options={accountTierOptions}
                placeholder="Select tier"
              />
              <UnifiedField
                label="Industry Vertical"
                value={data.industryVertical}
                onChange={(v) => handleChange('industryVertical', v)}
                editable={isEditable}
                placeholder="e.g., Financial Services"
              />
              <UnifiedField
                label="Company Revenue"
                value={data.companyRevenue}
                onChange={(v) => handleChange('companyRevenue', v)}
                editable={isEditable}
                type="select"
                options={revenueRangeOptions}
                placeholder="Select range"
              />
              <UnifiedField
                label="Employee Count"
                value={data.employeeCount}
                onChange={(v) => handleChange('employeeCount', v)}
                editable={isEditable}
                type="select"
                options={companySizeOptions}
                placeholder="Select size"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClientProfileSection
