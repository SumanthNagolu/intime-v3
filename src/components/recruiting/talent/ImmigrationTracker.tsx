'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Plus,
  Shield,
  AlertCircle,
  Loader2,
  Edit2,
  Save,
  X,
} from 'lucide-react'
import { format, differenceInDays, addDays } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImmigrationTrackerProps {
  consultantId: string
  visaType?: string
  visaExpiryDate?: string
  workAuthStatus?: string
  onUpdate?: (data: {
    visaType?: string
    visaExpiryDate?: string
    workAuthStatus?: string
  }) => void
  isUpdating?: boolean
}

const visaLabels: Record<string, string> = {
  h1b: 'H-1B',
  h1b_transfer: 'H-1B Transfer',
  l1: 'L-1',
  opt: 'OPT',
  opt_stem: 'OPT STEM',
  cpt: 'CPT',
  gc: 'Green Card',
  us_citizen: 'US Citizen',
  ead: 'EAD',
  tn: 'TN',
  h4_ead: 'H-4 EAD',
  l2_ead: 'L-2 EAD',
}

const visaDescriptions: Record<string, string> = {
  h1b: 'Specialty occupation visa for workers in specialized fields',
  h1b_transfer: 'H-1B visa being transferred from another employer',
  l1: 'Intracompany transferee visa',
  opt: 'Optional Practical Training for F-1 students',
  opt_stem: 'STEM extension of OPT for eligible F-1 students',
  cpt: 'Curricular Practical Training for F-1 students',
  gc: 'Permanent residency - no work restrictions',
  us_citizen: 'US Citizenship - no work restrictions',
  ead: 'Employment Authorization Document',
  tn: 'NAFTA professional worker visa',
  h4_ead: 'EAD for H-4 dependents',
  l2_ead: 'EAD for L-2 dependents',
}

const workAuthStatuses = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
  { value: 'renewal', label: 'Renewal in Progress', color: 'bg-blue-100 text-blue-800' },
]

interface TimelineEvent {
  id: string
  date: string
  type: 'visa_granted' | 'visa_extended' | 'status_change' | 'document_uploaded' | 'reminder'
  title: string
  description?: string
}

