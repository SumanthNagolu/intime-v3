'use client'

import { useState, useCallback } from 'react'
import {
  Phone,
  PhoneOff,
  PhoneOutgoing,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  MoreVertical,
  User,
  Building2,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { makePhoneCall } from '@/lib/desktop/tauri-bridge'

// ============================================
// Types
// ============================================

interface ClickToCallProps {
  phoneNumber: string
  contactName?: string
  contactId?: string
  entityType?: string
  entityId?: string
  variant?: 'button' | 'icon' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onCallStarted?: () => void
  onCallEnded?: () => void
}

interface CallLogModalProps {
  isOpen: boolean
  onClose: () => void
  phoneNumber: string
  contactName?: string
  entityType?: string
  entityId?: string
  onLogged?: () => void
}

type CallOutcome =
  | 'connected'
  | 'left_voicemail'
  | 'no_answer'
  | 'busy'
  | 'wrong_number'
  | 'disconnected'
  | 'call_back_requested'
  | 'not_interested'
  | 'interested'
  | 'scheduled_meeting'
  | 'other'

// ============================================
// Outcome Options
// ============================================

const CALL_OUTCOMES: Array<{ value: CallOutcome; label: string; icon: typeof CheckCircle2 }> = [
  { value: 'connected', label: 'Connected', icon: CheckCircle2 },
  { value: 'left_voicemail', label: 'Left Voicemail', icon: MessageSquare },
  { value: 'no_answer', label: 'No Answer', icon: PhoneOff },
  { value: 'busy', label: 'Busy', icon: Clock },
  { value: 'wrong_number', label: 'Wrong Number', icon: XCircle },
  { value: 'call_back_requested', label: 'Call Back Requested', icon: Clock },
  { value: 'interested', label: 'Interested', icon: CheckCircle2 },
  { value: 'not_interested', label: 'Not Interested', icon: XCircle },
  { value: 'scheduled_meeting', label: 'Scheduled Meeting', icon: CheckCircle2 },
  { value: 'other', label: 'Other', icon: MoreVertical },
]

// ============================================
// Call Log Modal
// ============================================

function CallLogModal({
  isOpen,
  onClose,
  phoneNumber,
  contactName,
  entityType,
  entityId,
  onLogged,
}: CallLogModalProps) {
  const [outcome, setOutcome] = useState<CallOutcome | null>(null)
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [isLogging, setIsLogging] = useState(false)

  const logCallMutation = trpc.phone.calls.log.useMutation()

  const handleLog = useCallback(async () => {
    if (!outcome) return

    setIsLogging(true)
    try {
      await logCallMutation.mutateAsync({
        direction: 'outbound',
        fromNumber: 'user', // Would come from user's phone account
        toNumber: phoneNumber,
        status: 'completed',
        durationSeconds: duration ? parseInt(duration) * 60 : undefined,
        outcome,
        outcomeNotes: notes || undefined,
        linkedEntities: entityType && entityId
          ? [{ entityType, entityId }]
          : undefined,
      })

      onLogged?.()
      onClose()
    } catch (error) {
      console.error('Failed to log call:', error)
    } finally {
      setIsLogging(false)
    }
  }, [outcome, notes, duration, phoneNumber, entityType, entityId, logCallMutation, onLogged, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-elevation-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-charcoal-100">
          <h3 className="text-lg font-semibold text-charcoal-900">Log Call</h3>
          <p className="text-sm text-charcoal-500 mt-1">
            {contactName && <span className="font-medium">{contactName}</span>}
            {contactName && ' • '}
            {phoneNumber}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Outcome selection */}
          <div>
            <label className="block text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
              Call Outcome
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CALL_OUTCOMES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setOutcome(opt.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors text-left',
                    outcome === opt.value
                      ? 'border-charcoal-900 bg-charcoal-900 text-white'
                      : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-700'
                  )}
                >
                  <opt.icon className="w-4 h-4 flex-shrink-0" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 5"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the call..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-charcoal-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-charcoal-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-charcoal-600 hover:text-charcoal-800"
          >
            Cancel
          </button>
          <button
            onClick={handleLog}
            disabled={!outcome || isLogging}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              outcome
                ? 'bg-charcoal-900 text-white hover:bg-charcoal-800'
                : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
            )}
          >
            {isLogging ? 'Logging...' : 'Log Call'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function ClickToCall({
  phoneNumber,
  contactName,
  contactId,
  entityType,
  entityId,
  variant = 'button',
  size = 'md',
  className,
  onCallStarted,
  onCallEnded,
}: ClickToCallProps) {
  const [showLogModal, setShowLogModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Format phone number for display
  const formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')

  const handleCall = useCallback(async () => {
    try {
      await makePhoneCall(phoneNumber)
      onCallStarted?.()
      // Show log modal after a brief delay (assume call ended)
      setTimeout(() => {
        setShowLogModal(true)
        onCallEnded?.()
      }, 1000)
    } catch (error) {
      console.error('Failed to initiate call:', error)
    }
  }, [phoneNumber, onCallStarted, onCallEnded])

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleCall}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isHovered
              ? 'bg-success-500 text-white'
              : 'bg-charcoal-100 text-charcoal-600 hover:bg-success-100 hover:text-success-600',
            className
          )}
          title={`Call ${formattedNumber}`}
        >
          {isHovered ? (
            <PhoneOutgoing className={iconSizes[size]} />
          ) : (
            <Phone className={iconSizes[size]} />
          )}
        </button>

        <CallLogModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          phoneNumber={phoneNumber}
          contactName={contactName}
          entityType={entityType}
          entityId={entityId}
        />
      </>
    )
  }

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={handleCall}
          className={cn(
            'inline-flex items-center gap-1.5 text-charcoal-600 hover:text-success-600 transition-colors',
            sizeClasses[size],
            className
          )}
        >
          <Phone className={iconSizes[size]} />
          <span className="underline underline-offset-2">{formattedNumber}</span>
        </button>

        <CallLogModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          phoneNumber={phoneNumber}
          contactName={contactName}
          entityType={entityType}
          entityId={entityId}
        />
      </>
    )
  }

  // Default button variant
  return (
    <>
      <button
        onClick={handleCall}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
          'bg-success-500 text-white hover:bg-success-600 hover:-translate-y-0.5 hover:shadow-md',
          sizeClasses[size],
          className
        )}
      >
        <Phone className={iconSizes[size]} />
        Call {contactName || formattedNumber}
      </button>

      <CallLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        phoneNumber={phoneNumber}
        contactName={contactName}
        entityType={entityType}
        entityId={entityId}
      />
    </>
  )
}

