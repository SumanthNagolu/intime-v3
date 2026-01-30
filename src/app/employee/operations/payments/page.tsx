'use client'

import { DollarSign, ArrowDownRight, Clock, CheckCircle, Plus, FileText, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Payments Received
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Track incoming payments and receivables
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">This Month</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">$425K</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Outstanding</p>
                <p className="text-h3 font-heading font-semibold text-amber-600 mt-2">$182K</p>
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
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Overdue</p>
                <p className="text-h3 font-heading font-semibold text-red-600 mt-2">$45K</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Collection Rate</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">94%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { client: 'Acme Corp', invoice: 'INV-2024-0145', amount: 45000, date: '2024-01-28', method: 'Wire Transfer' },
              { client: 'Tech Inc', invoice: 'INV-2024-0142', amount: 28500, date: '2024-01-27', method: 'ACH' },
              { client: 'Design Co', invoice: 'INV-2024-0139', amount: 12800, date: '2024-01-26', method: 'Check' },
              { client: 'Data Corp', invoice: 'INV-2024-0136', amount: 65000, date: '2024-01-25', method: 'Wire Transfer' },
              { client: 'Finance Ltd', invoice: 'INV-2024-0133', amount: 18200, date: '2024-01-24', method: 'ACH' },
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-charcoal-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-body font-medium text-charcoal-900">{payment.client}</p>
                    <p className="text-body-sm text-charcoal-500">{payment.invoice}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Badge variant="outline">{payment.method}</Badge>
                  <div className="text-right">
                    <p className="text-body font-semibold text-green-600">+${payment.amount.toLocaleString()}</p>
                    <p className="text-body-sm text-charcoal-500">{payment.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aging Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Receivables Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { period: 'Current', amount: 85000, color: 'bg-green-100 text-green-800' },
              { period: '1-30 Days', amount: 42000, color: 'bg-blue-100 text-blue-800' },
              { period: '31-60 Days', amount: 28000, color: 'bg-amber-100 text-amber-800' },
              { period: '61-90 Days', amount: 18000, color: 'bg-orange-100 text-orange-800' },
              { period: '90+ Days', amount: 9000, color: 'bg-red-100 text-red-800' },
            ].map((age, index) => (
              <div key={index} className="p-4 bg-charcoal-50 rounded-lg text-center">
                <Badge className={age.color}>{age.period}</Badge>
                <p className="text-h4 font-heading font-semibold text-charcoal-900 mt-3">${(age.amount/1000).toFixed(0)}K</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
