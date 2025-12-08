'use client'

import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateJobStore, JOB_TYPES } from '@/stores/create-job-store'
import { Building2, MapPin, Home, Briefcase } from 'lucide-react'

export function CreateJobStep1BasicInfo() {
  const { formData, setFormData } = useCreateJobStore()

  // Fetch accounts for dropdown
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    { limit: 100, status: 'active' },
  )
  const accounts = accountsQuery.data?.items || []

  return (
    <div className="space-y-6">
      {/* Job Title */}
      <div>
        <Label htmlFor="title" className="flex items-center gap-2 mb-2">
          <Briefcase className="w-4 h-4" />
          Job Title *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ title: e.target.value })}
          placeholder="e.g., Senior Software Engineer"
          maxLength={200}
          className="max-w-xl"
        />
        <p className="text-xs text-charcoal-500 mt-1">{formData.title.length}/200</p>
      </div>

      {/* Client Account */}
      <div>
        <Label htmlFor="account" className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4" />
          Client Account *
        </Label>
        <Select value={formData.accountId} onValueChange={(value) => setFormData({ accountId: value })}>
          <SelectTrigger className="max-w-xl">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} {account.industry ? `(${account.industry})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {accountsQuery.isLoading && (
          <p className="text-xs text-charcoal-500 mt-1">Loading accounts...</p>
        )}
      </div>

      {/* Job Type */}
      <div>
        <Label htmlFor="jobType" className="mb-2">Job Type *</Label>
        <Select value={formData.jobType} onValueChange={(value) => setFormData({ jobType: value })}>
          <SelectTrigger className="max-w-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOB_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location" className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4" />
          Location
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ location: e.target.value })}
          placeholder="e.g., San Francisco, CA"
          maxLength={200}
          className="max-w-xl"
        />
      </div>

      {/* Remote/Hybrid Options */}
      <div className="bg-charcoal-50 rounded-lg p-4">
        <Label className="flex items-center gap-2 mb-4">
          <Home className="w-4 h-4" />
          Work Arrangement
        </Label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRemote}
              onChange={(e) => {
                setFormData({ isRemote: e.target.checked })
                if (e.target.checked) setFormData({ isHybrid: false })
              }}
              className="w-4 h-4 rounded border-charcoal-300 text-hublot-900 focus:ring-gold-500"
            />
            <span className="text-sm">Remote</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isHybrid}
              onChange={(e) => {
                setFormData({ isHybrid: e.target.checked })
                if (e.target.checked) setFormData({ isRemote: false })
              }}
              className="w-4 h-4 rounded border-charcoal-300 text-hublot-900 focus:ring-gold-500"
            />
            <span className="text-sm">Hybrid</span>
          </label>
          {formData.isHybrid && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.hybridDays}
                onChange={(e) => setFormData({ hybridDays: parseInt(e.target.value) || 3 })}
                className="w-16"
              />
              <span className="text-sm text-charcoal-500">days/week in office</span>
            </div>
          )}
        </div>
        {!formData.isRemote && !formData.isHybrid && (
          <p className="text-xs text-charcoal-500 mt-2">On-site (default)</p>
        )}
      </div>
    </div>
  )
}
