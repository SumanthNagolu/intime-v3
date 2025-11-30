/**
 * RecruiterConsole
 *
 * Role-specific console for recruiters
 * Shows jobs, submissions, candidates, and pipeline metrics
 * Connected to real database via tRPC
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  FileText,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
  Calendar,
  DollarSign,
  Award,
  Activity,
  Zap,
  UserCheck,
  Building2,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

// =====================================================
// TYPES & CONSTANTS
// =====================================================

const PIPELINE_STAGES = [
  { id: 'sourced', label: 'Sourced', color: 'bg-stone-500' },
  { id: 'screening', label: 'Screening', color: 'bg-blue-500' },
  { id: 'submitted', label: 'Submitted', color: 'bg-amber-500' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-500' },
  { id: 'offer', label: 'Offer', color: 'bg-cyan-500' },
  { id: 'placed', label: 'Placed', color: 'bg-green-500' },
] as const;

// Default stats for loading/error states
const defaultStats = {
  activeJobs: 0,
  inPipeline: 0,
  interviews: 0,
  placementsMTD: 0,
  conversionRate: 0,
  avgTimeToFill: 0,
};

// Default pipeline for loading/error states
const defaultPipeline = [
  { stage: 'sourced', count: 0 },
  { stage: 'screening', count: 0 },
  { stage: 'submitted', count: 0 },
  { stage: 'interview', count: 0 },
  { stage: 'offer', count: 0 },
  { stage: 'placed', count: 0 },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export function RecruiterConsole() {
  const [activeTab, setActiveTab] = useState('overview');
  const [newTaskText, setNewTaskText] = useState('');

  // tRPC queries for dashboard data
  const { data: metrics, isLoading: metricsLoading } = trpc.workspace.metrics.useQuery({});
  const { data: pipeline, isLoading: pipelineLoading } = trpc.workspace.pipeline.useQuery({});
  const { data: priorityJobs, isLoading: jobsLoading } = trpc.workspace.priorityJobs.useQuery({ limit: 5 });
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.workspace.tasks.useQuery({ limit: 10 });
  const { data: recentSubmissions, isLoading: submissionsLoading } = trpc.workspace.recentSubmissions.useQuery({ limit: 5 });

  // Mutations
  const toggleTaskMutation = trpc.workspace.toggleTask.useMutation({
    onSuccess: () => refetchTasks(),
  });
  const createTaskMutation = trpc.workspace.createTask.useMutation({
    onSuccess: () => {
      refetchTasks();
      setNewTaskText('');
    },
  });

  // Use defaults if data not loaded
  const stats = metrics || defaultStats;
  const pipelineData = pipeline || defaultPipeline;
  const jobsList = priorityJobs || [];
  const tasksList = tasks || [];
  const submissionsList = recentSubmissions || [];

  const isLoading = metricsLoading || pipelineLoading;

  const toggleTask = (id: string) => {
    toggleTaskMutation.mutate({ taskId: id });
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      createTaskMutation.mutate({
        subject: newTaskText.trim(),
        priority: 'medium',
        dueDate: new Date(),
      });
    }
  };

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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                {metricsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-3xl font-bold">{stats.activeJobs}</p>
                )}
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                {metricsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-3xl font-bold">{stats.inPipeline}</p>
                )}
                <p className="text-sm text-muted-foreground">In Pipeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                {metricsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-3xl font-bold">{stats.interviews}</p>
                )}
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
                {metricsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-3xl font-bold">{stats.placementsMTD}</p>
                )}
                <p className="text-sm text-muted-foreground">Placements MTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Submission Pipeline</CardTitle>
            </div>
            <Link href="/employee/workspace/submissions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {pipelineLoading ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {pipelineData.map((stage, i) => {
                const config = PIPELINE_STAGES.find(s => s.id === stage.stage);
                const totalWidth = pipelineData.reduce((acc, s) => acc + s.count, 0) || 1;
                const widthPercent = Math.max((stage.count / totalWidth) * 100, 8);

                return (
                  <div key={stage.stage} className="flex-1 min-w-0" style={{ flex: widthPercent }}>
                    <div className={cn(
                      'h-12 flex items-center justify-center text-white font-medium text-sm',
                      config?.color,
                      i === 0 && 'rounded-l-lg',
                      i === pipelineData.length - 1 && 'rounded-r-lg'
                    )}>
                      {stage.count}
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1 truncate">
                      {config?.label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Priority Jobs</CardTitle>
                <Link href="/employee/workspace/jobs">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active jobs found</p>
                </div>
              ) : (
                jobsList.map((job) => (
                  <Link
                    key={job.id}
                    href={`/employee/workspace/jobs/${job.id}`}
                    className="block"
                  >
                    <div className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {job.account || 'No Account'}
                            <span className="text-muted-foreground/50">•</span>
                            {job.location}
                          </div>
                        </div>
                        <Badge
                          variant={job.priority === 'urgent' ? 'destructive' : job.priority === 'high' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {job.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {job.submissions} submissions • {job.daysOpen} days open
                        </span>
                        {job.targetRate && (
                          <span className="font-medium text-green-600">{job.targetRate}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today's Tasks
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {tasksList.filter(t => !t.done).length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : tasksList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-sm">No tasks for today</p>
              </div>
            ) : (
              tasksList.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border',
                    task.done
                      ? 'bg-muted/30 text-muted-foreground line-through border-transparent'
                      : 'bg-background hover:bg-muted/30 border-border',
                    toggleTaskMutation.isPending && 'opacity-50 pointer-events-none'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                    task.done
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/30'
                  )}>
                    {task.done && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <span className="text-sm flex-1">{task.text}</span>
                  {!task.done && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        task.priority === 'high' && 'border-red-200 text-red-600',
                        task.priority === 'urgent' && 'border-red-200 text-red-600',
                        task.priority === 'medium' && 'border-amber-200 text-amber-600',
                        task.priority === 'low' && 'border-stone-200 text-stone-500'
                      )}
                    >
                      {task.priority}
                    </Badge>
                  )}
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full mt-2"
              size="sm"
              onClick={handleAddTask}
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Task
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Submissions</CardTitle>
            <Link href="/employee/workspace/submissions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : submissionsList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissionsList.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/employee/workspace/submissions/${sub.id}`}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {sub.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{sub.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{sub.jobTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={cn(
                        'text-xs',
                        sub.status === 'offer_stage' && 'bg-green-100 text-green-700',
                        sub.status === 'placed' && 'bg-green-100 text-green-700',
                        sub.status === 'client_interview' && 'bg-purple-100 text-purple-700',
                        sub.status === 'client_accepted' && 'bg-purple-100 text-purple-700',
                        sub.status === 'submitted_to_client' && 'bg-blue-100 text-blue-700',
                        sub.status === 'client_review' && 'bg-blue-100 text-blue-700',
                        sub.status === 'vendor_accepted' && 'bg-blue-100 text-blue-700',
                        sub.status === 'screening' && 'bg-amber-100 text-amber-700',
                        sub.status === 'vendor_pending' && 'bg-amber-100 text-amber-700',
                        sub.status === 'sourced' && 'bg-stone-100 text-stone-700'
                      )}
                    >
                      {sub.status.replace(/_/g, ' ')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[180px] truncate">{sub.nextStep}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // =====================================================
  // PERFORMANCE TAB
  // =====================================================

  // Calculate placement target (can be made dynamic later)
  const placementsTarget = 5;
  const placementProgress = Math.min((stats.placementsMTD / placementsTarget) * 100, 100);

  const PerformanceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Placement Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Placement Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold">{stats.placementsMTD}</p>
                <p className="text-muted-foreground">of {placementsTarget} target</p>
              </div>
              <Progress value={placementProgress} className="h-3" />
              <p className="text-sm text-center text-muted-foreground mt-2">
                {placementsTarget - stats.placementsMTD > 0
                  ? `${placementsTarget - stats.placementsMTD} more to hit your goal`
                  : 'Goal achieved!'
                }
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Revenue Impact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pipeline Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold text-green-600">
                  {stats.inPipeline}
                </p>
                <p className="text-muted-foreground">active submissions</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Track placements to calculate revenue</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xs text-muted-foreground">This quarter</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.avgTimeToFill || '-'}</p>
                <p className="text-sm text-muted-foreground">Avg Days to Fill</p>
                <p className="text-xs text-muted-foreground">This quarter</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.activeJobs}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-xs text-muted-foreground">Currently working</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.interviews}</p>
                <p className="text-sm text-muted-foreground">Scheduled Interviews</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          )}
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
              <h1 className="text-xl font-semibold">Recruiter Console</h1>
              <p className="text-sm text-muted-foreground">
                Your unified recruitment workspace
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Quick Search
              </Button>
              <Link href="/employee/workspace/jobs">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Job
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
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>
        </Tabs>

        {/* Quick Access Cards */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Jobs', icon: Briefcase, href: '/employee/workspace/jobs', color: 'text-blue-600 bg-blue-100' },
              { name: 'Talent', icon: Users, href: '/employee/workspace/talent', color: 'text-indigo-600 bg-indigo-100' },
              { name: 'Submissions', icon: FileText, href: '/employee/workspace/submissions', color: 'text-amber-600 bg-amber-100' },
              { name: 'Accounts', icon: Building2, href: '/employee/workspace/accounts', color: 'text-purple-600 bg-purple-100' },
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
