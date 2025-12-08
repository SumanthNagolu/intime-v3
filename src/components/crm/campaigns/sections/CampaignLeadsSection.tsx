'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExternalLink, TrendingUp, Calendar, DollarSign, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface CampaignLeadsSectionProps {
  campaignId: string
}

export function CampaignLeadsSection({ campaignId }: CampaignLeadsSectionProps) {
  // Fetch leads generated from this campaign
  const { data: leads, isLoading } = trpc.crm.leads.listByCampaign.useQuery({
    campaignId,
  })

  // Lead statistics
  const stats = {
    total: leads?.length || 0,
    qualified: leads?.filter((l: { lead_status: string }) => l.lead_status === 'qualified').length || 0,
    converted: leads?.filter((l: { converted_to_deal_id?: string }) => l.converted_to_deal_id).length || 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-charcoal-500" />
              <span className="text-sm text-charcoal-500">Total Leads</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm text-charcoal-500">Qualified</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.qualified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gold-500" />
              <span className="text-sm text-charcoal-500">Converted to Deal</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.converted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.map((lead: {
                id: string
                first_name?: string
                last_name?: string
                company_name?: string
                lead_status: string
                lead_score?: number
                created_at: string
              }) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.first_name} {lead.last_name}</TableCell>
                  <TableCell>{lead.company_name}</TableCell>
                  <TableCell>
                    <Badge variant={lead.lead_status === 'qualified' ? 'default' : 'secondary'}>
                      {lead.lead_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.lead_score ?? 0}/100</TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/employee/crm/leads/${lead.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!leads || leads.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-charcoal-500 py-8">
                    No leads generated from this campaign yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
