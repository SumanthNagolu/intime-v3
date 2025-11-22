/**
 * Trainer Dashboard
 * Story: ACAD-025
 *
 * Overview of grading queue, students, escalations, and analytics
 */

import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Users,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/server';
import { createClient } from '@/lib/supabase/server';
import { GradingQueueWidget } from '@/components/trainer/GradingQueueWidget';
import { AtRiskStudentsWidget } from '@/components/trainer/AtRiskStudentsWidget';
import { EscalationInboxWidget } from '@/components/trainer/EscalationInboxWidget';
import { StudentListWidget } from '@/components/trainer/StudentListWidget';

export default async function TrainerDashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // TODO: Check if user has trainer role
  // For now, allow all authenticated users

  const caller = trpc.createCaller({ userId: user.id });

  // Fetch dashboard data in parallel
  const [stats, gradingQueue, atRiskStudents, escalations] = await Promise.all([
    caller.enrollment.getTrainerStats({}),
    caller.capstone.getGradingQueue(),
    caller.enrollment.getAtRiskStudents({ limit: 10 }),
    caller.escalation.getQueue(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trainer Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage students, grading, and support across all courses
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">{stats.activeStudents} active</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            <p className="text-sm text-gray-600">Total Students</p>
          </Card>

          {/* Completion Rate */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="secondary">{stats.completedStudents} graduated</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </Card>

          {/* Pending Grades */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              {stats.pendingGrades > 0 && (
                <Badge variant="destructive">{stats.pendingGrades}</Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</p>
            <p className="text-sm text-gray-600">Pending Grades</p>
          </Card>

          {/* Escalations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              {stats.pendingEscalations > 0 && (
                <Badge variant="destructive">{stats.pendingEscalations}</Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingEscalations}</p>
            <p className="text-sm text-gray-600">Escalations</p>
          </Card>
        </div>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="grading" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grading">
              <Clock className="h-4 w-4 mr-2" />
              Grading Queue
              {stats.pendingGrades > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingGrades}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="at-risk">
              <AlertTriangle className="h-4 w-4 mr-2" />
              At-Risk Students
              {atRiskStudents.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {atRiskStudents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="escalations">
              <MessageSquare className="h-4 w-4 mr-2" />
              Escalations
              {stats.pendingEscalations > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingEscalations}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              All Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grading">
            <GradingQueueWidget initialData={gradingQueue} />
          </TabsContent>

          <TabsContent value="at-risk">
            <AtRiskStudentsWidget initialData={atRiskStudents} />
          </TabsContent>

          <TabsContent value="escalations">
            <EscalationInboxWidget initialData={escalations} />
          </TabsContent>

          <TabsContent value="students">
            <StudentListWidget />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Generate metadata
export async function generateMetadata() {
  return {
    title: 'Trainer Dashboard - InTime Training Academy',
    description: 'Manage students, grading, and support',
  };
}
