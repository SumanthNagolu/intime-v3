'use client'

import { FileText, BarChart3, Download, Calendar, Users, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Reports
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Generate and view operational and financial reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Revenue MTD</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">$1.2M</p>
                <p className="text-body-sm text-green-600 mt-1">+12% vs last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Active Placements</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">287</p>
                <p className="text-body-sm text-charcoal-500 mt-1">Across 45 clients</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Billable Hours</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">12,450</p>
                <p className="text-body-sm text-charcoal-500 mt-1">This month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Gross Margin</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">24.5%</p>
                <p className="text-body-sm text-green-600 mt-1">+2.1% vs target</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gold-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Financial Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg font-heading font-semibold">Financial Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Revenue Summary', frequency: 'Monthly' },
                { name: 'P&L Statement', frequency: 'Monthly' },
                { name: 'AR Aging Report', frequency: 'Weekly' },
                { name: 'Cash Flow Report', frequency: 'Weekly' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-charcoal-500" />
                    <span className="text-body-sm text-charcoal-900">{report.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{report.frequency}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HR Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-heading font-semibold">HR Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Headcount Report', frequency: 'Monthly' },
                { name: 'Turnover Analysis', frequency: 'Quarterly' },
                { name: 'Onboarding Status', frequency: 'Weekly' },
                { name: 'Performance Summary', frequency: 'Quarterly' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-charcoal-500" />
                    <span className="text-body-sm text-charcoal-900">{report.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{report.frequency}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operations Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-heading font-semibold">Operations Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Placement Report', frequency: 'Weekly' },
                { name: 'Utilization Report', frequency: 'Monthly' },
                { name: 'Client Activity', frequency: 'Monthly' },
                { name: 'Timesheet Summary', frequency: 'Weekly' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-charcoal-500" />
                    <span className="text-body-sm text-charcoal-900">{report.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{report.frequency}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Scheduled Reports</CardTitle>
            <Button variant="outline" size="sm">Manage Schedules</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Weekly Revenue Summary', recipients: 5, nextRun: '2024-02-05', status: 'active' },
              { name: 'Monthly P&L Report', recipients: 3, nextRun: '2024-02-01', status: 'active' },
              { name: 'Weekly Timesheet Summary', recipients: 8, nextRun: '2024-02-02', status: 'active' },
              { name: 'Quarterly Performance Review', recipients: 12, nextRun: '2024-04-01', status: 'active' },
            ].map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-charcoal-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <p className="text-body font-medium text-charcoal-900">{schedule.name}</p>
                    <p className="text-body-sm text-charcoal-500">{schedule.recipients} recipients</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-body-sm text-charcoal-500">Next run</p>
                    <p className="text-body font-medium text-charcoal-900">{schedule.nextRun}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
