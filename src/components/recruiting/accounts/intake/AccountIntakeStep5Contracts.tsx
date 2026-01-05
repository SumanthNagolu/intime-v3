'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  useCreateAccountStore,
  AccountContract,
} from '@/stores/create-account-store'
import { Section } from './shared'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  UploadCloud,
  Paperclip,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const CONTRACT_TYPES = [
  { value: 'msa', label: 'Master Services Agreement (MSA)' },
  { value: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'sow', label: 'Statement of Work (SOW)' },
  { value: 'rate_agreement', label: 'Rate Agreement' },
  { value: 'subcontract', label: 'Subcontract Agreement' },
]

const CONTRACT_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-charcoal-100 text-charcoal-700' },
  {
    value: 'pending_signature',
    label: 'Pending Signature',
    color: 'bg-amber-100 text-amber-700',
  },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
]

export function AccountIntakeStep5Contracts() {
  const { formData, addContract, removeContract, updateContract } =
    useCreateAccountStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const [currentContract, setCurrentContract] = useState<Partial<AccountContract>>({
    type: 'msa',
    status: 'draft',
    autoRenew: false,
    currency: 'USD',
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setIsAddingNew(true)
    setCurrentContract({
      id: uuidv4(),
      type: 'msa',
      status: 'draft',
      autoRenew: false,
      currency: 'USD',
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
    setCurrentContract({
      type: 'msa',
      status: 'draft',
      autoRenew: false,
      currency: 'USD',
    })
  }

  const handleSave = () => {
    if (!currentContract.name) {
      return
    }

    if (editingId) {
      updateContract(editingId, currentContract)
    } else {
      addContract({
        ...currentContract,
        id: currentContract.id || uuidv4(),
      } as AccountContract)
    }
    handleClose()
  }

  const getTypeLabel = (type: string) =>
    CONTRACT_TYPES.find((t) => t.value === type)?.label || type

  const getStatusConfig = (status: string) =>
    CONTRACT_STATUSES.find((s) => s.value === status) || {
      label: status,
      color: 'bg-gray-100',
    }

  const isPanelOpen = isAddingNew || editingId !== null

  return (
    <div className="space-y-6">
      <Section
        icon={FileText}
        title="Contracts & Agreements"
        subtitle="Manage legal documents and agreements"
      >
        <div className="flex gap-4">
          {/* List View */}
          <div
            className={cn(
              'flex-1 transition-all duration-300',
              isPanelOpen ? 'max-w-[calc(100%-420px)]' : 'max-w-full'
            )}
          >
            {/* Add Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              className="mb-4 w-full border-dashed"
              disabled={isPanelOpen}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contract
            </Button>

            {/* Table */}
            {formData.contracts.length > 0 ? (
              <div className="border border-charcoal-200 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-charcoal-50/50">
                      <TableHead className="font-semibold text-charcoal-700">
                        Contract
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700">
                        Dates
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700 w-20">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.contracts.map((contract) => {
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
                                  <div className="text-xs text-charcoal-400">
                                    #{contract.number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-charcoal-500 uppercase tracking-wide">
                            {getTypeLabel(contract.type).split('(')[0].trim()}
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
                                {new Date(contract.effectiveDate).toLocaleDateString()}
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
                                  removeContract(contract.id)
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
                <p className="text-sm text-charcoal-500 mb-1 font-medium">
                  No contracts added yet
                </p>
                <p className="text-xs text-charcoal-400">
                  Add MSAs, NDAs, and other agreements
                </p>
              </div>
            )}
          </div>

          {/* Inline Detail Panel */}
          {isPanelOpen && (
            <div className="w-[400px] border border-charcoal-200 rounded-xl bg-white animate-in slide-in-from-right duration-300 flex flex-col max-h-[650px]">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-charcoal-200 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {isAddingNew ? 'Add Contract' : 'Edit Contract'}
                  </h3>
                  <p className="text-sm text-charcoal-500">
                    Contract details and documents
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-1.5">
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
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Contract Type</Label>
                    <Select
                      value={currentContract.type}
                      onValueChange={(v: AccountContract['type']) =>
                        setCurrentContract((prev) => ({ ...prev, type: v }))
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
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

                  <div className="space-y-1.5">
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
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Status</Label>
                    <Select
                      value={currentContract.status}
                      onValueChange={(v: AccountContract['status']) =>
                        setCurrentContract((prev) => ({ ...prev, status: v }))
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
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

                  <div className="space-y-1.5">
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
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Effective Date</Label>
                    <Input
                      type="date"
                      value={
                        currentContract.effectiveDate
                          ? new Date(currentContract.effectiveDate)
                              .toISOString()
                              .split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setCurrentContract((prev) => ({
                          ...prev,
                          effectiveDate: e.target.valueAsDate,
                        }))
                      }
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Expiry Date</Label>
                    <Input
                      type="date"
                      value={
                        currentContract.expiryDate
                          ? new Date(currentContract.expiryDate)
                              .toISOString()
                              .split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setCurrentContract((prev) => ({
                          ...prev,
                          expiryDate: e.target.valueAsDate,
                        }))
                      }
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={currentContract.autoRenew}
                      onCheckedChange={(c) =>
                        setCurrentContract((prev) => ({
                          ...prev,
                          autoRenew: !!c,
                        }))
                      }
                    />
                    <span className="text-sm font-medium text-charcoal-700">
                      Auto-renews at expiration
                    </span>
                  </label>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-charcoal-100">
                  <Label className="text-sm">Document Upload</Label>
                  <div className="border-2 border-dashed border-charcoal-200 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-charcoal-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCurrentContract((prev) => ({
                            ...prev,
                            fileUrl: e.target.files![0].name,
                          }))
                        }
                      }}
                    />
                    {currentContract.fileUrl ? (
                      <>
                        <Paperclip className="w-6 h-6 text-gold-500 mb-2" />
                        <p className="text-sm font-medium text-charcoal-700">
                          {currentContract.fileUrl}
                        </p>
                        <p className="text-xs text-charcoal-400 mt-1">
                          Click to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-charcoal-400 mb-2" />
                        <p className="text-sm font-medium text-charcoal-700">
                          Click or drag to upload
                        </p>
                        <p className="text-xs text-charcoal-400 mt-1">
                          PDF, DOCX up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-charcoal-200 flex-shrink-0">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gold-500 hover:bg-gold-600 text-white border-none"
                >
                  {isAddingNew ? 'Add Contract' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}

