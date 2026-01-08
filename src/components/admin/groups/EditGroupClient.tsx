'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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

interface GroupData {
  id: string
  name: string
  code: string | null
  description: string | null
  groupType: string
  parentGroupId: string | null
  supervisorId: string | null
  managerId: string | null
  securityZone: string | null
  phone: string | null
  fax: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  loadFactor: number
  isActive: boolean
}

interface EditGroupClientProps {
  group: GroupData
  availableParents: ParentGroup[]
  availableUsers: AvailableUser[]
}

export function EditGroupClient({ 
  group,
  availableParents, 
  availableUsers,
}: EditGroupClientProps) {
  const router = useRouter()

  // Form state initialized from group data
  const [name, setName] = useState(group.name)
  const [code, setCode] = useState(group.code || '')
  const [description, setDescription] = useState(group.description || '')
  const [groupType, setGroupType] = useState(group.groupType)
  const [parentGroupId, setParentGroupId] = useState(group.parentGroupId || '')
  const [supervisorId, setSupervisorId] = useState(group.supervisorId || '')
  const [managerId, setManagerId] = useState(group.managerId || '')
  const [securityZone, setSecurityZone] = useState(group.securityZone || 'default')
  const [loadFactor, setLoadFactor] = useState(group.loadFactor)
  const [isActive, setIsActive] = useState(group.isActive)
  
  // Contact info
  const [phone, setPhone] = useState(group.phone || '')
  const [fax, setFax] = useState(group.fax || '')
  const [email, setEmail] = useState(group.email || '')
  
  // Address
  const [addressLine1, setAddressLine1] = useState(group.address_line1 || '')
  const [addressLine2, setAddressLine2] = useState(group.address_line2 || '')
  const [city, setCity] = useState(group.city || '')
  const [state, setState] = useState(group.state || '')
  const [postalCode, setPostalCode] = useState(group.postal_code || '')
  const [country, setCountry] = useState(group.country || 'USA')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateGroup = trpc.groups.update.useMutation({
    onSuccess: () => {
      router.push(`/employee/admin/groups/${group.id}`)
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

    await updateGroup.mutateAsync({
      id: group.id,
      name,
      code: code || undefined,
      description: description || undefined,
      groupType: groupType as 'division' | 'branch' | 'team' | 'satellite_office' | 'producer',
      parentGroupId: parentGroupId || null,
      supervisorId: supervisorId || null,
      managerId: managerId || null,
      securityZone: securityZone || undefined,
      loadFactor,
      isActive,
      phone: phone || undefined,
      fax: fax || undefined,
      email: email || null,
      addressLine1: addressLine1 || undefined,
      addressLine2: addressLine2 || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country: country || undefined,
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Groups', href: '/employee/admin/groups' },
    { label: group.name, href: `/employee/admin/groups/${group.id}` },
    { label: 'Edit' },
  ]

  const isRootGroup = group.groupType === 'root'

  return (
    <DashboardShell
      title={`Edit: ${group.name}`}
      description="Update group settings and information"
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
                    disabled={isRootGroup}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="groupType" className="text-sm font-medium">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={groupType} 
                    onValueChange={setGroupType}
                    disabled={isRootGroup}
                  >
                    <SelectTrigger id="groupType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isRootGroup && (
                        <SelectItem value="root">Organization (Root)</SelectItem>
                      )}
                      {GROUP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!isRootGroup && (
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
                          .filter(p => p.id !== group.id && (p.groupType === 'root' || p.groupType === 'division'))
                          .map((parent) => (
                            <SelectItem key={parent.id} value={parent.id}>
                              {parent.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Active
                  </Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    disabled={isRootGroup}
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

                <div className="space-y-1.5">
                  <Label htmlFor="loadFactor" className="text-sm font-medium">
                    Load Factor (%)
                  </Label>
                  <Input
                    id="loadFactor"
                    type="number"
                    min={0}
                    max={200}
                    value={loadFactor}
                    onChange={(e) => setLoadFactor(parseInt(e.target.value) || 100)}
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
            onClick={() => router.push(`/employee/admin/groups/${group.id}`)}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </DashboardShell>
  )
}





