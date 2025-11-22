/**
 * At-Risk Students Widget
 * Story: ACAD-025 + ACAD-027
 *
 * Shows students who need support (quiz failures, inactivity, low progress)
 * Enhanced with intervention tracking (ACAD-027)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  User,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  TrendingDown,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface AtRiskStudentsWidgetProps {
  initialData: any[];
}

// Intervention Dialog Component
function InterventionDialog({ student }: { student: any }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const utils = trpc.useUtils();

  const createInterventionMutation = trpc.enrollment.createIntervention.useMutation({
    onSuccess: () => {
      toast.success('Intervention created successfully!', {
        description: 'Trainer has been notified via email.',
      });
      setOpen(false);
      setNotes('');
      utils.enrollment.getAtRiskStudents.invalidate();
    },
    onError: (error) => {
      toast.error('Failed to create intervention', {
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    createInterventionMutation.mutate({
      enrollmentId: student.enrollmentId,
      studentId: student.studentId,
      riskReasons: student.risks,
      riskLevel: student.riskLevel,
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1">
          <UserCheck className="h-4 w-4 mr-2" />
          Create Intervention
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Intervention</DialogTitle>
          <DialogDescription>
            Document your intervention plan for {student.studentName}. This will trigger an email
            notification to the assigned trainer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Risk Reasons */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Risk Factors</Label>
            <div className="flex flex-wrap gap-2">
              {student.risks.map((risk: string, index: number) => (
                <Badge key={index} variant="outline">
                  {risk}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Intervention Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the planned intervention (e.g., schedule 1-on-1 call, provide additional resources, offer tutoring...)"
              className="min-h-32"
            />
            <p className="text-sm text-gray-600">
              These notes will be included in the notification email.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createInterventionMutation.isPending}
          >
            {createInterventionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Create Intervention
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AtRiskStudentsWidget({ initialData }: AtRiskStudentsWidgetProps) {
  const { data: students, isLoading } = trpc.enrollment.getAtRiskStudents.useQuery(
    { limit: 20 },
    { initialData }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No At-Risk Students</h3>
        <p className="text-gray-600">All students are progressing well!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {students.length} student{students.length !== 1 ? 's' : ''} need{students.length === 1 ? 's' : ''} support
        </p>
      </div>

      {students.map((student: any) => {
        const riskColors = {
          high: 'border-red-300 bg-red-50',
          medium: 'border-orange-300 bg-orange-50',
          low: 'border-yellow-300 bg-yellow-50',
        };

        const riskBadgeColors = {
          high: 'destructive',
          medium: 'secondary',
          low: 'outline',
        };

        return (
          <Card
            key={student.enrollmentId}
            className={`p-6 ${riskColors[student.riskLevel]}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.studentName}
                  </h3>
                  <Badge variant={riskBadgeColors[student.riskLevel] as any}>
                    {student.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{student.courseTitle}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Enrolled {student.enrolledDays} days ago</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Course Progress</span>
                <span className="text-sm text-gray-600">{student.completionPercentage}%</span>
              </div>
              <Progress value={student.completionPercentage} className="h-2" />
            </div>

            {/* Risk Factors */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
              <div className="flex flex-wrap gap-2">
                {student.risks.map((risk: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-white">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {risk}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Last Activity */}
            {student.lastActiveAt && (
              <div className="mb-4 text-sm text-gray-600">
                <Calendar className="h-4 w-4 inline mr-1" />
                Last active: {new Date(student.lastActiveAt).toLocaleDateString()}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <InterventionDialog student={student} />
              <Link href={`mailto:${student.studentEmail}`}>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </Link>
              <Link href={`/trainer/students/${student.studentId}`}>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
