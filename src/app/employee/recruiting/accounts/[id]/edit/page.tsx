'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Loader2,
  Save,
  Building2,
  CreditCard,
  MessageSquare,
} from 'lucide-react'

const INDUSTRIES = [
  'technology', 'healthcare', 'finance', 'manufacturing', 'retail',
  'consulting', 'education', 'government', 'energy', 'media',
  'real_estate', 'other'
]

export default function EditAccountPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const accountId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    // Company Basics
    name: '',
    industry: '',
    companyType: 'direct_client' as 'direct_client' | 'implementation_partner' | 'staffing_vendor',
    status: 'prospect' as 'prospect' | 'active' | 'inactive',
    tier: '' as '' | 'preferred' | 'strategic' | 'exclusive',
    website: '',
    phone: '',
    headquartersLocation: '',
    description: '',
    // Billing
    billingEntityName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: '',
    billingFrequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    paymentTermsDays: '30',
    poRequired: false,
    // Communication
    preferredContactMethod: 'email' as 'email' | 'phone' | 'slack' | 'teams',
    meetingCadence: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
  })

  // Fetch account data
  const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })

  // Update mutation
  const updateMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Account updated successfully' })
      router.push(`/employee/recruiting/accounts/${accountId}`)
    },
    onError: (error) => {
      toast({ title: 'Error updating account', description: error.message, variant: 'error' })
      setIsSaving(false)
    },
  })

  // Populate form when data loads
  useEffect(() => {
    if (accountQuery.data) {
      const a = accountQuery.data
      setFormData({
        name: a.name || '',
        industry: a.industry || '',
        companyType: a.company_type || 'direct_client',
        status: a.status || 'prospect',
        tier: a.tier || '',
        website: a.website || '',
        phone: a.phone || '',
        headquartersLocation: a.headquarters_location || '',
        description: a.description || '',
        billingEntityName: a.billing_entity_name || '',
        billingEmail: a.billing_email || '',
        billingPhone: a.billing_phone || '',
        billingAddress: a.billing_address || '',
        billingCity: a.billing_city || '',
        billingState: a.billing_state || '',
        billingPostalCode: a.billing_postal_code || '',
        billingCountry: a.billing_country || '',
        billingFrequency: a.billing_frequency || 'monthly',
        paymentTermsDays: String(a.payment_terms_days || 30),
        poRequired: a.po_required || false,
        preferredContactMethod: a.preferred_contact_method || 'email',
        meetingCadence: a.meeting_cadence || 'weekly',
      })
    }
  }, [accountQuery.data])

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name || formData.name.length < 2) {
      toast({ title: 'Company name is required', description: 'Please enter at least 2 characters', variant: 'error' })
      return
    }

    setIsSaving(true)

    updateMutation.mutate({
      id: accountId,
      name: formData.name,
      industry: formData.industry || undefined,
      companyType: formData.companyType,
      status: formData.status,
      tier: formData.tier || undefined,
      website: formData.website || undefined,
      phone: formData.phone || undefined,
      headquartersLocation: formData.headquartersLocation || undefined,
      description: formData.description || undefined,
      billingEntityName: formData.billingEntityName || undefined,
      billingEmail: formData.billingEmail || undefined,
      billingPhone: formData.billingPhone || undefined,
      billingAddress: formData.billingAddress || undefined,
      billingCity: formData.billingCity || undefined,
      billingState: formData.billingState || undefined,
      billingPostalCode: formData.billingPostalCode || undefined,
      billingCountry: formData.billingCountry || undefined,
      billingFrequency: formData.billingFrequency,
      paymentTermsDays: parseInt(formData.paymentTermsDays) || 30,
      poRequired: formData.poRequired,
      preferredContactMethod: formData.preferredContactMethod,
      meetingCadence: formData.meetingCadence,
    })
  }

  if (accountQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!accountQuery.data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Account not found</h2>
          <p className="text-charcoal-500 mb-4">The account you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/employee/recruiting/accounts">Back to Accounts</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
          <Link href="/employee/workspace/dashboard" className="hover:text-hublot-700 transition-colors">
            My Work
          </Link>
          <span>/</span>
          <Link href="/employee/recruiting/accounts" className="hover:text-hublot-700 transition-colors">
            Accounts
          </Link>
          <span>/</span>
          <Link href={`/employee/recruiting/accounts/${accountId}`} className="hover:text-hublot-700 transition-colors">
            {accountQuery.data.name}
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-medium">Edit</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/employee/recruiting/accounts/${accountId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Edit Account</h1>
              <p className="text-charcoal-500">{accountQuery.data.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href={`/employee/recruiting/accounts/${accountId}`}>Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Company Basics */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-charcoal-500" />
              <CardTitle>Company Information</CardTitle>
            </div>
            <CardDescription>Basic company details and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind} className="capitalize">
                        {ind.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="companyType">Company Type</Label>
                <Select value={formData.companyType} onValueChange={(v) => updateField('companyType', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct_client">Direct Client</SelectItem>
                    <SelectItem value="implementation_partner">Implementation Partner</SelectItem>
                    <SelectItem value="staffing_vendor">Staffing Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tier">Partnership Tier</Label>
                <Select value={formData.tier || 'none'} onValueChange={(v) => updateField('tier', v === 'none' ? '' : v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select tier (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="preferred">Preferred</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                    <SelectItem value="exclusive">Exclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="headquartersLocation">Headquarters Location</Label>
                <Input
                  id="headquartersLocation"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.headquartersLocation}
                  onChange={(e) => updateField('headquartersLocation', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the company..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-charcoal-500" />
              <CardTitle>Billing Information</CardTitle>
            </div>
            <CardDescription>Payment and invoicing details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="billingEntityName">Legal Billing Entity Name</Label>
                <Input
                  id="billingEntityName"
                  placeholder="Legal name for invoicing"
                  value={formData.billingEntityName}
                  onChange={(e) => updateField('billingEntityName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  placeholder="billing@company.com"
                  value={formData.billingEmail}
                  onChange={(e) => updateField('billingEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingPhone">Billing Phone</Label>
                <Input
                  id="billingPhone"
                  placeholder="(555) 123-4567"
                  value={formData.billingPhone}
                  onChange={(e) => updateField('billingPhone', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  placeholder="Street address"
                  value={formData.billingAddress}
                  onChange={(e) => updateField('billingAddress', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingCity">City</Label>
                <Input
                  id="billingCity"
                  value={formData.billingCity}
                  onChange={(e) => updateField('billingCity', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingState">State</Label>
                <Input
                  id="billingState"
                  value={formData.billingState}
                  onChange={(e) => updateField('billingState', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingPostalCode">Postal Code</Label>
                <Input
                  id="billingPostalCode"
                  value={formData.billingPostalCode}
                  onChange={(e) => updateField('billingPostalCode', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingCountry">Country</Label>
                <Input
                  id="billingCountry"
                  value={formData.billingCountry}
                  onChange={(e) => updateField('billingCountry', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingFrequency">Billing Frequency</Label>
                <Select value={formData.billingFrequency} onValueChange={(v) => updateField('billingFrequency', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                <Input
                  id="paymentTermsDays"
                  type="number"
                  value={formData.paymentTermsDays}
                  onChange={(e) => updateField('paymentTermsDays', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-2">
                <Checkbox
                  id="poRequired"
                  checked={formData.poRequired}
                  onCheckedChange={(checked) => updateField('poRequired', !!checked)}
                />
                <Label htmlFor="poRequired" className="cursor-pointer">Purchase Order (PO) Required</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-charcoal-500" />
              <CardTitle>Communication Preferences</CardTitle>
            </div>
            <CardDescription>How this client prefers to be contacted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                <Select value={formData.preferredContactMethod} onValueChange={(v) => updateField('preferredContactMethod', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meetingCadence">Meeting Cadence</Label>
                <Select value={formData.meetingCadence} onValueChange={(v) => updateField('meetingCadence', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" asChild>
            <Link href={`/employee/recruiting/accounts/${accountId}`}>Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

