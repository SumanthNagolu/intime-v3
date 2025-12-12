'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Key,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Clock,
  Activity,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

type ApiToken = {
  id: string
  name: string
  token_prefix: string
  scopes: string[]
  expires_at: string | null
  last_used_at: string | null
  usage_count: number
  created_at: string
  revoked_at: string | null
  creator: { full_name: string }[] | null
}

type GeneratedToken = {
  id: string
  token: string
  name: string
  scopes: string[]
}

const AVAILABLE_SCOPES = [
  { value: 'read:users', label: 'Read Users' },
  { value: 'write:users', label: 'Write Users' },
  { value: 'read:jobs', label: 'Read Jobs' },
  { value: 'write:jobs', label: 'Write Jobs' },
  { value: 'read:candidates', label: 'Read Candidates' },
  { value: 'write:candidates', label: 'Write Candidates' },
  { value: 'read:submissions', label: 'Read Submissions' },
  { value: 'write:submissions', label: 'Write Submissions' },
  { value: 'read:reports', label: 'Read Reports' },
  { value: 'admin', label: 'Full Admin Access' },
]

export function ApiTokensPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [generatedToken, setGeneratedToken] = useState<GeneratedToken | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formScopes, setFormScopes] = useState<string[]>([])
  const [formExpiresAt, setFormExpiresAt] = useState('')

  const { toast } = useToast()

  const tokensQuery = trpc.permissions.listTokens.useQuery()

  const generateMutation = trpc.permissions.generateToken.useMutation({
    onSuccess: (data) => {
      tokensQuery.refetch()
      setIsCreateOpen(false)
      setGeneratedToken(data as GeneratedToken)
      resetForm()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate token',
        variant: 'error',
      })
    },
  })

  const revokeMutation = trpc.permissions.revokeToken.useMutation({
    onSuccess: () => {
      tokensQuery.refetch()
      setRevokeId(null)
      toast({
        title: 'Token Revoked',
        description: 'The API token has been revoked and can no longer be used.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke token',
        variant: 'error',
      })
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'API Tokens' },
  ]

  const resetForm = () => {
    setFormName('')
    setFormScopes([])
    setFormExpiresAt('')
  }

  const handleCreate = () => {
    if (!formName || formScopes.length === 0) return

    generateMutation.mutate({
      name: formName,
      scopes: formScopes,
      expiresAt: formExpiresAt || undefined,
    })
  }

  const handleCopyToken = async () => {
    if (!generatedToken?.token) return
    await navigator.clipboard.writeText(generatedToken.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleScope = (scope: string) => {
    setFormScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
  }

  const activeTokens = tokensQuery.data?.filter((t: ApiToken) => !t.revoked_at) || []
  const revokedTokens = tokensQuery.data?.filter((t: ApiToken) => t.revoked_at) || []

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <DashboardShell
      title="API Tokens"
      description="Manage API tokens for programmatic access"
      breadcrumbs={breadcrumbs}
      actions={
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-hublot-900 hover:bg-hublot-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Token
        </Button>
      }
    >
      <DashboardSection>
        {/* Active Tokens */}
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Active Tokens</h3>
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden mb-8">
          {tokensQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : tokensQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load tokens. Please try again.
            </div>
          ) : activeTokens.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Key className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No API tokens</h3>
              <p className="text-charcoal-500 mb-4">
                Generate an API token to enable programmatic access to your data.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Token
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal-50 border-b border-charcoal-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Token
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Scopes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Expires
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeTokens.map((token: ApiToken, idx: number) => (
                  <tr
                    key={token.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-charcoal-25'} ${
                      isExpired(token.expires_at) ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal-900">{token.name}</div>
                      <div className="text-xs text-charcoal-500">
                        by {token.creator?.[0]?.full_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm text-charcoal-600 bg-charcoal-100 px-2 py-1 rounded">
                        itk_{token.token_prefix}...
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {token.scopes.slice(0, 3).map((scope) => (
                          <span
                            key={scope}
                            className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                          >
                            {scope}
                          </span>
                        ))}
                        {token.scopes.length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal-100 text-charcoal-600">
                            +{token.scopes.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-charcoal-400" />
                        <span>{token.usage_count.toLocaleString()} calls</span>
                      </div>
                      {token.last_used_at && (
                        <div className="text-xs text-charcoal-500 mt-1">
                          Last: {format(new Date(token.last_used_at), 'MMM d, HH:mm')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {token.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          <span
                            className={`text-sm ${
                              isExpired(token.expires_at)
                                ? 'text-red-600'
                                : 'text-charcoal-600'
                            }`}
                          >
                            {isExpired(token.expires_at)
                              ? 'Expired'
                              : format(new Date(token.expires_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-charcoal-500">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRevokeId(token.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Revoked Tokens */}
        {revokedTokens.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Revoked Tokens</h3>
            <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden opacity-60">
              <table className="w-full">
                <tbody>
                  {revokedTokens.map((token: ApiToken, idx: number) => (
                    <tr key={token.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-charcoal-25'}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-charcoal-600 line-through">
                          {token.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-sm text-charcoal-400">
                          itk_{token.token_prefix}...
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Revoked
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DashboardSection>

      {/* Generate Token Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate API Token</DialogTitle>
            <DialogDescription>
              Create a new API token for programmatic access. The token will only be shown
              once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Token Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., CI/CD Pipeline, Integration"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Scopes</Label>
              <p className="text-xs text-charcoal-500 mb-2">
                Select the permissions this token should have.
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {AVAILABLE_SCOPES.map((scope) => (
                  <label
                    key={scope.value}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      formScopes.includes(scope.value)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-charcoal-50 border border-transparent hover:bg-charcoal-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formScopes.includes(scope.value)}
                      onChange={() => toggleScope(scope.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{scope.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Expires (optional)</Label>
              <Input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formName || formScopes.length === 0 || generateMutation.isPending}
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Token'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token Generated Dialog */}
      <Dialog open={!!generatedToken} onOpenChange={() => setGeneratedToken(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-green-500" />
              Token Generated
            </DialogTitle>
            <DialogDescription>
              Copy your API token now. You won&apos;t be able to see it again!
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-charcoal-900 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm text-green-400 break-all">{generatedToken?.token}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToken}
                  className="text-white hover:bg-charcoal-800 flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Important:</strong> This token will not be shown again. Make sure to
                copy and store it securely.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setGeneratedToken(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Revoke API Token
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this token? Any integrations using this token
              will immediately stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeId && revokeMutation.mutate({ id: revokeId })}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? 'Revoking...' : 'Revoke Token'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
