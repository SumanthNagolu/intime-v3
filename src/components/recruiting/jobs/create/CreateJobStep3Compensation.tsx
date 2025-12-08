'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateJobStore, RATE_TYPES, PRIORITIES, RATE_SUFFIXES } from '@/stores/create-job-store'
import { DollarSign, Users, Flag, Calendar } from 'lucide-react'

export function CreateJobStep3Compensation() {
  const { formData, setFormData } = useCreateJobStore()

  const rateSuffix = RATE_SUFFIXES[formData.rateType] || '/hr'

  return (
    <div className="space-y-6">
      {/* Rate Range */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4" />
          Rate Range
        </Label>
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          <div>
            <Label htmlFor="rateMin" className="text-sm text-charcoal-500">Minimum</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
              <Input
                id="rateMin"
                type="number"
                min={0}
                step="0.01"
                value={formData.rateMin}
                onChange={(e) => setFormData({ rateMin: e.target.value })}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="rateMax" className="text-sm text-charcoal-500">Maximum</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
              <Input
                id="rateMax"
                type="number"
                min={0}
                step="0.01"
                value={formData.rateMax}
                onChange={(e) => setFormData({ rateMax: e.target.value })}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="rateType" className="text-sm text-charcoal-500">Type</Label>
            <Select value={formData.rateType} onValueChange={(value) => setFormData({ rateType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(formData.rateMin || formData.rateMax) && (
          <p className="text-sm text-charcoal-600 mt-2">
            Rate Range: ${formData.rateMin || '0'} - ${formData.rateMax || '0'} {rateSuffix}
          </p>
        )}
      </div>

      {/* Positions & Priority */}
      <div className="grid grid-cols-2 gap-6 max-w-lg">
        <div>
          <Label htmlFor="positions" className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" />
            Positions
          </Label>
          <Input
            id="positions"
            type="number"
            min={1}
            max={100}
            value={formData.positionsCount}
            onChange={(e) => setFormData({ positionsCount: parseInt(e.target.value) || 1 })}
          />
          <p className="text-xs text-charcoal-500 mt-1">Number of openings</p>
        </div>
        <div>
          <Label htmlFor="priority" className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4" />
            Priority
          </Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <span className={p.color}>{p.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Target Dates */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4" />
          Target Dates
        </Label>
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div>
            <Label htmlFor="targetFill" className="text-sm text-charcoal-500">Target Fill Date</Label>
            <Input
              id="targetFill"
              type="date"
              value={formData.targetFillDate}
              onChange={(e) => setFormData({ targetFillDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-charcoal-500 mt-1">When to find candidates by</p>
          </div>
          <div>
            <Label htmlFor="targetStart" className="text-sm text-charcoal-500">Target Start Date</Label>
            <Input
              id="targetStart"
              type="date"
              value={formData.targetStartDate}
              onChange={(e) => setFormData({ targetStartDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-charcoal-500 mt-1">When candidate should start</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-charcoal-50 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-charcoal-900 mb-2">Job Summary</h3>
        <div className="text-sm text-charcoal-600 space-y-1">
          <p><strong>Positions:</strong> {formData.positionsCount}</p>
          <p><strong>Priority:</strong> {PRIORITIES.find(p => p.value === formData.priority)?.label}</p>
          {formData.targetFillDate && (
            <p><strong>Target Fill:</strong> {new Date(formData.targetFillDate).toLocaleDateString()}</p>
          )}
          {formData.targetStartDate && (
            <p><strong>Target Start:</strong> {new Date(formData.targetStartDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  )
}
