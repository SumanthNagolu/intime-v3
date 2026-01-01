'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardShell, DashboardSection } from '@/components/dashboard/DashboardShell'
import { trpc } from '@/lib/trpc/client'

const GROUP_TYPES = [
  { value: 'division', label: 'Division' },
  { value: 'branch', label: 'Branch Office' },
  { value: 'team', label: 'Team' },
  { value: 'satellite_office', label: 'Satellite Office' },
  { value: 'producer', label: 'Producer' },
] as const

interface ParentGroup {
  id: string
  name: string
  groupType: string
}

interface AvailableUser {
  id: string
  full_name: string
  email: string
}

interface NewGroupClientProps {
  availableParents: ParentGroup[]
  availableUsers: AvailableUser[]
  preselectedParentId?: string
}

export function NewGroupClient({ 
  availableParents, 
  availableUsers,
  preselectedParentId 
}: NewGroupClientProps) {
  const router = useRouter()

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [groupType, setGroupType] = useState<'division' | 'branch' | 'team' | 'satellite_office' | 'producer'>('team')
  const [parentGroupId, setParentGroupId] = useState(preselectedParentId || '')
  const [supervisorId, setSupervisorId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [securityZone, setSecurityZone] = useState('default')
  
  // Contact info
  const [phone, setPhone] = useState('')
  const [fax, setFax] = useState('')
  const [email, setEmail] = useState('')
  
  // Address
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('USA')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createGroup = trpc.groups.create.useMutation({
    onSuccess: (data) => {
      router.push(`/employee/admin/groups/${data.id}`)
    },
    onError: (error) => {
      setError(error.message)
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    await createGroup.mutateAsync({
      name,
      code: code || undefined,
      description: description || undefined,
      groupType,
      parentGroupId: parentGroupId || undefined,
      supervisorId: supervisorId || undefined,
      managerId: managerId || undefined,
      securityZone: securityZone || undefined,
      phone: phone || undefined,
      fax: fax || undefined,
      email: email || undefined,
      addressLine1: addressLine1 || undefined,
      addressLine2: addressLine2 || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country: country || 'USA',
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Groups', href: '/employee/admin/groups' },
    { label: 'New Group' },
  ]

  return (
    <DashboardShell
      title="New Group"
      description="Create a new organizational group"
      breadcrumbs={breadcrumbs}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Group Info Section */}
            <DashboardSection title="Group Info">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Group Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter group name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Optional code (e.g., recruiting_west)"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="groupType" className="text-sm font-medium">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={groupType} onValueChange={(v) => setGroupType(v as typeof groupType)}>
                    <SelectTrigger id="groupType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="parentGroupId" className="text-sm font-medium">
                    Parent Group
                  </Label>
                  <Select value={parentGroupId} onValueChange={setParentGroupId}>
                    <SelectTrigger id="parentGroupId">
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent (top level)</SelectItem>
                      {availableParents
                        .filter(p => p.groupType === 'root' || p.groupType === 'division')
                        .map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Contact Section */}
            <DashboardSection title="Contact">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fax" className="text-sm font-medium">
                    Fax
                  </Label>
                  <Input
                    id="fax"
                    value={fax}
                    onChange={(e) => setFax(e.target.value)}
                    placeholder="(555) 123-4568"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="group@example.com"
                  />
                </div>
              </div>
            </DashboardSection>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Management Section */}
            <DashboardSection title="Management">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="supervisorId" className="text-sm font-medium">
                    Supervisor
                  </Label>
                  <Select value={supervisorId} onValueChange={setSupervisorId}>
                    <SelectTrigger id="supervisorId">
                      <SelectValue placeholder="Select supervisor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="managerId" className="text-sm font-medium">
                    Manager
                  </Label>
                  <Select value={managerId} onValueChange={setManagerId}>
                    <SelectTrigger id="managerId">
                      <SelectValue placeholder="Select manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="securityZone" className="text-sm font-medium">
                    Security Zone
                  </Label>
                  <Input
                    id="securityZone"
                    value={securityZone}
                    onChange={(e) => setSecurityZone(e.target.value)}
                    placeholder="default"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Address Section */}
            <DashboardSection title="Address">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="addressLine1" className="text-sm font-medium">
                    Address Line 1
                  </Label>
                  <Input
                    id="addressLine1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addressLine2" className="text-sm font-medium">
                    Address Line 2
                  </Label>
                  <Input
                    id="addressLine2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Suite 100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-sm font-medium">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-sm font-medium">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="12345"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </div>
              </div>
            </DashboardSection>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-charcoal-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/employee/admin/groups')}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-hublot-900 hover:bg-hublot-800 text-white"
            disabled={isSubmitting || !name}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </form>
    </DashboardShell>
  )
}


