'use client'

import * as React from 'react'
import { Clock, Plus, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../SettingsSection'

interface DayHours {
  open: boolean
  start?: string
  end?: string
  break_minutes?: number
}

interface BusinessHoursTabProps {
  organization: {
    business_hours?: Record<string, DayHours> | null
    holiday_calendar?: string | null
    custom_holidays?: Array<{ date: string; name: string }> | null
  } | null | undefined
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
}

const defaultHours: Record<string, DayHours> = {
  monday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
  tuesday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
  wednesday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
  thursday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
  friday: { open: true, start: '09:00', end: '17:00', break_minutes: 60 },
  saturday: { open: false },
  sunday: { open: false },
}

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const holidayCalendars = [
  { value: 'us_federal', label: 'US Federal Holidays' },
  { value: 'us_federal_common', label: 'US Federal + Common Holidays' },
  { value: 'custom', label: 'Custom Only' },
]

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = (i % 2) * 30
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const ampm = hour < 12 ? 'AM' : 'PM'
  return { value: time, label: `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}` }
})

export function BusinessHoursTab({ organization, onSave, isPending }: BusinessHoursTabProps) {
  const [businessHours, setBusinessHours] = React.useState<Record<string, DayHours>>(
    organization?.business_hours || defaultHours
  )
  const [holidayCalendar, setHolidayCalendar] = React.useState(organization?.holiday_calendar || 'us_federal')
  const [customHolidays, setCustomHolidays] = React.useState<Array<{ date: string; name: string }>>(
    organization?.custom_holidays || []
  )
  const [newHolidayDate, setNewHolidayDate] = React.useState('')
  const [newHolidayName, setNewHolidayName] = React.useState('')

  React.useEffect(() => {
    if (organization) {
      setBusinessHours(organization.business_hours || defaultHours)
      setHolidayCalendar(organization.holiday_calendar || 'us_federal')
      setCustomHolidays(organization.custom_holidays || [])
    }
  }, [organization])

  const handleDayToggle = (day: string, open: boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: open
        ? { open: true, start: '09:00', end: '17:00', break_minutes: 60 }
        : { open: false }
    }))
  }

  const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const handleBreakChange = (day: string, value: number) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], break_minutes: value }
    }))
  }

  const addCustomHoliday = () => {
    if (newHolidayDate && newHolidayName) {
      setCustomHolidays(prev => [...prev, { date: newHolidayDate, name: newHolidayName }])
      setNewHolidayDate('')
      setNewHolidayName('')
    }
  }

  const removeCustomHoliday = (index: number) => {
    setCustomHolidays(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      business_hours: businessHours,
      holiday_calendar: holidayCalendar,
      custom_holidays: customHolidays,
    })
  }

  const applyToAllWeekdays = () => {
    const mondayHours = businessHours.monday
    const newHours = { ...businessHours }
    daysOfWeek.slice(0, 5).forEach(day => {
      newHours[day] = { ...mondayHours }
    })
    setBusinessHours(newHours)
  }

  // Calculate weekly hours
  const weeklyHours = daysOfWeek.reduce((total, day) => {
    const hours = businessHours[day]
    if (!hours?.open || !hours.start || !hours.end) return total
    const start = parseInt(hours.start.split(':')[0]) * 60 + parseInt(hours.start.split(':')[1])
    const end = parseInt(hours.end.split(':')[0]) * 60 + parseInt(hours.end.split(':')[1])
    const workMinutes = end - start - (hours.break_minutes || 0)
    return total + workMinutes
  }, 0)

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <SettingsSection
          title="Business Hours"
          description="Configure your organization's operating hours"
          icon={Clock}
          action={
            <Button type="button" variant="outline" size="sm" onClick={applyToAllWeekdays}>
              Apply Mon-Fri
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
              <div className="col-span-3">Day</div>
              <div className="col-span-1">Open</div>
              <div className="col-span-3">Start Time</div>
              <div className="col-span-3">End Time</div>
              <div className="col-span-2">Break (min)</div>
            </div>

            {daysOfWeek.map((day) => (
              <div key={day} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-3 border-b border-charcoal-100 last:border-0">
                <div className="col-span-3 flex items-center gap-3">
                  <span className="capitalize font-medium text-charcoal-900">{day}</span>
                </div>

                <div className="col-span-1">
                  <Switch
                    checked={businessHours[day]?.open || false}
                    onCheckedChange={(checked) => handleDayToggle(day, checked)}
                  />
                </div>

                {businessHours[day]?.open ? (
                  <>
                    <div className="col-span-3">
                      <Select
                        value={businessHours[day]?.start || '09:00'}
                        onValueChange={(value) => handleTimeChange(day, 'start', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Select
                        value={businessHours[day]?.end || '17:00'}
                        onValueChange={(value) => handleTimeChange(day, 'end', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={0}
                        max={120}
                        value={businessHours[day]?.break_minutes || 0}
                        onChange={(e) => handleBreakChange(day, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-8 text-charcoal-500 text-sm">
                    Closed
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 flex items-center justify-between text-sm">
              <span className="text-charcoal-600">Weekly Hours (excluding breaks):</span>
              <span className="font-semibold text-charcoal-900">
                {Math.floor(weeklyHours / 60)}h {weeklyHours % 60}m
              </span>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Holidays"
          description="Configure holiday calendar and custom holidays"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="holidayCalendar">Holiday Calendar</Label>
              <Select value={holidayCalendar} onValueChange={setHolidayCalendar}>
                <SelectTrigger id="holidayCalendar" className="w-full md:w-72">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  {holidayCalendars.map((cal) => (
                    <SelectItem key={cal.value} value={cal.value}>{cal.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Custom Holidays</Label>
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="md:w-48"
                />
                <Input
                  placeholder="Holiday name"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="md:w-64"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomHoliday}
                  disabled={!newHolidayDate || !newHolidayName}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {customHolidays.length > 0 && (
                <div className="border border-charcoal-100 rounded-lg divide-y divide-charcoal-100">
                  {customHolidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div>
                        <span className="font-medium">{holiday.name}</span>
                        <span className="text-charcoal-500 ml-2">
                          {new Date(holiday.date).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomHoliday(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end">
          <Button id="save-settings-btn" type="submit" loading={isPending} disabled={isPending}>
            Save Business Hours
          </Button>
        </div>
      </div>
    </form>
  )
}
