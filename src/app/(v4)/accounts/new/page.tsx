'use client'

/**
 * New Account Page - V4 Linear-style Form
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4AccountMutations } from '@/lib/v4/hooks/useV4Mutations'

export default function NewAccountPage() {
  const router = useRouter()
  const { createAccount, isCreating } = useV4AccountMutations()

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    type: 'smb' as 'enterprise' | 'mid_market' | 'smb' | 'startup',
    website: '',
    phone: '',
    city: '',
    state: '',
    country: 'US',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Company name is required'
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
      await createAccount({
        name: formData.name,
        industry: formData.industry || undefined,
        type: formData.type,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country,
      })
      router.push('/accounts')
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
                <Building2 className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">New Account</h1>
                <p className="hidden sm:block text-sm text-neutral-500">Add a new client account</p>
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
              <span className="hidden sm:inline">Create Account</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setErrors({ ...errors, name: '' })
              }}
              placeholder="e.g., Acme Corporation"
              className={cn(
                'w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder:text-neutral-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                errors.name ? 'border-red-500' : 'border-neutral-700'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Industry & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Account Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="enterprise">Enterprise</option>
                <option value="mid_market">Mid-Market</option>
                <option value="smb">SMB</option>
                <option value="startup">Startup</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://acme.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 100-1000"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State/Province"
                className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
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
