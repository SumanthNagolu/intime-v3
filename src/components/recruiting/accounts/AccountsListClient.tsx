'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  Building2,
  ExternalLink,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  prospect: 'bg-blue-100 text-blue-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
}

interface Account {
  id: string
  name: string
  status: string
  industry?: string | null
  city?: string | null
  state?: string | null
  phone?: string | null
  lastContactDate?: string | null
  owner?: { full_name: string } | null
}

interface HealthSummary {
  total: number
  healthy: number
  needsAttention: number
  atRisk: number
}

interface AccountHealth {
  id: string
  healthStatus: 'healthy' | 'attention' | 'at_risk'
  healthScore: number
}

interface AccountsListClientProps {
  initialAccounts: Account[]
  initialTotal: number
  initialHealth: {
    summary: HealthSummary
    accounts: AccountHealth[]
  } | null
  initialSearch: string
  initialIndustry: string
}

export function AccountsListClient({
  initialAccounts,
  initialTotal,
  initialHealth,
  initialSearch,
  initialIndustry,
}: AccountsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Initialize from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlStatus = searchParams.get('status')

    if (urlSearch && urlSearch !== search) setSearch(urlSearch)
    if (urlStatus && urlStatus !== statusFilter) setStatusFilter(urlStatus)
  }, [searchParams])

  // Fetch accounts
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    {
      search: search || undefined,
      status: statusFilter as 'active' | 'inactive' | 'prospect' | 'all',
      limit: 50,
    },
    {
      initialData: { items: initialAccounts, total: initialTotal },
      enabled: search !== initialSearch || statusFilter !== 'all',
    }
  )

  // Fetch health overview
  const healthQuery = trpc.crm.accounts.getHealth.useQuery({}, {
    initialData: initialHealth,
    staleTime: 60 * 1000,
  })

  const accounts = accountsQuery.data?.items || initialAccounts
  const total = accountsQuery.data?.total || initialTotal
  const healthSummary = healthQuery.data?.summary

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'attention':
        return <Minus className="w-4 h-4 text-amber-500" />
      case 'at_risk':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== 'all') {
        params.set('status', value)
      } else {
        params.delete('status')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="p-6 space-y-6 bg-cream min-h-screen" data-testid="page-content">
      {/* Breadcrumb Navigation - Guidewire Style */}
      <nav className="flex items-center gap-2 text-sm text-charcoal-500">
        <Link href="/employee/workspace/dashboard" className="hover:text-hublot-700 transition-colors">
          My Work
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">Accounts</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Accounts</h1>
          <p className="text-charcoal-500">Manage client accounts and relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/employee/recruiting/accounts/health">
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Health Dashboard
            </Button>
          </Link>
          <Link href="/employee/recruiting/accounts/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Health Summary Cards */}
      {healthSummary && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Total Accounts</p>
                  <p className="text-2xl font-bold">{healthSummary.total}</p>
                </div>
                <Building2 className="w-8 h-8 text-charcoal-300" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Healthy</p>
                  <p className="text-2xl font-bold text-green-600">{healthSummary.healthy}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-300" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Needs Attention</p>
                  <p className="text-2xl font-bold text-amber-600">{healthSummary.needsAttention}</p>
                </div>
                <Minus className="w-8 h-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{healthSummary.atRisk}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
              <Input
                placeholder="Search accounts by name or industry..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} Account{total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">No accounts found</h3>
              <p className="text-charcoal-500 mb-4">
                {search ? 'Try a different search term' : 'Get started by creating your first account'}
              </p>
              {!search && (
                <Link href="/employee/recruiting/accounts/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const healthData = healthQuery.data?.accounts.find(a => a.id === account.id)
                  return (
                    <TableRow key={account.id} className="group">
                      <TableCell>
                        <Link href={`/employee/recruiting/accounts/${account.id}`} className="block">
                          <div className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                            {account.name}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-charcoal-500">
                            {account.city && account.state && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {account.city}, {account.state}
                              </span>
                            )}
                            {account.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {account.phone}
                              </span>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-charcoal-600 capitalize">
                          {account.industry?.replace('_', ' ') || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[account.status] || statusColors.inactive)}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {healthData && (
                          <div className="flex items-center gap-2">
                            {getHealthIcon(healthData.healthStatus)}
                            <span className={cn(
                              'text-sm',
                              healthData.healthStatus === 'healthy' && 'text-green-600',
                              healthData.healthStatus === 'attention' && 'text-amber-600',
                              healthData.healthStatus === 'at_risk' && 'text-red-600',
                            )}>
                              {healthData.healthScore}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {account.lastContactDate ? (
                          <span className="text-charcoal-600">
                            {formatDistanceToNow(new Date(account.lastContactDate), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {account.owner ? (
                          <span className="text-charcoal-600">{account.owner.full_name}</span>
                        ) : (
                          <span className="text-charcoal-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/employee/recruiting/accounts/${account.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
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
