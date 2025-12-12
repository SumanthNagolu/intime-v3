'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { InlinePanelSection } from '@/components/ui/inline-panel'

interface RateCardItemEditorProps {
  rateCardId: string
}

interface RateCardItem {
  id: string
  jobCategory: string | null
  jobLevel: string | null
  jobFamily: string | null
  rateUnit: string
  minPayRate: number | null
  maxPayRate: number | null
  targetPayRate: number | null
  minBillRate: number | null
  maxBillRate: number | null
  standardBillRate: number | null
  targetMarginPercentage: number | null
  minMarginPercentage: number | null
  displayOrder: number
  notes: string | null
}

const itemSchema = z.object({
  jobCategory: z.string().min(1, 'Category required'),
  jobLevel: z.string().optional(),
  rateUnit: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual', 'fixed']),
  minPayRate: z.number().min(0).optional(),
  maxPayRate: z.number().min(0).optional(),
  targetPayRate: z.number().min(0).optional(),
  minBillRate: z.number().min(0).optional(),
  maxBillRate: z.number().min(0).optional(),
  standardBillRate: z.number().min(0).optional(),
  targetMarginPercentage: z.number().min(0).max(100).optional(),
  minMarginPercentage: z.number().min(0).max(100).optional(),
})

type ItemFormData = z.infer<typeof itemSchema>

const JOB_CATEGORIES = [
  'Software Development',
  'Data & Analytics',
  'Cloud & Infrastructure',
  'Security',
  'Project Management',
  'Business Analysis',
  'Quality Assurance',
  'Design',
  'DevOps',
  'Support',
  'Administrative',
  'Executive',
  'Other',
]

const JOB_LEVELS = [
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Principal',
  'Manager',
  'Director',
  'VP',
  'C-Level',
]

const RATE_UNITS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'fixed', label: 'Fixed' },
]

/**
 * RateCardItemEditor - Editor for rate card line items
 *
 * Features:
 * - Add/edit/delete rate card items
 * - Configure pay and bill rates
 * - Set margin thresholds
 * - Drag-and-drop reordering (future)
 */
