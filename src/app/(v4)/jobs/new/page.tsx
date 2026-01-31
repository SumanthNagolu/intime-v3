'use client'

/**
 * New Job Page - V4 Linear-style Form
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  DollarSign,
  Loader2,
  MapPin,
  Save,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4JobMutations } from '@/lib/v4/hooks/useV4Mutations'
import { useV4Accounts } from '@/lib/v4/hooks/useV4Data'

export default function NewJobPage() {
  const router = useRouter()
  const { createJob, isCreating } = useV4JobMutations()
  const { accounts } = useV4Accounts({ status: 'active' })

  const [formData, setFormData] = useState({
    title: '',
    accountId: '',
    location: '',
    isRemote: false,
    rateMin: '',
    rateMax: '',
    rateType: 'hourly' as 'hourly' | 'annual',
    description: '',
    positionsCount: '1',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters'
    if (!formData.accountId) newErrors.accountId = 'Account is required'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await createJob({
        title: formData.title,
        accountId: formData.accountId,
        location: formData.location || undefined,
        isRemote: formData.isRemote,
        rateMin: formData.rateMin ? Number(formData.rateMin) : undefined,
        rateMax: formData.rateMax ? Number(formData.rateMax) : undefined,
        rateType: formData.rateType,
        description: formData.description || undefined,
        positionsCount: Number(formData.positionsCount) || 1,
      })
      router.push('/jobs')
    } catch (err) {
      // Error handled by mutation
    }
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header */}
      <header className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-10 h-10 rounded-lg bg-neutral-800 items-center justify-center">
                <Briefcase className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">New Job</h1>
                <p className="hidden sm:block text-sm text-neutral-500">Create a new job posting</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Create Job</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value })
                setErrors({ ...errors, title: '' })
              }}
              placeholder="e.g., Senior React Developer"
              className={cn(
                'w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder:text-neutral-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                errors.title ? 'border-red-500' : 'border-neutral-700'
              )}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Account *
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => {
                setFormData({ ...formData, accountId: e.target.value })
                setErrors({ ...errors, accountId: '' })
              }}
              className={cn(
                'w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                errors.accountId ? 'border-red-500' : 'border-neutral-700'
              )}
            >
              <option value="">Select an account...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-400">{errors.accountId}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Location
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., San Francisco, CA"
                disabled={formData.isRemote}
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked, location: '' })}
                  className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm text-neutral-300">Remote</span>
              </label>
            </div>
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Rate Range
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="number"
                    value={formData.rateMin}
                    onChange={(e) => setFormData({ ...formData, rateMin: e.target.value })}
                    placeholder="Min"
                    className="w-full pl-9 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-neutral-500">to</span>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="number"
                    value={formData.rateMax}
                    onChange={(e) => setFormData({ ...formData, rateMax: e.target.value })}
                    placeholder="Max"
                    className="w-full pl-9 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <select
                value={formData.rateType}
                onChange={(e) => setFormData({ ...formData, rateType: e.target.value as 'hourly' | 'annual' })}
                className="w-full sm:w-auto px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="hourly">per hour</option>
                <option value="annual">per year</option>
              </select>
            </div>
          </div>

          {/* Positions */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Number of Positions
            </label>
            <input
              type="number"
              min="1"
              value={formData.positionsCount}
              onChange={(e) => setFormData({ ...formData, positionsCount: e.target.value })}
              className="w-32 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Job description, requirements, and responsibilities..."
              rows={6}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </div>

      {/* Footer - hidden on mobile */}
      <footer className="hidden sm:block flex-shrink-0 px-6 py-2 border-t border-neutral-800">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">Esc</kbd> Cancel
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">Cmd+Enter</kbd> Save
          </span>
        </div>
      </footer>
    </div>
  )
}
