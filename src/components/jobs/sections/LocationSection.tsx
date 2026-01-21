'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Building2,
  Home,
  Globe,
  Monitor,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { WORK_ARRANGEMENTS, US_STATES, COUNTRIES, VISA_TYPES } from '@/lib/jobs/constants'
import type { SectionMode, LocationSectionData } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface LocationSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: LocationSectionData
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
 * LocationSection - Unified component for Job Location/Work Arrangement
 *
 * Covers remote/hybrid/onsite settings and physical location details
 */
export function LocationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: LocationSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const [newRestriction, setNewRestriction] = React.useState('')

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

  // Derived state
  const showLocationDetails = data.workArrangement === 'onsite' || data.workArrangement === 'hybrid'
  const showHybridDays = data.workArrangement === 'hybrid'

  // Handle work arrangement change
  const handleArrangementChange = (arrangement: LocationSectionData['workArrangement']) => {
    handleChange('workArrangement', arrangement)
    handleChange('isRemote', arrangement === 'remote')
    if (arrangement === 'remote') {
      // Clear location fields for remote
      handleChange('locationAddressLine1', '')
      handleChange('locationAddressLine2', '')
    }
  }

  // Restriction management
  const addRestriction = () => {
    if (!newRestriction.trim()) return
    handleChange('locationRestrictions', [...data.locationRestrictions, newRestriction.trim()])
    setNewRestriction('')
  }

  const removeRestriction = (index: number) => {
    handleChange('locationRestrictions', data.locationRestrictions.filter((_, i) => i !== index))
  }

  // Work authorization toggle
  const toggleWorkAuth = (auth: string) => {
    const current = data.workAuthorizations
    if (current.includes(auth)) {
      handleChange('workAuthorizations', current.filter((a) => a !== auth))
    } else {
      handleChange('workAuthorizations', [...current, auth])
    }
  }

  // Icons for work arrangements
  const arrangementIcons = {
    remote: <Monitor className="w-6 h-6" />,
    hybrid: <Building2 className="w-6 h-6" />,
    onsite: <MapPin className="w-6 h-6" />,
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Location & Work Arrangement"
          subtitle="Where and how the role will be performed"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Work Arrangement Selection */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-base font-heading">Work Arrangement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <div className="grid grid-cols-3 gap-4">
              {WORK_ARRANGEMENTS.map((arrangement) => (
                <button
                  key={arrangement.value}
                  type="button"
                  onClick={() => handleArrangementChange(arrangement.value as LocationSectionData['workArrangement'])}
                  className={cn(
                    'p-6 rounded-xl border-2 text-center transition-all duration-200',
                    data.workArrangement === arrangement.value
                      ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                      : 'border-charcoal-100 bg-white hover:border-gold-200'
                  )}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={cn(
                        'p-3 rounded-xl',
                        data.workArrangement === arrangement.value
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-charcoal-100 text-charcoal-500'
                      )}
                    >
                      {arrangementIcons[arrangement.value as keyof typeof arrangementIcons]}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-charcoal-800 block">
                        {arrangement.label}
                      </span>
                      <span className="text-xs text-charcoal-500">{arrangement.description}</span>
                    </div>
                    {data.workArrangement === arrangement.value && (
                      <CheckCircle2 className="w-5 h-5 text-gold-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-3 bg-charcoal-100 rounded-xl">
                {arrangementIcons[data.workArrangement as keyof typeof arrangementIcons]}
              </div>
              <div>
                <p className="font-semibold text-charcoal-900">
                  {WORK_ARRANGEMENTS.find((a) => a.value === data.workArrangement)?.label ||
                    data.workArrangement}
                </p>
                <p className="text-sm text-charcoal-500">
                  {WORK_ARRANGEMENTS.find((a) => a.value === data.workArrangement)?.description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hybrid Days - Only show for hybrid */}
      {showHybridDays && (
        <Card className="shadow-elevation-sm">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-charcoal-900">Days in Office</Label>
                <p className="text-xs text-charcoal-500">Number of days per week in office</p>
              </div>
              {isEditable ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleChange('hybridDays', day)}
                      className={cn(
                        'w-10 h-10 rounded-lg font-semibold transition-all duration-200',
                        data.hybridDays === day
                          ? 'bg-gold-500 text-white'
                          : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              ) : (
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {data.hybridDays} days/week
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Details - Only show for onsite/hybrid */}
      {showLocationDetails && (
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Office Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location String (for display/quick entry) */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Location
              </Label>
              {isEditable ? (
                <Input
                  value={data.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.location || (
                    <span className="text-charcoal-400">Not specified</span>
                  )}
                </p>
              )}
            </div>

            {/* Detailed Address Fields */}
            {isEditable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      Address Line 1
                    </Label>
                    <Input
                      value={data.locationAddressLine1}
                      onChange={(e) => handleChange('locationAddressLine1', e.target.value)}
                      placeholder="Street address"
                      className="h-10 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      Address Line 2
                    </Label>
                    <Input
                      value={data.locationAddressLine2}
                      onChange={(e) => handleChange('locationAddressLine2', e.target.value)}
                      placeholder="Suite, floor, etc."
                      className="h-10 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      City
                    </Label>
                    <Input
                      value={data.locationCity}
                      onChange={(e) => handleChange('locationCity', e.target.value)}
                      placeholder="City"
                      className="h-10 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      State
                    </Label>
                    <Select
                      value={data.locationState}
                      onValueChange={(value) => handleChange('locationState', value)}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-charcoal-200 bg-white">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      Postal Code
                    </Label>
                    <Input
                      value={data.locationPostalCode}
                      onChange={(e) => handleChange('locationPostalCode', e.target.value)}
                      placeholder="ZIP code"
                      className="h-10 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      Country
                    </Label>
                    <Select
                      value={data.locationCountry}
                      onValueChange={(value) => handleChange('locationCountry', value)}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-charcoal-200 bg-white">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* View mode address display */}
            {!isEditable && (data.locationAddressLine1 || data.locationCity) && (
              <div className="text-sm text-charcoal-700">
                {data.locationAddressLine1 && <p>{data.locationAddressLine1}</p>}
                {data.locationAddressLine2 && <p>{data.locationAddressLine2}</p>}
                <p>
                  {[
                    data.locationCity,
                    data.locationState,
                    data.locationPostalCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {data.locationCountry && data.locationCountry !== 'US' && (
                  <p>{COUNTRIES.find((c) => c.value === data.locationCountry)?.label}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location Restrictions (for remote) */}
      {data.workArrangement === 'remote' && (
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Globe className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">Location Restrictions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-charcoal-500">
              Specify any geographic restrictions for remote workers (e.g., US only, specific time zones)
            </p>
            {isEditable && (
              <div className="flex gap-2">
                <Input
                  value={newRestriction}
                  onChange={(e) => setNewRestriction(e.target.value)}
                  placeholder="e.g., US-based only, EST timezone preferred"
                  className="h-10 rounded-xl border-charcoal-200 bg-white flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRestriction())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRestriction}
                  disabled={!newRestriction.trim()}
                  className="h-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.locationRestrictions.map((restriction, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 flex items-center gap-1"
                >
                  {restriction}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => removeRestriction(index)}
                      className="ml-1 hover:text-error-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.locationRestrictions.length === 0 && (
                <p className="text-sm text-charcoal-400">No restrictions - open to all locations</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Authorization Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Globe className="w-4 h-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-heading">Accepted Work Authorization</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {VISA_TYPES.map((visa) => (
                <button
                  key={visa.value}
                  type="button"
                  onClick={() => toggleWorkAuth(visa.value)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all duration-200',
                    data.workAuthorizations.includes(visa.value)
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-charcoal-100 bg-white hover:border-indigo-200'
                  )}
                >
                  <span className="text-sm font-medium text-charcoal-900">{visa.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.workAuthorizations.length > 0 ? (
                data.workAuthorizations.map((auth, index) => (
                  <Badge key={index} variant="secondary" className="py-1">
                    {VISA_TYPES.find((v) => v.value === auth)?.label || auth}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-charcoal-400">
                  No specific work authorization requirements
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LocationSection
