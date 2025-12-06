'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Users, Activity, CheckCircle, BarChart2 } from 'lucide-react'

interface ViewUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flagId: string
}

export function ViewUsageDialog({
  open,
  onOpenChange,
  flagId,
}: ViewUsageDialogProps) {
  const [days, setDays] = useState(30)

  const flagQuery = trpc.featureFlags.getById.useQuery({ id: flagId })
  const usageQuery = trpc.featureFlags.getUsage.useQuery({ flagId, days })

  const flag = flagQuery.data
  const usage = usageQuery.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Feature Usage</DialogTitle>
          <DialogDescription>
            {flag?.name} ({flag?.key})
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-end mb-4">
            <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {usageQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{usage?.uniqueUsers || 0}</p>
                <p className="text-xs text-charcoal-500">Unique Users</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <Activity className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{usage?.totalChecks || 0}</p>
                <p className="text-xs text-charcoal-500">Total Checks</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{usage?.enabledChecks || 0}</p>
                <p className="text-xs text-charcoal-500">Enabled Checks</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <BarChart2 className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{usage?.enabledRate || 0}%</p>
                <p className="text-xs text-charcoal-500">Enabled Rate</p>
              </div>
            </div>
          )}

          {!usageQuery.isLoading && usage?.totalChecks === 0 && (
            <p className="text-center text-charcoal-500 py-4">
              No usage data yet for this period.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
