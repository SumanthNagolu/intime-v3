'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Paperclip,
  X,
  DollarSign,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'
import { SectionWrapper } from '../layouts/SectionHeader'
import { CONTRACT_TYPES, CONTRACT_STATUSES, CURRENCIES, getLabel } from '@/lib/accounts/constants'
import type { SectionMode, AccountContract, ContractsSectionData } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

// ============ PROPS ============

interface ContractsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: ContractsSectionData
  /** Handler for adding a contract */
  onAddContract?: (contract: AccountContract) => void
  /** Handler for updating a contract */
  onUpdateContract?: (id: string, contract: Partial<AccountContract>) => void
  /** Handler for removing a contract */
  onRemoveContract?: (id: string) => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

const DEFAULT_CONTRACT: Partial<AccountContract> = {
  type: 'msa',
  name: '',
  number: '',
  status: 'draft',
  effectiveDate: null,
  expiryDate: null,
  autoRenew: false,
  contractValue: '',
  currency: 'USD',
}

/**
 * ContractsSection - Unified component for Contracts & Agreements
 *
 * Handles all three modes:
 * - create: Table with inline add/edit panel for wizard step
 * - view: Read-only table for detail page
 * - edit: Table with add/edit panel
 */
export function ContractsSection({
  mode,
  data,
  onAddContract,
  onUpdateContract,
  onRemoveContract,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: ContractsSectionProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = React.useState(false)
  const [currentContract, setCurrentContract] = React.useState<Partial<AccountContract>>(DEFAULT_CONTRACT)

  const isPanelOpen = isAddingNew || editingId !== null

  const handleOpenAdd = () => {
    setEditingId(null)
    setIsAddingNew(true)
    setCurrentContract({
      ...DEFAULT_CONTRACT,
      id: uuidv4(),
    })
  }

  const handleOpenEdit = (contract: AccountContract) => {
    setIsAddingNew(false)
    setEditingId(contract.id)
    setCurrentContract({ ...contract })
  }

  const handleClose = () => {
    setEditingId(null)
    setIsAddingNew(false)
    setCurrentContract(DEFAULT_CONTRACT)
  }

  const handleSave = () => {
    if (!currentContract.name) {
      return
    }

    if (editingId) {
      onUpdateContract?.(editingId, currentContract)
    } else {
      onAddContract?.({
        ...currentContract,
        id: currentContract.id || uuidv4(),
      } as AccountContract)
    }
    handleClose()
  }

  const handleDelete = (id: string) => {
    onRemoveContract?.(id)
    if (editingId === id) {
      handleClose()
    }
  }

  const getTypeLabel = (type: string) => {
    return getLabel(CONTRACT_TYPES, type) || type
  }

  const getStatusConfig = (status: string) => {
    const statusInfo = CONTRACT_STATUSES.find((s) => s.value === status)
    if (!statusInfo) return { label: status, color: 'bg-charcoal-100 text-charcoal-700' }
    return { label: statusInfo.label, color: statusInfo.color || 'bg-charcoal-100 text-charcoal-700' }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null
    try {
      return new Date(date).toLocaleDateString()
    } catch {
      return null
    }
  }

  const formatCurrency = (value: string | undefined, currency: string = 'USD') => {
    if (!value) return null
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''))
    if (isNaN(num)) return value
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  // ============ CREATE MODE ============
  if (mode === 'create') {
    return (
      <div className={cn('space-y-6', className)}>
        <SectionWrapper
          icon={FileText}
          title="Contracts & Agreements"
          subtitle="Manage legal documents and agreements"
        >
          <div className="flex flex-col gap-4">
            {/* Add Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              className="mb-4 w-full border-dashed h-12 rounded-xl"
              disabled={isPanelOpen}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contract
            </Button>

            {/* Contracts Table */}
            {data.contracts.length > 0 ? (
              <div className="border border-charcoal-200 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-charcoal-50/50">
                      <TableHead className="font-semibold text-charcoal-700">Contract</TableHead>
                      <TableHead className="font-semibold text-charcoal-700">Type</TableHead>
                      <TableHead className="font-semibold text-charcoal-700">Status</TableHead>
                      <TableHead className="font-semibold text-charcoal-700">Dates</TableHead>
                      <TableHead className="font-semibold text-charcoal-700 w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.contracts.map((contract) => {
                      const statusConfig = getStatusConfig(contract.status)
                      return (
                        <TableRow
                          key={contract.id}
                          className={cn(
                            'group hover:bg-charcoal-50/50 cursor-pointer transition-colors',
                            editingId === contract.id && 'bg-gold-50'
                          )}
                          onClick={() => handleOpenEdit(contract)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-charcoal-50 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-charcoal-500" />
                              </div>
                              <div>
                                <div className="font-medium text-charcoal-900 truncate max-w-[200px]">
                                  {contract.name}
                                </div>
                                {contract.number && (
                                  <div className="text-xs text-charcoal-400">#{contract.number}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-charcoal-500 uppercase tracking-wide">
                              {getTypeLabel(contract.type).split('(')[0].trim()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('border-0', statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-charcoal-600">
                            {contract.effectiveDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                                {formatDate(contract.effectiveDate)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-charcoal-400 hover:text-charcoal-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenEdit(contract)
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(contract.id)
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200">
                <FileText className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                <p className="text-sm text-charcoal-500 mb-1 font-medium">No contracts added yet</p>
                <p className="text-xs text-charcoal-400">
                  Add MSAs, NDAs, and other agreements
                </p>
              </div>
            )}

            {/* Inline Edit Panel */}
            {isPanelOpen && (
              <ContractEditPanel
                isAddingNew={isAddingNew}
                currentContract={currentContract}
                setCurrentContract={setCurrentContract}
                onSave={handleSave}
                onClose={handleClose}
              />
            )}
          </div>
        </SectionWrapper>
      </div>
    )
  }

  // ============ VIEW MODE ============
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-charcoal-900">Contracts</h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Legal documents and agreements ({data.contracts.length})
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contract
        </Button>
      </div>

      {/* Contracts Table */}
      {data.contracts.length > 0 ? (
        <div className="border border-charcoal-200 rounded-xl overflow-hidden bg-white shadow-elevation-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-charcoal-50/50">
                <TableHead className="font-semibold text-charcoal-700">Contract</TableHead>
                <TableHead className="font-semibold text-charcoal-700">Type</TableHead>
                <TableHead className="font-semibold text-charcoal-700">Status</TableHead>
                <TableHead className="font-semibold text-charcoal-700">Value</TableHead>
                <TableHead className="font-semibold text-charcoal-700">Dates</TableHead>
                <TableHead className="font-semibold text-charcoal-700 w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.contracts.map((contract) => {
                const statusConfig = getStatusConfig(contract.status)
                return (
                  <TableRow
                    key={contract.id}
                    className="group hover:bg-charcoal-50/50 cursor-pointer transition-colors"
                    onClick={() => handleOpenEdit(contract)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-charcoal-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-charcoal-500" />
                        </div>
                        <div>
                          <div className="font-medium text-charcoal-900">{contract.name}</div>
                          {contract.number && (
                            <div className="text-xs text-charcoal-400">#{contract.number}</div>
                          )}
                          {contract.fileName && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Paperclip className="w-3 h-3 text-gold-500" />
                              <span className="text-xs text-charcoal-500">{contract.fileName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getTypeLabel(contract.type).split('(')[0].trim()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('border-0', statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-charcoal-600">
                      {contract.contractValue && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-charcoal-400" />
                          {formatCurrency(contract.contractValue, contract.currency)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-charcoal-600">
                      <div className="space-y-1">
                        {contract.effectiveDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs">Start: {formatDate(contract.effectiveDate)}</span>
                          </div>
                        )}
                        {contract.expiryDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs">End: {formatDate(contract.expiryDate)}</span>
                          </div>
                        )}
                        {contract.autoRenew && (
                          <div className="flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs text-blue-600">Auto-renew</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-charcoal-400 hover:text-charcoal-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(contract)
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(contract.id)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200">
          <FileText className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
          <p className="text-sm text-charcoal-500 mb-1 font-medium">No contracts added yet</p>
          <p className="text-xs text-charcoal-400 mb-4">Add your first contract to get started</p>
          <Button variant="outline" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contract
          </Button>
        </div>
      )}

      {/* Inline Edit Panel for View Mode */}
      {isPanelOpen && (
        <ContractEditPanel
          isAddingNew={isAddingNew}
          currentContract={currentContract}
          setCurrentContract={setCurrentContract}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

// ============ CONTRACT EDIT PANEL ============

interface ContractEditPanelProps {
  isAddingNew: boolean
  currentContract: Partial<AccountContract>
  setCurrentContract: React.Dispatch<React.SetStateAction<Partial<AccountContract>>>
  onSave: () => void
  onClose: () => void
}

function ContractEditPanel({
  isAddingNew,
  currentContract,
  setCurrentContract,
  onSave,
  onClose,
}: ContractEditPanelProps) {
  return (
    <div className="w-full border border-charcoal-200 rounded-xl bg-white animate-in slide-in-from-bottom duration-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-charcoal-200">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">
            {isAddingNew ? 'Add Contract' : 'Edit Contract'}
          </h3>
          <p className="text-sm text-charcoal-500">Contract details and documents</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="p-4 space-y-4">
        {/* Row 1: Name, Type, Number, Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">
              Contract Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., Master Services Agreement 2024"
              value={currentContract.name || ''}
              onChange={(e) =>
                setCurrentContract((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Contract Type</Label>
            <Select
              value={currentContract.type}
              onValueChange={(v) =>
                setCurrentContract((prev) => ({
                  ...prev,
                  type: v as AccountContract['type'],
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Contract Number</Label>
            <Input
              placeholder="Optional"
              value={currentContract.number || ''}
              onChange={(e) =>
                setCurrentContract((prev) => ({
                  ...prev,
                  number: e.target.value,
                }))
              }
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Status</Label>
            <Select
              value={currentContract.status}
              onValueChange={(v) =>
                setCurrentContract((prev) => ({
                  ...prev,
                  status: v as AccountContract['status'],
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Value, Effective Date, Expiry Date, Auto-renew, Document */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Contract Value</Label>
            <Input
              placeholder="e.g., 100,000"
              value={currentContract.contractValue || ''}
              onChange={(e) =>
                setCurrentContract((prev) => ({
                  ...prev,
                  contractValue: e.target.value,
                }))
              }
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Effective Date</Label>
            <Input
              type="date"
              value={
                currentContract.effectiveDate
                  ? new Date(currentContract.effectiveDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setCurrentContract((prev) => ({
                  ...prev,
                  effectiveDate: e.target.valueAsDate,
                }))
              }
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Expiry Date</Label>
            <Input
              type="date"
              value={
                currentContract.expiryDate
                  ? new Date(currentContract.expiryDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setCurrentContract((prev) => ({
                  ...prev,
                  expiryDate: e.target.valueAsDate,
                }))
              }
              className="h-11 rounded-lg"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 h-11 px-3 rounded-lg border border-charcoal-200 cursor-pointer hover:bg-charcoal-50">
              <Checkbox
                checked={currentContract.autoRenew}
                onCheckedChange={(checked) =>
                  setCurrentContract((prev) => ({ ...prev, autoRenew: !!checked }))
                }
              />
              <span className="text-sm">Auto-renew</span>
            </label>
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="text-sm">Document</Label>
            {currentContract.fileData ? (
              <div className="border border-charcoal-200 rounded-lg p-2 flex items-center justify-between bg-charcoal-50 h-11">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-gold-500" />
                  <span className="text-xs font-medium text-charcoal-700 truncate max-w-[200px]">
                    {currentContract.fileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentContract((prev) => ({
                      ...prev,
                      fileData: undefined,
                      fileName: undefined,
                      fileMimeType: undefined,
                    }))
                  }
                  className="text-charcoal-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <FileUpload
                onChange={(value, file) => {
                  if (value && file) {
                    setCurrentContract((prev) => ({
                      ...prev,
                      fileData: value,
                      fileName: file.name,
                      fileMimeType: file.type,
                    }))
                  }
                }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                maxSize={10 * 1024 * 1024}
                placeholder="PDF, Word, Excel (max 10MB)"
                preview={false}
                className="min-h-[44px] [&>div]:min-h-[44px] [&>div]:py-2"
              />
            )}
          </div>
        </div>
      </div>

      {/* Panel Footer */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-charcoal-200">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="bg-gold-500 hover:bg-gold-600 text-white border-none"
        >
          {isAddingNew ? 'Add Contract' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

export default ContractsSection
