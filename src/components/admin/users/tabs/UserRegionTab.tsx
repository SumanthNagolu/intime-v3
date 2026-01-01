'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Trash2, Building2, Globe, CheckCircle } from 'lucide-react'
import type { FullUserData, RegionAssignment } from '@/types/admin'

interface UserRegionTabProps {
  user: FullUserData
}

/**
 * User Region Tab - Geographic assignments
 */
export function UserRegionTab({ user }: UserRegionTabProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])

  // Get region assignments from user data
  const regionAssignments: RegionAssignment[] = user.sections?.regionAssignments?.items || []

  // Primary region
  const primaryRegion = user.primary_region

  const toggleSelect = (regionId: string) => {
    setSelectedRegions(prev =>
      prev.includes(regionId)
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    )
  }

  const handleRemoveSelected = () => {
    // TODO: Implement region removal mutation
    console.log('Remove regions:', selectedRegions)
    setSelectedRegions([])
  }

  return (
    <div className="space-y-6">
      {/* Primary Region */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Primary Region
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primaryRegion ? (
            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">{primaryRegion.name}</p>
                  <p className="text-sm text-charcoal-500">{primaryRegion.code}</p>
                </div>
              </div>
              <Badge className="bg-gold-100 text-gold-800">Primary</Badge>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No primary region assigned</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="w-4 h-4 mr-1" />
                Set Primary Region
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Region Assignments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Region Assignments
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedRegions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove ({selectedRegions.length})
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Region
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {regionAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No additional regions assigned</p>
              <p className="text-sm text-charcoal-400 mt-1">
                Add regions to allow access to location-specific data
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
                        checked={selectedRegions.length === regionAssignments.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRegions(regionAssignments.map(r => r.id))
                          } else {
                            setSelectedRegions([])
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Region
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Parent Region
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {regionAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-charcoal-300"
                          checked={selectedRegions.includes(assignment.id)}
                          onChange={() => toggleSelect(assignment.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-charcoal-500" />
                          <span className="font-medium text-charcoal-900">
                            {assignment.region?.name || assignment.region_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {assignment.region?.type || 'state'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-600">
                        {assignment.region?.parent_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Office Locations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Office Locations
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Office
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {user.office_locations && user.office_locations.length > 0 ? (
            <div className="space-y-3">
              {user.office_locations.map((office, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-charcoal-500" />
                    <div>
                      <p className="font-medium text-charcoal-900">{office.name}</p>
                      <p className="text-sm text-charcoal-500">{office.address}</p>
                    </div>
                  </div>
                  {office.is_primary && (
                    <Badge className="bg-gold-100 text-gold-800">Primary</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No office locations assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Region Coverage Map Placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Coverage Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-charcoal-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">Geographic coverage visualization</p>
              <p className="text-sm text-charcoal-400">Map integration coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
