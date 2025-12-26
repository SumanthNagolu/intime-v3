'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  FileText,
  ClipboardList,
  Users,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  Link as LinkIcon,
  Percent,
  Hash,
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface JobClientDetailsSectionProps {
  jobId: string
}

// Special value for "None" option in Select (Radix UI doesn't handle empty strings well)
const NONE_VALUE = '__none__'

// Fee type options
const FEE_TYPES = [
  { value: 'percentage', label: 'Percentage of Salary', icon: Percent },
  { value: 'flat', label: 'Flat Fee', icon: DollarSign },
  { value: 'hourly_spread', label: 'Hourly Spread', icon: Clock },
] as const

// Interview format icons
const FORMAT_ICONS: Record<string, typeof Video> = {
  video: Video,
  phone: Phone,
  onsite: Building2,
  in_person: Building2,
  technical: FileText,
  panel: Users,
}

export function JobClientDetailsSection({ jobId }: JobClientDetailsSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Fetch job data
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const job = jobQuery.data

  // Fetch companies for selection
  const companiesQuery = trpc.crm.accounts.list.useQuery({
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  })
  const companies = companiesQuery.data?.items || []

  // Mutation for updating job
  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Client details updated successfully' })
      utils.ats.jobs.getById.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'error' })
    },
  })

  // UI State for Companies section
  const [isEditingClient, setIsEditingClient] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [isEditingEndClient, setIsEditingEndClient] = useState(false)
  const [selectedEndClientId, setSelectedEndClientId] = useState<string>('')
  const [isEditingVendor, setIsEditingVendor] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState<string>('')
  const [isEditingExternalId, setIsEditingExternalId] = useState(false)
  const [externalJobId, setExternalJobId] = useState('')

  // UI State for Fee Structure
  const [isEditingFees, setIsEditingFees] = useState(false)
  const [feeType, setFeeType] = useState<string>('')
  const [feePercentage, setFeePercentage] = useState<string>('')
  const [feeFlatAmount, setFeeFlatAmount] = useState<string>('')

  // UI State for Instructions
  const [isEditingInstructions, setIsEditingInstructions] = useState(false)
  const [submissionInstructions, setSubmissionInstructions] = useState('')
  const [interviewProcess, setInterviewProcess] = useState('')

  // Get company info from API response (uses camelCase)
  const clientCompany = (job as any)?.clientCompany
  const endClientCompany = (job as any)?.endClientCompany
  const vendorCompany = (job as any)?.vendorCompany

  // Handlers for Client Company
  const startEditingClient = () => {
    setSelectedClientId(job?.client_company_id || NONE_VALUE)
    setIsEditingClient(true)
  }

  const handleSaveClient = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      clientCompanyId: selectedClientId === NONE_VALUE ? null : selectedClientId || null,
    })
    setIsEditingClient(false)
  }

  // Handlers for End Client
  const startEditingEndClient = () => {
    setSelectedEndClientId(job?.end_client_company_id || NONE_VALUE)
    setIsEditingEndClient(true)
  }

  const handleSaveEndClient = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      endClientCompanyId: selectedEndClientId === NONE_VALUE ? null : selectedEndClientId || null,
    })
    setIsEditingEndClient(false)
  }

  // Handlers for Vendor
  const startEditingVendor = () => {
    setSelectedVendorId(job?.vendor_company_id || NONE_VALUE)
    setIsEditingVendor(true)
  }

  const handleSaveVendor = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      vendorCompanyId: selectedVendorId === NONE_VALUE ? null : selectedVendorId || null,
    })
    setIsEditingVendor(false)
  }

  // Handlers for External Job ID
  const startEditingExternalId = () => {
    setExternalJobId(job?.external_job_id || '')
    setIsEditingExternalId(true)
  }

  const handleSaveExternalId = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      externalJobId: externalJobId || null,
    })
    setIsEditingExternalId(false)
  }

  // Handlers for Fee Structure
  const startEditingFees = () => {
    setFeeType(job?.fee_type || NONE_VALUE)
    setFeePercentage(job?.fee_percentage?.toString() || '')
    setFeeFlatAmount(job?.fee_flat_amount?.toString() || '')
    setIsEditingFees(true)
  }

  const handleSaveFees = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      feeType: feeType === NONE_VALUE ? null : (feeType as 'percentage' | 'flat' | 'hourly_spread') || null,
      feePercentage: feePercentage ? parseFloat(feePercentage) : null,
      feeFlatAmount: feeFlatAmount ? parseFloat(feeFlatAmount) : null,
    })
    setIsEditingFees(false)
  }

  // Handlers for Instructions
  const startEditingInstructions = () => {
    setSubmissionInstructions(job?.client_submission_instructions || '')
    // Handle interview_rounds JSON
    const interviewRounds = (job as any)?.interview_rounds
    if (interviewRounds && Array.isArray(interviewRounds)) {
      // Convert array to readable text
      setInterviewProcess(formatInterviewRoundsForEdit(interviewRounds))
    } else {
      setInterviewProcess(job?.client_interview_process || '')
    }
    setIsEditingInstructions(true)
  }

  const handleSaveInstructions = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      clientSubmissionInstructions: submissionInstructions || undefined,
      clientInterviewProcess: interviewProcess || undefined,
    })
    setIsEditingInstructions(false)
  }

  // Helper to format interview rounds for editing
  const formatInterviewRoundsForEdit = (rounds: any[]): string => {
    return rounds.map((round, idx) => {
      return `Round ${idx + 1}: ${round.name}\n` +
        `  Format: ${round.format}\n` +
        `  Duration: ${round.duration} min\n` +
        `  Interviewer: ${round.interviewer}\n` +
        `  Focus: ${round.focus}`
    }).join('\n\n')
  }

  // Helper to render interview rounds nicely
  const renderInterviewRounds = (rounds: any[]) => {
    if (!Array.isArray(rounds) || rounds.length === 0) return null

    return (
      <div className="space-y-3">
        {rounds.map((round, idx) => {
          const FormatIcon = FORMAT_ICONS[round.format?.toLowerCase()] || MessageSquare
          return (
            <div key={idx} className="flex items-start gap-3 p-3 bg-charcoal-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-hublot-700">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-charcoal-900">{round.name}</span>
                  <Badge variant="outline" className="text-xs">
                    <FormatIcon className="w-3 h-3 mr-1" />
                    {round.format}
                  </Badge>
                  {round.duration && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {round.duration} min
                    </Badge>
                  )}
                </div>
                {round.interviewer && (
                  <p className="text-sm text-charcoal-600">
                    <span className="font-medium">Interviewer:</span> {round.interviewer}
                  </p>
                )}
                {round.focus && (
                  <p className="text-sm text-charcoal-500 mt-1">{round.focus}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Companies
          </CardTitle>
          <CardDescription>Client, end client, and vendor information</CardDescription>
        </CardHeader>
        <CardContent>
          {jobQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Direct Client */}
              <div className="p-4 border rounded-lg group hover:border-charcoal-300 transition-colors">
                {isEditingClient ? (
                  <div className="space-y-3">
                    <Label>Direct Client / Account</Label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client company..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          <span className="text-charcoal-500">None</span>
                        </SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-charcoal-400" />
                              <span>{company.name}</span>
                              {company.industry && (
                                <span className="text-charcoal-400 text-xs">• {company.industry}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingClient(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveClient} disabled={updateJobMutation.isPending}>
                        {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">Direct Client</Badge>
                      </div>
                      {clientCompany ? (
                        <Link
                          href={`/employee/recruiting/accounts/${clientCompany.id}`}
                          className="font-medium text-charcoal-900 hover:text-hublot-600 transition-colors flex items-center gap-1"
                        >
                          {clientCompany.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <p className="text-charcoal-500 italic">No direct client set</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={startEditingClient}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Building2 className="w-8 h-8 text-charcoal-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* End Client */}
              <div className={cn(
                "p-4 border rounded-lg group hover:border-charcoal-300 transition-colors",
                endClientCompany && "bg-purple-50/50"
              )}>
                {isEditingEndClient ? (
                  <div className="space-y-3">
                    <Label>End Client (if different from direct client)</Label>
                    <Select value={selectedEndClientId} onValueChange={setSelectedEndClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end client..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          <span className="text-charcoal-500">None (Same as direct client)</span>
                        </SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-purple-400" />
                              <span>{company.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingEndClient(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEndClient} disabled={updateJobMutation.isPending}>
                        {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                          End Client
                        </Badge>
                      </div>
                      {endClientCompany ? (
                        <Link
                          href={`/employee/recruiting/accounts/${endClientCompany.id}`}
                          className="font-medium text-charcoal-900 hover:text-hublot-600 transition-colors flex items-center gap-1"
                        >
                          {endClientCompany.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <p className="text-charcoal-500 italic text-sm">Same as direct client</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={startEditingEndClient}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Building2 className="w-8 h-8 text-purple-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* Vendor */}
              <div className={cn(
                "p-4 border rounded-lg group hover:border-charcoal-300 transition-colors",
                vendorCompany && "bg-amber-50/50"
              )}>
                {isEditingVendor ? (
                  <div className="space-y-3">
                    <Label>Vendor / Implementation Partner</Label>
                    <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          <span className="text-charcoal-500">None (Direct placement)</span>
                        </SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-amber-500" />
                              <span>{company.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingVendor(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveVendor} disabled={updateJobMutation.isPending}>
                        {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                          Vendor / Partner
                        </Badge>
                      </div>
                      {vendorCompany ? (
                        <Link
                          href={`/employee/recruiting/accounts/${vendorCompany.id}`}
                          className="font-medium text-charcoal-900 hover:text-hublot-600 transition-colors flex items-center gap-1"
                        >
                          {vendorCompany.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <p className="text-charcoal-500 italic text-sm">Direct placement (no vendor)</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={startEditingVendor}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Users className="w-8 h-8 text-amber-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* External Job ID */}
              <div className="p-4 border rounded-lg bg-charcoal-50/50 group hover:border-charcoal-300 transition-colors">
                {isEditingExternalId ? (
                  <div className="space-y-3">
                    <Label>Client Job ID / Requisition Number</Label>
                    <Input
                      placeholder="e.g., REQ-2024-001"
                      value={externalJobId}
                      onChange={(e) => setExternalJobId(e.target.value)}
                      maxLength={100}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingExternalId(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveExternalId} disabled={updateJobMutation.isPending}>
                        {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-charcoal-500 mb-0.5">Client Job ID</p>
                      {job?.external_job_id ? (
                        <p className="font-mono font-medium text-charcoal-900">
                          {job.external_job_id}
                        </p>
                      ) : (
                        <p className="text-charcoal-500 italic text-sm">Not set</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={startEditingExternalId}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Hash className="w-6 h-6 text-charcoal-300" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fee Structure
            </CardTitle>
            <CardDescription>Placement fee arrangement</CardDescription>
          </div>
          {!isEditingFees && (
            <Button variant="ghost" size="sm" onClick={startEditingFees}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {jobQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : isEditingFees ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Fee Type</Label>
                  <Select value={feeType} onValueChange={setFeeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>
                        <span className="text-charcoal-500">Not specified</span>
                      </SelectItem>
                      {FEE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fee Percentage (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 20"
                    value={feePercentage}
                    onChange={(e) => setFeePercentage(e.target.value)}
                    min={0}
                    max={100}
                    step={0.5}
                    disabled={feeType !== 'percentage'}
                  />
                </div>
                <div>
                  <Label>Flat Fee Amount ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 15000"
                    value={feeFlatAmount}
                    onChange={(e) => setFeeFlatAmount(e.target.value)}
                    min={0}
                    step={100}
                    disabled={feeType !== 'flat'}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditingFees(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveFees} disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-charcoal-500 mb-1">Fee Type</p>
                <p className="font-medium text-charcoal-900">
                  {FEE_TYPES.find(t => t.value === job?.fee_type)?.label || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 mb-1">Fee Percentage (%)</p>
                <p className="font-medium text-charcoal-900">
                  {job?.fee_percentage ? `${job.fee_percentage}%` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 mb-1">Flat Fee Amount</p>
                <p className="font-medium text-charcoal-900">
                  {formatCurrency(job?.fee_flat_amount)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission & Interview Instructions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Client Instructions
            </CardTitle>
            <CardDescription>
              Submission guidelines and interview process from the client
            </CardDescription>
          </div>
          {!isEditingInstructions && (
            <Button variant="ghost" size="sm" onClick={startEditingInstructions}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {jobQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : isEditingInstructions ? (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Submission Instructions</Label>
                <Textarea
                  placeholder="Enter submission guidelines, required documents, formatting requirements..."
                  value={submissionInstructions}
                  onChange={(e) => setSubmissionInstructions(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label className="mb-2 block">Interview Process</Label>
                <Textarea
                  placeholder="Describe the interview rounds, format, duration, interviewers, and focus areas..."
                  value={interviewProcess}
                  onChange={(e) => setInterviewProcess(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-charcoal-500 mt-1">
                  Tip: Document each interview round with format, duration, and focus areas
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditingInstructions(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveInstructions} disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Submission Instructions */}
              <div>
                <h4 className="text-sm font-medium text-charcoal-700 mb-2">
                  Submission Instructions
                </h4>
                {job?.client_submission_instructions ? (
                  <div className="p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                      {job.client_submission_instructions}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-500 italic">
                    No submission instructions provided
                  </p>
                )}
              </div>

              {/* Interview Process */}
              <div>
                <h4 className="text-sm font-medium text-charcoal-700 mb-2">Interview Process</h4>
                {(() => {
                  // Try to parse interview_rounds JSON first
                  const interviewRounds = (job as any)?.interview_rounds
                  if (interviewRounds && Array.isArray(interviewRounds) && interviewRounds.length > 0) {
                    return renderInterviewRounds(interviewRounds)
                  }
                  // Fallback to client_interview_process text
                  if (job?.client_interview_process) {
                    // Try to parse as JSON (in case it's a stringified array)
                    try {
                      const parsed = JSON.parse(job.client_interview_process)
                      if (Array.isArray(parsed)) {
                        return renderInterviewRounds(parsed)
                      }
                    } catch {
                      // Not JSON, display as text
                    }
                    return (
                      <div className="p-4 bg-charcoal-50 rounded-lg">
                        <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                          {job.client_interview_process}
                        </p>
                      </div>
                    )
                  }
                  return (
                    <p className="text-sm text-charcoal-500 italic">
                      No interview process documented
                    </p>
                  )
                })()}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card className="bg-charcoal-50 border-charcoal-200">
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm text-charcoal-600">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {clientCompany ? 'Client linked' : 'No client'}
              </span>
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {job?.fee_type ? `${FEE_TYPES.find(t => t.value === job.fee_type)?.label}` : 'No fee set'}
              </span>
            </div>
            <span>
              {job?.external_job_id && `Ref: ${job.external_job_id}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
