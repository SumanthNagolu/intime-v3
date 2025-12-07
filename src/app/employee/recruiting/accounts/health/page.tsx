'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertTriangle,
  Building2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const healthColors = {
  healthy: { bg: 'bg-green-100', text: 'text-green-800', icon: TrendingUp },
  attention: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Minus },
  at_risk: { bg: 'bg-red-100', text: 'text-red-800', icon: TrendingDown },
}

export default function AccountHealthPage() {
  const [filter, setFilter] = useState<'all' | 'healthy' | 'attention' | 'at_risk'>('all')

  const healthQuery = trpc.crm.accounts.getHealth.useQuery({})

  const healthData = healthQuery.data
  const summary = healthData?.summary
  const accounts = healthData?.accounts || []

  const filteredAccounts = filter === 'all'
    ? accounts
    : accounts.filter(a => a.healthStatus === filter)

  // Sort by health score ascending (worst first)
  const sortedAccounts = [...filteredAccounts].sort((a, b) => a.healthScore - b.healthScore)

  return (
    <div className="p-6 space-y-6 bg-cream min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-charcoal-500">
        <Link href="/employee/workspace/dashboard" className="hover:text-hublot-700 transition-colors">
          My Work
        </Link>
        <span>/</span>
        <Link href="/employee/recruiting/accounts" className="hover:text-hublot-700 transition-colors">
          Accounts
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">Health Dashboard</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Account Health Dashboard</h1>
          <p className="text-charcoal-500">Monitor and improve client relationships</p>
        </div>
        <Button
          variant="outline"
          onClick={() => healthQuery.refetch()}
          disabled={healthQuery.isRefetching}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", healthQuery.isRefetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Health Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === 'all' && "ring-2 ring-hublot-500"
            )}
            onClick={() => setFilter('all')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Total Accounts</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
                <Building2 className="w-8 h-8 text-charcoal-300" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === 'healthy' && "ring-2 ring-green-500"
            )}
            onClick={() => setFilter('healthy')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Healthy</p>
                  <p className="text-2xl font-bold text-green-600">{summary.healthy}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-300" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === 'attention' && "ring-2 ring-amber-500"
            )}
            onClick={() => setFilter('attention')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Needs Attention</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.needsAttention}</p>
                </div>
                <Minus className="w-8 h-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              filter === 'at_risk' && "ring-2 ring-red-500"
            )}
            onClick={() => setFilter('at_risk')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{summary.atRisk}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Score Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Health Score Factors</CardTitle>
          <CardDescription>How account health is calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="p-3 bg-charcoal-50 rounded-lg">
              <p className="font-medium">Base Score</p>
              <p className="text-charcoal-500">100 points</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="font-medium text-red-700">No contact &gt;14 days</p>
              <p className="text-red-600">-30 points</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="font-medium text-amber-700">No contact 7-14 days</p>
              <p className="text-amber-600">-15 points</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-700">No active jobs</p>
              <p className="text-blue-600">-20 points</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-700">NPS &lt; 7</p>
              <p className="text-purple-600">-20 points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {filter === 'all' ? 'All Accounts' : `${filter.replace('_', ' ')} Accounts`.replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <CardDescription>
              {sortedAccounts.length} account{sortedAccounts.length !== 1 ? 's' : ''} {filter !== 'all' && `requiring ${filter === 'at_risk' ? 'immediate' : 'some'} attention`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {healthQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : sortedAccounts.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">
                {filter === 'all' ? 'No accounts yet' : `No ${filter.replace('_', ' ')} accounts`}
              </h3>
              <p className="text-charcoal-500">
                {filter === 'all' ? 'Create your first account to start tracking health' : 'Great job keeping accounts healthy!'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Active Jobs</TableHead>
                  <TableHead>NPS</TableHead>
                  <TableHead>Action Needed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAccounts.map((account) => {
                  const colors = healthColors[account.healthStatus as keyof typeof healthColors] || healthColors.healthy
                  const HealthIcon = colors.icon
                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <Link
                          href={`/employee/recruiting/accounts/${account.id}`}
                          className="font-medium text-charcoal-900 hover:text-hublot-700"
                        >
                          {account.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HealthIcon className={cn("w-4 h-4", colors.text)} />
                          <span className={cn("font-medium", colors.text)}>
                            {account.healthScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(colors.bg, colors.text, "border-0")}>
                          {account.healthStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {account.lastContactDate ? (
                          formatDistanceToNow(new Date(account.lastContactDate), { addSuffix: true })
                        ) : (
                          <span className="text-red-600 font-medium">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {account.activeJobs || 0}
                      </TableCell>
                      <TableCell>
                        {account.npsScore ?? <span className="text-charcoal-400">-</span>}
                      </TableCell>
                      <TableCell>
                        {account.healthStatus === 'at_risk' && (
                          <Button size="sm" variant="destructive" asChild>
                            <Link href={`/employee/recruiting/accounts/${account.id}`}>
                              Review Now
                            </Link>
                          </Button>
                        )}
                        {account.healthStatus === 'attention' && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/employee/recruiting/accounts/${account.id}`}>
                              Check In
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
