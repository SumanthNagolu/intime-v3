'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Mail,
  Plus,
  Settings,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { EmailInbox } from '@/components/email/EmailInbox'
import { EmailThread } from '@/components/email/EmailThread'
import { EmailCompose, useEmailCompose } from '@/components/email/index'

// ============================================
// Types
// ============================================

interface EmailAccount {
  id: string
  provider: string
  email_address: string
  display_name?: string
  is_primary: boolean
  sync_status: string
  last_synced_at?: string
}

interface EmailMessage {
  id: string
  thread_id: string
  from_name: string
  from_email: string
  to: Array<{ name: string; email: string }>
  cc?: Array<{ name: string; email: string }>
  subject: string
  body_text: string
  body_html?: string
  attachments: Array<{
    id: string
    filename: string
    mime_type: string
    size: number
  }>
  sent_at: string
  is_read: boolean
}

// ============================================
// Account Selector
// ============================================

function AccountSelector({
  accounts,
  selectedId,
  onSelect,
}: {
  accounts: EmailAccount[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (accounts.length === 0) return null

  if (accounts.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-charcoal-50 rounded-lg">
        <Mail className="w-4 h-4 text-charcoal-500" />
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
// OAuth Connection Panel
// ============================================

function ConnectEmailPanel({ onConnect }: { onConnect: (provider: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-200 flex items-center justify-center mb-6">
        <Mail className="w-10 h-10 text-charcoal-500" />
      </div>
      <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
        Connect Your Email
      </h2>
      <p className="text-charcoal-500 text-center max-w-md mb-8">
        Link your email account to send messages, track conversations, and automatically
        connect communications to your contacts and jobs.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => onConnect('gmail')}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-charcoal-200 rounded-xl hover:border-charcoal-300 hover:shadow-md transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
            />
            <path
              fill="#34A853"
              d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
            />
            <path
              fill="#4A90E2"
              d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
            />
            <path
              fill="#FBBC05"
              d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
            />
          </svg>
          <span className="font-medium text-charcoal-700">Connect Gmail</span>
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
          <span className="font-medium text-charcoal-700">Connect Outlook</span>
        </button>
      </div>

      <p className="mt-8 text-xs text-charcoal-400 text-center max-w-sm">
        We only request access to read and send emails. Your data is never shared and you
        can disconnect at any time.
      </p>
    </div>
  )
}

// ============================================
// Main Page
// ============================================

export default function EmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const threadId = searchParams.get('thread')

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const emailCompose = useEmailCompose()

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = trpc.email.accounts.list.useQuery(
    undefined,
    {
      onSuccess: (data) => {
        if (data && data.length > 0 && !selectedAccountId) {
          const primary = data.find((a: EmailAccount) => a.is_primary) || data[0]
          setSelectedAccountId(primary.id)
        }
      },
    }
  )

  // Sync mutation
  const syncMutation = trpc.email.accounts.sync.useMutation()

  // OAuth connect
  const connectMutation = trpc.email.accounts.connect.useMutation({
    onSuccess: (data) => {
      // Redirect to OAuth URL
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

  const handleThreadSelect = useCallback(
    (thread: { id: string }) => {
      router.push(`/employee/email?thread=${thread.id}`)
    },
    [router]
  )

  const handleBack = useCallback(() => {
    router.push('/employee/email')
  }, [router])

  const handleCompose = useCallback(
    (mode: 'reply' | 'replyAll' | 'forward', message: EmailMessage) => {
      emailCompose.open({
        mode,
        replyTo: {
          messageId: message.id,
          threadId: message.thread_id,
          subject: message.subject,
          from: { name: message.from_name, email: message.from_email },
          to: message.to,
          cc: message.cc,
        },
      })
    },
    [emailCompose]
  )

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
          <ConnectEmailPanel onConnect={handleConnect} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-charcoal-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-charcoal-900">Email</h1>
          <AccountSelector
            accounts={accounts as EmailAccount[]}
            selectedId={selectedAccountId}
            onSelect={setSelectedAccountId}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => emailCompose.open()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-900 text-white rounded-lg hover:bg-charcoal-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Compose
          </button>
          <button
            onClick={() => selectedAccountId && syncMutation.mutate({ accountId: selectedAccountId })}
            disabled={syncMutation.isPending}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={cn('w-5 h-5', syncMutation.isPending && 'animate-spin')} />
          </button>
          <button
            onClick={() => router.push('/employee/settings/email')}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {threadId && selectedAccountId ? (
          <EmailThread
            accountId={selectedAccountId}
            threadId={threadId}
            onBack={handleBack}
            onCompose={handleCompose}
            className="flex-1 bg-white"
          />
        ) : selectedAccountId ? (
          <EmailInbox
            accountId={selectedAccountId}
            onThreadSelect={handleThreadSelect}
            selectedThreadId={threadId || undefined}
            className="flex-1 bg-white"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-charcoal-500">Select an email account</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {emailCompose.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-xl shadow-xl overflow-hidden">
            <EmailCompose
              accountId={selectedAccountId || undefined}
              mode={emailCompose.mode}
              replyTo={emailCompose.replyTo}
              onClose={emailCompose.close}
              onSend={async (data) => {
                // Handle send
                emailCompose.close()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
