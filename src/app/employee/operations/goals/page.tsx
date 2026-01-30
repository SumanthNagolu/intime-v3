'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  Users,
  Building2,
  User,
  Filter,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GoalCascadeTree } from '@/components/hr/performance'
import { trpc } from '@/lib/trpc/client'

const SCOPE_OPTIONS = [
  { value: 'company', label: 'Company', icon: Building2 },
  { value: 'department', label: 'Department', icon: Users },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'individual', label: 'Individual', icon: User },
]

const TYPE_OPTIONS = [
  { value: 'objective', label: 'Objective (O)' },
  { value: 'key_result', label: 'Key Result (KR)' },
  { value: 'goal', label: 'Goal (G)' },
  { value: 'initiative', label: 'Initiative (I)' },
]

const CATEGORY_OPTIONS = [
  { value: 'performance', label: 'Performance' },
  { value: 'development', label: 'Development' },
  { value: 'project', label: 'Project' },
]

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState('cascade')
  const [scopeFilter, setScopeFilter] = useState<string>('')
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    goal: '',
    description: '',
    scope: 'individual',
    goalType: 'goal',
    category: 'performance',
    targetDate: '',
    weightPercent: '',
  })

  const utils = trpc.useUtils()

  const { data: cascadeTree, isLoading: treeLoading } = trpc.performance.goals.getCascadeTree.useQuery({})

  const { data: goals, isLoading: goalsLoading } = trpc.performance.goals.list.useQuery({
    scope: scopeFilter as 'company' | 'department' | 'team' | 'individual' | undefined || undefined,
  })

  const createGoalMutation = trpc.performance.goals.create.useMutation({
    onSuccess: () => {
      utils.performance.goals.getCascadeTree.invalidate()
      utils.performance.goals.list.invalidate()
      setIsNewGoalOpen(false)
      resetNewGoalForm()
    },
  })

  const updateProgressMutation = trpc.performance.goals.updateProgress.useMutation({
    onSuccess: () => {
      utils.performance.goals.getCascadeTree.invalidate()
      utils.performance.goals.list.invalidate()
    },
  })

  const resetNewGoalForm = () => {
    setNewGoal({
      goal: '',
      description: '',
      scope: 'individual',
      goalType: 'goal',
      category: 'performance',
      targetDate: '',
      weightPercent: '',
    })
  }

  const handleCreateGoal = () => {
    createGoalMutation.mutate({
      goal: newGoal.goal,
      description: newGoal.description || undefined,
      scope: newGoal.scope as 'company' | 'department' | 'team' | 'individual',
      goalType: newGoal.goalType as 'objective' | 'key_result' | 'goal' | 'initiative',
      category: newGoal.category as 'performance' | 'development' | 'project',
      targetDate: newGoal.targetDate || undefined,
      weightPercent: newGoal.weightPercent ? parseInt(newGoal.weightPercent) : undefined,
    })
  }

  // Calculate stats from goals
  const stats = {
    total: goals?.length ?? 0,
    onTrack: goals?.filter(g => g.status === 'in_progress' && g.progress_percent >= 50).length ?? 0,
    atRisk: goals?.filter(g => g.status === 'in_progress' && g.progress_percent < 50).length ?? 0,
    completed: goals?.filter(g => g.status === 'completed').length ?? 0,
  }

  const isLoading = treeLoading || goalsLoading

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Goals & OKRs
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Track company, team, and individual objectives with cascade alignment
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/employee/operations/performance">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </Button>
          </Link>
          <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Define a new goal, objective, or key result.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Goal Title *</Label>
                  <Input
                    value={newGoal.goal}
                    onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
                    placeholder="Enter goal title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Describe the goal in detail..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Scope</Label>
                    <Select
                      value={newGoal.scope}
                      onValueChange={(v) => setNewGoal({ ...newGoal, scope: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCOPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newGoal.goalType}
                      onValueChange={(v) => setNewGoal({ ...newGoal, goalType: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(v) => setNewGoal({ ...newGoal, category: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Weight (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newGoal.weightPercent}
                      onChange={(e) => setNewGoal({ ...newGoal, weightPercent: e.target.value })}
                      placeholder="0-100"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewGoalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGoal}
                  disabled={!newGoal.goal.trim() || createGoalMutation.isPending}
                >
                  {createGoalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Total Goals</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">On Track</p>
                <p className="text-h3 font-heading font-semibold text-green-600 mt-2">
                  {isLoading ? '—' : stats.onTrack}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">At Risk</p>
                <p className="text-h3 font-heading font-semibold text-amber-600 mt-2">
                  {isLoading ? '—' : stats.atRisk}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Completed</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : stats.completed}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-charcoal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="cascade">Cascade View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-charcoal-400" />
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Scopes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Scopes</SelectItem>
                {SCOPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="cascade">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : cascadeTree && cascadeTree.length > 0 ? (
                <GoalCascadeTree
                  goals={cascadeTree}
                  onUpdateProgress={(id, progress) =>
                    updateProgressMutation.mutate({ id, progressPercent: progress })
                  }
                  showActions
                />
              ) : (
                <div className="flex flex-col items-center py-12">
                  <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-charcoal-400" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                    No Goals Yet
                  </h3>
                  <p className="text-charcoal-500 text-center max-w-md mb-6">
                    Create company, department, or individual goals to start tracking objectives.
                  </p>
                  <Button onClick={() => setIsNewGoalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">All Goals</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : goals && goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const ScopeIcon = SCOPE_OPTIONS.find(s => s.value === goal.scope)?.icon || Target
                    return (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                            <ScopeIcon className="h-5 w-5 text-charcoal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900">{goal.goal}</p>
                            <div className="flex items-center gap-2 text-sm text-charcoal-500">
                              <Badge variant="outline" className="text-xs">
                                {goal.scope}
                              </Badge>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {goal.category}
                              </Badge>
                              {goal.target_date && (
                                <>
                                  <span>•</span>
                                  <span>Due {new Date(goal.target_date).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-charcoal-900">
                              {goal.progress_percent}%
                            </p>
                            <Progress value={goal.progress_percent} className="w-24 h-1.5" />
                          </div>
                          <Badge
                            className={
                              goal.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : goal.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {goal.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12">
                  <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-charcoal-400" />
                  </div>
                  <p className="text-charcoal-500">No goals match your filter criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
