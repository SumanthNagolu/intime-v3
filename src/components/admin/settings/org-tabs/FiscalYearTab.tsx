'use client'

import * as React from 'react'
import { Calendar, TrendingUp } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SettingsSection } from '../SettingsSection'

interface FiscalYearTabProps {
  organization: {
    fiscal_year_start?: number | null
    reporting_period?: string | null
    sprint_alignment?: boolean | null
  } | null | undefined
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
}

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const reportingPeriods = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (Q1, Q2, Q3, Q4)' },
  { value: 'semi-annual', label: 'Semi-Annual (H1, H2)' },
]

export function FiscalYearTab({ organization, onSave, isPending }: FiscalYearTabProps) {
  const [fiscalYearStart, setFiscalYearStart] = React.useState(organization?.fiscal_year_start || 1)
  const [reportingPeriod, setReportingPeriod] = React.useState(organization?.reporting_period || 'quarterly')
  const [sprintAlignment, setSprintAlignment] = React.useState(organization?.sprint_alignment ?? true)

  React.useEffect(() => {
    if (organization) {
      setFiscalYearStart(organization.fiscal_year_start || 1)
      setReportingPeriod(organization.reporting_period || 'quarterly')
      setSprintAlignment(organization.sprint_alignment ?? true)
    }
  }, [organization])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      fiscal_year_start: fiscalYearStart,
      reporting_period: reportingPeriod,
      sprint_alignment: sprintAlignment,
    })
  }

  // Calculate fiscal year periods based on current date and settings
  const getCurrentFiscalYear = () => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (currentMonth >= fiscalYearStart) {
      return { year: currentYear, endYear: fiscalYearStart === 1 ? currentYear : currentYear + 1 }
    } else {
      return { year: currentYear - 1, endYear: currentYear }
    }
  }

  const getFiscalPeriods = () => {
    const { year, endYear } = getCurrentFiscalYear()
    const periods: Array<{ name: string; start: string; end: string; status: string }> = []
    const startMonth = fiscalYearStart
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (reportingPeriod === 'quarterly') {
      for (let q = 0; q < 4; q++) {
        const qStartMonth = ((startMonth - 1 + q * 3) % 12) + 1
        const qEndMonth = ((startMonth - 1 + (q + 1) * 3 - 1) % 12) + 1
        const qStartYear = qStartMonth < startMonth ? endYear : year
        const qEndYear = qEndMonth < startMonth ? endYear : year

        const periodStart = new Date(qStartYear, qStartMonth - 1, 1)
        const periodEnd = new Date(qEndYear, qEndMonth, 0)

        let status = 'Upcoming'
        if (now > periodEnd) status = 'Closed'
        else if (now >= periodStart && now <= periodEnd) status = 'Current'

        periods.push({
          name: `Q${q + 1} ${qStartYear}`,
          start: periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          end: periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status,
        })
      }
    } else if (reportingPeriod === 'semi-annual') {
      for (let h = 0; h < 2; h++) {
        const hStartMonth = ((startMonth - 1 + h * 6) % 12) + 1
        const hEndMonth = ((startMonth - 1 + (h + 1) * 6 - 1) % 12) + 1
        const hStartYear = hStartMonth < startMonth ? endYear : year
        const hEndYear = hEndMonth < startMonth ? endYear : year

        const periodStart = new Date(hStartYear, hStartMonth - 1, 1)
        const periodEnd = new Date(hEndYear, hEndMonth, 0)

        let status = 'Upcoming'
        if (now > periodEnd) status = 'Closed'
        else if (now >= periodStart && now <= periodEnd) status = 'Current'

        periods.push({
          name: `H${h + 1} ${hStartYear}`,
          start: periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          end: periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status,
        })
      }
    } else {
      for (let m = 0; m < 12; m++) {
        const mMonth = ((startMonth - 1 + m) % 12) + 1
        const mYear = mMonth < startMonth ? endYear : year

        const periodStart = new Date(mYear, mMonth - 1, 1)
        const periodEnd = new Date(mYear, mMonth, 0)

        let status = 'Upcoming'
        if (now > periodEnd) status = 'Closed'
        else if (now >= periodStart && now <= periodEnd) status = 'Current'

        periods.push({
          name: periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          start: periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          end: periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status,
        })
      }
    }

    return periods.slice(0, reportingPeriod === 'monthly' ? 6 : reportingPeriod === 'quarterly' ? 4 : 2)
  }

  const { year } = getCurrentFiscalYear()
  const fiscalPeriods = getFiscalPeriods()

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <SettingsSection
          title="Fiscal Year Configuration"
          description="Set up your organization's fiscal year and reporting periods"
          icon={Calendar}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fiscalYearStart">Fiscal Year Start Month</Label>
              <Select
                value={fiscalYearStart.toString()}
                onValueChange={(value) => setFiscalYearStart(parseInt(value))}
              >
                <SelectTrigger id="fiscalYearStart">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-charcoal-500">
                Current Fiscal Year: FY{year}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportingPeriod">Reporting Period Type</Label>
              <Select value={reportingPeriod} onValueChange={setReportingPeriod}>
                <SelectTrigger id="reportingPeriod">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {reportingPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Sprint Alignment"
          description="Configure how sprints align with fiscal periods"
          icon={TrendingUp}
        >
          <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
            <div>
              <p className="font-medium text-charcoal-900">Align sprints to fiscal periods</p>
              <p className="text-sm text-charcoal-500 mt-1">
                Sprint targets will reset at the start of each {reportingPeriod.replace('-', ' ')} period
              </p>
            </div>
            <Switch
              checked={sprintAlignment}
              onCheckedChange={setSprintAlignment}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Fiscal Year Preview"
          description="See how your fiscal periods will be structured"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-medium text-charcoal-500 uppercase tracking-wider border-b border-charcoal-100">
                  <th className="pb-3 text-left">Period</th>
                  <th className="pb-3 text-left">Start Date</th>
                  <th className="pb-3 text-left">End Date</th>
                  <th className="pb-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {fiscalPeriods.map((period, index) => (
                  <tr key={index} className="border-b border-charcoal-100 last:border-0">
                    <td className="py-3 font-medium text-charcoal-900">{period.name}</td>
                    <td className="py-3 text-charcoal-600">{period.start}</td>
                    <td className="py-3 text-charcoal-600">{period.end}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        period.status === 'Current' ? 'bg-green-100 text-green-800' :
                        period.status === 'Closed' ? 'bg-charcoal-100 text-charcoal-600' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {period.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsSection>

        <div className="flex justify-end">
          <Button id="save-settings-btn" type="submit" loading={isPending} disabled={isPending}>
            Save Fiscal Settings
          </Button>
        </div>
      </div>
    </form>
  )
}
