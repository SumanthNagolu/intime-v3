'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Hash,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { FullGroupData, GroupProducerCode } from '@/types/admin'

interface GroupCodesTabProps {
  group: FullGroupData
}

/**
 * Group Producer Codes Tab - Manage producer codes assigned to this group
 *
 * Producer codes are identifiers used for tracking business operations,
 * commission allocation, and compliance reporting.
 */
export function GroupCodesTab({ group }: GroupCodesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Get producer codes from group data
  const producerCodes = group.producerCodes ?? []

  // Filter codes based on search query
  const filteredCodes = producerCodes.filter(
    (code) =>
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Summary stats
  const totalCodes = producerCodes.length
  const activeCodes = producerCodes.filter((c) => c.is_active).length
  const inactiveCodes = totalCodes - activeCodes

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-100 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-charcoal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900">{totalCodes}</p>
              <p className="text-sm text-charcoal-500">Total Codes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900">{activeCodes}</p>
              <p className="text-sm text-charcoal-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-charcoal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900">{inactiveCodes}</p>
              <p className="text-sm text-charcoal-500">Inactive</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Producer Codes Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Producer Codes
          </CardTitle>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Code
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search by code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          {filteredCodes.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50">
                    <TableHead className="font-semibold uppercase text-xs tracking-wider">
                      Code
                    </TableHead>
                    <TableHead className="font-semibold uppercase text-xs tracking-wider">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold uppercase text-xs tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code) => (
                    <ProducerCodeRow key={code.id} code={code} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyCodesState searchQuery={searchQuery} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ProducerCodeRowProps {
  code: GroupProducerCode
}

function ProducerCodeRow({ code }: ProducerCodeRowProps) {
  return (
    <TableRow className="hover:bg-charcoal-50 transition-colors">
      <TableCell>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-charcoal-400" />
          <span className="font-mono font-medium text-charcoal-900">{code.code}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-charcoal-700">
          {code.description || <span className="text-charcoal-400 italic">No description</span>}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            code.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-charcoal-100 text-charcoal-600'
          }`}
        >
          {code.is_active ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Active
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Inactive
            </>
          )}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>{code.is_active ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

interface EmptyCodesStateProps {
  searchQuery: string
}

function EmptyCodesState({ searchQuery }: EmptyCodesStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="w-12 h-12 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-6 h-6 text-charcoal-400" />
      </div>
      {searchQuery ? (
        <>
          <p className="text-charcoal-900 font-medium mb-1">No matching codes</p>
          <p className="text-charcoal-500 text-sm">
            No producer codes match &quot;{searchQuery}&quot;
          </p>
        </>
      ) : (
        <>
          <p className="text-charcoal-900 font-medium mb-1">No producer codes</p>
          <p className="text-charcoal-500 text-sm mb-4">
            This group has no producer codes assigned yet.
          </p>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add First Code
          </Button>
        </>
      )}
    </div>
  )
}
