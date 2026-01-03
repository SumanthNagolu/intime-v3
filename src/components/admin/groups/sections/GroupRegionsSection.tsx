'use client'

import { useState } from 'react'
import { Plus, Trash2, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import type { FullOrgGroupData, OrgGroupRegion } from '@/types/admin'

interface GroupRegionsSectionProps {
  group: FullOrgGroupData
  onRegionsChange?: () => void
}

/**
 * Guidewire-style Group Regions Tab
 * 
 * Shows regions serviced by this group with:
 * - Region name and code
 * - Primary flag
 * - Add/Remove actions
 */
export function GroupRegionsSection({ group, onRegionsChange }: GroupRegionsSectionProps) {
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())
  const [isAddingRegion, setIsAddingRegion] = useState(false)

  const removeRegions = trpc.groups.removeRegions.useMutation({
    onSuccess: () => {
      setSelectedRegions(new Set())
      onRegionsChange?.()
    },
  })

  const regions = group.regions ?? []

  const handleToggleSelect = (regionAssignmentId: string) => {
    const newSelected = new Set(selectedRegions)
    if (newSelected.has(regionAssignmentId)) {
      newSelected.delete(regionAssignmentId)
    } else {
      newSelected.add(regionAssignmentId)
    }
    setSelectedRegions(newSelected)
  }

  const handleRemoveSelected = async () => {
    if (selectedRegions.size === 0) return
    
    const regionIds = Array.from(selectedRegions).map(assignmentId => {
      const assignment = regions.find(r => r.id === assignmentId)
      return assignment?.region_id
    }).filter(Boolean) as string[]

    await removeRegions.mutateAsync({
      groupId: group.id,
      regionIds,
    })
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            className="bg-hublot-900 hover:bg-hublot-800 text-white"
            onClick={() => setIsAddingRegion(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
          <Button 
            variant="outline"
            disabled={selectedRegions.size === 0}
            onClick={handleRemoveSelected}
            className={selectedRegions.size > 0 ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
        <span className="text-sm text-charcoal-500">
          {regions.length} region{regions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Regions Table */}
      <div className="bg-white rounded-lg border border-charcoal-100 overflow-hidden">
        {regions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-charcoal-400" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No regions</h3>
            <p className="text-charcoal-500 mb-4">
              This group doesn&apos;t service any regions yet.
            </p>
            <Button 
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
              onClick={() => setIsAddingRegion(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Region
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-100 bg-charcoal-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-charcoal-300"
                    checked={selectedRegions.size === regions.length && regions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRegions(new Set(regions.map(r => r.id)))
                      } else {
                        setSelectedRegions(new Set())
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Region</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Primary</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {regions.map((assignment: OrgGroupRegion) => (
                <tr key={assignment.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-charcoal-300"
                      checked={selectedRegions.has(assignment.id)}
                      onChange={() => handleToggleSelect(assignment.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-charcoal-400" />
                      <span className="font-medium text-charcoal-900">
                        {assignment.region.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-600">
                    {assignment.region.code}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {assignment.is_primary ? (
                      <Star className="w-4 h-4 text-gold-500 fill-gold-500 mx-auto" />
                    ) : (
                      <span className="text-charcoal-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={assignment.is_active ? 'text-green-600' : 'text-charcoal-400'}>
                      {assignment.is_active ? '✓' : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Region Dialog (placeholder) */}
      {isAddingRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Add Region</h3>
            <p className="text-charcoal-500 mb-4">
              Select regions to add to this group&apos;s service area.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingRegion(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




