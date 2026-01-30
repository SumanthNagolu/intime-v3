'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { DetailHeader } from '@/components/pcf/detail-view/DetailHeader'
import { INVOICE_STATUS_CONFIG, formatCurrency } from '@/configs/entities/invoices.config'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/card'
import { FileText, DollarSign, Building2, Calendar, Clock, CreditCard, AlertCircle } from 'lucide-react'

export default function InvoiceDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const invoiceId = params.id as string
  const section = searchParams.get('section') || 'overview'

  const { data: invoice, isLoading, error } = trpc.invoices.getById.useQuery(
    { id: invoiceId },
    { enabled: !!invoiceId }
  )

  if (isLoading) {
    return (
      <SidebarLayout sectionId="invoices">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-charcoal-500">Loading invoice...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !invoice) {
    return (
      <SidebarLayout sectionId="invoices">
        <div className="flex items-center justify-center h-64">
          <div className="text-error-500">Invoice not found</div>
        </div>
      </SidebarLayout>
    )
  }

  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status as keyof typeof INVOICE_STATUS_CONFIG]

  return (
    <SidebarLayout sectionId="invoices">
      <div className="space-y-6">
        <DetailHeader
          entity={invoice}
          titleField="invoiceNumber"
          subtitleFields={[
            { key: 'invoiceType', format: (v) => String(v).replace('_', ' ').toUpperCase() },
          ]}
          statusField="status"
          statusConfig={INVOICE_STATUS_CONFIG}
          breadcrumbs={[
            { label: 'Operations', href: '/employee/operations/invoices' },
            { label: 'Invoices', href: '/employee/operations/invoices' },
            { label: invoice.invoiceNumber, href: `/employee/operations/invoices/${invoice.id}` },
          ]}
        />

        {section === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoice Summary Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-charcoal-500" />
                  Invoice Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-charcoal-500">Invoice Number</p>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Reference Number</p>
                    <p className="font-medium">{invoice.referenceNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Invoice Type</p>
                    <p className="font-medium capitalize">{invoice.invoiceType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.bgColor || 'bg-charcoal-100'} ${statusConfig?.textColor || 'text-charcoal-700'}`}>
                      {statusConfig?.label || invoice.status}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Dates Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-charcoal-500" />
                  Important Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-charcoal-500">Invoice Date</p>
                    <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Due Date</p>
                    <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  {invoice.sentAt && (
                    <div>
                      <p className="text-sm text-charcoal-500">Sent At</p>
                      <p className="font-medium">{new Date(invoice.sentAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {invoice.viewedAt && (
                    <div>
                      <p className="text-sm text-charcoal-500">Viewed At</p>
                      <p className="font-medium">{new Date(invoice.viewedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Notes Card */}
              {(invoice.clientNotes || invoice.internalNotes) && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  {invoice.clientNotes && (
                    <div className="mb-4">
                      <p className="text-sm text-charcoal-500 mb-1">Client Notes</p>
                      <p className="text-charcoal-700">{invoice.clientNotes}</p>
                    </div>
                  )}
                  {invoice.internalNotes && (
                    <div>
                      <p className="text-sm text-charcoal-500 mb-1">Internal Notes</p>
                      <p className="text-charcoal-700">{invoice.internalNotes}</p>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Amount Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-charcoal-500" />
                  Amount Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-success-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Tax</span>
                      <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-lg">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-success-600">
                    <span>Amount Paid</span>
                    <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Balance Due</span>
                    <span className={`font-semibold text-lg ${invoice.balanceDue > 0 ? 'text-error-600' : 'text-success-600'}`}>
                      {formatCurrency(invoice.balanceDue)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Client Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-charcoal-500" />
                  Client
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">
                    {(invoice.company as { name?: string } | null)?.name ||
                     (invoice.account as { name?: string } | null)?.name ||
                     'No Client'}
                  </p>
                  {invoice.billingContact != null && (
                    <>
                      <p className="text-sm text-charcoal-600">
                        {String((invoice.billingContact as Record<string, unknown>).first_name || '')}{' '}
                        {String((invoice.billingContact as Record<string, unknown>).last_name || '')}
                      </p>
                      <p className="text-sm text-charcoal-500">
                        {String((invoice.billingContact as Record<string, unknown>).email || '')}
                      </p>
                    </>
                  )}
                </div>
              </Card>

              {/* Aging Info */}
              {invoice.agingBucket && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-charcoal-500" />
                    Aging
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-charcoal-500">Aging Bucket</p>
                    <p className={`font-medium ${invoice.agingBucket === '90_plus' ? 'text-error-600' : ''}`}>
                      {invoice.agingBucket === 'current' ? 'Current' :
                       invoice.agingBucket === '1_30' ? '1-30 Days' :
                       invoice.agingBucket === '31_60' ? '31-60 Days' :
                       invoice.agingBucket === '61_90' ? '61-90 Days' :
                       '90+ Days'}
                    </p>
                    {invoice.reminderCount > 0 && (
                      <p className="text-sm text-charcoal-500">
                        {invoice.reminderCount} reminder(s) sent
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {/* Disputed */}
              {invoice.isDisputed && (
                <Card className="p-6 border-error-200 bg-error-50">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-error-700">
                    <AlertCircle className="h-5 w-5" />
                    Disputed
                  </h3>
                  <p className="text-sm text-error-600">{invoice.disputeReason || 'No reason provided'}</p>
                  {invoice.disputeOpenedAt && (
                    <p className="text-xs text-error-500 mt-2">
                      Opened: {new Date(invoice.disputeOpenedAt).toLocaleDateString()}
                    </p>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}

        {section === 'lineItems' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Line Items</h3>
            <p className="text-charcoal-500">Line items section - coming soon</p>
          </Card>
        )}

        {section === 'payments' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-charcoal-500" />
              Payments
            </h3>
            <p className="text-charcoal-500">Payments section - coming soon</p>
          </Card>
        )}
      </div>
    </SidebarLayout>
  )
}
