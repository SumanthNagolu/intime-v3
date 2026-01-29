'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * My Activities Page
 * Shows all activities assigned to the current user
 */
export default function MyActivitiesPage() {
  // TODO: Implement with EntityListView when activities config is created
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
          My Activities
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Your assigned activities and tasks
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">12</p>
                <p className="text-sm text-charcoal-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">4</p>
                <p className="text-sm text-charcoal-500">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">1</p>
                <p className="text-sm text-charcoal-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">7</p>
                <p className="text-sm text-charcoal-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for activities list */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="text-lg">Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-charcoal-500 text-sm">
            Your activities will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
