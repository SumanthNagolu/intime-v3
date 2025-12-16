'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Search,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Briefcase,
  MapPin,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  prospect: 'bg-blue-100 text-blue-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
}

// Account item from the consolidated query
export interface AccountItem {
  id: string
  name: string
  industry: string | null
  status: string
  city: string | null
  state: string | null
  lastContactDate: string | null
  health?: {
    healthStatus: string
    healthScore: number
    activeJobs: number
  }
}

export interface AccountsData {
  items: AccountItem[]
  total: number
}

interface MyAccountsTableProps {
  className?: string
  data?: AccountsData
  isLoading?: boolean
}

export function MyAccountsTable({ className, data, isLoading = false }: MyAccountsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter accounts client-side based on filter state
  const accounts = useMemo(() => {
    let items = data?.items ?? []

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter((a) =>
        a.name.toLowerCase().includes(searchLower) ||
        a.industry?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      items = items.filter((a) => a.status === statusFilter)
    }

    return items
  }, [data?.items, search, statusFilter])

  const total = accounts.length

  const getHealthIcon = (status: string) => {
    switch (status) {
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

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            My Accounts
            {total > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({total})
              </span>
            )}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => router.push('/employee/recruiting/accounts/new')}
          >
            <Building2 className="w-4 h-4 mr-1" />
            New Account
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No accounts found</p>
            <p className="text-sm text-charcoal-400">
              {search
                ? 'Try a different search term'
                : 'Create your first account to get started.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Open Jobs</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="group">
                  <TableCell>
                    <Link
                      href={`/employee/recruiting/accounts/${account.id}`}
                      className="block"
                    >
                      <div className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                        {account.name}
                      </div>
                      {(account.city || account.state) && (
                        <div className="flex items-center gap-1 text-sm text-charcoal-500">
                          <MapPin className="w-3 h-3" />
                          {[account.city, account.state]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-charcoal-600 capitalize">
                      {account.industry?.replace('_', ' ') || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        statusColors[account.status] || statusColors.inactive
                      )}
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.health ? (
                      <div className="flex items-center gap-2">
                        {getHealthIcon(account.health.healthStatus)}
                        <span
                          className={cn(
                            'text-sm',
                            account.health.healthStatus === 'healthy' &&
                              'text-green-600',
                            account.health.healthStatus === 'attention' &&
                              'text-amber-600',
                            account.health.healthStatus === 'at_risk' &&
                              'text-red-600'
                          )}
                        >
                          {account.health.healthScore}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.health ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Briefcase className="w-3 h-3" />
                        {account.health.activeJobs}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.lastContactDate ? (
                      <span className="text-charcoal-600">
                        {formatDistanceToNow(new Date(account.lastContactDate), {
                          addSuffix: true,
                        })}
                      </span>
                    ) : (
                      <span className="text-charcoal-400">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/employee/recruiting/accounts/${account.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
