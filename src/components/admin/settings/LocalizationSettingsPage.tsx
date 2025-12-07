'use client'

import * as React from 'react'
import { Globe, Calendar, DollarSign, Hash, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SettingsSection } from './SettingsSection'

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
]

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2024)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2024)' },
]

const timeFormats = [
  { value: '12h', label: '12-hour (1:30 PM)' },
  { value: '24h', label: '24-hour (13:30)' },
]

const currencies = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (\u20AC)', symbol: '\u20AC' },
  { value: 'GBP', label: 'British Pound (\u00A3)', symbol: '\u00A3' },
  { value: 'CAD', label: 'Canadian Dollar (CA$)', symbol: 'CA$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen (\u00A5)', symbol: '\u00A5' },
  { value: 'INR', label: 'Indian Rupee (\u20B9)', symbol: '\u20B9' },
]

const decimalSeparators = [
  { value: '.', label: 'Period (.)' },
  { value: ',', label: 'Comma (,)' },
]

const thousandsSeparators = [
  { value: ',', label: 'Comma (,)' },
  { value: '.', label: 'Period (.)' },
  { value: ' ', label: 'Space' },
]

export function LocalizationSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch organization and settings
  const { data: organization, isLoading: loadingOrg } = trpc.settings.getOrganization.useQuery()
  const { data: orgSettings, isLoading: loadingSettings } = trpc.settings.getOrgSettings.useQuery({ category: 'localization' })

  // Form state
  const [timezone, setTimezone] = React.useState('America/New_York')
  const [dateFormat, setDateFormat] = React.useState('MM/DD/YYYY')
  const [timeFormat, setTimeFormat] = React.useState('12h')
  const [currency, setCurrency] = React.useState('USD')
  const [decimalSeparator, setDecimalSeparator] = React.useState('.')
  const [thousandsSeparator, setThousandsSeparator] = React.useState(',')

  // Update form when data loads
  React.useEffect(() => {
    if (organization) {
      if (organization.timezone) setTimezone(organization.timezone)
      if (organization.locale) {
        // Parse locale for currency if possible
      }
    }
  }, [organization])

  React.useEffect(() => {
    if (orgSettings) {
      const settingsMap = Object.fromEntries(
        orgSettings.map(s => {
          try {
            return [s.key, JSON.parse(s.value as string)]
          } catch {
            return [s.key, s.value]
          }
        })
      )

      if (settingsMap.date_format) setDateFormat(settingsMap.date_format)
      if (settingsMap.time_format) setTimeFormat(settingsMap.time_format)
      if (settingsMap.currency) setCurrency(settingsMap.currency)
      if (settingsMap.decimal_separator) setDecimalSeparator(settingsMap.decimal_separator)
      if (settingsMap.thousands_separator) setThousandsSeparator(settingsMap.thousands_separator)
    }
  }, [orgSettings])

  // Mutations
  const updateOrganization = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      utils.settings.getOrganization.invalidate()
    },
  })

  const updateSettings = trpc.settings.bulkUpdateOrgSettings.useMutation({
    onSuccess: () => {
      utils.settings.getOrgSettings.invalidate()
    },
  })

  const handleSave = async () => {
    try {
      // Update both in parallel and wait for completion
      await Promise.all([
        updateOrganization.mutateAsync({ timezone }),
        updateSettings.mutateAsync({
          settings: [
            { key: 'date_format', value: dateFormat, category: 'localization' },
            { key: 'time_format', value: timeFormat, category: 'localization' },
            { key: 'currency', value: currency, category: 'localization' },
            { key: 'decimal_separator', value: decimalSeparator, category: 'localization' },
            { key: 'thousands_separator', value: thousandsSeparator, category: 'localization' },
          ],
        }),
      ])
      toast.success('Localization settings saved successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    }
  }

  const isLoading = loadingOrg || loadingSettings
  const isSaving = updateOrganization.isPending || updateSettings.isPending

  // Preview helpers
  const formatNumber = (num: number) => {
    const parts = num.toFixed(2).split('.')
    const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    return whole + decimalSeparator + parts[1]
  }

  const getCurrencySymbol = () => {
    const curr = currencies.find(c => c.value === currency)
    return curr?.symbol || '$'
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Localization' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-lg" />
          <div className="h-48 bg-charcoal-100 rounded-lg" />
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
          >
            Save Changes
          </Button>
        }
      />
      <div className="space-y-8">
        {/* Timezone & Date/Time */}
        <SettingsSection
          title="Date & Time"
          description="Configure timezone and date/time display formats"
          icon={Calendar}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="w-full">
                  <Globe className="h-4 w-4 mr-2 text-charcoal-400" />
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={timeFormat} onValueChange={setTimeFormat}>
                <SelectTrigger id="timeFormat">
                  <Clock className="h-4 w-4 mr-2 text-charcoal-400" />
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  {timeFormats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        {/* Currency & Numbers */}
        <SettingsSection
          title="Currency & Numbers"
          description="Configure currency and number formatting"
          icon={DollarSign}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decimalSeparator">Decimal Separator</Label>
              <Select value={decimalSeparator} onValueChange={setDecimalSeparator}>
                <SelectTrigger id="decimalSeparator">
                  <SelectValue placeholder="Select separator" />
                </SelectTrigger>
                <SelectContent>
                  {decimalSeparators.map((sep) => (
                    <SelectItem key={sep.value} value={sep.value}>
                      {sep.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thousandsSeparator">Thousands Separator</Label>
              <Select value={thousandsSeparator} onValueChange={setThousandsSeparator}>
                <SelectTrigger id="thousandsSeparator">
                  <SelectValue placeholder="Select separator" />
                </SelectTrigger>
                <SelectContent>
                  {thousandsSeparators.map((sep) => (
                    <SelectItem key={sep.value} value={sep.value}>
                      {sep.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        {/* Preview */}
        <SettingsSection
          title="Format Preview"
          description="See how your settings will be displayed"
          icon={Hash}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Date Example
              </p>
              <p className="text-lg font-medium text-charcoal-900">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: dateFormat.includes('MMM') ? 'short' : '2-digit',
                  day: '2-digit',
                })}
              </p>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Time Example
              </p>
              <p className="text-lg font-medium text-charcoal-900">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: timeFormat === '12h',
                })}
              </p>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                Currency Example
              </p>
              <p className="text-lg font-medium text-charcoal-900">
                {getCurrencySymbol()}{formatNumber(1234567.89)}
              </p>
            </div>
          </div>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}
