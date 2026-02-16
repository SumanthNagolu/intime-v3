'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Phone,
  MessageSquare,
  History,
  Settings,
  Plus,
  Search,
  RefreshCw,
  User,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { CallHistory } from '@/components/phone/CallHistory'
import { SMSConversation } from '@/components/phone/SMSConversation'
import { ClickToCall } from '@/components/phone/ClickToCall'
import { formatDistanceToNow } from 'date-fns'

// ============================================
// Types
// ============================================

interface PhoneAccount {
  id: string
  provider: string
  phone_number: string
  display_name?: string
  is_primary: boolean
  status: string
}

interface SMSThread {
  phone_number: string
  contact_name?: string
  contact_id?: string
  last_message: string
  last_message_at: string
  unread_count: number
}

// ============================================
// Tab Navigation
// ============================================

const TABS = [
  { id: 'calls', label: 'Calls', icon: History },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
] as const

// ============================================
// SMS Thread List
// ============================================

function SMSThreadList({
  accountId,
  onSelectThread,
  selectedNumber,
}: {
  accountId: string
  onSelectThread: (thread: SMSThread) => void
  selectedNumber?: string
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: threads, isLoading } = trpc.phone.sms.list.useQuery(
    { accountId, search: searchQuery || undefined },
    { enabled: !!accountId }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-charcoal-300 border-t-charcoal-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-3 border-b border-charcoal-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {!threads || threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-charcoal-500">No messages</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Start a conversation by sending a text
            </p>
          </div>
        ) : (
          threads.map((thread: SMSThread) => (
            <button
              key={thread.phone_number}
              onClick={() => onSelectThread(thread)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 border-b border-charcoal-100 text-left transition-colors',
                selectedNumber === thread.phone_number
                  ? 'bg-gold-50'
                  : 'hover:bg-charcoal-50'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-charcoal-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-charcoal-900 truncate">
                    {thread.contact_name || thread.phone_number}
                  </span>
                  <span className="text-xs text-charcoal-400">
                    {formatDistanceToNow(new Date(thread.last_message_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-charcoal-500 truncate mt-0.5">
                  {thread.last_message}
                </p>
              </div>
              {thread.unread_count > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {thread.unread_count}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-charcoal-300 flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// Connect Phone Panel
// ============================================

function ConnectPhonePanel({ onConnect }: { onConnect: (provider: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-200 flex items-center justify-center mb-6">
        <Phone className="w-10 h-10 text-charcoal-500" />
      </div>
      <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
        Connect Your Phone
      </h2>
      <p className="text-charcoal-500 text-center max-w-md mb-8">
        Connect a phone provider to make calls, send texts, and track all your
        communications with candidates and clients.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => onConnect('twilio')}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-charcoal-200 rounded-xl hover:border-charcoal-300 hover:shadow-md transition-all"
        >
          <span className="w-6 h-6 bg-red-500 rounded text-white text-xs font-bold flex items-center justify-center">
            T
          </span>
          <span className="font-medium text-charcoal-700">Connect Twilio</span>
        </button>

        <button
          onClick={() => onConnect('ringcentral')}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-charcoal-200 rounded-xl hover:border-charcoal-300 hover:shadow-md transition-all"
        >
          <span className="w-6 h-6 bg-orange-500 rounded text-white text-xs font-bold flex items-center justify-center">
            R
          </span>
          <span className="font-medium text-charcoal-700">Connect RingCentral</span>
        </button>

        <button
          onClick={() => onConnect('vonage')}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-charcoal-200 rounded-xl hover:border-charcoal-300 hover:shadow-md transition-all"
        >
          <span className="w-6 h-6 bg-purple-500 rounded text-white text-xs font-bold flex items-center justify-center">
            V
          </span>
          <span className="font-medium text-charcoal-700">Connect Vonage</span>
        </button>
      </div>

      <p className="mt-8 text-xs text-charcoal-400 text-center max-w-sm">
        We integrate with your phone provider to enable click-to-call, call logging,
        and SMS capabilities. Standard carrier rates may apply.
      </p>
    </div>
  )
}

// ============================================
// Main Page
// ============================================

export default function PhonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<'calls' | 'messages'>('calls')
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [selectedSmsNumber, setSelectedSmsNumber] = useState<string | null>(null)
  const [dialNumber, setDialNumber] = useState('')

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = trpc.phone.accounts.list.useQuery(
    undefined,
    {
      onSuccess: (data) => {
        if (data && data.length > 0 && !selectedAccountId) {
          const primary = data.find((a: PhoneAccount) => a.is_primary) || data[0]
          setSelectedAccountId(primary.id)
        }
      },
    }
  )

  // Connect mutation
  const connectMutation = trpc.phone.accounts.connect.useMutation({
    onSuccess: (data) => {
      if (data.setupUrl) {
        window.location.href = data.setupUrl
      }
    },
  })

  const handleConnect = useCallback(
    (provider: string) => {
      connectMutation.mutate({ provider })
    },
    [connectMutation]
  )

  const handleSelectThread = useCallback((thread: SMSThread) => {
    setSelectedSmsNumber(thread.phone_number)
  }, [])

  const handleBackFromSms = useCallback(() => {
    setSelectedSmsNumber(null)
  }, [])

  const handleCall = useCallback((phoneNumber: string) => {
    // Use ClickToCall functionality
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
          <ConnectPhonePanel onConnect={handleConnect} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-charcoal-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-charcoal-900">Phone</h1>

          {/* Tab Navigation */}
          <div className="flex items-center bg-charcoal-100 rounded-lg p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSelectedSmsNumber(null)
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    activeTab === tab.id
                      ? 'bg-white text-charcoal-900 shadow-sm'
                      : 'text-charcoal-600 hover:text-charcoal-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Dial */}
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              placeholder="Enter number..."
              className="w-40 px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            />
            <ClickToCall
              phoneNumber={dialNumber}
              variant="button"
              disabled={!dialNumber}
            />
          </div>

          <button
            onClick={() => router.push('/employee/settings/phone')}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'calls' ? (
          <div className="flex-1 bg-white">
            {selectedAccountId && (
              <CallHistory
                accountId={selectedAccountId}
                className="h-full"
              />
            )}
          </div>
        ) : activeTab === 'messages' ? (
          <div className="flex-1 flex bg-white">
            {selectedSmsNumber && selectedAccountId ? (
              <SMSConversation
                accountId={selectedAccountId}
                phoneNumber={selectedSmsNumber}
                onBack={handleBackFromSms}
                onCall={handleCall}
                className="flex-1"
              />
            ) : selectedAccountId ? (
              <SMSThreadList
                accountId={selectedAccountId}
                onSelectThread={handleSelectThread}
                selectedNumber={selectedSmsNumber || undefined}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-charcoal-500">Select a phone account</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
