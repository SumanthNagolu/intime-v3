'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  ArrowLeft,
  Star,
  Users,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  GripVertical,
  User,
  Briefcase,
  DollarSign,
  ExternalLink,
  Send,
} from 'lucide-react'

// Type for the nested consultant structure from API
interface HotlistConsultantItem {
  id: string
  hotlist_id: string
  consultant_id: string
  position_order?: number
  notes?: string
  added_at?: string
  consultant?: {
    id: string
    status?: string
    visa_type?: string
    target_rate?: number
    candidate?: {
      id: string
      full_name?: string
      email?: string
      avatar_url?: string
    }
  }
}
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { AddToHotlistDialog } from './AddToHotlistDialog'

const statusColors: Record<string, string> = {
  'available': 'bg-green-100 text-green-800',
  'placed': 'bg-blue-100 text-blue-800',
  'marketing': 'bg-purple-100 text-purple-800',
  'interviewing': 'bg-yellow-100 text-yellow-800',
  'onboarding': 'bg-amber-100 text-amber-800',
  'inactive': 'bg-charcoal-100 text-charcoal-800',
}

const visaStatusColors: Record<string, string> = {
  'H1B': 'bg-blue-100 text-blue-800',
  'OPT': 'bg-purple-100 text-purple-800',
  'CPT': 'bg-indigo-100 text-indigo-800',
  'GC': 'bg-green-100 text-green-800',
  'USC': 'bg-emerald-100 text-emerald-800',
  'H4_EAD': 'bg-cyan-100 text-cyan-800',
  'L1': 'bg-orange-100 text-orange-800',
  'TN': 'bg-yellow-100 text-yellow-800',
}

interface HotlistDetailPageProps {
  hotlistId: string
}

export function HotlistDetailPage({ hotlistId }: HotlistDetailPageProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const { data: hotlist, isLoading, refetch } = trpc.bench.hotlists.getById.useQuery({ id: hotlistId })

  const utils = trpc.useUtils()
  const removeConsultantMutation = trpc.bench.hotlists.removeConsultant.useMutation({
    onSuccess: () => {
      toast.success('Consultant removed from hotlist')
      utils.bench.hotlists.getById.invalidate({ id: hotlistId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove consultant')
    }
  })

  const handleRemoveConsultant = async (consultantId: string, name: string) => {
    if (window.confirm(`Remove ${name} from this hotlist?`)) {
      await removeConsultantMutation.mutateAsync({
        hotlistId,
        consultantId
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-charcoal-100 animate-pulse rounded" />
        <div className="h-64 bg-charcoal-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!hotlist) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 mx-auto mb-4 text-charcoal-300" />
        <p className="text-charcoal-600">Hotlist not found</p>
        <Button className="mt-4" onClick={() => router.push('/employee/recruiting/talent-hotlists')}>
          Back to Hotlists
        </Button>
      </div>
    )
  }

  const consultants = (hotlist.consultants || []) as HotlistConsultantItem[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/employee/recruiting/talent-hotlists')}
            className="flex items-center gap-1 text-sm text-charcoal-600 hover:text-charcoal-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hotlists
          </button>
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-gold-500" />
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
              {hotlist.name}
            </h1>
            {hotlist.purpose && (
              <Badge className="bg-charcoal-100 text-charcoal-800">
                {hotlist.purpose}
              </Badge>
            )}
          </div>
          {hotlist.description && (
            <p className="text-charcoal-600 mt-2 max-w-2xl">{hotlist.description}</p>
          )}
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Consultant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{consultants.length}</p>
                <p className="text-sm text-charcoal-600">Total Consultants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">
                  {consultants.filter((c: HotlistConsultantItem) => c.consultant?.status === 'available').length}
                </p>
                <p className="text-sm text-charcoal-600">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">
                  {consultants.filter((c: HotlistConsultantItem) => c.consultant?.status === 'marketing').length}
                </p>
                <p className="text-sm text-charcoal-600">Marketing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">
                  {consultants.filter((c: HotlistConsultantItem) => c.consultant?.status === 'placed').length}
                </p>
                <p className="text-sm text-charcoal-600">Placed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultants Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Consultants</CardTitle>
        </CardHeader>
        <CardContent>
          {consultants.length === 0 ? (
            <div className="text-center py-12 text-charcoal-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No consultants in this hotlist</p>
              <p className="text-sm mt-1">Add consultants to start building your list</p>
              <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Consultant
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visa</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants.map((item: HotlistConsultantItem) => {
                  const consultant = item.consultant
                  const candidateName = consultant?.candidate?.full_name || 'Unknown'
                  const consultantId = consultant?.id || item.consultant_id

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-charcoal-300 cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gold-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gold-600" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900">
                              {candidateName}
                            </p>
                            <p className="text-sm text-charcoal-600">{consultant?.candidate?.email || '-'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[consultant?.status || ''] || 'bg-charcoal-100'}>
                          {consultant?.status?.replace('_', ' ') || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {consultant?.visa_type ? (
                          <Badge className={visaStatusColors[consultant.visa_type] || 'bg-charcoal-100'}>
                            {consultant.visa_type.replace('_', ' ')}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {consultant?.target_rate ? (
                          <span className="flex items-center gap-1 text-charcoal-700">
                            <DollarSign className="h-3 w-3" />
                            {consultant.target_rate}/hr
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-charcoal-600">
                        {item.added_at ? format(new Date(item.added_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/employee/recruiting/talent/${consultantId}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/employee/recruiting/talent/${consultantId}`, '_blank')}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open in New Tab
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleRemoveConsultant(consultantId, candidateName)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove from Hotlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddToHotlistDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        hotlistId={hotlistId}
        hotlistName={hotlist.name}
        existingConsultantIds={consultants.map((c: HotlistConsultantItem) => c.consultant_id)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
