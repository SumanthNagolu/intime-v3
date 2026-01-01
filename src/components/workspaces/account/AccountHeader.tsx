'use client'

import * as React from 'react'
import { Building2, ChevronDown, Pencil, Pause, Archive, Megaphone, Download, Play, Star, ExternalLink, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountData } from '@/types/workspace'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface AccountHeaderProps {
  account: AccountData
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  active: { 
    bg: 'bg-success-50', 
    text: 'text-success-700', 
    dot: 'bg-success-500',
    border: 'border-success-200'
  },
  prospect: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    dot: 'bg-blue-500',
    border: 'border-blue-200'
  },
  inactive: { 
    bg: 'bg-charcoal-100', 
    text: 'text-charcoal-600', 
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200'
  },
  churned: { 
    bg: 'bg-error-50', 
    text: 'text-error-700', 
    dot: 'bg-error-500',
    border: 'border-error-200'
  },
  on_hold: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    dot: 'bg-amber-500',
    border: 'border-amber-200'
  },
}

const TIER_CONFIG: Record<string, { bg: string; text: string; icon: typeof Star }> = {
  strategic: { bg: 'bg-gradient-to-r from-gold-100 to-gold-50', text: 'text-gold-800', icon: Star },
  preferred: { bg: 'bg-gradient-to-r from-forest-100 to-forest-50', text: 'text-forest-700', icon: Star },
  standard: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', icon: Star },
}

/**
 * AccountHeader - Premium entity header with visual hierarchy
 * Features: Gradient backgrounds, tier badges, sophisticated actions
 */
export function AccountHeader({ account }: AccountHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)
  
  const statusConfig = STATUS_CONFIG[account.status] || STATUS_CONFIG.inactive
  const tierConfig = TIER_CONFIG[account.tier || 'standard']

  // Format "Since" date
  const sinceDate = account.created_at
    ? new Date(account.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : null

  // Format industry display
  const industryDisplay = account.industries?.length
    ? account.industries[0].replace(/_/g, ' ')
    : account.industry?.replace(/_/g, ' ')

  // Copy account ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(account.id)
    setCopied(true)
    toast({ title: 'Account ID copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle quick actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.push(`/employee/recruiting/accounts/${account.id}/edit`)
        break
      case 'addContact':
        window.dispatchEvent(new CustomEvent('openAccountDialog', { 
          detail: { dialogId: 'addContact', accountId: account.id } 
        }))
        break
      case 'createJob':
        router.push(`/employee/recruiting/jobs/intake?accountId=${account.id}`)
        break
      case 'logActivity':
        window.dispatchEvent(new CustomEvent('openAccountDialog', { 
          detail: { dialogId: 'logActivity', accountId: account.id } 
        }))
        break
      case 'addToCampaign':
        // TODO: Implement add to campaign
        toast({ title: 'Coming soon', description: 'Campaign feature is under development' })
        break
      case 'deactivate':
        // TODO: Implement status change
        toast({ title: 'Coming soon', description: 'Status change feature is under development' })
        break
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-gold-50/20" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-forest-500 via-gold-500 to-forest-500" />
      
      <div className="relative p-6">
        <div className="flex items-start gap-5">
          {/* Icon with gradient */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg shadow-forest-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-forest-500/30 group-hover:scale-105">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            {/* Tier indicator */}
            {account.tier === 'strategic' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/40 animate-pulse-slow">
                <Star className="h-3.5 w-3.5 text-charcoal-900 fill-current" />
              </div>
            )}
            {account.tier === 'preferred' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center shadow-lg">
                <Star className="h-3.5 w-3.5 text-white fill-current" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight truncate">
                {account.name}
              </h1>
              <Badge className={cn(
                'capitalize font-medium px-2.5 py-0.5 flex items-center gap-1.5',
                statusConfig.bg,
                statusConfig.text,
                statusConfig.border
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                {account.status?.replace(/_/g, ' ')}
              </Badge>
              {account.tier && account.tier !== 'standard' && (
                <Badge className={cn(
                  'capitalize font-medium px-2.5 py-0.5',
                  tierConfig.bg,
                  tierConfig.text
                )}>
                  {account.tier}
                </Badge>
              )}
            </div>
            
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-500">
              {industryDisplay && (
                <span className="capitalize font-medium text-charcoal-600">{industryDisplay}</span>
              )}
              {account.headquarters_city && account.headquarters_state && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  {account.headquarters_city}, {account.headquarters_state}
                </span>
              )}
              {sinceDate && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  Since {sinceDate}
                </span>
              )}
              {account.owner && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  Owner: <span className="font-medium text-charcoal-700">{account.owner.full_name}</span>
                </span>
              )}
            </div>

            {/* ID row */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors font-mono"
              >
                <span className="bg-charcoal-100 px-1.5 py-0.5 rounded">ID: {account.id.slice(0, 8)}...</span>
                {copied ? (
                  <Check className="h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {account.website && (
                <a
                  href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAction('edit')}
              className="text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-sm"
                >
                  Actions
                  <ChevronDown className="h-4 w-4 ml-1.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => handleAction('addContact')}>
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center mr-2">
                    <Building2 className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <span>Add Contact</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('createJob')}>
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center mr-2">
                    <Building2 className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <span>Create Job</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('logActivity')}>
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center mr-2">
                    <Building2 className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <span>Log Activity</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction('addToCampaign')}>
                  <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center mr-2">
                    <Megaphone className="h-4 w-4 text-gold-700" />
                  </div>
                  <span>Add to Campaign</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('export')}>
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center mr-2">
                    <Download className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <span>Export Data</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {account.status === 'active' ? (
                  <DropdownMenuItem onClick={() => handleAction('deactivate')} className="text-amber-600 focus:text-amber-700">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mr-2">
                      <Pause className="h-4 w-4 text-amber-600" />
                    </div>
                    <span>Put On Hold</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleAction('activate')} className="text-success-600 focus:text-success-700">
                    <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center mr-2">
                      <Play className="h-4 w-4 text-success-600" />
                    </div>
                    <span>Activate</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountHeader
