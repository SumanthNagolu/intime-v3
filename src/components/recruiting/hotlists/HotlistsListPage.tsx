'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  MoreHorizontal,
  Star,
  Users,
  Eye,
  Pencil,
  Trash2,
  Copy,
  FolderOpen,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CreateHotlistDialog } from './CreateHotlistDialog'

interface HotlistItem {
  id: string
  name: string
  description?: string | null
  purpose?: string
  created_at?: string
  consultants?: Array<{ count?: number }> | { count?: number }[]
}

export function HotlistsListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data, isLoading, refetch } = trpc.bench.hotlists.list.useQuery({
    search: searchQuery || undefined,
    limit: 50
  })

  const utils = trpc.useUtils()
  const deleteMutation = trpc.bench.hotlists.delete.useMutation({
    onSuccess: () => {
      toast.success('Hotlist deleted')
      utils.bench.hotlists.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete hotlist')
    }
  })

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMutation.mutateAsync({ id })
    }
  }

  const hotlists = (data || []) as HotlistItem[]

  // Helper to get consultant count from nested structure
  const getConsultantCount = (h: HotlistItem): number => {
    if (!h.consultants) return 0
    if (Array.isArray(h.consultants)) {
      return h.consultants.length
    }
    return 0
  }

  // Summary stats
  const totalHotlists = hotlists.length
  const totalConsultants = hotlists.reduce((sum: number, h: HotlistItem) => sum + getConsultantCount(h), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Hotlists</h1>
          <p className="text-sm text-charcoal-600 mt-1">
            Manage your curated talent lists for quick access
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Hotlist
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-gold-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{totalHotlists}</p>
                <p className="text-sm text-charcoal-600">Total Hotlists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{totalConsultants}</p>
                <p className="text-sm text-charcoal-600">Total Consultants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search hotlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotlists Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium">All Hotlists</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : hotlists.length === 0 ? (
            <div className="text-center py-12 text-charcoal-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No hotlists found</p>
              <p className="text-sm mt-1">Create your first hotlist to organize talent</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Hotlist
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-center">Consultants</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotlists.map((hotlist: HotlistItem) => (
                  <TableRow
                    key={hotlist.id}
                    className="cursor-pointer hover:bg-charcoal-50"
                    onClick={() => router.push(`/employee/recruiting/talent-hotlists/${hotlist.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gold-500" />
                        <span className="font-medium text-charcoal-900">{hotlist.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-charcoal-600">
                      {hotlist.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-charcoal-100 text-charcoal-800">
                        {hotlist.purpose || 'general'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {getConsultantCount(hotlist)} consultants
                      </Badge>
                    </TableCell>
                    <TableCell className="text-charcoal-600">
                      {hotlist.created_at ? format(new Date(hotlist.created_at), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/employee/recruiting/talent-hotlists/${hotlist.id}`)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Edit functionality coming soon')
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Clone functionality coming soon')
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(hotlist.id, hotlist.name)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateHotlistDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