export function RateCardItemEditor({ rateCardId }: RateCardItemEditorProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<RateCardItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch items
  const itemsQuery = trpc.rates.items.list.useQuery({
    rateCardId,
    limit: 100,
  })

  const utils = trpc.useUtils()

  // Mutations
  const createMutation = trpc.rates.items.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Item added',
        description: 'Rate card item has been created.',
      })
      utils.rates.items.list.invalidate({ rateCardId })
      setShowAddForm(false)
      reset()
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const updateMutation = trpc.rates.items.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Item updated',
        description: 'Rate card item has been updated.',
      })
      utils.rates.items.list.invalidate({ rateCardId })
      setEditingItem(null)
      reset()
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const deleteMutation = trpc.rates.items.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Item deleted',
        description: 'Rate card item has been removed.',
      })
      utils.rates.items.list.invalidate({ rateCardId })
    },
  })

  const items = itemsQuery.data?.items ?? []
  const isLoading = itemsQuery.isLoading

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      jobCategory: '',
      jobLevel: '',
      rateUnit: 'hourly',
    },
  })

  const onSubmit = (data: ItemFormData) => {
    setIsSubmitting(true)

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        jobCategory: data.jobCategory,
        jobLevel: data.jobLevel || undefined,
        rateUnit: data.rateUnit,
        minPayRate: data.minPayRate,
        maxPayRate: data.maxPayRate,
        targetPayRate: data.targetPayRate,
        minBillRate: data.minBillRate,
        maxBillRate: data.maxBillRate,
        standardBillRate: data.standardBillRate,
        targetMarginPercentage: data.targetMarginPercentage,
        minMarginPercentage: data.minMarginPercentage,
      })
    } else {
      createMutation.mutate({
        rateCardId,
        jobCategory: data.jobCategory,
        jobLevel: data.jobLevel || undefined,
        rateUnit: data.rateUnit,
        minPayRate: data.minPayRate,
        maxPayRate: data.maxPayRate,
        targetPayRate: data.targetPayRate,
        minBillRate: data.minBillRate,
        maxBillRate: data.maxBillRate,
        standardBillRate: data.standardBillRate,
        targetMarginPercentage: data.targetMarginPercentage,
        minMarginPercentage: data.minMarginPercentage,
        displayOrder: items.length,
      })
    }
  }

  const handleEdit = (item: RateCardItem) => {
    setEditingItem(item)
    setShowAddForm(true)
    setValue('jobCategory', item.jobCategory || '')
    setValue('jobLevel', item.jobLevel || '')
    setValue('rateUnit', item.rateUnit as ItemFormData['rateUnit'])
    setValue('minPayRate', item.minPayRate || undefined)
    setValue('maxPayRate', item.maxPayRate || undefined)
    setValue('targetPayRate', item.targetPayRate || undefined)
    setValue('minBillRate', item.minBillRate || undefined)
    setValue('maxBillRate', item.maxBillRate || undefined)
    setValue('standardBillRate', item.standardBillRate || undefined)
    setValue('targetMarginPercentage', item.targetMarginPercentage || undefined)
    setValue('minMarginPercentage', item.minMarginPercentage || undefined)
  }

  const handleDelete = (item: RateCardItem) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate({ id: item.id })
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingItem(null)
    reset()
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  if (isLoading) {
    return (
      <InlinePanelSection title="Line Items">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </InlinePanelSection>
    )
  }

  return (
    <InlinePanelSection title={`Line Items (${items.length})`}>
      {/* Items List */}
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border bg-white transition-colors',
              editingItem?.id === item.id && 'border-gold-500 bg-gold-50/50'
            )}
          >
            <div className="text-charcoal-400 cursor-grab pt-1">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-charcoal-900">
                  {item.jobCategory || 'Uncategorized'}
                </span>
                {item.jobLevel && (
                  <span className="text-xs text-charcoal-500">
                    ({item.jobLevel})
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-500">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Pay: {formatCurrency(item.minPayRate)} - {formatCurrency(item.maxPayRate)}
                </span>
                <span>
                  Bill: {formatCurrency(item.minBillRate)} - {formatCurrency(item.maxBillRate)}
                </span>
                <span className="uppercase">{item.rateUnit}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {items.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-charcoal-500">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
            <p className="text-sm">No rate items defined</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 border border-charcoal-200 rounded-lg bg-charcoal-50/50">
          <h4 className="font-medium text-charcoal-900 mb-4">
            {editingItem ? 'Edit Item' : 'Add Item'}
          </h4>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Job Category *</Label>
              <Select
                value={watch('jobCategory')}
                onValueChange={(value) => setValue('jobCategory', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jobCategory && (
                <p className="text-xs text-red-600">{errors.jobCategory.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Job Level</Label>
              <Select
                value={watch('jobLevel') || ''}
                onValueChange={(value) => setValue('jobLevel', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Level</SelectItem>
                  {JOB_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Rate Unit *</Label>
              <Select
                value={watch('rateUnit')}
                onValueChange={(value) => setValue('rateUnit', value as ItemFormData['rateUnit'])}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATE_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Min Pay Rate</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9"
                {...register('minPayRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Pay Rate</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9"
                {...register('maxPayRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Target Pay</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9"
                {...register('targetPayRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Min Bill Rate</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9"
                {...register('minBillRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Bill Rate</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9"
                {...register('maxBillRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Standard Bill</Label>
              <Input
                type="number"
                step="0.01"
                className="h-9"
                {...register('standardBillRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <Label className="text-xs">Min Margin %</Label>
              <Input
                type="number"
                step="0.1"
                className="h-9"
                {...register('minMarginPercentage', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Target Margin %</Label>
              <Input
                type="number"
                step="0.1"
                className="h-9"
                {...register('targetMarginPercentage', { valueAsNumber: true })}
                placeholder="20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setShowAddForm(true)
            setEditingItem(null)
            reset()
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Line Item
        </Button>
      )}
    </InlinePanelSection>
  )
}
