'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  X,
  Users,
  Briefcase
} from 'lucide-react'
import { useState } from 'react'
import type { FullUserData, AuthorityLimit } from '@/types/admin'

interface UserAuthorityTabProps {
  user: FullUserData
}

/**
 * User Authority Tab - Authority limits, approval powers
 */
export function UserAuthorityTab({ user }: UserAuthorityTabProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Get authority data from user
  const authority = user.authority || {
    financial_limits: {
      expense_approval: 0,
      po_approval: 0,
      contract_signing: 0,
    },
    operational_limits: {
      max_direct_reports: 0,
      max_contractors: 0,
      hiring_authority: false,
      termination_authority: false,
    },
  }

  // Authority limits from sections
  const authorityLimits: AuthorityLimit[] = user.sections?.authorityLimits?.items || []

  // Pending approvals from sections
  const pendingApprovals = user.sections?.pendingApprovals?.items || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Financial Authority */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Financial Authority
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit Limits
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setIsEditing(false)}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-charcoal-500" />
                <span className="text-sm font-medium text-charcoal-600">Expense Approval</span>
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Max Amount</Label>
                  <Input
                    type="number"
                    defaultValue={authority.financial_limits?.expense_approval || 0}
                    className="h-9"
                  />
                </div>
              ) : (
                <p className="text-2xl font-semibold text-charcoal-900">
                  {formatCurrency(authority.financial_limits?.expense_approval || 0)}
                </p>
              )}
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-5 h-5 text-charcoal-500" />
                <span className="text-sm font-medium text-charcoal-600">PO Approval</span>
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Max Amount</Label>
                  <Input
                    type="number"
                    defaultValue={authority.financial_limits?.po_approval || 0}
                    className="h-9"
                  />
                </div>
              ) : (
                <p className="text-2xl font-semibold text-charcoal-900">
                  {formatCurrency(authority.financial_limits?.po_approval || 0)}
                </p>
              )}
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-charcoal-500" />
                <span className="text-sm font-medium text-charcoal-600">Contract Signing</span>
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Max Amount</Label>
                  <Input
                    type="number"
                    defaultValue={authority.financial_limits?.contract_signing || 0}
                    className="h-9"
                  />
                </div>
              ) : (
                <p className="text-2xl font-semibold text-charcoal-900">
                  {formatCurrency(authority.financial_limits?.contract_signing || 0)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Authority */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Operational Authority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-charcoal-500" />
                  <div>
                    <p className="font-medium text-charcoal-900">Max Direct Reports</p>
                    <p className="text-sm text-charcoal-500">Number of direct reports allowed</p>
                  </div>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    defaultValue={authority.operational_limits?.max_direct_reports || 0}
                    className="w-20 h-9"
                  />
                ) : (
                  <Badge variant="outline" className="text-lg">
                    {authority.operational_limits?.max_direct_reports || 0}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-charcoal-500" />
                  <div>
                    <p className="font-medium text-charcoal-900">Max Contractors</p>
                    <p className="text-sm text-charcoal-500">Contractor management limit</p>
                  </div>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    defaultValue={authority.operational_limits?.max_contractors || 0}
                    className="w-20 h-9"
                  />
                ) : (
                  <Badge variant="outline" className="text-lg">
                    {authority.operational_limits?.max_contractors || 0}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${authority.operational_limits?.hiring_authority ? 'text-green-500' : 'text-charcoal-300'}`} />
                  <div>
                    <p className="font-medium text-charcoal-900">Hiring Authority</p>
                    <p className="text-sm text-charcoal-500">Can approve new hires</p>
                  </div>
                </div>
                <Badge className={authority.operational_limits?.hiring_authority
                  ? 'bg-green-100 text-green-800'
                  : 'bg-charcoal-100 text-charcoal-600'
                }>
                  {authority.operational_limits?.hiring_authority ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${authority.operational_limits?.termination_authority ? 'text-amber-500' : 'text-charcoal-300'}`} />
                  <div>
                    <p className="font-medium text-charcoal-900">Termination Authority</p>
                    <p className="text-sm text-charcoal-500">Can approve terminations</p>
                  </div>
                </div>
                <Badge className={authority.operational_limits?.termination_authority
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-charcoal-100 text-charcoal-600'
                }>
                  {authority.operational_limits?.termination_authority ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authority Limits (Custom) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Custom Authority Limits
            </CardTitle>
            <Button variant="outline" size="sm">
              Add Limit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {authorityLimits.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No custom authority limits defined</p>
              <p className="text-sm text-charcoal-400 mt-1">
                Add custom limits for specific business rules
              </p>
            </div>
          ) : (
            <div className="border border-charcoal-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal-50 border-b border-charcoal-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Limit Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Amount / Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Scope
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {authorityLimits.map((limit) => (
                    <tr key={limit.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3 font-medium text-charcoal-900">
                        {limit.type}
                      </td>
                      <td className="px-4 py-3 text-charcoal-700">
                        {limit.is_monetary ? formatCurrency(limit.value) : limit.value}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{limit.scope || 'global'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-500">
                        {limit.expires_at || 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((approval, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-charcoal-900">{approval.type}</p>
                      <p className="text-sm text-charcoal-500">{approval.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800">
                      {formatCurrency(approval.amount)}
                    </Badge>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
