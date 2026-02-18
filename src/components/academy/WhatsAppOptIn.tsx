'use client'

import React, { useState } from 'react'
import { MessageCircle, Check, Phone } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface WhatsAppOptInProps {
  currentPhone?: string | null
  isOptedIn?: boolean
  onOptInComplete?: () => void
}

export function WhatsAppOptIn({ currentPhone, isOptedIn, onOptInComplete }: WhatsAppOptInProps) {
  const [phone, setPhone] = useState(currentPhone || '')
  const [consent, setConsent] = useState(isOptedIn || false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateWhatsApp = trpc.academy.updateWhatsAppOptIn.useMutation({
    onSuccess: () => {
      setSaved(true)
      setSaving(false)
      setTimeout(() => setSaved(false), 3000)
      onOptInComplete?.()
    },
    onError: () => {
      setSaving(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent || !phone.trim()) return
    setSaving(true)
    updateWhatsApp.mutate({
      phone: phone.trim(),
      optedIn: consent,
    })
  }

  const handleOptOut = () => {
    setSaving(true)
    updateWhatsApp.mutate({
      phone: phone.trim() || null,
      optedIn: false,
    })
    setConsent(false)
  }

  if (isOptedIn && currentPhone) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">WhatsApp Notifications Active</p>
            <p className="text-xs text-green-600">{currentPhone}</p>
          </div>
          <button
            onClick={handleOptOut}
            disabled={saving}
            className="text-xs text-charcoal-500 hover:text-charcoal-700 underline"
          >
            {saving ? 'Saving...' : 'Opt out'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-charcoal-200/60 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal-900">WhatsApp Notifications</p>
          <p className="text-xs text-charcoal-500">Get progress updates and reminders via WhatsApp</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Phone className="w-4 h-4 text-charcoal-400" />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          />
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-charcoal-300 text-green-600 focus:ring-green-500/20"
          />
          <span className="text-xs text-charcoal-600 leading-relaxed">
            I agree to receive WhatsApp messages from InTime Academy including progress updates,
            reminders, and milestone notifications. You can opt out at any time.
          </span>
        </label>

        <button
          type="submit"
          disabled={!consent || !phone.trim() || saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              Enable WhatsApp Notifications
            </>
          )}
        </button>
      </form>
    </div>
  )
}