// ============================================
// Phone Number Display with Call Button
// ============================================

export function PhoneDisplay({
  phoneNumber,
  phoneType = 'mobile',
  contactName,
  entityType,
  entityId,
  showLabel = true,
  className,
}: {
  phoneNumber: string
  phoneType?: 'mobile' | 'work' | 'home' | 'fax' | 'other'
  contactName?: string
  entityType?: string
  entityId?: string
  showLabel?: boolean
  className?: string
}) {
  const formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')

  const typeLabels = {
    mobile: 'Mobile',
    work: 'Work',
    home: 'Home',
    fax: 'Fax',
    other: 'Phone',
  }

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div>
        {showLabel && (
          <span className="text-xs text-charcoal-500 uppercase tracking-wider">
            {typeLabels[phoneType]}
          </span>
        )}
        <p className="text-sm text-charcoal-900 font-medium">{formattedNumber}</p>
      </div>
      <ClickToCall
        phoneNumber={phoneNumber}
        contactName={contactName}
        entityType={entityType}
        entityId={entityId}
        variant="icon"
        size="sm"
      />
    </div>
  )
}

// ============================================
// Entity Phone List
// ============================================

export function EntityPhoneList({
  entityType,
  entityId,
  contactId,
  className,
}: {
  entityType: string
  entityId: string
  contactId?: string
  className?: string
}) {
  const { data: phones, isLoading } = trpc.phone.contactPhones.list.useQuery(
    { contactId: contactId ?? entityId },
    { enabled: !!contactId || entityType === 'contact' }
  )

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-2', className)}>
        {[1, 2].map((i) => (
          <div key={i} className="h-12 bg-charcoal-100 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!phones || phones.length === 0) {
    return (
      <div className={cn('text-sm text-charcoal-500 italic', className)}>
        No phone numbers on file
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {phones.map((phone) => (
        <PhoneDisplay
          key={phone.id}
          phoneNumber={phone.phone_number}
          phoneType={phone.phone_type as any}
          entityType={entityType}
          entityId={entityId}
        />
      ))}
    </div>
  )
}

export default ClickToCall
