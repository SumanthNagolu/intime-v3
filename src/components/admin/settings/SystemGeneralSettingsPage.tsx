'use client'

import * as React from 'react'
import { Globe, DollarSign } from 'lucide-react'
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
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
]

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const timeFormats = [
  { value: '12h', label: '12-hour' },
  { value: '24h', label: '24-hour' },
]

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
]

export function SystemGeneralSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch system settings
  const { data: systemSettings, isLoading } = trpc.settings.getSystemSettings.useQuery({ category: 'general' })

  // Form state
  const [defaultTimezone, setDefaultTimezone] = React.useState('America/New_York')
  const [defaultDateFormat, setDefaultDateFormat] = React.useState('MM/DD/YYYY')
  const [defaultTimeFormat, setDefaultTimeFormat] = React.useState('12h')
  const [defaultCurrency, setDefaultCurrency] = React.useState('USD')
  const [decimalSeparator, setDecimalSeparator] = React.useState('.')
  const [thousandsSeparator, setThousandsSeparator] = React.useState(',')

  // Update form when data loads
  React.useEffect(() => {
    if (systemSettings) {
      const settingsMap = Object.fromEntries(
        systemSettings.map(s => {
          try {
            return [s.key, JSON.parse(s.value as string)]
          } catch {
            return [s.key, s.value]
          }
        })
      )

      if (settingsMap.default_timezone) setDefaultTimezone(settingsMap.default_timezone)
      if (settingsMap.default_date_format) setDefaultDateFormat(settingsMap.default_date_format)
      if (settingsMap.default_time_format) setDefaultTimeFormat(settingsMap.default_time_format)
      if (settingsMap.default_currency) setDefaultCurrency(settingsMap.default_currency)
      if (settingsMap.decimal_separator) setDecimalSeparator(settingsMap.decimal_separator)
      if (settingsMap.thousands_separator) setThousandsSeparator(settingsMap.thousands_separator)
    }
  }, [systemSettings])

  // Mutation
  const updateSettings = trpc.settings.bulkUpdateSystemSettings.useMutation({
    onSuccess: () => {
      utils.settings.getSystemSettings.invalidate()
      toast.success('System settings saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const handleSave = () => {
    updateSettings.mutate({
      settings: [
        { key: 'default_timezone', value: defaultTimezone },
        { key: 'default_date_format', value: defaultDateFormat },
        { key: 'default_time_format', value: defaultTimeFormat },
        { key: 'default_currency', value: defaultCurrency },
        { key: 'decimal_separator', value: decimalSeparator },
        { key: 'thousands_separator', value: thousandsSeparator },
      ],
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'System General' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-6">
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
            loading={updateSettings.isPending}
            disabled={updateSettings.isPending}
          >
            Save Changes
          </Button>
        }
      />
      <div className="space-y-8">
        <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
          <p className="text-sm text-gold-800">
            <strong>Note:</strong> These are default settings that apply to new organizations. Individual organizations can override these in their own settings.
          </p>
        </div>

        {/* Regional Defaults */}
        <SettingsSection
          title="Regional Defaults"
          description="Default timezone and date/time settings"
          icon={Globe}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select value={defaultTimezone} onValueChange={setDefaultTimezone}>
                <SelectTrigger id="timezone">
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
              <Label htmlFor="dateFormat">Default Date Format</Label>
              <Select value={defaultDateFormat} onValueChange={setDefaultDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select format" />
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
              <Label htmlFor="timeFormat">Default Time Format</Label>
              <Select value={defaultTimeFormat} onValueChange={setDefaultTimeFormat}>
                <SelectTrigger id="timeFormat">
                  <SelectValue placeholder="Select format" />
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
          description="Default currency and number formatting"
          icon={DollarSign}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
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
              <Label htmlFor="decimal">Decimal Separator</Label>
              <Select value={decimalSeparator} onValueChange={setDecimalSeparator}>
                <SelectTrigger id="decimal">
                  <SelectValue placeholder="Select separator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Period (.)</SelectItem>
                  <SelectItem value=",">Comma (,)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thousands">Thousands Separator</Label>
              <Select value={thousandsSeparator} onValueChange={setThousandsSeparator}>
                <SelectTrigger id="thousands">
                  <SelectValue placeholder="Select separator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=".">Period (.)</SelectItem>
                  <SelectItem value=" ">Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}
