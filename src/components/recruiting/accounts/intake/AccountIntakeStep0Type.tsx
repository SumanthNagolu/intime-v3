'use client'

import { useCreateAccountStore } from '@/stores/create-account-store'
import { cn } from '@/lib/utils'
import { Building2, User, CheckCircle2 } from 'lucide-react'

export function AccountIntakeStep0Type() {
  const { formData, setFormData } = useCreateAccountStore()

  const handleTypeSelect = (type: 'company' | 'person') => {
    setFormData({ accountType: type })
    
    // Clear name fields when switching type to avoid confusion, 
    // or keep them if they might share "name" field.
    // formData.name is shared.
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-heading font-bold text-charcoal-900">
          What type of account are you creating?
        </h2>
        <p className="text-charcoal-500 mt-2">
          Choose the entity type to configure the correct fields and workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Company Card */}
        <button
          onClick={() => handleTypeSelect('company')}
          className={cn(
            "relative p-8 rounded-2xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-md",
            formData.accountType === 'company'
              ? "border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow"
              : "border-charcoal-100 bg-white hover:border-gold-200"
          )}
        >
          {formData.accountType === 'company' && (
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-6 h-6 text-gold-500" />
            </div>
          )}
          
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors",
            formData.accountType === 'company'
              ? "bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow"
              : "bg-charcoal-50 text-charcoal-400 group-hover:bg-gold-50 group-hover:text-gold-500"
          )}>
            <Building2 className="w-8 h-8" />
          </div>

          <h3 className={cn(
            "text-xl font-bold mb-2",
            formData.accountType === 'company' ? "text-charcoal-900" : "text-charcoal-700"
          )}>
            Company Account
          </h3>
          <p className="text-sm text-charcoal-500 leading-relaxed">
            For business entities (Corporations, LLCs, etc.) that provide job requisitions. Includes support for multiple contacts, billing entities, and master agreements.
          </p>
        </button>

        {/* Person Card */}
        <button
          onClick={() => handleTypeSelect('person')}
          className={cn(
            "relative p-8 rounded-2xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-md",
            formData.accountType === 'person'
              ? "border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow"
              : "border-charcoal-100 bg-white hover:border-gold-200"
          )}
        >
           {formData.accountType === 'person' && (
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-6 h-6 text-gold-500" />
            </div>
          )}

          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors",
            formData.accountType === 'person'
              ? "bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow"
              : "bg-charcoal-50 text-charcoal-400 group-hover:bg-gold-50 group-hover:text-gold-500"
          )}>
            <User className="w-8 h-8" />
          </div>

          <h3 className={cn(
            "text-xl font-bold mb-2",
            formData.accountType === 'person' ? "text-charcoal-900" : "text-charcoal-700"
          )}>
            Person Account
          </h3>
          <p className="text-sm text-charcoal-500 leading-relaxed">
            For individual consultants or sole proprietors acting as a client. Simplified workflow focused on a single individual identity.
          </p>
        </button>
      </div>
    </div>
  )
}

