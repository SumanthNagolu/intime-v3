'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowLeft,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Plus,
  Trash2,
  Upload,
  Send,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Calendar,
  Building2,
  User,
  Download,
  AlertCircle,
  Edit3,
  ImageIcon,
  History,
  MapPin,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, iconColor: 'text-gray-500' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, iconColor: 'text-blue-500' },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, iconColor: 'text-amber-500' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, iconColor: 'text-green-500' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, iconColor: 'text-red-500' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock, iconColor: 'text-purple-500' },
  paid: { label: 'Paid', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: CreditCard, iconColor: 'text-teal-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle, iconColor: 'text-gray-500' },
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Receipt; color: string }> = {
  travel: { label: 'Travel', icon: MapPin, color: 'text-blue-500 bg-blue-50' },
  meals: { label: 'Meals', icon: Receipt, color: 'text-orange-500 bg-orange-50' },
  lodging: { label: 'Lodging', icon: Building2, color: 'text-purple-500 bg-purple-50' },
  transportation: { label: 'Transportation', icon: MapPin, color: 'text-teal-500 bg-teal-50' },
  office_supplies: { label: 'Office Supplies', icon: FileText, color: 'text-gray-500 bg-gray-50' },
  software: { label: 'Software', icon: FileText, color: 'text-indigo-500 bg-indigo-50' },
  equipment: { label: 'Equipment', icon: FileText, color: 'text-amber-500 bg-amber-50' },
  training: { label: 'Training', icon: FileText, color: 'text-green-500 bg-green-50' },
  professional_services: { label: 'Professional Services', icon: User, color: 'text-pink-500 bg-pink-50' },
  client_entertainment: { label: 'Client Entertainment', icon: Receipt, color: 'text-rose-500 bg-rose-50' },
  phone_internet: { label: 'Phone/Internet', icon: FileText, color: 'text-cyan-500 bg-cyan-50' },
  other: { label: 'Other', icon: Receipt, color: 'text-gray-500 bg-gray-50' },
}

const EXPENSE_CATEGORIES = [
  'travel', 'meals', 'lodging', 'transportation', 'office_supplies',
  'software', 'equipment', 'training', 'professional_services',
  'client_entertainment', 'phone_internet', 'other'
]

