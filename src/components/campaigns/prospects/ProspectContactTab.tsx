'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Linkedin,
  ExternalLink,
  MoreHorizontal,
  Edit2,
  UserMinus,
  MessageSquare,
  PhoneCall,
  StickyNote,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CampaignProspect, ProspectStatus } from '@/types/campaign'

interface ProspectContactTabProps {
  prospect: CampaignProspect
  onStatusChange?: (status: ProspectStatus) => void
  onLogActivity?: (type: 'email' | 'call' | 'linkedin' | 'note') => void
  onEdit?: () => void
  onRemove?: () => void
  isUpdating?: boolean
}

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  enrolled: { label: 'Enrolled', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Clock },
  contacted: { label: 'Contacted', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Send },
  engaged: { label: 'Engaged', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: MessageSquare },
  responded: { label: 'Responded', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
  converted: { label: 'Converted', color: 'text-gold-700', bg: 'bg-gold-50 border-gold-200', icon: CheckCircle },
  opted_out: { label: 'Opted Out', color: 'text-charcoal-600', bg: 'bg-charcoal-100 border-charcoal-200', icon: AlertCircle },
  bounced: { label: 'Bounced', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertCircle },
}

/**
 * ProspectContactTab - Enterprise-grade contact information for a campaign prospect
 *
 * Features:
 * - Quick action buttons (Email, Call, LinkedIn, Note)
 * - Status change dropdown
 * - Edit and Remove options
 * - Link to full contact record
 * - Rich contact display with badges
 */
export function ProspectContactTab({
  prospect,
  onStatusChange,
  onLogActivity,
  onEdit,
  onRemove,
  isUpdating,
}: ProspectContactTabProps) {
  const fullName = [prospect.firstName, prospect.lastName].filter(Boolean).join(' ') || 'Unknown'
  const statusConfig = STATUS_CONFIG[prospect.status] || STATUS_CONFIG.enrolled
  const StatusIcon = statusConfig.icon

  return (
    <div className="py-4 space-y-5">
      {/* Quick Actions Bar */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => onLogActivity?.('email')}
          disabled={!prospect.email}
        >
          <Mail className="w-4 h-4 mr-1.5" />
          Email
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => onLogActivity?.('call')}
          disabled={!prospect.phone}
        >
          <PhoneCall className="w-4 h-4 mr-1.5" />
          Call
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9"
          onClick={() => onLogActivity?.('linkedin')}
        >
          <Linkedin className="w-4 h-4 mr-1.5" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-2"
          onClick={() => onLogActivity?.('note')}
        >
          <StickyNote className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 px-2">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Prospect
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/employee/crm/contacts/${prospect.contactId}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Contact
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRemove}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Remove from Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Change */}
      <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
          <span className="text-sm font-medium text-charcoal-700">Status</span>
        </div>
        <Select
          value={prospect.status}
          onValueChange={(value) => onStatusChange?.(value as ProspectStatus)}
          disabled={isUpdating || prospect.status === 'converted'}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="opted_out">Opted Out</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contact Card */}
      <div className="border border-charcoal-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-charcoal-50 border-b border-charcoal-200">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-charcoal-900">{fullName}</h4>
            <Badge className={cn('border', statusConfig.bg, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
          {prospect.title && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-charcoal-600">
              <Briefcase className="w-3.5 h-3.5 text-charcoal-400" />
              <span>{prospect.title}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          {/* Company */}
          {prospect.companyName && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-charcoal-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider">Company</p>
                <p className="text-sm font-medium text-charcoal-900">{prospect.companyName}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {prospect.email && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-charcoal-400 uppercase tracking-wider">Email</p>
                <a
                  href={`mailto:${prospect.email}`}
                  className="text-sm font-medium text-blue-600 hover:underline truncate block"
                >
                  {prospect.email}
                </a>
              </div>
            </div>
          )}

          {/* Phone */}
          {prospect.phone && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider">Phone</p>
                <a
                  href={`tel:${prospect.phone}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {prospect.phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-charcoal-50 rounded-lg">
          <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Enrolled</p>
          <p className="text-sm font-medium text-charcoal-900">
            {prospect.enrolledAt
              ? format(new Date(prospect.enrolledAt), 'MMM d, yyyy')
              : '—'}
          </p>
        </div>
        <div className="p-3 bg-charcoal-50 rounded-lg">
          <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Score</p>
          <p className={cn(
            'text-sm font-bold',
            (prospect.engagementScore || 0) >= 70 ? 'text-green-600' :
            (prospect.engagementScore || 0) >= 40 ? 'text-amber-600' : 'text-charcoal-500'
          )}>
            {prospect.engagementScore || 0}/100
          </p>
        </div>
      </div>

      {/* View Full Contact Link */}
      <Link
        href={`/employee/crm/contacts/${prospect.contactId}`}
        className="flex items-center justify-center gap-2 py-2.5 text-sm text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50 rounded-lg transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        View Full Contact Record
      </Link>
    </div>
  )
}
