'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Building2,
  Loader2,
  ExternalLink,
  DollarSign,
  Pencil,
  Check,
  X,
  Users,
  Percent,
  Clock,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { FullJob } from '@/types/job'

interface ClientCardProps {
  job: FullJob
  jobId: string
}

interface JobCompany {
  id: string
  name: string
  industry?: string
}

interface JobWithCompanyRelations {
  client_company_id?: string
  end_client_company_id?: string
  vendor_company_id?: string
  clientCompany?: JobCompany
  endClientCompany?: JobCompany
  vendorCompany?: JobCompany
}

const NONE_VALUE = '__none__'

const FEE_TYPES = [
  { value: 'percentage', label: 'Percentage', icon: Percent },
  { value: 'flat', label: 'Flat Fee', icon: DollarSign },
  { value: 'hourly_spread', label: 'Hourly Spread', icon: Clock },
] as const

export function ClientCard({ job, jobId }: ClientCardProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const companiesQuery = trpc.crm.accounts.list.useQuery({
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  })
  const companies = companiesQuery.data?.items || []

  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Client details updated' })
      utils.ats.jobs.getFullJob.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'error' })
    },
  })

  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedEndClientId, setSelectedEndClientId] = useState<string>('')
  const [selectedVendorId, setSelectedVendorId] = useState<string>('')
  const [feeType, setFeeType] = useState<string>('')
  const [feePercentage, setFeePercentage] = useState<string>('')
  const [feeFlatAmount, setFeeFlatAmount] = useState<string>('')
  const [submissionInstructions, setSubmissionInstructions] = useState('')
  const [externalJobId, setExternalJobId] = useState('')
  const [interviewProcess, setInterviewProcess] = useState('')

  const jobWithRelations = job as unknown as JobWithCompanyRelations
  const clientCompany = jobWithRelations?.clientCompany
  const endClientCompany = jobWithRelations?.endClientCompany
  const vendorCompany = jobWithRelations?.vendorCompany

  const startEditingCompanies = () => {
    setSelectedClientId(job.client_company_id || NONE_VALUE)
    setSelectedEndClientId(job.end_client_company_id || NONE_VALUE)
    setSelectedVendorId(job.vendor_company_id || NONE_VALUE)
    setEditingField('companies')
  }

  const handleSaveCompanies = async () => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      clientCompanyId: selectedClientId === NONE_VALUE ? null : selectedClientId || null,
      endClientCompanyId: selectedEndClientId === NONE_VALUE ? null : selectedEndClientId || null,
      vendorCompanyId: selectedVendorId === NONE_VALUE ? null : selectedVendorId || null,
    })
    setEditingField(null)
  }

  const startEditingFees = () => {
    const feeTypeValue = typeof job.fee_type === 'string' ? job.fee_type : NONE_VALUE
    setFeeType(feeTypeValue || NONE_VALUE)
    setFeePercentage(job.fee_percentage?.toString() || '')
    setFeeFlatAmount(job.fee_flat_amount?.toString() || '')
    setEditingField('fees')
  }

  const handleSaveFees = async () => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      feeType: feeType === NONE_VALUE ? null : (feeType as 'percentage' | 'flat' | 'hourly_spread') || null,
      feePercentage: feePercentage ? parseFloat(feePercentage) : null,
      feeFlatAmount: feeFlatAmount ? parseFloat(feeFlatAmount) : null,
    })
    setEditingField(null)
  }

  const startEditingInstructions = () => {
    const instructions = typeof job.client_submission_instructions === 'string' ? job.client_submission_instructions : ''
    setSubmissionInstructions(instructions)
    setEditingField('instructions')
  }

  const handleSaveInstructions = async () => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      clientSubmissionInstructions: submissionInstructions || undefined,
    })
    setEditingField(null)
  }

  const startEditingExternalId = () => {
    const extId = typeof job.external_job_id === 'string' ? job.external_job_id : ''
    setExternalJobId(extId)
    setEditingField('externalId')
  }

  const handleSaveExternalId = async () => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      externalJobId: externalJobId || null,
    })
    setEditingField(null)
  }

  const startEditingInterviewProcess = () => {
    const process = typeof job.client_interview_process === 'string' ? job.client_interview_process : ''
    setInterviewProcess(process)
    setEditingField('interviewProcess')
  }

  const handleSaveInterviewProcess = async () => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      clientInterviewProcess: interviewProcess || undefined,
    })
    setEditingField(null)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-5">
      {/* Companies Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">Companies</span>
          {editingField !== 'companies' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-charcoal-500 hover:text-charcoal-900" onClick={startEditingCompanies}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {editingField === 'companies' ? (
          <div className="space-y-3 p-4 border border-charcoal-200 rounded-xl bg-charcoal-50/50">
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">Direct Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="h-9 text-sm bg-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">End Client</Label>
              <Select value={selectedEndClientId} onValueChange={setSelectedEndClientId}>
                <SelectTrigger className="h-9 text-sm bg-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Same as direct client</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">Vendor</Label>
              <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                <SelectTrigger className="h-9 text-sm bg-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Direct placement</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" className="h-8" onClick={handleSaveCompanies} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg hover:border-charcoal-200 transition-colors">
              <div className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500 mb-1">Client</div>
              {clientCompany ? (
                <Link
                  href={`/employee/recruiting/accounts/${clientCompany.id}`}
                  className="text-sm font-medium text-charcoal-900 hover:text-gold-600 flex items-center gap-1.5 group"
                >
                  {clientCompany.name}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : (
                <span className="text-sm text-charcoal-400 italic">Not set</span>
              )}
            </div>
            <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg hover:border-charcoal-200 transition-colors">
              <div className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500 mb-1">End Client</div>
              {endClientCompany ? (
                <span className="text-sm font-medium text-charcoal-900">{endClientCompany.name}</span>
              ) : (
                <span className="text-sm text-charcoal-400 italic">Same</span>
              )}
            </div>
            <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg hover:border-charcoal-200 transition-colors">
              <div className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500 mb-1">Vendor</div>
              {vendorCompany ? (
                <span className="text-sm font-medium text-charcoal-900">{vendorCompany.name}</span>
              ) : (
                <span className="text-sm text-charcoal-400 italic">Direct</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fee Structure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">Fee Structure</span>
          {editingField !== 'fees' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-charcoal-500 hover:text-charcoal-900" onClick={startEditingFees}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {editingField === 'fees' ? (
          <div className="space-y-3 p-4 border border-charcoal-200 rounded-xl bg-charcoal-50/50">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">Fee Type</Label>
                <Select value={feeType} onValueChange={setFeeType}>
                  <SelectTrigger className="h-9 text-sm bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>Not set</SelectItem>
                    {FEE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">Percentage</Label>
                <Input
                  type="number"
                  className="h-9 text-sm bg-white"
                  placeholder="e.g., 20"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(e.target.value)}
                  disabled={feeType !== 'percentage'}
                />
              </div>
              <div>
                <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">Flat Amount</Label>
                <Input
                  type="number"
                  className="h-9 text-sm bg-white"
                  placeholder="e.g., 15000"
                  value={feeFlatAmount}
                  onChange={(e) => setFeeFlatAmount(e.target.value)}
                  disabled={feeType !== 'flat'}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" className="h-8" onClick={handleSaveFees} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg">
              <div className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500 mb-1">Type</div>
              <span className={`text-sm font-medium ${job.fee_type ? 'text-charcoal-900' : 'text-charcoal-400 italic'}`}>
                {FEE_TYPES.find(t => t.value === job.fee_type)?.label || 'Not set'}
              </span>
            </div>
            <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg">
              <div className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500 mb-1">Percentage</div>
              <span className={`text-sm font-medium ${job.fee_percentage ? 'text-charcoal-900' : 'text-charcoal-400 italic'}`}>
                {job.fee_percentage ? `${job.fee_percentage}%` : 'Not set'}
              </span>
            </div>
            <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg">
              <div className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500 mb-1">Flat Fee</div>
              <span className={`text-sm font-medium ${job.fee_flat_amount ? 'text-charcoal-900' : 'text-charcoal-400 italic'}`}>
                {job.fee_flat_amount ? formatCurrency(job.fee_flat_amount as number) : 'Not set'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Submission Instructions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">Submission Instructions</span>
          {editingField !== 'instructions' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-charcoal-500 hover:text-charcoal-900" onClick={startEditingInstructions}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {editingField === 'instructions' ? (
          <div className="space-y-3 p-4 border border-charcoal-200 rounded-xl bg-charcoal-50/50">
            <Textarea
              value={submissionInstructions}
              onChange={(e) => setSubmissionInstructions(e.target.value)}
              placeholder="Enter submission guidelines..."
              rows={3}
              className="text-sm bg-white"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" className="h-8" onClick={handleSaveInstructions} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg">
            {job.client_submission_instructions && typeof job.client_submission_instructions === 'string' ? (
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap line-clamp-3 leading-relaxed">
                {job.client_submission_instructions}
              </p>
            ) : (
              <span className="text-sm text-charcoal-400 italic">No instructions provided</span>
            )}
          </div>
        )}
      </div>

      {/* External Job ID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">Client Job ID</span>
          {editingField !== 'externalId' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-charcoal-500 hover:text-charcoal-900" onClick={startEditingExternalId}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {editingField === 'externalId' ? (
          <div className="space-y-3 p-4 border border-charcoal-200 rounded-xl bg-charcoal-50/50">
            <Input
              value={externalJobId}
              onChange={(e) => setExternalJobId(e.target.value)}
              placeholder="e.g., REQ-12345"
              className="text-sm h-9 bg-white"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" className="h-8" onClick={handleSaveExternalId} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg">
            {job.external_job_id && typeof job.external_job_id === 'string' ? (
              <span className="text-sm font-mono font-medium text-charcoal-900 bg-charcoal-100 px-2 py-0.5 rounded">
                {job.external_job_id}
              </span>
            ) : (
              <span className="text-sm text-charcoal-400 italic">Not set</span>
            )}
          </div>
        )}
      </div>

      {/* Interview Process */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">Interview Process</span>
          {editingField !== 'interviewProcess' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-charcoal-500 hover:text-charcoal-900" onClick={startEditingInterviewProcess}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {editingField === 'interviewProcess' ? (
          <div className="space-y-3 p-4 border border-charcoal-200 rounded-xl bg-charcoal-50/50">
            <Textarea
              value={interviewProcess}
              onChange={(e) => setInterviewProcess(e.target.value)}
              placeholder="Describe the client's interview process (rounds, format, interviewers)..."
              rows={4}
              className="text-sm bg-white"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" className="h-8" onClick={handleSaveInterviewProcess} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-charcoal-50/50 border border-charcoal-100 rounded-lg">
            {job.client_interview_process && typeof job.client_interview_process === 'string' ? (
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                {job.client_interview_process}
              </p>
            ) : (
              <span className="text-sm text-charcoal-400 italic">Not specified</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
