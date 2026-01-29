'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileBarChart, TrendingUp, Users, DollarSign } from 'lucide-react'

/**
 * Team Reports Page
 * Shows team performance reports and analytics
 */
export default function TeamReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
          Team Reports
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Performance metrics and analytics for the team
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-elevation-sm hover:shadow-elevation-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileBarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Activity Report</h3>
                <p className="text-sm text-charcoal-500">Team activity summary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm hover:shadow-elevation-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Performance</h3>
                <p className="text-sm text-charcoal-500">KPIs and metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm hover:shadow-elevation-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Team Metrics</h3>
                <p className="text-sm text-charcoal-500">Individual performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm hover:shadow-elevation-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Revenue</h3>
                <p className="text-sm text-charcoal-500">Placements & billing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content Placeholder */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="text-lg">Report Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-charcoal-500 text-sm">
            Select a report type above to view detailed analytics and metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