export default function ExpenseReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const utils = trpc.useUtils()

  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)

  // New item form state
  const [newItem, setNewItem] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'other' as string,
    description: '',
    vendorName: '',
    amount: '',
    receiptUrl: '',
    isMileage: false,
    miles: '',
    originLocation: '',
    destinationLocation: '',
  })

  const { data: report, isLoading } = trpc.expenses.reports.getFullReport.useQuery(
    { id },
    { enabled: !!id }
  )

  const createItemMutation = trpc.expenses.items.create.useMutation({
    onSuccess: () => {
      utils.expenses.reports.getFullReport.invalidate({ id })
      setIsAddItemOpen(false)
      resetNewItemForm()
    },
  })

  const deleteItemMutation = trpc.expenses.items.delete.useMutation({
    onSuccess: () => {
      utils.expenses.reports.getFullReport.invalidate({ id })
    },
  })

  const submitMutation = trpc.expenses.reports.submit.useMutation({
    onSuccess: () => {
      utils.expenses.reports.getFullReport.invalidate({ id })
      setIsSubmitDialogOpen(false)
    },
  })

  const approveMutation = trpc.expenses.reports.approve.useMutation({
    onSuccess: () => {
      utils.expenses.reports.getFullReport.invalidate({ id })
      setIsApprovalDialogOpen(false)
      setApprovalComments('')
    },
  })

  const rejectMutation = trpc.expenses.reports.reject.useMutation({
    onSuccess: () => {
      utils.expenses.reports.getFullReport.invalidate({ id })
      setIsRejectDialogOpen(false)
      setRejectReason('')
    },
  })

  const markPaidMutation = trpc.expenses.reports.markPaid.useMutation({
    onSuccess: () => {
      utils.expenses.reports.getFullReport.invalidate({ id })
    },
  })

  const resetNewItemForm = () => {
    setNewItem({
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'other',
      description: '',
      vendorName: '',
      amount: '',
      receiptUrl: '',
      isMileage: false,
      miles: '',
      originLocation: '',
      destinationLocation: '',
    })
  }

  const handleAddItem = () => {
    createItemMutation.mutate({
      expenseReportId: id,
      expenseDate: newItem.expenseDate,
      category: newItem.category as typeof EXPENSE_CATEGORIES[number],
      description: newItem.description,
      vendorName: newItem.vendorName || undefined,
      amount: parseFloat(newItem.amount) || 0,
      receiptUrl: newItem.receiptUrl || undefined,
      isMileage: newItem.isMileage,
      miles: newItem.isMileage && newItem.miles ? parseFloat(newItem.miles) : undefined,
      originLocation: newItem.isMileage ? newItem.originLocation : undefined,
      destinationLocation: newItem.isMileage ? newItem.destinationLocation : undefined,
    })
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Delete this expense item?')) {
      deleteItemMutation.mutate({ id: itemId })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-3xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
          <h2 className="text-h3 font-heading font-semibold text-charcoal-900 mb-2">
            Report Not Found
          </h2>
          <p className="text-charcoal-500 mb-6">
            The expense report you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/employee/operations/expenses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]
  const StatusIcon = statusConfig?.icon || FileText
  const employee = report.employee as {
    id: string
    job_title: string
    department: string
    user: { full_name: string; email: string; avatar_url?: string | null }
  }
  const items = report.items ?? []
  const totalsByCategory = report.totalsByCategory ?? {}
  const approvals = report.approvals ?? []
  const auditLog = report.auditLog ?? []

  const isDraft = report.status === 'draft'
  const isPendingApproval = report.status === 'pending_approval'
  const isApproved = report.status === 'approved'

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/operations/expenses">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                    {report.title}
                  </h1>
                  <Badge className={cn('flex items-center gap-1 border', statusConfig?.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig?.label}
                  </Badge>
                </div>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  {report.report_number}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDraft && items.length > 0 && (
                <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Expense Report</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to submit this expense report for approval?
                        You won&apos;t be able to make changes after submission.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="flex justify-between p-4 bg-charcoal-50 rounded-lg">
                        <span className="text-charcoal-600">Total Amount</span>
                        <span className="font-semibold text-charcoal-900">
                          {formatCurrency(report.total_amount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between p-4 bg-charcoal-50 rounded-lg">
                        <span className="text-charcoal-600">Items</span>
                        <span className="font-semibold text-charcoal-900">
                          {items.length} expense{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => submitMutation.mutate({ id })}
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {isPendingApproval && (
                <>
                  <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Expense Report</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for rejecting this expense report.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label>Reason for Rejection</Label>
                        <Textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain why this report is being rejected..."
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => rejectMutation.mutate({ id, reason: rejectReason })}
                          disabled={!rejectReason.trim() || rejectMutation.isPending}
                        >
                          {rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Expense Report</DialogTitle>
                        <DialogDescription>
                          Review the expense report before approving.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="flex justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-green-700">Total to Approve</span>
                          <span className="font-semibold text-green-900">
                            {formatCurrency(report.total_amount || 0)}
                          </span>
                        </div>
                        <div>
                          <Label>Comments (Optional)</Label>
                          <Textarea
                            value={approvalComments}
                            onChange={(e) => setApprovalComments(e.target.value)}
                            placeholder="Add any comments..."
                            className="mt-2"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveMutation.mutate({ id, comments: approvalComments || undefined })}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {isApproved && (
                <Button
                  onClick={() => markPaidMutation.mutate({ id })}
                  disabled={markPaidMutation.isPending}
                >
                  {markPaidMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Mark as Paid
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Print Report
                  </DropdownMenuItem>
                  {isDraft && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">Total</p>
                      <p className="text-xl font-semibold text-charcoal-900">
                        {formatCurrency(report.total_amount || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">Items</p>
                      <p className="text-xl font-semibold text-charcoal-900">
                        {items.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">Submitted</p>
                      <p className="text-xl font-semibold text-charcoal-900">
                        {report.submitted_at
                          ? new Date(report.submitted_at).toLocaleDateString()
                          : '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expense Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-heading font-semibold">
                    Expense Items
                  </CardTitle>
                  {isDraft && (
                    <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Add Expense Item</DialogTitle>
                          <DialogDescription>
                            Add a new expense to this report.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={newItem.expenseDate}
                                onChange={(e) => setNewItem({ ...newItem, expenseDate: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Category</Label>
                              <Select
                                value={newItem.category}
                                onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {EXPENSE_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {CATEGORY_CONFIG[cat]?.label || cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={newItem.description}
                              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                              placeholder="What was this expense for?"
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Vendor/Merchant</Label>
                              <Input
                                value={newItem.vendorName}
                                onChange={(e) => setNewItem({ ...newItem, vendorName: e.target.value })}
                                placeholder="e.g., Starbucks, Uber"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Amount</Label>
                              <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={newItem.amount}
                                  onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                                  placeholder="0.00"
                                  className="pl-7"
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Receipt URL (Optional)</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={newItem.receiptUrl}
                                onChange={(e) => setNewItem({ ...newItem, receiptUrl: e.target.value })}
                                placeholder="https://..."
                                className="flex-1"
                              />
                              <Button variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddItem}
                            disabled={!newItem.description || !newItem.amount || createItemMutation.isPending}
                          >
                            {createItemMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add Item
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                      <Receipt className="h-7 w-7 text-charcoal-400" />
                    </div>
                    <p className="text-charcoal-600 font-medium mb-1">No expense items yet</p>
                    <p className="text-charcoal-500 text-sm mb-4">
                      Add expenses to this report
                    </p>
                    {isDraft && (
                      <Button size="sm" onClick={() => setIsAddItemOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other
                      const CatIcon = catConfig.icon
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', catConfig.color)}>
                              <CatIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-charcoal-900">{item.description}</p>
                              <div className="flex items-center gap-2 text-sm text-charcoal-500">
                                <span>{catConfig.label}</span>
                                {item.vendor_name && (
                                  <>
                                    <span>•</span>
                                    <span>{item.vendor_name}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{new Date(item.expense_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-charcoal-900">
                                {formatCurrency(item.amount)}
                              </p>
                              {item.receipt_url ? (
                                <a
                                  href={item.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                  View Receipt
                                </a>
                              ) : item.receipt_required ? (
                                <span className="text-xs text-amber-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Receipt Required
                                </span>
                              ) : null}
                            </div>
                            {isDraft && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Receipt
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            {Object.keys(totalsByCategory).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-semibold">
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(totalsByCategory)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([category, amount]) => {
                        const catConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other
                        const percentage = ((amount as number) / (report.total_amount || 1)) * 100
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-charcoal-700">
                                {catConfig.label}
                              </span>
                              <span className="text-sm font-semibold text-charcoal-900">
                                {formatCurrency(amount as number)}
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audit History */}
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-charcoal-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-heading font-semibold flex items-center gap-2">
                        <History className="h-5 w-5 text-charcoal-500" />
                        Activity History
                      </CardTitle>
                      {historyOpen ? (
                        <ChevronDown className="h-5 w-5 text-charcoal-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-charcoal-500" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    {auditLog.length === 0 ? (
                      <p className="text-charcoal-500 text-center py-4">No activity recorded yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {auditLog.map((entry, index) => {
                          const user = entry.performed_by_user as { full_name: string } | null
                          return (
                            <div key={entry.id} className="flex gap-4">
                              <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-charcoal-400 mt-2" />
                                {index < auditLog.length - 1 && (
                                  <div className="absolute top-4 left-[3px] w-px h-full bg-charcoal-200" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p className="text-sm text-charcoal-700">
                                  <span className="font-medium">{user?.full_name || 'System'}</span>
                                  {' '}
                                  <span className="text-charcoal-500">{entry.action}</span>
                                  {entry.previous_status && entry.new_status && (
                                    <>
                                      {' • '}
                                      <span className="text-charcoal-500">
                                        {entry.previous_status} → {entry.new_status}
                                      </span>
                                    </>
                                  )}
                                </p>
                                <p className="text-xs text-charcoal-400 mt-0.5">
                                  {new Date(entry.performed_at).toLocaleString()}
                                </p>
                                {entry.notes && (
                                  <p className="text-sm text-charcoal-600 mt-1 italic">
                                    &quot;{entry.notes}&quot;
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Submitter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                  Submitted By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee?.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-charcoal-100">
                      {employee ? getInitials(employee.user.full_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {employee?.user?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      {employee?.job_title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.description && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-sm text-charcoal-700">{report.description}</p>
                  </div>
                )}
                {report.business_purpose && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Business Purpose
                    </p>
                    <p className="text-sm text-charcoal-700">{report.business_purpose}</p>
                  </div>
                )}
                {report.period_start && report.period_end && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Expense Period
                    </p>
                    <p className="text-sm text-charcoal-700">
                      {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {report.project_code && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Project Code
                    </p>
                    <p className="text-sm text-charcoal-700 font-mono">{report.project_code}</p>
                  </div>
                )}
                {report.cost_center_code && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Cost Center
                    </p>
                    <p className="text-sm text-charcoal-700 font-mono">{report.cost_center_code}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Status */}
            {approvals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                    Approval Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {approvals.map((approval) => {
                      const approver = approval.approver as { full_name: string; avatar_url?: string | null } | null
                      const isApproved = approval.status === 'approved'
                      const isRejected = approval.status === 'rejected'
                      const isPending = approval.status === 'pending'

                      return (
                        <div
                          key={approval.id}
                          className={cn(
                            'p-3 rounded-lg border',
                            isApproved && 'bg-green-50 border-green-200',
                            isRejected && 'bg-red-50 border-red-200',
                            isPending && 'bg-amber-50 border-amber-200'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={approver?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {approver ? getInitials(approver.full_name) : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {approver?.full_name || 'Unknown'}
                              </span>
                            </div>
                            <Badge
                              className={cn(
                                isApproved && 'bg-green-100 text-green-700',
                                isRejected && 'bg-red-100 text-red-700',
                                isPending && 'bg-amber-100 text-amber-700'
                              )}
                            >
                              {approval.status}
                            </Badge>
                          </div>
                          {approval.comments && (
                            <p className="text-sm text-charcoal-600 mt-2 italic">
                              &quot;{approval.comments}&quot;
                            </p>
                          )}
                          {approval.decision_at && (
                            <p className="text-xs text-charcoal-500 mt-1">
                              {new Date(approval.decision_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            {report.status === 'paid' && (
              <Card className="border-teal-200 bg-teal-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-teal-900">Payment Complete</p>
                      <p className="text-sm text-teal-700">
                        {report.paid_at && new Date(report.paid_at).toLocaleDateString()}
                      </p>
                      {report.payment_reference && (
                        <p className="text-xs text-teal-600 font-mono mt-1">
                          Ref: {report.payment_reference}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection Info */}
            {report.status === 'rejected' && report.rejection_reason && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Report Rejected</p>
                      <p className="text-sm text-red-700 mt-1">
                        {report.rejection_reason}
                      </p>
                      {report.rejected_at && (
                        <p className="text-xs text-red-600 mt-2">
                          {new Date(report.rejected_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
