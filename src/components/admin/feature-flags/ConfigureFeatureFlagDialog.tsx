'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, X, Search } from 'lucide-react'

interface ConfigureFeatureFlagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flagId: string
}

type RolloutStrategy = 'all' | 'roles' | 'users' | 'percentage' | 'pods' | 'none'
type FeatureState = 'enabled' | 'disabled' | 'beta' | 'internal' | 'percentage' | 'coming_soon'

export function ConfigureFeatureFlagDialog({
  open,
  onOpenChange,
  flagId,
}: ConfigureFeatureFlagDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [state, setState] = useState<FeatureState>('disabled')
  const [strategy, setStrategy] = useState<RolloutStrategy>('none')
  const [percentage, setPercentage] = useState(10)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedPods, setSelectedPods] = useState<string[]>([])
  const [showInNav, setShowInNav] = useState(true)
  const [showNewBadge, setShowNewBadge] = useState(false)
  const [showBetaBadge, setShowBetaBadge] = useState(false)
  const [logUsage, setLogUsage] = useState(true)
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  // Queries
  const flagQuery = trpc.featureFlags.getById.useQuery({ id: flagId })
  const rolesQuery = trpc.permissions.getRoles.useQuery()
  const categoriesQuery = trpc.featureFlags.getCategories.useQuery()
  const usersQuery = trpc.users.list.useQuery({ search: userSearch || undefined, pageSize: 20 })
  const podsQuery = trpc.pods.list.useQuery({})

  const roles = rolesQuery.data || []
  const users = usersQuery.data?.items || []
  const pods = podsQuery.data?.items || []
  const categories = categoriesQuery.data || []

  // Mutation
  const updateMutation = trpc.featureFlags.update.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate()
      utils.featureFlags.getStats.invalidate()
      toast({ title: 'Feature flag updated' })
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Populate form when data loads
  useEffect(() => {
    if (flagQuery.data) {
      const f = flagQuery.data
      setName(f.name || '')
      setDescription(f.description || '')
      setCategory(f.category || '')
      setState(f.state as FeatureState || 'disabled')
      setStrategy(f.rollout_strategy as RolloutStrategy || 'none')
      setPercentage(f.rollout_percentage || 10)
      setSelectedRoles(f.enabled_roles || [])
      setSelectedUsers(f.enabled_users || [])
      setSelectedPods(f.enabled_pods || [])
      setShowInNav(f.show_in_nav ?? true)
      setShowNewBadge(f.show_new_badge ?? false)
      setShowBetaBadge(f.show_beta_badge ?? false)
      setLogUsage(f.log_usage ?? true)
      setShowFeedbackPrompt(f.show_feedback_prompt ?? false)
    }
  }, [flagQuery.data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      id: flagId,
      name,
      description,
      category,
      state,
      rolloutStrategy: strategy,
      rolloutPercentage: percentage,
      enabledRoles: selectedRoles,
      enabledUsers: selectedUsers,
      enabledPods: selectedPods,
      showInNav,
      showNewBadge,
      showBetaBadge,
      logUsage,
      showFeedbackPrompt,
    })
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    )
  }

  const togglePod = (podId: string) => {
    setSelectedPods((prev) =>
      prev.includes(podId)
        ? prev.filter((id) => id !== podId)
        : [...prev, podId]
    )
  }

  const addUser = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers([...selectedUsers, userId])
    }
    setUserSearch('')
  }

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userId))
  }

  // Group roles by category
  const rolesByCategory = roles.reduce((acc, role) => {
    const cat = role.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(role)
    return acc
  }, {} as Record<string, typeof roles>)

  if (flagQuery.isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Configure Feature Flag</DialogTitle>
            <DialogDescription>
              Key: <code className="bg-charcoal-50 px-1 rounded">{flagQuery.data?.key}</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-charcoal-500">
                Feature Details
              </h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Feature Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <hr className="border-charcoal-100" />

            {/* Rollout Strategy */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-charcoal-500">
                Rollout Strategy
              </h3>
              <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as RolloutStrategy)}>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50">
                    <RadioGroupItem value="all" />
                    <div>
                      <p className="font-medium">Enable for all users</p>
                      <p className="text-xs text-charcoal-500">Everyone in the organization can access</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50">
                    <RadioGroupItem value="roles" />
                    <div>
                      <p className="font-medium">Enable for specific roles</p>
                      <p className="text-xs text-charcoal-500">Only selected roles can access</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50">
                    <RadioGroupItem value="users" />
                    <div>
                      <p className="font-medium">Enable for specific users</p>
                      <p className="text-xs text-charcoal-500">Only selected users can access (beta testers)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50">
                    <RadioGroupItem value="percentage" />
                    <div>
                      <p className="font-medium">Percentage rollout</p>
                      <p className="text-xs text-charcoal-500">Gradually roll out to a percentage of users</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50">
                    <RadioGroupItem value="pods" />
                    <div>
                      <p className="font-medium">Enable for specific pods</p>
                      <p className="text-xs text-charcoal-500">Only selected teams/pods can access</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-charcoal-50">
                    <RadioGroupItem value="none" />
                    <div>
                      <p className="font-medium">Disable for all</p>
                      <p className="text-xs text-charcoal-500">Feature is completely off</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              {/* Strategy-specific options */}
              {strategy === 'roles' && (
                <div className="mt-4 border rounded-lg p-4">
                  <Label className="mb-3 block">Select Roles</Label>
                  <div className="space-y-4 max-h-48 overflow-y-auto">
                    {Object.entries(rolesByCategory).map(([category, categoryRoles]) => (
                      <div key={category}>
                        <p className="text-xs font-medium text-charcoal-500 uppercase mb-2">
                          {category.replace(/_/g, ' ')}
                        </p>
                        <div className="space-y-2">
                          {categoryRoles.map((role) => (
                            <label
                              key={role.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedRoles.includes(role.id)}
                                onCheckedChange={() => toggleRole(role.id)}
                              />
                              <span className="text-sm">{role.display_name || role.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    Selected: {selectedRoles.length} role(s)
                  </p>
                </div>
              )}

              {strategy === 'users' && (
                <div className="mt-4 border rounded-lg p-4">
                  <Label className="mb-3 block">Beta Testers</Label>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                    {userSearch && users.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {users.map((user: { id: string; full_name?: string; email?: string }) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => addUser(user.id)}
                            className="w-full text-left px-3 py-2 hover:bg-charcoal-50 text-sm"
                          >
                            {user.full_name || user.email}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedUsers.map((userId) => {
                      const user = users.find((u: { id: string; full_name?: string; email?: string }) => u.id === userId)
                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between bg-charcoal-50 rounded px-3 py-2"
                        >
                          <span className="text-sm">{user?.full_name || user?.email || userId}</span>
                          <button
                            type="button"
                            onClick={() => removeUser(userId)}
                            className="text-charcoal-400 hover:text-charcoal-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    {selectedUsers.length} user(s) selected
                  </p>
                </div>
              )}

              {strategy === 'percentage' && (
                <div className="mt-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label>Rollout Percentage</Label>
                    <span className="text-lg font-bold">{percentage}%</span>
                  </div>
                  <Slider
                    value={[percentage]}
                    onValueChange={([v]) => setPercentage(v)}
                    min={0}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-xs text-charcoal-400">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {strategy === 'pods' && (
                <div className="mt-4 border rounded-lg p-4">
                  <Label className="mb-3 block">Select Pods</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pods.map((pod: { id: string; name: string }) => (
                      <label
                        key={pod.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedPods.includes(pod.id)}
                          onCheckedChange={() => togglePod(pod.id)}
                        />
                        <span className="text-sm">{pod.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    Selected: {selectedPods.length} pod(s)
                  </p>
                </div>
              )}
            </div>

            <hr className="border-charcoal-100" />

            {/* Additional Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-charcoal-500">
                Additional Settings
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={showInNav}
                    onCheckedChange={(c) => setShowInNav(!!c)}
                  />
                  <span className="text-sm">Show feature in navigation/menu</span>
                </label>
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={showNewBadge}
                    onCheckedChange={(c) => setShowNewBadge(!!c)}
                  />
                  <span className="text-sm">Show &quot;New&quot; badge on feature (for 30 days)</span>
                </label>
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={showBetaBadge}
                    onCheckedChange={(c) => setShowBetaBadge(!!c)}
                  />
                  <span className="text-sm">Show &quot;Beta&quot; badge on feature</span>
                </label>
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={logUsage}
                    onCheckedChange={(c) => setLogUsage(!!c)}
                  />
                  <span className="text-sm">Log feature usage for analytics</span>
                </label>
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={showFeedbackPrompt}
                    onCheckedChange={(c) => setShowFeedbackPrompt(!!c)}
                  />
                  <span className="text-sm">Show feedback prompt after first use</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
