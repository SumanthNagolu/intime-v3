'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card } from '@/components/ui/card'
import {
  Mail,
  Linkedin,
  Phone,
  MessageSquare,
  Check,
  Plus,
  ExternalLink,
  Loader2,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
}

const channelColors: Record<string, string> = {
  email: 'bg-blue-50 text-blue-700 border-blue-200',
  linkedin: 'bg-sky-50 text-sky-700 border-sky-200',
  phone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sms: 'bg-violet-50 text-violet-700 border-violet-200',
}

interface SequenceTemplatePickerProps {
  channel?: string
  selectedIds: string[]
  onChange: (ids: string[]) => void
  maxSelections?: number
  className?: string
}

export function SequenceTemplatePicker({
  channel,
  selectedIds,
  onChange,
  maxSelections,
  className,
}: SequenceTemplatePickerProps) {
  const [open, setOpen] = useState(false)

  const { data, isLoading } = trpc.sequences.listForPicker.useQuery({
    channel: channel as 'email' | 'linkedin' | 'phone' | 'sms' | undefined,
  })

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(sid => sid !== id))
    } else {
      if (maxSelections && selectedIds.length >= maxSelections) {
        // Replace the first selection
        onChange([...selectedIds.slice(1), id])
      } else {
        onChange([...selectedIds, id])
      }
    }
  }

  const selectedSequences = data?.filter(seq => selectedIds.includes(seq.id)) ?? []

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected Sequences */}
      {selectedSequences.length > 0 && (
        <div className="space-y-2">
          {selectedSequences.map(seq => (
            <Card key={seq.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-1.5 rounded', channelColors[seq.channel])}>
                  {channelIcons[seq.channel]}
                </div>
                <div>
                  <div className="font-medium text-sm">{seq.name}</div>
                  <div className="text-xs text-charcoal-500">
                    {seq.stepCount} steps • {seq.channel}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(selectedIds.filter(id => id !== seq.id))}
                className="text-charcoal-500 hover:text-red-600"
              >
                Remove
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Picker Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            {selectedSequences.length === 0 ? 'Select Sequence Template' : 'Add Another Sequence'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3 border-b border-charcoal-100">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Sequence Templates</h4>
              <Link href="/employee/crm/sequences" target="_blank">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Library
                </Button>
              </Link>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-charcoal-400" />
              </div>
            ) : data && data.length > 0 ? (
              <div className="space-y-1">
                {data.map(seq => {
                  const isSelected = selectedIds.includes(seq.id)
                  return (
                    <button
                      key={seq.id}
                      type="button"
                      onClick={() => {
                        toggleSelection(seq.id)
                        if (!isSelected) setOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors',
                        isSelected
                          ? 'bg-gold-50 border border-gold-200'
                          : 'hover:bg-charcoal-50 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('p-1.5 rounded', channelColors[seq.channel])}>
                          {channelIcons[seq.channel]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{seq.name}</div>
                          <div className="text-xs text-charcoal-500">
                            {seq.stepCount} steps • Used in {seq.usageCount} campaigns
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-gold-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <GitBranch className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <p className="text-sm text-charcoal-500">No sequences available</p>
                <Link href="/employee/crm/sequences">
                  <Button variant="link" size="sm" className="mt-2">
                    Create your first sequence
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}








