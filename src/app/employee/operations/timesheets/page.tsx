'use client'

import { Clock, Calendar, CheckCircle, AlertTriangle, Plus, FileText, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TimesheetsPage() {
  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Timesheets
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Track and approve contractor and employee time entries
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">This Week</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">2,450 hrs</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending Approval</p>
                <p className="text-h3 font-heading font-semibold text-amber-600 mt-2">48</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Approved</p>
                <p className="text-h3 font-heading font-semibold text-green-600 mt-2">312</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Billable Amount</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">$185K</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gold-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Pending Approvals</CardTitle>
            <Button variant="outline" size="sm">Approve All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'John Contractor', client: 'Acme Corp', hours: 40, rate: 85, period: 'Jan 22-28', status: 'pending' },
              { name: 'Sarah Developer', client: 'Tech Inc', hours: 38, rate: 95, period: 'Jan 22-28', status: 'pending' },
              { name: 'Mike Designer', client: 'Design Co', hours: 42, rate: 75, period: 'Jan 22-28', status: 'pending' },
              { name: 'Emily Analyst', client: 'Data Corp', hours: 36, rate: 80, period: 'Jan 22-28', status: 'pending' },
            ].map((timesheet, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-charcoal-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-charcoal-200 flex items-center justify-center">
                    <span className="text-charcoal-700 font-medium">{timesheet.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-body font-medium text-charcoal-900">{timesheet.name}</p>
                    <p className="text-body-sm text-charcoal-500">{timesheet.client} • {timesheet.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-body font-medium text-charcoal-900">{timesheet.hours} hrs</p>
                    <p className="text-body-sm text-charcoal-500">${timesheet.rate}/hr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-semibold text-charcoal-900">${(timesheet.hours * timesheet.rate).toLocaleString()}</p>
                    <p className="text-body-sm text-charcoal-500">Total</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reject</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Weekly Summary by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { client: 'Acme Corp', hours: 480, contractors: 12, amount: 42000 },
              { client: 'Tech Inc', hours: 320, contractors: 8, amount: 32000 },
              { client: 'Design Co', hours: 240, contractors: 6, amount: 19200 },
              { client: 'Data Corp', hours: 200, contractors: 5, amount: 18000 },
              { client: 'Finance Ltd', hours: 160, contractors: 4, amount: 14400 },
              { client: 'Health Systems', hours: 120, contractors: 3, amount: 10800 },
            ].map((client, index) => (
              <div key={index} className="p-4 bg-charcoal-50 rounded-lg">
                <p className="text-body font-medium text-charcoal-900 mb-2">{client.client}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-h4 font-heading font-semibold text-charcoal-900">{client.hours}</p>
                    <p className="text-caption text-charcoal-500">Hours</p>
                  </div>
                  <div>
                    <p className="text-h4 font-heading font-semibold text-charcoal-900">{client.contractors}</p>
                    <p className="text-caption text-charcoal-500">People</p>
                  </div>
                  <div>
                    <p className="text-h4 font-heading font-semibold text-charcoal-900">${(client.amount/1000).toFixed(0)}K</p>
                    <p className="text-caption text-charcoal-500">Amount</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