export function ImmigrationTracker({
  consultantId,
  visaType,
  visaExpiryDate,
  workAuthStatus,
  onUpdate,
  isUpdating = false,
}: ImmigrationTrackerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    visaType: visaType || '',
    visaExpiryDate: visaExpiryDate || '',
    workAuthStatus: workAuthStatus || 'active',
  })
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [reminderDate, setReminderDate] = useState('')
  const [reminderNote, setReminderNote] = useState('')

  // Calculate days until expiry
  const daysUntilExpiry = visaExpiryDate
    ? differenceInDays(new Date(visaExpiryDate), new Date())
    : null

  // Determine alert level
  const getExpiryAlert = () => {
    if (daysUntilExpiry === null) return null
    if (daysUntilExpiry < 0) return { level: 'expired', message: 'Visa has expired' }
    if (daysUntilExpiry <= 30) return { level: 'critical', message: `Expires in ${daysUntilExpiry} days` }
    if (daysUntilExpiry <= 60) return { level: 'warning', message: `Expires in ${daysUntilExpiry} days` }
    if (daysUntilExpiry <= 90) return { level: 'notice', message: `Expires in ${daysUntilExpiry} days` }
    return null
  }

  const expiryAlert = getExpiryAlert()

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        visaType: editData.visaType || undefined,
        visaExpiryDate: editData.visaExpiryDate || undefined,
        workAuthStatus: editData.workAuthStatus || undefined,
      })
    }
    setIsEditing(false)
    toast.success('Immigration info updated')
  }

  const handleSetReminder = () => {
    if (!reminderDate) {
      toast.error('Please select a reminder date')
      return
    }
    // In a real implementation, this would save to the database
    toast.success(`Reminder set for ${format(new Date(reminderDate), 'MMM d, yyyy')}`)
    setReminderDialogOpen(false)
    setReminderDate('')
    setReminderNote('')
  }

  // Mock timeline events - in reality these would come from the database
  const timelineEvents: TimelineEvent[] = [
    ...(visaType && visaExpiryDate ? [{
      id: '1',
      date: new Date().toISOString(),
      type: 'visa_granted' as const,
      title: `${visaLabels[visaType] || visaType} Status`,
      description: `Valid until ${format(new Date(visaExpiryDate), 'MMMM d, yyyy')}`
    }] : []),
  ]

  const isUnrestricted = visaType === 'us_citizen' || visaType === 'gc'

  return (
    <div className="space-y-6">
      {/* Expiry Alert Banner */}
      {expiryAlert && !isUnrestricted && (
        <Card className={cn(
          "border-2",
          expiryAlert.level === 'expired' ? "border-red-300 bg-red-50" :
          expiryAlert.level === 'critical' ? "border-red-300 bg-red-50" :
          expiryAlert.level === 'warning' ? "border-amber-200 bg-amber-50" :
          "border-blue-200 bg-blue-50"
        )}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={cn(
                  "h-6 w-6",
                  expiryAlert.level === 'expired' || expiryAlert.level === 'critical' ? "text-red-600" :
                  expiryAlert.level === 'warning' ? "text-amber-600" : "text-blue-600"
                )} />
                <div>
                  <p className={cn(
                    "font-medium",
                    expiryAlert.level === 'expired' || expiryAlert.level === 'critical' ? "text-red-800" :
                    expiryAlert.level === 'warning' ? "text-amber-800" : "text-blue-800"
                  )}>
                    {expiryAlert.message}
                  </p>
                  <p className={cn(
                    "text-sm",
                    expiryAlert.level === 'expired' || expiryAlert.level === 'critical' ? "text-red-600" :
                    expiryAlert.level === 'warning' ? "text-amber-600" : "text-blue-600"
                  )}>
                    {visaLabels[visaType || ''] || visaType} expires on {visaExpiryDate ? format(new Date(visaExpiryDate), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={expiryAlert.level === 'expired' || expiryAlert.level === 'critical' ? 'destructive' : 'outline'}
                onClick={() => setReminderDialogOpen(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Work Authorization</CardTitle>
            <CardDescription>Immigration status and visa information</CardDescription>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => {
              setEditData({
                visaType: visaType || '',
                visaExpiryDate: visaExpiryDate || '',
                workAuthStatus: workAuthStatus || 'active',
              })
              setIsEditing(true)
            }}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visaType">Visa Type</Label>
                <Select
                  value={editData.visaType}
                  onValueChange={(value) => setEditData({ ...editData, visaType: value })}
                >
                  <SelectTrigger id="visaType">
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us_citizen">US Citizen</SelectItem>
                    <SelectItem value="gc">Green Card</SelectItem>
                    <SelectItem value="h1b">H-1B</SelectItem>
                    <SelectItem value="h1b_transfer">H-1B Transfer</SelectItem>
                    <SelectItem value="l1">L-1</SelectItem>
                    <SelectItem value="opt">OPT</SelectItem>
                    <SelectItem value="opt_stem">OPT STEM</SelectItem>
                    <SelectItem value="cpt">CPT</SelectItem>
                    <SelectItem value="ead">EAD</SelectItem>
                    <SelectItem value="tn">TN</SelectItem>
                    <SelectItem value="h4_ead">H-4 EAD</SelectItem>
                    <SelectItem value="l2_ead">L-2 EAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visaExpiry">Expiry Date</Label>
                <Input
                  id="visaExpiry"
                  type="date"
                  value={editData.visaExpiryDate}
                  onChange={(e) => setEditData({ ...editData, visaExpiryDate: e.target.value })}
                  disabled={editData.visaType === 'us_citizen' || editData.visaType === 'gc'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authStatus">Status</Label>
                <Select
                  value={editData.workAuthStatus}
                  onValueChange={(value) => setEditData({ ...editData, workAuthStatus: value })}
                >
                  <SelectTrigger id="authStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workAuthStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-charcoal-400" />
                  <Label className="text-charcoal-500">Visa Type</Label>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-charcoal-900">
                    {visaType ? visaLabels[visaType] || visaType : 'Not specified'}
                  </p>
                  {isUnrestricted && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      No Restrictions
                    </Badge>
                  )}
                </div>
                {visaType && visaDescriptions[visaType] && (
                  <p className="text-sm text-charcoal-500">{visaDescriptions[visaType]}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-charcoal-400" />
                  <Label className="text-charcoal-500">Expiry Date</Label>
                </div>
                {isUnrestricted ? (
                  <p className="text-lg font-medium text-green-600">N/A - No Expiry</p>
                ) : (
                  <p className={cn(
                    "text-lg font-medium",
                    daysUntilExpiry !== null && daysUntilExpiry <= 30 ? "text-red-600" :
                    daysUntilExpiry !== null && daysUntilExpiry <= 60 ? "text-amber-600" :
                    "text-charcoal-900"
                  )}>
                    {visaExpiryDate ? format(new Date(visaExpiryDate), 'MMMM d, yyyy') : 'Not specified'}
                  </p>
                )}
                {daysUntilExpiry !== null && !isUnrestricted && (
                  <p className="text-sm text-charcoal-500">
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-charcoal-400" />
                  <Label className="text-charcoal-500">Authorization Status</Label>
                </div>
                <div>
                  {workAuthStatus ? (
                    <Badge className={workAuthStatuses.find(s => s.value === workAuthStatus)?.color || 'bg-charcoal-100'}>
                      {workAuthStatuses.find(s => s.value === workAuthStatus)?.label || workAuthStatus}
                    </Badge>
                  ) : (
                    <Badge className="bg-charcoal-100 text-charcoal-600">Not specified</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setReminderDialogOpen(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
            <Button variant="outline" onClick={() => toast.info('Document upload coming soon')}>
              <FileText className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
            <Button variant="outline" onClick={() => toast.info('History view coming soon')}>
              <Calendar className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Dates */}
      {!isUnrestricted && visaExpiryDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-charcoal-900">90-Day Warning</p>
                    <p className="text-sm text-charcoal-600">Start renewal process</p>
                  </div>
                </div>
                <p className="text-charcoal-700">
                  {format(addDays(new Date(visaExpiryDate), -90), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-charcoal-900">Visa Expiry</p>
                    <p className="text-sm text-charcoal-600">Must be renewed before this date</p>
                  </div>
                </div>
                <p className="text-charcoal-700">
                  {format(new Date(visaExpiryDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Set Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Immigration Reminder</DialogTitle>
            <DialogDescription>
              Set a reminder for visa-related tasks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminderDate">Reminder Date</Label>
              <Input
                id="reminderDate"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderNote">Note (optional)</Label>
              <Textarea
                id="reminderNote"
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                placeholder="Add a note about this reminder..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetReminder}>
              <Clock className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
