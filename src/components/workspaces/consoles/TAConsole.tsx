/**
 * TAConsole (Talent Acquisition Console)
 *
 * Role-specific console for Talent Acquisition specialists
 * Shows campaigns, leads, sourcing metrics, and pipeline
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Target,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Search,
  Send,
  Eye,
  MessageSquare,
  UserPlus,
  BarChart3,
  Calendar,
  Mail,
  Linkedin,
  CheckCircle,
  Clock,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// =====================================================
// MOCK DATA
// =====================================================

const mockStats = {
  activeCampaigns: 5,
  totalReached: 1250,
  responses: 187,
  conversions: 42,
  responseRate: 14.96,
  conversionRate: 3.36,
  leadsGenerated: 89,
  meetingsBooked: 23,
};

const mockCampaigns = [
  {
    id: '1',
    name: 'Senior React Engineers - Q1',
    status: 'active',
    channel: 'combined',
    reached: 342,
    responses: 58,
    conversions: 12,
    responseRate: 16.96,
  },
  {
    id: '2',
    name: 'DevOps Engineers - Bay Area',
    status: 'active',
    channel: 'linkedin',
    reached: 215,
    responses: 28,
    conversions: 6,
    responseRate: 13.02,
  },
  {
    id: '3',
    name: 'Data Scientists Outreach',
    status: 'paused',
    channel: 'email',
    reached: 189,
    responses: 22,
    conversions: 4,
    responseRate: 11.64,
  },
];

const mockLeads = [
  {
    id: '1',
    name: 'CloudTech Solutions',
    contact: 'John Smith',
    title: 'VP of Engineering',
    status: 'qualified',
    source: 'LinkedIn Campaign',
    lastContact: '2 days ago',
  },
  {
    id: '2',
    name: 'DataFlow Inc',
    contact: 'Sarah Johnson',
    title: 'CTO',
    status: 'meeting_scheduled',
    source: 'Email Outreach',
    lastContact: '1 day ago',
  },
  {
    id: '3',
    name: 'TechVentures',
    contact: 'Mike Chen',
    title: 'Director of Recruiting',
    status: 'new',
    source: 'Referral',
    lastContact: 'Today',
  },
];

const mockChannelPerformance = [
  { channel: 'LinkedIn', icon: Linkedin, sent: 450, responses: 85, rate: 18.9, color: 'text-[#0A66C2]' },
  { channel: 'Email', icon: Mail, sent: 620, responses: 78, rate: 12.6, color: 'text-blue-600' },
  { channel: 'Job Boards', icon: Globe, sent: 180, responses: 24, rate: 13.3, color: 'text-purple-600' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function TAConsole() {
  const [activeTab, setActiveTab] = useState('overview');

  // =====================================================
  // OVERVIEW TAB
  // =====================================================

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.activeCampaigns}</p>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.totalReached}</p>
                <p className="text-sm text-muted-foreground">Total Reached</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.responseRate}%</p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.conversions}</p>
                <p className="text-sm text-muted-foreground">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  Active Campaigns
                </CardTitle>
                <Link href="/employee/workspace/campaigns">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/employee/workspace/campaigns/${campaign.id}`}
                  className="block"
                >
                  <div className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {campaign.channel === 'linkedin' && <Linkedin className="w-3 h-3" />}
                          {campaign.channel === 'email' && <Mail className="w-3 h-3" />}
                          {campaign.channel === 'combined' && <Globe className="w-3 h-3" />}
                          <span className="capitalize">{campaign.channel}</span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          'text-xs',
                          campaign.status === 'active' && 'bg-green-100 text-green-700',
                          campaign.status === 'paused' && 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <p className="font-bold">{campaign.reached}</p>
                        <p className="text-xs text-muted-foreground">Reached</p>
                      </div>
                      <div>
                        <p className="font-bold">{campaign.responses}</p>
                        <p className="text-xs text-muted-foreground">Responses</p>
                      </div>
                      <div>
                        <p className="font-bold">{campaign.conversions}</p>
                        <p className="text-xs text-muted-foreground">Conversions</p>
                      </div>
                      <div>
                        <p className="font-bold text-green-600">{campaign.responseRate}%</p>
                        <p className="text-xs text-muted-foreground">Rate</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Channel Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockChannelPerformance.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.channel} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', channel.color)} />
                      <span className="font-medium">{channel.channel}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {channel.rate}%
                    </span>
                  </div>
                  <Progress value={channel.rate * 3} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{channel.sent} sent</span>
                    <span>{channel.responses} responses</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Recent Leads
            </CardTitle>
            <Link href="/employee/workspace/leads">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/employee/workspace/leads/${lead.id}`}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="text-xs">
                      {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.contact} - {lead.title}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    className={cn(
                      'text-xs',
                      lead.status === 'qualified' && 'bg-green-100 text-green-700',
                      lead.status === 'meeting_scheduled' && 'bg-blue-100 text-blue-700',
                      lead.status === 'new' && 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {lead.status.replace('_', ' ')}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{lead.lastContact}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Talent Acquisition Console</h1>
              <p className="text-sm text-muted-foreground">
                Manage campaigns, leads, and sourcing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Find Talent
              </Button>
              <Link href="/employee/workspace/campaigns">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="campaigns">
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Detailed campaign management</p>
                <Link href="/employee/workspace/campaigns">
                  <Button className="mt-4">Go to Campaigns Workspace</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="leads">
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Lead management and qualification</p>
                <Link href="/employee/workspace/leads">
                  <Button className="mt-4">Go to Leads Workspace</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Campaigns', icon: Megaphone, href: '/employee/workspace/campaigns', color: 'text-rose-600 bg-rose-100' },
              { name: 'Leads', icon: Target, href: '/employee/workspace/leads', color: 'text-amber-600 bg-amber-100' },
              { name: 'Contacts', icon: Users, href: '/employee/workspace/contacts', color: 'text-purple-600 bg-purple-100' },
              { name: 'Deals', icon: TrendingUp, href: '/employee/workspace/deals', color: 'text-green-600 bg-green-100' },
            ].map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6 flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
