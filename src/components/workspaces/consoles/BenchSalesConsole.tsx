/**
 * BenchSalesConsole
 *
 * Role-specific console for bench sales representatives
 * Shows bench consultants, job orders, submissions, and marketing metrics
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  TrendingUp,
  ArrowRight,
  Plus,
  Calendar,
  Award,
  Briefcase,
  Search,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  benchConsultants: 12,
  activeMarketings: 8,
  submissionsThisWeek: 15,
  interviewsScheduled: 4,
  placements: 2,
  placementsTarget: 4,
  avgDaysOnBench: 18,
  responseRate: 24.5,
};

const mockBenchConsultants = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    title: 'Java Full Stack Developer',
    skills: ['Java', 'Spring Boot', 'React', 'AWS'],
    daysOnBench: 5,
    visaStatus: 'H1B',
    location: 'Dallas, TX',
    availability: 'Immediate',
    status: 'active',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    title: 'Data Engineer',
    skills: ['Python', 'Spark', 'Databricks', 'Azure'],
    daysOnBench: 12,
    visaStatus: 'OPT-STEM',
    location: 'Chicago, IL',
    availability: 'Immediate',
    status: 'active',
  },
  {
    id: '3',
    name: 'Arun Patel',
    title: 'DevOps Engineer',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'Jenkins'],
    daysOnBench: 28,
    visaStatus: 'GC-EAD',
    location: 'Remote',
    availability: 'Immediate',
    status: 'urgent',
  },
];

const mockJobOrders = [
  {
    id: '1',
    title: 'Senior Java Developer',
    client: 'TechCorp',
    location: 'Austin, TX',
    rate: '$85-90/hr',
    priority: 'high',
    submissions: 3,
    positions: 2,
  },
  {
    id: '2',
    title: 'Data Analyst',
    client: 'FinanceHub',
    location: 'Remote',
    rate: '$70-80/hr',
    priority: 'normal',
    submissions: 1,
    positions: 1,
  },
];

const mockMarketingActivity = [
  { channel: 'LinkedIn', sent: 45, responses: 12, rate: 26.7 },
  { channel: 'Email', sent: 120, responses: 28, rate: 23.3 },
  { channel: 'Job Boards', sent: 30, responses: 8, rate: 26.7 },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function BenchSalesConsole() {
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
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.benchConsultants}</p>
                <p className="text-sm text-muted-foreground">On Bench</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.submissionsThisWeek}</p>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.interviewsScheduled}</p>
                <p className="text-sm text-muted-foreground">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mockStats.placements}</p>
                <p className="text-sm text-muted-foreground">Placements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bench Consultants */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Bench Consultants
                </CardTitle>
                <Link href="/employee/workspace/talent">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockBenchConsultants.map((consultant) => (
                <Link
                  key={consultant.id}
                  href={`/employee/workspace/talent/${consultant.id}`}
                  className="block"
                >
                  <div className={cn(
                    'p-4 rounded-lg hover:bg-muted/50 transition-colors border',
                    consultant.status === 'urgent' ? 'border-red-200 bg-red-50/30' : 'border-border bg-muted/30'
                  )}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="text-xs">
                            {consultant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{consultant.name}</p>
                          <p className="text-sm text-muted-foreground">{consultant.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={consultant.status === 'urgent' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {consultant.daysOnBench} days
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{consultant.visaStatus}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {consultant.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{consultant.location}</span>
                      <span className="text-green-600">{consultant.availability}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Marketing Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Marketing Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockMarketingActivity.map((channel) => (
              <div key={channel.channel} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{channel.channel}</span>
                  <span className="text-muted-foreground">
                    {channel.responses}/{channel.sent} ({channel.rate}%)
                  </span>
                </div>
                <Progress value={channel.rate} className="h-2" />
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Response Rate</span>
                <span className="font-bold text-green-600">{mockStats.responseRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Job Orders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Active Job Orders
            </CardTitle>
            <Link href="/employee/workspace/job-orders">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockJobOrders.map((job) => (
              <Link
                key={job.id}
                href={`/employee/workspace/job-orders/${job.id}`}
              >
                <div className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.client} • {job.location}
                      </p>
                    </div>
                    <Badge
                      variant={job.priority === 'high' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {job.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">{job.rate}</span>
                    <span className="text-muted-foreground">
                      {job.submissions} of {job.positions} filled
                    </span>
                  </div>
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
              <h1 className="text-xl font-semibold">Bench Sales Console</h1>
              <p className="text-sm text-muted-foreground">
                Manage bench consultants and job order submissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Find Requirements
              </Button>
              <Link href="/employee/workspace/talent">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Consultant
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
            <TabsTrigger value="bench">Bench</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="bench">
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Detailed bench management view</p>
                <Link href="/employee/workspace/talent">
                  <Button className="mt-4">Go to Talent Workspace</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="marketing">
            <Card>
              <CardContent className="py-12 text-center">
                <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Marketing analytics and outreach</p>
                <Link href="/employee/workspace/campaigns">
                  <Button className="mt-4">Go to Campaigns</Button>
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
              { name: 'Talent', icon: Users, href: '/employee/workspace/talent', color: 'text-indigo-600 bg-indigo-100' },
              { name: 'Job Orders', icon: Briefcase, href: '/employee/workspace/job-orders', color: 'text-emerald-600 bg-emerald-100' },
              { name: 'Submissions', icon: FileText, href: '/employee/workspace/submissions', color: 'text-amber-600 bg-amber-100' },
              { name: 'Campaigns', icon: Send, href: '/employee/workspace/campaigns', color: 'text-rose-600 bg-rose-100' },
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
