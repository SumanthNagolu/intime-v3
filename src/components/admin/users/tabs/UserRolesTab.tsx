'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, Trash2, Calendar, User } from 'lucide-react'
import type { FullUserData, RoleAssignment } from '@/types/admin'
import { format } from 'date-fns'

interface UserRolesTabProps {
  user: FullUserData
}

/**
 * User Roles Tab - Assigned roles with Add/Remove
 */
export function UserRolesTab({ user }: UserRolesTabProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  // Get role assignments from user data
  const roleAssignments: RoleAssignment[] = user.sections?.roleAssignments?.items || []

  // Current role from user profile
  const currentRole = user.role

  const toggleSelect = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleRemoveSelected = () => {
    // TODO: Implement role removal mutation
    console.log('Remove roles:', selectedRoles)
    setSelectedRoles([])
  }

  return (
    <div className="space-y-6">
      {/* Primary Role */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Primary Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentRole ? (
            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${currentRole.color_code}20` }}
                >
                  <Shield
                    className="w-5 h-5"
                    style={{ color: currentRole.color_code }}
                  />
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">{currentRole.display_name}</p>
                  <p className="text-sm text-charcoal-500">{currentRole.name}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${currentRole.color_code}20`,
                  borderColor: currentRole.color_code,
                  color: currentRole.color_code
                }}
              >
                Primary
              </Badge>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No primary role assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Role Assignments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Role Assignments
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedRoles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove ({selectedRoles.length})
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Role
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {roleAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No additional role assignments</p>
              <p className="text-sm text-charcoal-400 mt-1">
                Add roles to grant additional permissions
              </p>
            </div>
          ) : (
            <div className="border border-charcoal-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal-50 border-b border-charcoal-100">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-charcoal-300"
                        checked={selectedRoles.length === roleAssignments.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles(roleAssignments.map(r => r.id))
                          } else {
                            setSelectedRoles([])
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Assigned By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Assigned Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {roleAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-charcoal-300"
                          checked={selectedRoles.includes(assignment.id)}
                          onChange={() => toggleSelect(assignment.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-charcoal-500" />
                          <span className="font-medium text-charcoal-900">
                            {assignment.role?.display_name || assignment.role_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-charcoal-600">
                          <User className="w-4 h-4" />
                          {assignment.assigned_by_user?.full_name || 'System'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {assignment.assigned_at
                            ? format(new Date(assignment.assigned_at), 'MMM d, yyyy')
                            : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-600">
                        {assignment.expires_at
                          ? format(new Date(assignment.expires_at), 'MMM d, yyyy')
                          : <span className="text-charcoal-400">Never</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Preview */}
      {currentRole && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Effective Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-charcoal-500 mb-4">
              Permissions inherited from assigned roles
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Show some sample permissions - in real app, compute from roles */}
              {['view_users', 'edit_users', 'view_jobs', 'create_submissions', 'view_reports'].map((perm) => (
                <Badge key={perm} variant="outline" className="text-xs">
                  {perm.replace(/_/g, ' ')}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs text-charcoal-400">
                +{Math.floor(Math.random() * 20) + 5} more
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
