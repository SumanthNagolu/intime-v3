'use client'

import { CreditCard, DollarSign, Clock, CheckCircle, Plus, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Credits & Adjustments
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Manage credit notes and invoice adjustments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Issue Credit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Total Credits</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">$18,450</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending</p>
                <p className="text-h3 font-heading font-semibold text-amber-600 mt-2">$4,200</p>
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
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Applied</p>
                <p className="text-h3 font-heading font-semibold text-green-600 mt-2">$12,800</p>
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
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Available</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">$1,450</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-charcoal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Recent Credit Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { client: 'Acme Corp', credit: 'CR-2024-0028', amount: 2500, reason: 'Service adjustment', date: '2024-01-28', status: 'applied' },
              { client: 'Tech Inc', credit: 'CR-2024-0027', amount: 1200, reason: 'Early payment discount', date: '2024-01-25', status: 'applied' },
              { client: 'Design Co', credit: 'CR-2024-0026', amount: 800, reason: 'Volume discount', date: '2024-01-22', status: 'pending' },
              { client: 'Data Corp', credit: 'CR-2024-0025', amount: 3500, reason: 'Contract adjustment', date: '2024-01-20', status: 'applied' },
            ].map((credit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-charcoal-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-charcoal-200 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <p className="text-body font-medium text-charcoal-900">{credit.client}</p>
                    <p className="text-body-sm text-charcoal-500">{credit.credit} • {credit.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-body font-semibold text-charcoal-900">${credit.amount.toLocaleString()}</p>
                    <p className="text-body-sm text-charcoal-500">{credit.date}</p>
                  </div>
                  <Badge className={credit.status === 'applied' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {credit.status === 'applied' ? 'Applied' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Client Credit Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { client: 'Acme Corp', balance: 450 },
              { client: 'Tech Inc', balance: 0 },
              { client: 'Design Co', balance: 800 },
              { client: 'Data Corp', balance: 200 },
              { client: 'Finance Ltd', balance: 0 },
              { client: 'Health Systems', balance: 0 },
            ].map((client, index) => (
              <div key={index} className="p-4 bg-charcoal-50 rounded-lg flex items-center justify-between">
                <p className="text-body font-medium text-charcoal-900">{client.client}</p>
                <p className={`text-body font-semibold ${client.balance > 0 ? 'text-green-600' : 'text-charcoal-400'}`}>
                  ${client.balance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
