'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Check,
  X,
  GitCompare,
  FlaskConical,
  FileDown,
  ChevronDown,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { BulkUpdateDialog } from './BulkUpdateDialog'

const SCOPE_LABELS: Record<string, string> = {
  own: 'Own',
  own_raci: 'Own + RACI',
  own_ra: 'Own + R/A',
  team: 'Team',
  region: 'Region',
  org: 'Organization',
  draft_only: 'Draft Only',
}

const SCOPE_COLORS: Record<string, string> = {
  own: 'bg-charcoal-100 text-charcoal-700',
  own_raci: 'bg-blue-100 text-blue-700',
  own_ra: 'bg-indigo-100 text-indigo-700',
  team: 'bg-purple-100 text-purple-700',
  region: 'bg-amber-100 text-amber-700',
  org: 'bg-green-100 text-green-700',
  draft_only: 'bg-orange-100 text-orange-700',
}

type RolePermission = {
  roleId: string
  roleName: string
  granted: boolean
  scope: string | null
}

type MatrixRow = {
  permission: {
    id: string
    code: string
    name: string
    action: string
  }
  rolePermissions: RolePermission[]
}

type Role = {
  id: string
  code: string
  name: string
  display_name: string
  category: string
  hierarchy_level: number
  color_code: string | null
}

export function PermissionMatrixPage() {
  const [objectType, setObjectType] = useState<string>('')
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false)
  const { toast } = useToast()

  const objectTypesQuery = trpc.permissions.getObjectTypes.useQuery()
  const matrixQuery = trpc.permissions.getMatrix.useQuery(
    { objectType },
    { enabled: !!objectType }
  )

  const updateMutation = trpc.permissions.updateRolePermission.useMutation({
    onSuccess: () => {
      matrixQuery.refetch()
      setEditingCell(null)
      toast({
        title: 'Permission Updated',
        description: 'The role permission has been updated successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update permission',
        variant: 'error',
      })
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Permissions' },
  ]

  const handleTogglePermission = (
    roleId: string,
    permissionId: string,
    currentGranted: boolean,
    currentScope: string | null
  ) => {
    updateMutation.mutate({
      roleId,
      permissionId,
      granted: !currentGranted,
      scope: (currentScope as 'own' | 'own_raci' | 'own_ra' | 'team' | 'region' | 'org' | 'draft_only') || 'own',
    })
  }

  const handleScopeChange = (
    roleId: string,
    permissionId: string,
    newScope: string
  ) => {
    updateMutation.mutate({
      roleId,
      permissionId,
      granted: true,
      scope: newScope as 'own' | 'own_raci' | 'own_ra' | 'team' | 'region' | 'org' | 'draft_only',
    })
    setEditingCell(null)
  }

  const exportToCSV = () => {
    if (!matrixQuery.data) return

    const headers = ['Permission', ...matrixQuery.data.roles.map((r: Role) => r.display_name)]
    const rows = matrixQuery.data.matrix.map((row: MatrixRow) => [
      row.permission.name,
      ...row.rolePermissions.map((rp: RolePermission) =>
        rp.granted ? `Yes (${SCOPE_LABELS[rp.scope || 'own']})` : 'No'
      ),
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `permissions-${objectType}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Set default object type when data loads
  if (objectTypesQuery.data && objectTypesQuery.data.length > 0 && !objectType) {
    setObjectType(objectTypesQuery.data[0])
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkUpdateOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Bulk Update
            </Button>
            <Link href="/employee/admin/permissions/test">
              <Button variant="outline">
                <FlaskConical className="w-4 h-4 mr-2" />
                Test Permission
              </Button>
            </Link>
            <Link href="/employee/admin/permissions/compare">
              <Button variant="outline">
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Roles
              </Button>
            </Link>
            <Button variant="outline" onClick={exportToCSV} disabled={!matrixQuery.data}>
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />
      <DashboardSection>
        {/* Object Type Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-charcoal-700">Object Type:</label>
          <Select value={objectType} onValueChange={setObjectType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select object type" />
            </SelectTrigger>
            <SelectContent>
              {objectTypesQuery.data?.map((type: string) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/employee/admin/permissions/overrides" className="ml-auto">
            <Button variant="ghost" size="sm">
              View Overrides
            </Button>
          </Link>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {!objectType ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Shield className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                Select an Object Type
              </h3>
              <p className="text-charcoal-500">
                Choose an object type above to view and edit its permission matrix.
              </p>
            </div>
          ) : matrixQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : matrixQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load permission matrix. Please try again.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal-50 border-b border-charcoal-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider sticky left-0 bg-charcoal-50 z-10">
                      Action
                    </th>
                    {matrixQuery.data?.roles.map((role: Role) => (
                      <th
                        key={role.id}
                        className="px-3 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider min-w-[100px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: role.color_code || '#6b7280' }}
                          />
                          <span className="whitespace-nowrap">{role.display_name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixQuery.data?.matrix.map((row: MatrixRow, idx: number) => (
                    <tr
                      key={row.permission.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-charcoal-25'}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-charcoal-900 sticky left-0 bg-inherit z-10 border-r border-charcoal-100">
                        <div>
                          <div className="font-medium">{row.permission.name}</div>
                          <div className="text-xs text-charcoal-500">{row.permission.code}</div>
                        </div>
                      </td>
                      {row.rolePermissions.map((rp: RolePermission) => {
                        const cellKey = `${row.permission.id}-${rp.roleId}`
                        const isEditing = editingCell === cellKey

                        return (
                          <td key={rp.roleId} className="px-3 py-3 text-center">
                            {rp.granted ? (
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => handleTogglePermission(
                                    rp.roleId,
                                    row.permission.id,
                                    rp.granted,
                                    rp.scope
                                  )}
                                  className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                                  disabled={updateMutation.isPending}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                {isEditing ? (
                                  <Select
                                    value={rp.scope || 'own'}
                                    onValueChange={(v) =>
                                      handleScopeChange(rp.roleId, row.permission.id, v)
                                    }
                                  >
                                    <SelectTrigger className="h-6 text-xs w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(SCOPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <button
                                    onClick={() => setEditingCell(cellKey)}
                                    className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                      SCOPE_COLORS[rp.scope || 'own']
                                    } hover:opacity-80 transition-opacity`}
                                  >
                                    {SCOPE_LABELS[rp.scope || 'own']}
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleTogglePermission(
                                  rp.roleId,
                                  row.permission.id,
                                  rp.granted,
                                  rp.scope
                                )}
                                className="w-6 h-6 rounded-full bg-charcoal-100 text-charcoal-400 flex items-center justify-center hover:bg-charcoal-200 transition-colors mx-auto"
                                disabled={updateMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Scope Legend */}
        <div className="mt-6 p-4 bg-charcoal-50 rounded-lg">
          <h4 className="text-sm font-semibold text-charcoal-700 mb-3">Scope Legend</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(SCOPE_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${SCOPE_COLORS[value]}`}>
                  {label}
                </span>
                <span className="text-xs text-charcoal-500">
                  {value === 'own' && '- Only records created by the user'}
                  {value === 'own_raci' && '- Records where user is R, A, C, or I'}
                  {value === 'own_ra' && '- Records where user is Responsible or Accountable'}
                  {value === 'team' && '- All records in user\'s pod/team'}
                  {value === 'region' && '- All records in user\'s region'}
                  {value === 'org' && '- All records in the organization'}
                  {value === 'draft_only' && '- Only draft status records'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DashboardSection>

      <BulkUpdateDialog open={isBulkUpdateOpen} onOpenChange={setIsBulkUpdateOpen} />
    </AdminPageContent>
  )
}
