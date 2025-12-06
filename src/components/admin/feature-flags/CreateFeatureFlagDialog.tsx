'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2 } from 'lucide-react'

interface CreateFeatureFlagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFeatureFlagDialog({
  open,
  onOpenChange,
}: CreateFeatureFlagDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const categoriesQuery = trpc.featureFlags.getCategories.useQuery()
  const categories = categoriesQuery.data || []

  const createMutation = trpc.featureFlags.create.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate()
      utils.featureFlags.getStats.invalidate()
      toast({ title: 'Feature flag created', description: 'The feature is disabled by default' })
      onOpenChange(false)
      resetForm()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setKey('')
    setName('')
    setDescription('')
    setCategory('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      key,
      name,
      description,
      category,
    })
  }

  // Auto-generate key from name
  const handleNameChange = (value: string) => {
    setName(value)
    if (!key || key === generateKey(name)) {
      setKey(generateKey(value))
    }
  }

  const generateKey = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Create a new feature flag. It will be disabled by default.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Feature Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="AI Twin System"
                required
              />
            </div>

            <div>
              <Label htmlFor="key">Feature Key *</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="ai_twin_system"
                required
                pattern="^[a-z][a-z0-9_]*$"
                title="Lowercase letters, numbers, and underscores only. Must start with a letter."
              />
              <p className="text-xs text-charcoal-500 mt-1">
                Used in code to check feature status. Cannot be changed later.
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="AI-powered assistant for recruiters..."
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !key || !name}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Feature Flag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
