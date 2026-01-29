'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, Users, Briefcase } from 'lucide-react'

/**
 * Team Today Page
 * Shows today's activities and tasks for the team
 */
export default function TeamTodayPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
          Team Today
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">12</p>
                <p className="text-sm text-charcoal-500">Tasks Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">5</p>
                <p className="text-sm text-charcoal-500">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">8</p>
                <p className="text-sm text-charcoal-500">Follow-ups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">3</p>
                <p className="text-sm text-charcoal-500">Submissions Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="text-lg">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-charcoal-500 text-sm">
            Team schedule for today will be displayed here with member filtering.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
