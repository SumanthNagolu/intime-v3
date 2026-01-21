'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  FileText,
  DollarSign,
  Users,
  Briefcase,
  Plus,
  Trash2,
  CreditCard,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  CONTRACT_TYPES,
  PAYMENT_TERMS,
  BILLING_FREQUENCY,
  formatCurrency,
} from '@/lib/deals/constants'
import type { SectionMode, ProposalSectionData, DealRoleBreakdown } from '@/lib/deals/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface ProposalSectionProps {
  mode: SectionMode
  data: ProposalSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
  /** Current stage - needed for conditional display */
  currentStage?: string
}

/**
 * ProposalSection - Unified component for Deal Proposal
 */
export function ProposalSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  currentStage,
}: ProposalSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

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

  // Role management
  const handleAddRole = () => {
    const newRole: DealRoleBreakdown = {
      id: crypto.randomUUID(),
      title: '',
      count: 1,
      billRate: null,
      startDate: null,
    }
    onChange?.('rolesBreakdown', [...data.rolesBreakdown, newRole])
  }

  const handleRemoveRole = (id: string) => {
    onChange?.('rolesBreakdown', data.rolesBreakdown.filter((r) => r.id !== id))
  }

  const handleRoleChange = (id: string, field: string, value: unknown) => {
    const updated = data.rolesBreakdown.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    )
    onChange?.('rolesBreakdown', updated)
  }

  // Billing contact management
  const handleBillingContactChange = (field: string, value: unknown) => {
    onChange?.('billingContact', { ...data.billingContact, [field]: value })
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'
  const isClosedWon = currentStage === 'closed_won'

  const contractTypeOptions = CONTRACT_TYPES.map((c) => ({ value: c.value, label: c.label }))
  const paymentTermsOptions = PAYMENT_TERMS.map((p) => ({ value: p.value, label: p.label }))
  const billingFrequencyOptions = BILLING_FREQUENCY.map((b) => ({ value: b.value, label: b.label }))

  // Calculate total estimated value
  const totalEstimatedValue = data.rolesBreakdown.reduce((sum, role) => {
    if (role.billRate && role.count) {
      // Assuming 160 hours per month per resource
      return sum + (role.billRate * 160 * role.count)
    }
    return sum
  }, 0)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Proposal"
          subtitle="Pricing, terms, and scope of services"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Roles Breakdown Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Roles Breakdown</CardTitle>
            </div>
            {totalEstimatedValue > 0 && !isEditable && (
              <Badge variant="outline" className="text-sm">
                Est. Monthly: {formatCurrency(totalEstimatedValue)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditable ? (
            <>
              {data.rolesBreakdown.map((role, index) => (
                <div
                  key={role.id}
                  className="p-4 rounded-lg border border-charcoal-200 bg-charcoal-50/50 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-charcoal-600">
                      Role {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRole(role.id!)}
                      className="text-charcoal-400 hover:text-error-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Role Title <span className="text-gold-500">*</span>
                      </label>
                      <Input
                        value={role.title}
                        onChange={(e) => handleRoleChange(role.id!, 'title', e.target.value)}
                        placeholder="e.g., Senior Java Developer"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Count
                      </label>
                      <Input
                        type="number"
                        value={role.count}
                        onChange={(e) => handleRoleChange(role.id!, 'count', Number(e.target.value) || 1)}
                        min={1}
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Bill Rate
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500">$</span>
                        <Input
                          type="number"
                          value={role.billRate || ''}
                          onChange={(e) => handleRoleChange(role.id!, 'billRate', e.target.value ? Number(e.target.value) : null)}
                          placeholder="0"
                          className="h-11 rounded-lg pl-7"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full h-12 border-dashed"
                onClick={handleAddRole}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </>
          ) : data.rolesBreakdown.length > 0 ? (
            <div className="space-y-2">
              {data.rolesBreakdown.map((role, index) => (
                <div
                  key={role.id || index}
                  className="flex items-center justify-between p-4 rounded-lg bg-charcoal-50 border border-charcoal-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-200 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal-900">{role.title}</p>
                      <p className="text-xs text-charcoal-500">
                        {role.count} position{role.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {role.billRate && (
                    <Badge variant="outline" className="text-charcoal-600">
                      {formatCurrency(role.billRate)}/hr
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-charcoal-400" />
              </div>
              <p className="text-sm text-charcoal-500">No roles defined</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Terms Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Contract Terms</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Contract Type"
              type="select"
              options={contractTypeOptions}
              value={data.contractType}
              onChange={(v) => handleChange('contractType', v)}
              editable={isEditable}
              placeholder="Select type"
            />
            <UnifiedField
              label="Duration (months)"
              type="number"
              value={data.contractDurationMonths}
              onChange={(v) => handleChange('contractDurationMonths', v ? Number(v) : null)}
              editable={isEditable}
              placeholder="e.g., 12"
              min={1}
              max={60}
            />
            <UnifiedField
              label="Payment Terms"
              type="select"
              options={paymentTermsOptions}
              value={data.paymentTerms}
              onChange={(v) => handleChange('paymentTerms', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Billing Frequency"
              type="select"
              options={billingFrequencyOptions}
              value={data.billingFrequency}
              onChange={(v) => handleChange('billingFrequency', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Billing Contact Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Billing Contact</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Contact Name"
              value={data.billingContact.name}
              onChange={(v) => handleBillingContactChange('name', v)}
              editable={isEditable}
              placeholder="Billing contact name"
            />
            <UnifiedField
              label="Email"
              type="email"
              value={data.billingContact.email}
              onChange={(v) => handleBillingContactChange('email', v)}
              editable={isEditable}
              placeholder="billing@company.com"
            />
            <UnifiedField
              label="Phone"
              value={data.billingContact.phone}
              onChange={(v) => handleBillingContactChange('phone', v)}
              editable={isEditable}
              placeholder="+1 (555) 123-4567"
            />
            <UnifiedField
              label="Billing Address"
              type="textarea"
              value={data.billingContact.address}
              onChange={(v) => handleBillingContactChange('address', v)}
              editable={isEditable}
              placeholder="Street, City, State, ZIP"
              maxLength={500}
            />
          </CardContent>
        </Card>
      </div>

      {/* Confirmed Roles - Show when closed_won */}
      {isClosedWon && data.confirmedRoles.length > 0 && (
        <Card className="shadow-elevation-sm border-success-200 bg-success-50/30">
          <CardHeader className="pb-3 border-b border-success-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-success-100 rounded-lg">
                <Briefcase className="w-4 h-4 text-success-600" />
              </div>
              <CardTitle className="text-base font-heading text-success-900">
                Confirmed Roles
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {data.confirmedRoles.map((role, index) => (
                <div
                  key={role.id || index}
                  className="flex items-center justify-between p-4 rounded-lg bg-success-50 border border-success-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-success-900">{role.title}</p>
                      <p className="text-xs text-success-700">
                        {role.count} position{role.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success-100 text-success-800 border-success-200">
                    {formatCurrency(role.billRate)}/hr
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProposalSection
