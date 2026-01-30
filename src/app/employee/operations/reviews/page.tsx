'use client'

import { FileText, Calendar, Users, Star, Plus, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Performance Reviews
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Manage employee performance review cycles and feedback
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Cycle
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Review
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Active Cycle</p>
                <p className="text-h4 font-heading font-semibold text-charcoal-900 mt-2">Q1 2024</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending Reviews</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">24</p>
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
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Completed</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">89</p>
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
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Avg. Rating</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">4.2</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gold-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Review Cycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Q1 2024 Review Cycle</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm text-charcoal-600">Cycle Progress</span>
                <span className="text-body-sm font-medium text-charcoal-900">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-charcoal-50 rounded-lg">
                <p className="text-caption text-charcoal-500 uppercase tracking-wider mb-1">Self Reviews</p>
                <p className="text-h4 font-heading font-semibold text-charcoal-900">95/113</p>
                <p className="text-body-sm text-charcoal-500">84% complete</p>
              </div>
              <div className="p-4 bg-charcoal-50 rounded-lg">
                <p className="text-caption text-charcoal-500 uppercase tracking-wider mb-1">Manager Reviews</p>
                <p className="text-h4 font-heading font-semibold text-charcoal-900">72/113</p>
                <p className="text-body-sm text-charcoal-500">64% complete</p>
              </div>
              <div className="p-4 bg-charcoal-50 rounded-lg">
                <p className="text-caption text-charcoal-500 uppercase tracking-wider mb-1">Calibration</p>
                <p className="text-h4 font-heading font-semibold text-charcoal-900">Pending</p>
                <p className="text-body-sm text-charcoal-500">Starts Feb 20</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { employee: 'Alice Chen', reviewer: 'Bob Wilson', rating: 4.5, status: 'completed', date: '2024-01-28' },
              { employee: 'David Lee', reviewer: 'Carol Smith', rating: 4.0, status: 'completed', date: '2024-01-27' },
              { employee: 'Emma Davis', reviewer: 'Frank Johnson', rating: null, status: 'pending', date: '2024-01-30' },
              { employee: 'Grace Kim', reviewer: 'Henry Brown', rating: null, status: 'pending', date: '2024-02-01' },
            ].map((review, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-charcoal-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-charcoal-200 flex items-center justify-center">
                    <span className="text-charcoal-700 font-medium">{review.employee.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-body font-medium text-charcoal-900">{review.employee}</p>
                    <p className="text-body-sm text-charcoal-500">Reviewer: {review.reviewer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {review.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                      <span className="text-body font-medium text-charcoal-900">{review.rating}</span>
                    </div>
                  )}
                  <span className="text-body-sm text-charcoal-500">{review.date}</span>
                  <Badge className={review.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {review.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
