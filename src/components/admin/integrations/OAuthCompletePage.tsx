'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

const PROVIDER_NAMES: Record<string, string> = {
  google: 'Google',
  microsoft: 'Microsoft 365',
  zoom: 'Zoom',
}

export function OAuthCompletePage() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const error = searchParams.get('error')
  const provider = searchParams.get('provider')
  const email = searchParams.get('email')
  const integrationId = searchParams.get('integrationId')

  const providerName = provider ? PROVIDER_NAMES[provider] || provider : 'OAuth'

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-elevation-md max-w-md w-full p-8 text-center">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-charcoal-900 mb-2">
              Connected Successfully
            </h1>
            <p className="text-charcoal-600 mb-6">
              Your {providerName} account has been connected successfully.
            </p>
            {email && (
              <div className="bg-charcoal-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-charcoal-500 mb-1">Connected Account</p>
                <p className="font-medium text-charcoal-900">{email}</p>
              </div>
            )}
            <div className="space-y-3">
              {integrationId && (
                <Link href={`/employee/admin/integrations/${integrationId}`}>
                  <Button className="w-full bg-hublot-900 hover:bg-hublot-800 text-white">
                    View Integration
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Link href="/employee/admin/integrations">
                <Button variant="outline" className="w-full">
                  Back to Integrations
                </Button>
              </Link>
            </div>
            <p className="text-xs text-charcoal-500 mt-6">
              You can close this window if it does not redirect automatically.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-charcoal-900 mb-2">
              Connection Failed
            </h1>
            <p className="text-charcoal-600 mb-4">
              There was an error connecting your {providerName} account.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
              </div>
            )}
            <div className="space-y-3">
              <Link href="/employee/admin/integrations">
                <Button className="w-full bg-hublot-900 hover:bg-hublot-800 text-white">
                  Back to Integrations
                </Button>
              </Link>
            </div>
            <p className="text-xs text-charcoal-500 mt-6">
              If this problem persists, please contact support.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
