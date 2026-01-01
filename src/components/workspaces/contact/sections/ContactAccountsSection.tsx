'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, ExternalLink } from 'lucide-react'
import type { ContactAccount } from '@/types/workspace'
import Link from 'next/link'

interface ContactAccountsSectionProps {
  accounts: ContactAccount[]
  contactId: string
}

/**
 * ContactAccountsSection - Shows linked accounts with roles
 */
export function ContactAccountsSection({ accounts, contactId }: ContactAccountsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Linked Accounts ({accounts.length})
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Link Account
          </Button>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="py-8 text-center text-charcoal-500">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
              <p>No linked accounts</p>
              <p className="text-sm mt-1">Link this contact to an account to track the relationship.</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {accounts.map((account) => (
                <div key={account.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-charcoal-900 flex items-center gap-2">
                        {account.name}
                        {account.isPrimary && (
                          <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded">Primary</span>
                        )}
                      </div>
                      <div className="text-sm text-charcoal-500">
                        {account.role}
                        {account.industry && ` \u2022 ${account.industry}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      account.status === 'active' ? 'bg-success-100 text-success-700' :
                      'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {account.status}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/employee/recruiting/accounts/${account.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactAccountsSection
