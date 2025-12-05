'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Minus, GitCompare, ArrowLeftRight } from 'lucide-react'

const SCOPE_LABELS: Record<string, string> = {
  own: 'Own',
  own_raci: 'Own + RACI',
  own_ra: 'Own + R/A',
  team: 'Team',
  region: 'Region',
  org: 'Organization',
  draft_only: 'Draft Only',
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

type Permission = {
  id: string
  code: string
  name: string
  object_type: string
  action: string
}

type PermissionComparison = {
  permission: Permission
  role1: { granted: boolean; scope: string | null }
  role2: { granted: boolean; scope: string | null }
  different: boolean
}

type FeatureComparison = {
  featureCode: string
  featureName: string
  role1Enabled: boolean
  role2Enabled: boolean
  different: boolean
}

export function RoleComparisonPage() {
  const [roleId1, setRoleId1] = useState<string>('')
  const [roleId2, setRoleId2] = useState<string>('')
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const [groupByObject, setGroupByObject] = useState(true)

  const rolesQuery = trpc.permissions.getRoles.useQuery()
  const comparisonQuery = trpc.permissions.compareRoles.useQuery(
    { roleId1, roleId2 },
    { enabled: !!roleId1 && !!roleId2 }
  )

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Permissions', href: '/employee/admin/permissions' },
    { label: 'Compare Roles' },
  ]

  const swapRoles = () => {
    const temp = roleId1
    setRoleId1(roleId2)
    setRoleId2(temp)
  }

  const filteredPermissions = comparisonQuery.data?.permissionComparison?.filter(
    (p: PermissionComparison) => !showOnlyDifferences || p.different
  )

  const groupedPermissions = groupByObject
    ? filteredPermissions?.reduce(
        (acc: Record<string, PermissionComparison[]>, p: PermissionComparison) => {
          const objectType = p.permission.object_type
          if (!acc[objectType]) acc[objectType] = []
          acc[objectType].push(p)
          return acc
        },
        {}
      )
    : null

  const filteredFeatures = comparisonQuery.data?.featureComparison?.filter(
    (f: FeatureComparison) => !showOnlyDifferences || f.different
  )

  const renderPermissionStatus = (granted: boolean, scope: string | null) => {
    if (!granted) {
      return (
        <div className="flex items-center gap-1 text-charcoal-400">
          <X className="w-4 h-4" />
          <span className="text-sm">Denied</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-green-600">
        <Check className="w-4 h-4" />
        <span className="text-sm">{SCOPE_LABELS[scope || 'own']}</span>
      </div>
    )
  }

  return (
    <DashboardShell
      title="Compare Roles"
      description="Compare permissions and feature flags between two roles"
      breadcrumbs={breadcrumbs}
    >
      <DashboardSection>
        {/* Role Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">
              First Role
            </label>
            <Select value={roleId1} onValueChange={setRoleId1}>
              <SelectTrigger>
                <SelectValue placeholder="Select first role" />
              </SelectTrigger>
              <SelectContent>
                {rolesQuery.data?.map((role: Role) => (
                  <SelectItem key={role.id} value={role.id} disabled={role.id === roleId2}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: role.color_code || '#6b7280' }}
                      />
                      {role.display_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={swapRoles}
            className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors mt-6 sm:mt-0"
            disabled={!roleId1 || !roleId2}
          >
            <ArrowLeftRight className="w-5 h-5 text-charcoal-500" />
          </button>

          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">
              Second Role
            </label>
            <Select value={roleId2} onValueChange={setRoleId2}>
              <SelectTrigger>
                <SelectValue placeholder="Select second role" />
              </SelectTrigger>
              <SelectContent>
                {rolesQuery.data?.map((role: Role) => (
                  <SelectItem key={role.id} value={role.id} disabled={role.id === roleId1}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: role.color_code || '#6b7280' }}
                      />
                      {role.display_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyDifferences}
              onChange={(e) => setShowOnlyDifferences(e.target.checked)}
              className="rounded border-charcoal-300"
            />
            <span className="text-sm text-charcoal-700">Show only differences</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByObject}
              onChange={(e) => setGroupByObject(e.target.checked)}
              className="rounded border-charcoal-300"
            />
            <span className="text-sm text-charcoal-700">Group by object type</span>
          </label>
        </div>

        {/* Comparison Table */}
        {!roleId1 || !roleId2 ? (
          <div className="text-center py-12 text-charcoal-500">
            <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Select two roles to compare their permissions and feature flags.</p>
          </div>
        ) : comparisonQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-charcoal-100 animate-pulse rounded" />
            ))}
          </div>
        ) : comparisonQuery.error ? (
          <div className="text-center py-8 text-red-600">
            Failed to load comparison. Please try again.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Permissions Comparison */}
            <div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Permissions</h3>
              <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-charcoal-50 border-b border-charcoal-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                        Permission
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                comparisonQuery.data?.role1?.color_code || '#6b7280',
                            }}
                          />
                          {comparisonQuery.data?.role1?.display_name}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                comparisonQuery.data?.role2?.color_code || '#6b7280',
                            }}
                          />
                          {comparisonQuery.data?.role2?.display_name}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByObject && groupedPermissions
                      ? Object.entries(groupedPermissions).map(([objectType, perms]) => (
                          <>
                            <tr key={objectType} className="bg-charcoal-25">
                              <td
                                colSpan={3}
                                className="px-4 py-2 text-sm font-semibold text-charcoal-700 uppercase"
                              >
                                {objectType}
                              </td>
                            </tr>
                            {(perms as PermissionComparison[]).map((p, idx) => (
                              <tr
                                key={p.permission.id}
                                className={`${
                                  p.different ? 'bg-amber-50' : idx % 2 === 0 ? 'bg-white' : ''
                                } border-b border-charcoal-50`}
                              >
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-charcoal-900">
                                    {p.permission.name}
                                  </div>
                                  <div className="text-xs text-charcoal-500">
                                    {p.permission.code}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {renderPermissionStatus(p.role1.granted, p.role1.scope)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {renderPermissionStatus(p.role2.granted, p.role2.scope)}
                                </td>
                              </tr>
                            ))}
                          </>
                        ))
                      : filteredPermissions?.map((p: PermissionComparison, idx: number) => (
                          <tr
                            key={p.permission.id}
                            className={`${
                              p.different ? 'bg-amber-50' : idx % 2 === 0 ? 'bg-white' : ''
                            } border-b border-charcoal-50`}
                          >
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-charcoal-900">
                                {p.permission.name}
                              </div>
                              <div className="text-xs text-charcoal-500">
                                {p.permission.object_type} - {p.permission.code}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {renderPermissionStatus(p.role1.granted, p.role1.scope)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {renderPermissionStatus(p.role2.granted, p.role2.scope)}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Flags Comparison */}
            {filteredFeatures && filteredFeatures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Feature Flags</h3>
                <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-charcoal-50 border-b border-charcoal-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                          Feature
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase">
                          {comparisonQuery.data?.role1?.display_name}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase">
                          {comparisonQuery.data?.role2?.display_name}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeatures.map((f: FeatureComparison, idx: number) => (
                        <tr
                          key={f.featureCode}
                          className={`${
                            f.different ? 'bg-amber-50' : idx % 2 === 0 ? 'bg-white' : ''
                          } border-b border-charcoal-50`}
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-charcoal-900">
                              {f.featureName}
                            </div>
                            <div className="text-xs text-charcoal-500">{f.featureCode}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {f.role1Enabled ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <Check className="w-4 h-4" /> Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-charcoal-400">
                                <Minus className="w-4 h-4" /> Disabled
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {f.role2Enabled ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <Check className="w-4 h-4" /> Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-charcoal-400">
                                <Minus className="w-4 h-4" /> Disabled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <h4 className="text-sm font-semibold text-charcoal-700 mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-500">Total permissions:</span>{' '}
                  <span className="font-medium">
                    {comparisonQuery.data?.permissionComparison?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500">Differences:</span>{' '}
                  <span className="font-medium text-amber-600">
                    {comparisonQuery.data?.permissionComparison?.filter(
                      (p: PermissionComparison) => p.different
                    ).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  )
}
