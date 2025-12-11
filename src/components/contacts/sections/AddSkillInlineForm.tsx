'use client'

import { useState, useEffect, useRef } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { X, Loader2, Check, ChevronsUpDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddSkillInlineFormProps {
  entityType: string
  entityId: string
  showRequiredField?: boolean
  onSuccess: () => void
  onCancel: () => void
}

interface Skill {
  id: string
  name: string
  category: string | null
  domain: string | null
  trending: boolean
}

const proficiencyOptions = [
  { value: '1', label: 'Beginner' },
  { value: '2', label: 'Basic' },
  { value: '3', label: 'Intermediate' },
  { value: '4', label: 'Advanced' },
  { value: '5', label: 'Expert' },
]

export function AddSkillInlineForm({
  entityType,
  entityId,
  showRequiredField = false,
  onSuccess,
  onCancel,
}: AddSkillInlineFormProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [proficiencyLevel, setProficiencyLevel] = useState<string>('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [isRequired, setIsRequired] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Search skills
  const searchSkillsQuery = trpc.skills.search.useQuery(
    { query: debouncedQuery, limit: 10 },
    { enabled: debouncedQuery.length >= 2 }
  )

  // Add skill mutation
  const addSkillMutation = trpc.entitySkills.add.useMutation({
    onSuccess: () => {
      toast({ title: 'Skill added successfully' })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSkill) {
      toast({
        title: 'Error',
        description: 'Please select a skill',
        variant: 'error',
      })
      return
    }

    addSkillMutation.mutate({
      entityType,
      entityId,
      skillId: selectedSkill.id,
      proficiencyLevel: proficiencyLevel ? parseInt(proficiencyLevel) : undefined,
      yearsExperience: yearsExperience ? parseFloat(yearsExperience) : undefined,
      isPrimary,
      isRequired: showRequiredField ? isRequired : undefined,
      source: 'manual',
    })
  }

  const handleSelectSkill = (skill: Skill) => {
    setSelectedSkill(skill)
    setSearchQuery(skill.name)
    setOpen(false)
  }

  return (
    <div className="border rounded-lg bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium">Add Skill</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Skill Autocomplete */}
          <div className="col-span-2">
            <Label className="mb-1.5 block">Skill *</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedSkill ? selectedSkill.name : 'Search skills...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    ref={inputRef}
                    placeholder="Type to search skills..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
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
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedSkill?.id === skill.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
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
              </PopoverContent>
            </Popover>
          </div>

          {/* Proficiency Level */}
          <div>
            <Label className="mb-1.5 block">Proficiency Level</Label>
            <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {proficiencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Years Experience */}
          <div>
            <Label className="mb-1.5 block">Years Experience</Label>
            <Input
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="e.g., 3.5"
            />
          </div>

          {/* Primary Skill Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="isPrimary"
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
            />
            <Label htmlFor="isPrimary" className="cursor-pointer">
              Primary skill
            </Label>
          </div>

          {/* Required Toggle (for jobs) */}
          {showRequiredField && (
            <div className="flex items-center gap-2">
              <Switch
                id="isRequired"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="isRequired" className="cursor-pointer">
                Required skill
              </Label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={addSkillMutation.isPending || !selectedSkill}
          >
            {addSkillMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Add Skill
          </Button>
        </div>
      </form>
    </div>
  )
}
