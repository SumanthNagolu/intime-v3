'use client'

import * as React from 'react'
import { Globe, Calendar, Clock, DollarSign } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '../SettingsSection'

interface RegionalTabProps {
  organization: {
    timezone?: string | null
    locale?: string | null
    date_format?: string | null
    time_format?: string | null
    week_start?: string | null
    currency?: string | null
    number_format?: string | null
  } | null | undefined
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
]

const locales = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'en-CA', label: 'English (Canada)' },
  { value: 'en-AU', label: 'English (Australia)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'de-DE', label: 'German (Germany)' },
]

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2024)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2024)' },
]

const timeFormats = [
  { value: '12h', label: '12-hour (2:30 PM)' },
  { value: '24h', label: '24-hour (14:30)' },
]

const weekStarts = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
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

const numberFormats = [
  { value: '1,234.56', label: '1,234.56 (US)' },
  { value: '1.234,56', label: '1.234,56 (Europe)' },
  { value: '1 234,56', label: '1 234,56 (France)' },
]

export function RegionalTab({ organization, onSave, isPending }: RegionalTabProps) {
  const [timezone, setTimezone] = React.useState(organization?.timezone || 'America/New_York')
  const [locale, setLocale] = React.useState(organization?.locale || 'en-US')
  const [dateFormat, setDateFormat] = React.useState(organization?.date_format || 'MM/DD/YYYY')
  const [timeFormat, setTimeFormat] = React.useState(organization?.time_format || '12h')
  const [weekStart, setWeekStart] = React.useState(organization?.week_start || 'sunday')
  const [currency, setCurrency] = React.useState(organization?.currency || 'USD')
  const [numberFormat, setNumberFormat] = React.useState(organization?.number_format || '1,234.56')

  React.useEffect(() => {
    if (organization) {
      setTimezone(organization.timezone || 'America/New_York')
      setLocale(organization.locale || 'en-US')
      setDateFormat(organization.date_format || 'MM/DD/YYYY')
      setTimeFormat(organization.time_format || '12h')
      setWeekStart(organization.week_start || 'sunday')
      setCurrency(organization.currency || 'USD')
      setNumberFormat(organization.number_format || '1,234.56')
    }
  }, [organization])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      timezone,
      locale,
      date_format: dateFormat,
      time_format: timeFormat,
      week_start: weekStart,
      currency,
      number_format: numberFormat,
    })
  }

  const getCurrencySymbol = () => {
    const curr = currencies.find(c => c.value === currency)
    return curr?.symbol || '$'
  }

  const formatNumber = (num: number) => {
    const [decimal, thousand] = numberFormat === '1,234.56' ? ['.', ','] :
                                numberFormat === '1.234,56' ? [',', '.'] : [',', ' ']
    const parts = num.toFixed(2).split('.')
    const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand)
    return whole + decimal + parts[1]
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <SettingsSection
          title="Timezone & Locale"
          description="Configure regional settings for your organization"
          icon={Globe}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Default Locale</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger id="locale">
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Date & Time Formats"
          description="How dates and times are displayed"
          icon={Calendar}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={timeFormat} onValueChange={setTimeFormat}>
                <SelectTrigger id="timeFormat">
                  <Clock className="h-4 w-4 mr-2 text-charcoal-400" />
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {timeFormats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekStart">Week Starts On</Label>
              <Select value={weekStart} onValueChange={setWeekStart}>
                <SelectTrigger id="weekStart">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {weekStarts.map((day) => (
                    <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Currency & Numbers"
          description="How currency and numbers are formatted"
          icon={DollarSign}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberFormat">Number Format</Label>
              <Select value={numberFormat} onValueChange={setNumberFormat}>
                <SelectTrigger id="numberFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {numberFormats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Format Preview"
          description="See how your settings will be displayed"
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

        <div className="flex justify-end">
          <Button id="save-settings-btn" type="submit" loading={isPending} disabled={isPending}>
            Save Regional Settings
          </Button>
        </div>
      </div>
    </form>
  )
}
