'use client'

import { Shield, Lock } from 'lucide-react'
import { PermissionsTable } from '../PermissionsTable'
import type { FullRoleData } from '@/types/admin'

const CATEGORY_LABELS: Record<string, string> = {
  pod_ic: 'Pod IC',
  pod_manager: 'Pod Manager',
  leadership: 'Leadership',
  executive: 'Executive',
  portal: 'Portal',
  admin: 'Admin',
}

interface RoleBasicsTabProps {
  role: FullRoleData
}

export function RoleBasicsTab({ role }: RoleBasicsTabProps) {
  return (
    <div className="space-y-6">
      {/* Role Info Section */}
      <div className="bg-white rounded-lg border border-charcoal-100">
        <div className="px-4 py-3 border-b border-charcoal-100 bg-charcoal-50">
          <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
            Role Information
          </h3>
        </div>
        <div className="p-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Name
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${role.color_code}20` }}
                >
                  <Shield className="w-3.5 h-3.5" style={{ color: role.color_code }} />
                </div>
                <span className="font-medium text-charcoal-900">{role.display_name}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Code
              </dt>
              <dd className="mt-1">
                <code className="px-2 py-1 bg-charcoal-100 text-charcoal-700 text-sm rounded">
                  {role.code}
                </code>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Type
              </dt>
              <dd className="mt-1 font-medium text-charcoal-900">
                {CATEGORY_LABELS[role.category] || role.category}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Hierarchy Level
              </dt>
              <dd className="mt-1 font-medium text-charcoal-900">
                Level {role.hierarchy_level}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Internal Only
              </dt>
              <dd className="mt-1">
                {role.is_system_role ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    <Lock className="w-3 h-3" />
                    System Role
                  </span>
                ) : (
                  <span className="text-charcoal-600">No</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Status
              </dt>
              <dd className="mt-1">
                {role.is_active ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-600">
                    Inactive
                  </span>
                )}
              </dd>
            </div>
            {role.description && (
              <div className="md:col-span-2">
                <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Description
                </dt>
                <dd className="mt-1 text-charcoal-700">{role.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Permissions Table Section */}
      <div className="bg-white rounded-lg border border-charcoal-100">
        <div className="px-4 py-3 border-b border-charcoal-100 bg-charcoal-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
            Permissions
          </h3>
          <span className="text-xs text-charcoal-500">
            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <PermissionsTable permissions={role.permissions} pageSize={15} />
      </div>
    </div>
  )
}
