'use client'

import React, { useState } from 'react'
import {
  X,
  Mail,
  Phone,
  User,
  Loader2,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/client'

interface EnrollmentRequestFormProps {
  pathSlug: string
  pathTitle: string
  onClose: () => void
}

export function EnrollmentRequestForm({ pathSlug, pathTitle, onClose }: EnrollmentRequestFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [experience, setExperience] = useState('')
  const [message, setMessage] = useState('')

  const submitRequest = trpc.academy.submitEnrollmentRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitRequest.mutate({
      pathSlug,
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      priorExperience: experience || undefined,
      message: message || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-charcoal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap size={20} className="text-gold-400" />
            <div>
              <h2 className="font-heading font-bold text-base">
                {submitted ? 'Application Submitted' : 'Apply for Enrollment'}
              </h2>
              <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">
                {pathTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="font-heading font-bold text-xl text-charcoal-900 mb-2">
              Application Received!
            </h3>
            <p className="text-sm text-charcoal-500 mb-6 max-w-sm mx-auto">
              Our team will review your application and get back to you within 2 business days.
              You&apos;ll receive a confirmation email shortly.
            </p>
            <Button onClick={onClose} className="bg-charcoal-900 text-white hover:bg-black">
              CLOSE
            </Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error */}
            {submitRequest.error && (
              <div className="p-3 bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg">
                {submitRequest.error.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  className="h-10"
                  leftIcon={<User size={14} />}
                />
              </div>
              <div>
                <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-10"
                leftIcon={<Mail size={14} />}
              />
            </div>

            <div>
              <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                Phone (Optional)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-10"
                leftIcon={<Phone size={14} />}
              />
            </div>

            <div>
              <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                Prior Guidewire Experience (Optional)
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-10 rounded-sm border border-charcoal-200 bg-white px-3 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              >
                <option value="">Select experience level</option>
                <option value="none">No prior experience</option>
                <option value="basic">Basic knowledge (tutorials, courses)</option>
                <option value="intermediate">Some project experience</option>
                <option value="advanced">Multiple projects delivered</option>
              </select>
            </div>

            <div>
              <label className="block text-charcoal-600 text-xs font-bold uppercase tracking-wider mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your goals..."
                rows={3}
                className="w-full rounded-sm border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitRequest.isPending}
                className="flex-1 bg-charcoal-900 text-white hover:bg-black"
              >
                {submitRequest.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'SUBMIT APPLICATION'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
