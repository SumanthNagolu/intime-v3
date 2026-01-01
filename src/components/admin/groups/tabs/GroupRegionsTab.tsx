'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Globe } from 'lucide-react'
import type { FullGroupData } from '@/types/admin'

interface GroupRegionsTabProps {
  group: FullGroupData
}

/**
 * Group Regions Tab - Geographic coverage for this group
 */
export function GroupRegionsTab({ group }: GroupRegionsTabProps) {
  const regions = group.regions ?? []
  const primaryRegion = group.region

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
            <div className="flex items-center gap-3 p-4 bg-gold-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gold-700" />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">{primaryRegion.name}</p>
                <p className="text-sm text-charcoal-500">Code: {primaryRegion.code}</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-charcoal-50 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-charcoal-400" />
              </div>
              <p className="text-charcoal-500">No primary region assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Regions (if any) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Geographic Coverage ({regions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Globe className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No additional regions</h3>
              <p className="text-charcoal-500">
                This group only operates in its primary region.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {regions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg"
                >
                  <MapPin className="w-4 h-4 text-charcoal-400" />
                  <div>
                    <p className="font-medium text-charcoal-900">{region.name}</p>
                    <p className="text-xs text-charcoal-500">{region.code}</p>
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
