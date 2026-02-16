'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar as CalendarIcon,
  Plus,
  Settings,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { CalendarView } from '@/components/calendar/CalendarView'
import { EventModal } from '@/components/calendar/EventModal'

// ============================================
// Types
// ============================================

interface CalendarAccount {
  id: string
  provider: string
  email_address: string
  display_name?: string
  is_primary: boolean
  sync_status: string
  last_synced_at?: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  location?: string
  meeting_url?: string
  attendees: Array<{ email: string; name?: string; status: string }>
  event_type: 'meeting' | 'interview' | 'reminder' | 'block' | 'other'
  is_recurring: boolean
  entity_links: Array<{ entity_type: string; entity_id: string; entity_name: string }>
}

// ============================================
// OAuth Connection Panel
// ============================================

function ConnectCalendarPanel({ onConnect }: { onConnect: (provider: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-200 flex items-center justify-center mb-6">
        <CalendarIcon className="w-10 h-10 text-charcoal-500" />
      </div>
      <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
        Connect Your Calendar
      </h2>
      <p className="text-charcoal-500 text-center max-w-md mb-8">
        Link your calendar to schedule interviews, track meetings, and stay organized
        with your recruiting activities.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => onConnect('google')}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-charcoal-200 rounded-xl hover:border-charcoal-300 hover:shadow-md transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium text-charcoal-700">Connect Google Calendar</span>
        </button>

        <button
          onClick={() => onConnect('outlook')}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-charcoal-200 rounded-xl hover:border-charcoal-300 hover:shadow-md transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#0078D4" d="M0 0h11.5v11.5H0z" />
            <path fill="#0078D4" d="M12.5 0H24v11.5H12.5z" />
            <path fill="#0078D4" d="M0 12.5h11.5V24H0z" />
            <path fill="#0078D4" d="M12.5 12.5H24V24H12.5z" />
          </svg>
          <span className="font-medium text-charcoal-700">Connect Outlook Calendar</span>
        </button>
      </div>

      <p className="mt-8 text-xs text-charcoal-400 text-center max-w-sm">
        We only request access to view and manage calendar events. Your data is never
        shared and you can disconnect at any time.
      </p>
    </div>
  )
}

// ============================================
// Account Selector
// ============================================

function AccountSelector({
  accounts,
  selectedId,
  onSelect,
}: {
  accounts: CalendarAccount[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (accounts.length === 0) return null

  if (accounts.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-charcoal-50 rounded-lg">
        <CalendarIcon className="w-4 h-4 text-charcoal-500" />
        <span className="text-sm text-charcoal-700">{accounts[0].email_address}</span>
      </div>
    )
  }

  return (
    <select
      value={selectedId || ''}
      onChange={(e) => onSelect(e.target.value)}
      className="px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
    >
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.email_address}
        </option>
      ))}
    </select>
  )
}

// ============================================
// Main Page
// ============================================

export default function CalendarPage() {
  const router = useRouter()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    event?: CalendarEvent | null
    defaultDate?: Date
  }>({ isOpen: false })

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = trpc.calendar.accounts.list.useQuery(
    undefined,
    {
      onSuccess: (data) => {
        if (data && data.length > 0 && !selectedAccountId) {
          const primary = data.find((a: CalendarAccount) => a.is_primary) || data[0]
          setSelectedAccountId(primary.id)
        }
      },
    }
  )

  // Sync mutation
  const syncMutation = trpc.calendar.accounts.sync.useMutation()

  // OAuth connect
  const connectMutation = trpc.calendar.accounts.connect.useMutation({
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    },
  })

  const handleConnect = useCallback(
    (provider: string) => {
      connectMutation.mutate({ provider })
    },
    [connectMutation]
  )

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setModalState({ isOpen: true, event })
  }, [])

  const handleCreateEvent = useCallback((date: Date) => {
    setModalState({ isOpen: true, event: null, defaultDate: date })
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false })
  }, [])

  // Loading state
  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-6 h-6 text-charcoal-400 animate-spin" />
      </div>
    )
  }

  // No accounts - show connect panel
  if (!accounts || accounts.length === 0) {
    return (
      <div className="h-full bg-cream">
        <div className="max-w-2xl mx-auto pt-16">
          <ConnectCalendarPanel onConnect={handleConnect} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-charcoal-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-charcoal-900">Calendar</h1>
          <AccountSelector
            accounts={accounts as CalendarAccount[]}
            selectedId={selectedAccountId}
            onSelect={setSelectedAccountId}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => selectedAccountId && syncMutation.mutate({ accountId: selectedAccountId })}
            disabled={syncMutation.isPending}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={cn('w-5 h-5', syncMutation.isPending && 'animate-spin')} />
          </button>
          <button
            onClick={() => router.push('/employee/settings/calendar')}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden p-4">
        {selectedAccountId ? (
          <CalendarView
            accountId={selectedAccountId}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            className="h-full rounded-xl border border-charcoal-200 shadow-sm"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-charcoal-500">Select a calendar account</p>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {modalState.isOpen && selectedAccountId && (
        <EventModal
          accountId={selectedAccountId}
          event={modalState.event}
          defaultDate={modalState.defaultDate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
