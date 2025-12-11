'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Flag, Search, Globe, Building, ChevronDown, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type Role = {
  id: string
  display_name: string
  color_code: string | null
}

type FlagRole = {
  role_id: string
  enabled: boolean
  system_roles: Role
}

type FeatureFlag = {
  id: string
  code: string
  name: string
  description: string | null
  default_enabled: boolean
  is_global: boolean
  feature_flag_roles: FlagRole[]
}

export function FeatureFlagsPage() {
  const [search, setSearch] = useState('')
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set())

  const { toast } = useToast()

  const flagsQuery = trpc.permissions.getFeatureFlags.useQuery()
  const rolesQuery = trpc.permissions.getRoles.useQuery()

  const updateMutation = trpc.permissions.updateFeatureFlagRole.useMutation({
    onSuccess: () => {
      flagsQuery.refetch()
      toast({
        title: 'Feature Flag Updated',
        description: 'The feature flag setting has been updated.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update feature flag',
        variant: 'error',
      })
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Feature Flags' },
  ]

  const toggleExpand = (flagId: string) => {
    const newExpanded = new Set(expandedFlags)
    if (newExpanded.has(flagId)) {
      newExpanded.delete(flagId)
    } else {
      newExpanded.add(flagId)
    }
    setExpandedFlags(newExpanded)
  }

  const handleToggleRole = (flagId: string, roleId: string, currentEnabled: boolean) => {
    updateMutation.mutate({
      featureFlagId: flagId,
      roleId,
      enabled: !currentEnabled,
    })
  }

  const filteredFlags = flagsQuery.data?.filter((flag: FeatureFlag) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      flag.name.toLowerCase().includes(searchLower) ||
      flag.code.toLowerCase().includes(searchLower) ||
      flag.description?.toLowerCase().includes(searchLower)
    )
  })

  const getRoleStatus = (flag: FeatureFlag, roleId: string) => {
    const roleFlag = flag.feature_flag_roles?.find((fr: FlagRole) => fr.role_id === roleId)
    return roleFlag?.enabled ?? flag.default_enabled
  }

  const getEnabledRolesCount = (flag: FeatureFlag) => {
    return (
      flag.feature_flag_roles?.filter((fr: FlagRole) => fr.enabled).length ||
      (flag.default_enabled ? rolesQuery.data?.length || 0 : 0)
    )
  }

  return (
    <DashboardShell
      title="Feature Flags"
      description="Enable or disable features for specific roles"
      breadcrumbs={breadcrumbs}
    >
      <DashboardSection>
        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setExpandedFlags(
                expandedFlags.size === filteredFlags?.length
                  ? new Set()
                  : new Set(filteredFlags?.map((f: FeatureFlag) => f.id))
              )
            }
          >
            {expandedFlags.size === filteredFlags?.length ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>

        {/* Feature Flags List */}
        <div className="space-y-4">
          {flagsQuery.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-charcoal-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : flagsQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load feature flags. Please try again.
            </div>
          ) : filteredFlags?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Flag className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                No feature flags found
              </h3>
              <p className="text-charcoal-500">
                {search
                  ? 'Try adjusting your search terms.'
                  : 'Feature flags will appear here when configured.'}
              </p>
            </div>
          ) : (
            filteredFlags?.map((flag: FeatureFlag) => {
              const isExpanded = expandedFlags.has(flag.id)
              const enabledCount = getEnabledRolesCount(flag)
              const totalRoles = rolesQuery.data?.length || 0

              return (
                <div
                  key={flag.id}
                  className="bg-white rounded-xl border border-charcoal-100 overflow-hidden"
                >
                  {/* Flag Header */}
                  <button
                    onClick={() => toggleExpand(flag.id)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-charcoal-25 transition-colors text-left"
                  >
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-charcoal-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-charcoal-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-charcoal-900">{flag.name}</h3>
                        {flag.is_global ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                            <Globe className="w-3 h-3" />
                            Global
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">
                            <Building className="w-3 h-3" />
                            Org
                          </span>
                        )}
                        {flag.default_enabled && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                            Default On
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal-500 mt-1">{flag.description}</p>
                      <p className="text-xs text-charcoal-400 mt-1 font-mono">{flag.code}</p>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-medium text-charcoal-900">
                        {enabledCount} / {totalRoles}
                      </div>
                      <div className="text-xs text-charcoal-500">roles enabled</div>
                    </div>
                  </button>

                  {/* Expanded Role List */}
                  {isExpanded && (
                    <div className="px-6 pb-4 border-t border-charcoal-100">
                      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {rolesQuery.data?.map((role: Role) => {
                          const isEnabled = getRoleStatus(flag, role.id)

                          return (
                            <div
                              key={role.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isEnabled
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-charcoal-50 border-charcoal-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: role.color_code || '#6b7280' }}
                                />
                                <span className="text-sm font-medium text-charcoal-900">
                                  {role.display_name}
                                </span>
                              </div>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() =>
                                  handleToggleRole(flag.id, role.id, isEnabled)
                                }
                                disabled={updateMutation.isPending}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-charcoal-50 rounded-lg">
          <h4 className="text-sm font-semibold text-charcoal-700 mb-3">About Feature Flags</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-charcoal-600">
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <span className="font-medium">Global flags</span> are shared across all
                organizations.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <span className="font-medium">Org flags</span> are specific to your
                organization.
              </div>
            </div>
          </div>
        </div>
      </DashboardSection>
    </DashboardShell>
  )
}
