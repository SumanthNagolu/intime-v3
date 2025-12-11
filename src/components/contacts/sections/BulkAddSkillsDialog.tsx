'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, X, Check, TrendingUp, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkAddSkillsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string
  entityId: string
  showRequiredField?: boolean
  onSuccess: () => void
}

interface SelectedSkill {
  skillId: string
  skillName: string
  proficiencyLevel?: number
  isRequired?: boolean
}

const proficiencyOptions = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Basic' },
  { value: 3, label: 'Intermediate' },
  { value: 4, label: 'Advanced' },
  { value: 5, label: 'Expert' },
]

export function BulkAddSkillsDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  showRequiredField = false,
  onSuccess,
}: BulkAddSkillsDialogProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([])
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setSelectedSkills([])
    }
  }, [open])

  // Search skills
  const searchSkillsQuery = trpc.skills.search.useQuery(
    { query: debouncedQuery, limit: 15 },
    { enabled: debouncedQuery.length >= 2 }
  )

  // Bulk add mutation
  const bulkAddMutation = trpc.entitySkills.bulkAdd.useMutation({
    onSuccess: (data) => {
      toast({ title: `Added ${data.count} skills` })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleSelectSkill = (skill: { id: string; name: string }) => {
    if (selectedSkills.some((s) => s.skillId === skill.id)) {
      // Remove if already selected
      setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skill.id))
    } else {
      // Add to selection
      setSelectedSkills((prev) => [
        ...prev,
        {
          skillId: skill.id,
          skillName: skill.name,
          proficiencyLevel: undefined,
          isRequired: false,
        },
      ])
    }
  }

  const handleUpdateSkill = (
    skillId: string,
    updates: Partial<Omit<SelectedSkill, 'skillId' | 'skillName'>>
  ) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, ...updates } : s))
    )
  }

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skillId))
  }

  const handleSubmit = () => {
    if (selectedSkills.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one skill',
        variant: 'error',
      })
      return
    }

    bulkAddMutation.mutate({
      entityType,
      entityId,
      skills: selectedSkills.map((s) => ({
        skillId: s.skillId,
        proficiencyLevel: s.proficiencyLevel,
        isRequired: showRequiredField ? s.isRequired : undefined,
      })),
      source: 'manual',
    })
  }

  const isSelected = (skillId: string) =>
    selectedSkills.some((s) => s.skillId === skillId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Add Skills</DialogTitle>
          <DialogDescription>
            Search and select multiple skills to add at once.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Section */}
          <div>
            <Label className="mb-1.5 block">Search Skills</Label>
            <Command className="border rounded-lg" shouldFilter={false}>
              <CommandInput
                placeholder="Type to search skills..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList className="max-h-[200px]">
                {searchSkillsQuery.isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
                {!searchSkillsQuery.isLoading &&
                  debouncedQuery.length >= 2 &&
                  searchSkillsQuery.data?.length === 0 && (
                    <CommandEmpty>No skills found.</CommandEmpty>
                  )}
                {debouncedQuery.length < 2 && (
                  <div className="py-4 text-center text-sm text-charcoal-500">
                    Type at least 2 characters to search
                  </div>
                )}
                {searchSkillsQuery.data && searchSkillsQuery.data.length > 0 && (
                  <CommandGroup>
                    {searchSkillsQuery.data.map((skill) => (
                      <CommandItem
                        key={skill.id}
                        value={skill.id}
                        onSelect={() => handleSelectSkill(skill)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            'mr-2 h-4 w-4 border rounded flex items-center justify-center',
                            isSelected(skill.id)
                              ? 'bg-hublot-900 border-hublot-900'
                              : 'border-charcoal-300'
                          )}
                        >
                          {isSelected(skill.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{skill.name}</span>
                            {skill.trending && (
                              <TrendingUp className="w-3 h-3 text-green-600" />
                            )}
                          </div>
                          {skill.category && (
                            <span className="text-xs text-charcoal-500 capitalize">
                              {skill.category.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>

          {/* Selected Skills Section */}
          {selectedSkills.length > 0 && (
            <div className="flex-1 overflow-auto">
              <Label className="mb-1.5 block">
                Selected Skills ({selectedSkills.length})
              </Label>
              <div className="border rounded-lg divide-y max-h-[250px] overflow-auto">
                {selectedSkills.map((skill) => (
                  <div
                    key={skill.skillId}
                    className="p-3 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{skill.skillName}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Proficiency Select */}
                      <Select
                        value={skill.proficiencyLevel?.toString() ?? ''}
                        onValueChange={(v) =>
                          handleUpdateSkill(skill.skillId, {
                            proficiencyLevel: v ? parseInt(v) : undefined,
                          })
                        }
                      >
                        <SelectTrigger className="w-[130px] h-8 text-sm">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {proficiencyOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Required Toggle (for jobs) */}
                      {showRequiredField && (
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={skill.isRequired ?? false}
                            onCheckedChange={(checked) =>
                              handleUpdateSkill(skill.skillId, { isRequired: checked })
                            }
                          />
                          <span className="text-xs text-charcoal-600">Required</span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveSkill(skill.skillId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedSkills.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center py-8">
                <Plus className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
                <p className="text-charcoal-500">No skills selected</p>
                <p className="text-sm text-charcoal-400 mt-1">
                  Search above and click to add skills
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={bulkAddMutation.isPending || selectedSkills.length === 0}
          >
            {bulkAddMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Add {selectedSkills.length} Skill{selectedSkills.length !== 1 && 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
