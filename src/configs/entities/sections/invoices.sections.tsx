'use client'

/**
 * PCF-Compatible Section Adapters for Invoices
 * INVOICES-01: Section components for invoice detail view
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Building2,
  User,
  CreditCard,
  Activity,
  Calendar,
  AlertCircle,
  Send,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import {
  Invoice,
  InvoiceLineItem,
  InvoicePayment,
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
  PAYMENT_METHOD_CONFIG,
  AGING_BUCKET_CONFIG,
  formatCurrency,
  formatDate,
  isInvoiceOverdue,
} from '../invoices.config'

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

// ============================================
// OVERVIEW SECTION
// ============================================

export function InvoiceOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const invoice = entity as Invoice | undefined

  if (!invoice) return null

  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]
  const typeConfig = INVOICE_TYPE_CONFIG[invoice.invoiceType]
  const agingConfig = invoice.agingBucket ? AGING_BUCKET_CONFIG[invoice.agingBucket] : null
  const isOverdue = isInvoiceOverdue(invoice)
  const daysOverdue = isOverdue ? differenceInDays(new Date(), new Date(invoice.dueDate)) : 0

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Invoice Details Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">Invoice Number</span>
                <p className="font-medium text-lg">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Reference Number</span>
                <p className="font-medium">{invoice.referenceNumber || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Invoice Date</span>
                <p className="font-medium">
                  {format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Due Date</span>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  {isOverdue && <span className="ml-2">({daysOverdue} days overdue)</span>}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Invoice Type</span>
                <p className="font-medium">{typeConfig?.label || invoice.invoiceType}</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Status</span>
                <div className="mt-1">
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoice.company && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-charcoal-500">Company</span>
                  <Link
                    href={`/employee/recruiting/accounts/${invoice.companyId}`}
                    className="block text-lg font-medium text-hublot-900 hover:underline"
                  >
                    {invoice.company.name}
                  </Link>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employee/recruiting/accounts/${invoice.companyId}`}>
                    View Account
                  </Link>
                </Button>
              </div>
            )}
            {invoice.account && !invoice.company && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-charcoal-500">Account</span>
                  <Link
                    href={`/employee/recruiting/accounts/${invoice.accountId}`}
                    className="block text-lg font-medium text-hublot-900 hover:underline"
                  >
                    {invoice.account.name}
                  </Link>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employee/recruiting/accounts/${invoice.accountId}`}>
                    View Account
                  </Link>
                </Button>
              </div>
            )}
            {invoice.billingContact && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-sm text-charcoal-500">Billing Contact</span>
                  <p className="font-medium">
                    {invoice.billingContact.first_name} {invoice.billingContact.last_name}
                  </p>
                  <p className="text-sm text-charcoal-500">{invoice.billingContact.email}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employee/crm/contacts/${invoice.billingContactId}`}>
                    View Contact
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Cards */}
        {(invoice.internalNotes || invoice.clientNotes) && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.clientNotes && (
                <div>
                  <span className="text-sm text-charcoal-500 font-medium">Client Notes</span>
                  <p className="mt-1 text-charcoal-700 whitespace-pre-wrap">
                    {invoice.clientNotes}
                  </p>
                </div>
              )}
              {invoice.internalNotes && (
                <div className={invoice.clientNotes ? 'pt-4 border-t' : ''}>
                  <span className="text-sm text-charcoal-500 font-medium">Internal Notes</span>
                  <p className="mt-1 text-charcoal-700 whitespace-pre-wrap">
                    {invoice.internalNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dispute Info */}
        {invoice.isDisputed && (
          <Card className="bg-white border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" />
                Dispute Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div>
                <span className="text-sm text-charcoal-500">Reason</span>
                <p className="font-medium">{invoice.disputeReason || 'Not specified'}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Opened</span>
                <span>
                  {invoice.disputeOpenedAt
                    ? format(new Date(invoice.disputeOpenedAt), 'MMM d, yyyy')
                    : '-'}
                </span>
              </div>
              {invoice.disputeResolvedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-500">Resolved</span>
                  <span>{format(new Date(invoice.disputeResolvedAt), 'MMM d, yyyy')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right - Financial Summary */}
      <div className="space-y-6">
        {/* Financial Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Tax</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid</span>
              <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Balance Due</span>
              <span
                className={`font-bold text-lg ${invoice.balanceDue > 0 && isOverdue ? 'text-red-600' : ''}`}
              >
                {formatCurrency(invoice.balanceDue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Aging */}
        {agingConfig && invoice.balanceDue > 0 && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Aging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Aging Bucket</span>
                <Badge className={`${agingConfig.bgColor} ${agingConfig.color}`}>
                  {agingConfig.label}
                </Badge>
              </div>
              {invoice.reminderCount > 0 && (
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-charcoal-500">Reminders Sent</span>
                  <span>{invoice.reminderCount}</span>
                </div>
              )}
              {invoice.lastReminderSent && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-charcoal-500">Last Reminder</span>
                  <span>
                    {formatDistanceToNow(new Date(invoice.lastReminderSent), { addSuffix: true })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery Status */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoice.sentAt ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Sent {formatDistanceToNow(new Date(invoice.sentAt), { addSuffix: true })}
                  </span>
                </div>
                {invoice.sentTo && invoice.sentTo.length > 0 && (
                  <div className="text-sm text-charcoal-500">
                    To: {invoice.sentTo.join(', ')}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-charcoal-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Not sent yet</span>
              </div>
            )}
            {invoice.viewedAt && (
              <div className="flex items-center gap-2 text-blue-600 pt-2 border-t">
                <Eye className="w-4 h-4" />
                <span className="text-sm">
                  Viewed {formatDistanceToNow(new Date(invoice.viewedAt), { addSuffix: true })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Updated</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(invoice.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// LINE ITEMS SECTION
// ============================================

export function InvoiceLineItemsSectionPCF({ entityId }: PCFSectionProps) {
  const lineItemsQuery = trpc.invoices.lineItems.list.useQuery({ invoiceId: entityId })
  const lineItems = (lineItemsQuery.data ?? []) as InvoiceLineItem[]

  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
  const discountTotal = lineItems.reduce((sum, item) => sum + item.discountAmount, 0)
  const taxTotal = lineItems.reduce((sum, item) => sum + item.taxAmount, 0)
  const total = lineItems.reduce((sum, item) => sum + item.totalAmount, 0)

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Line Items
        </CardTitle>
        <div className="text-sm text-charcoal-500">
          {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
        </div>
      </CardHeader>
      <CardContent>
        {lineItemsQuery.isLoading ? (
          <div className="text-center py-8 text-charcoal-500">Loading line items...</div>
        ) : lineItems.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <DollarSign className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No line items yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-200">
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">#</th>
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">
                      Description
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">Period</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Qty</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Rate</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-charcoal-100 hover:bg-charcoal-50"
                    >
                      <td className="py-3 px-2 text-charcoal-500">{item.lineNumber}</td>
                      <td className="py-3 px-2">
                        <div className="font-medium">{item.description}</div>
                        {item.projectCode && (
                          <div className="text-xs text-charcoal-500">
                            Project: {item.projectCode}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-charcoal-600">
                        {item.serviceStartDate && item.serviceEndDate ? (
                          <span>
                            {format(new Date(item.serviceStartDate), 'M/d')} -{' '}
                            {format(new Date(item.serviceEndDate), 'M/d/yy')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {item.quantity} {item.unitType}
                      </td>
                      <td className="py-3 px-2 text-right">{formatCurrency(item.unitRate)}</td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatCurrency(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-charcoal-200">
                    <td colSpan={5} className="py-3 px-2 text-right font-medium">
                      Subtotal
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{formatCurrency(subtotal)}</td>
                  </tr>
                  {discountTotal > 0 && (
                    <tr className="text-green-600">
                      <td colSpan={5} className="py-1 px-2 text-right">
                        Discount
                      </td>
                      <td className="py-1 px-2 text-right">-{formatCurrency(discountTotal)}</td>
                    </tr>
                  )}
                  {taxTotal > 0 && (
                    <tr>
                      <td colSpan={5} className="py-1 px-2 text-right text-charcoal-600">
                        Tax
                      </td>
                      <td className="py-1 px-2 text-right">{formatCurrency(taxTotal)}</td>
                    </tr>
                  )}
                  <tr className="bg-charcoal-50 font-bold">
                    <td colSpan={5} className="py-3 px-2 text-right">
                      Total
                    </td>
                    <td className="py-3 px-2 text-right text-lg">{formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// PAYMENTS SECTION
// ============================================

export function InvoicePaymentsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const invoice = entity as Invoice | undefined
  const paymentsQuery = trpc.invoices.payments.list.useQuery({ invoiceId: entityId })
  const payments = (paymentsQuery.data ?? []) as InvoicePayment[]

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payments
        </CardTitle>
        {invoice && invoice.balanceDue > 0 && (
          <Button variant="outline" size="sm">
            Record Payment
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {paymentsQuery.isLoading ? (
          <div className="text-center py-8 text-charcoal-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <CreditCard className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No payments recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Payments List */}
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border rounded-lg hover:bg-charcoal-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {formatCurrency(payment.amount)}
                        </span>
                        <Badge variant="outline">
                          {PAYMENT_METHOD_CONFIG[payment.paymentMethod]?.label ||
                            payment.paymentMethod}
                        </Badge>
                      </div>
                      <div className="text-sm text-charcoal-500">
                        {format(new Date(payment.paymentDate), 'MMM d, yyyy')}
                      </div>
                      {payment.referenceNumber && (
                        <div className="text-sm text-charcoal-500">
                          Ref: {payment.referenceNumber}
                        </div>
                      )}
                      {payment.notes && (
                        <div className="text-sm text-charcoal-600 mt-2">{payment.notes}</div>
                      )}
                    </div>
                    {payment.depositDate && (
                      <div className="text-right text-sm text-charcoal-500">
                        <div>Deposited</div>
                        <div>{format(new Date(payment.depositDate), 'M/d/yy')}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Total Paid</span>
                <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              {invoice && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Balance Due</span>
                  <span
                    className={`font-bold ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {formatCurrency(invoice.balanceDue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// ACTIVITIES SECTION
// ============================================

export function InvoiceActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No activities recorded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// NOTES SECTION
// ============================================

export function InvoiceNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No notes added yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// DOCUMENTS SECTION
// ============================================

export function InvoiceDocumentsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No documents uploaded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// HISTORY SECTION
// ============================================

export function InvoiceHistorySectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Clock className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>Change history will appear here</p>
        </div>
      </CardContent>
    </Card>
  )
}
