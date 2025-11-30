/**
 * Talent Profile Sections
 *
 * Complete 14-section enterprise profile for talent/candidates.
 * Covers all data points needed for multi-country staffing operations.
 */

'use client';

import React from 'react';
import { format, differenceInDays } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Link2,
  AlertTriangle,
  Shield,
  GraduationCap,
  Building2,
  Briefcase,
  Award,
  Users,
  FileCheck,
  Search,
  FileText,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  Eye,
  Star,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// =====================================================
// TYPES
// =====================================================

interface TalentProfile {
  // Basic info
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  preferredName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  avatarUrl?: string | null;
  profilePictureUrl?: string | null;

  // Contact
  email?: string | null;
  emailSecondary?: string | null;
  phone?: string | null;
  phoneHome?: string | null;
  phoneWork?: string | null;
  preferredContactMethod?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  personalWebsite?: string | null;
  doNotContact?: boolean | null;
  doNotEmail?: boolean | null;
  doNotText?: boolean | null;

  // Emergency contact
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;

  // Professional
  professionalHeadline?: string | null;
  professionalSummary?: string | null;
  careerObjectives?: string | null;
  candidateExperienceYears?: number | null;
  candidateSkills?: string[] | null;
  tags?: string[] | null;
  categories?: string[] | null;

  // Visa/Work Auth
  candidateCurrentVisa?: string | null;
  candidateVisaExpiry?: string | null;

  // Rate/Availability
  candidateHourlyRate?: number | string | null;
  candidateAvailability?: string | null;
  candidateBenchStartDate?: string | null;
  candidateStatus?: string | null;
  candidateLocation?: string | null;
  candidateWillingToRelocate?: boolean | null;
  candidateResumeUrl?: string | null;

  // Compensation preferences
  desiredSalaryAnnual?: number | null;
  desiredSalaryCurrency?: string | null;
  minimumHourlyRate?: number | null;
  minimumAnnualSalary?: number | null;
  benefitsRequired?: string[] | null;
  compensationNotes?: string | null;

  // Source
  leadSource?: string | null;
  leadSourceDetail?: string | null;
  marketingStatus?: string | null;
  isOnHotlist?: boolean | null;
  hotlistAddedAt?: string | null;
  hotlistNotes?: string | null;

  // Rating
  recruiterRating?: number | null;
  recruiterRatingNotes?: string | null;
  profileCompletenessScore?: number | null;

  // Timestamps
  createdAt?: string | null;
  updatedAt?: string | null;
  lastContactedAt?: string | null;
  timezone?: string | null;
}

interface SectionProps {
  talent: TalentProfile;
  canEdit: boolean;
  onEdit?: () => void;
}

// =====================================================
// 1. PERSONAL SECTION
// =====================================================

export function PersonalSection({ talent, canEdit, onEdit }: SectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo & Basic Info */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={talent.avatarUrl || talent.profilePictureUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {((talent.firstName?.[0] || '') + (talent.lastName?.[0] || '')).toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Legal First Name</Label>
                <p className="font-medium">{talent.firstName || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Legal Last Name</Label>
                <p className="font-medium">{talent.lastName || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Middle Name</Label>
                <p className="font-medium">{talent.middleName || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Preferred Name</Label>
                <p className="font-medium">{talent.preferredName || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Personal Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Date of Birth</Label>
              <p className="font-medium">
                {talent.dateOfBirth ? format(new Date(talent.dateOfBirth), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Gender</Label>
              <p className="font-medium capitalize">{talent.gender || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nationality</Label>
              <p className="font-medium">{talent.nationality || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Timezone</Label>
              <p className="font-medium">{talent.timezone || 'America/New_York'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Contact Name</Label>
              <p className="font-medium">{talent.emergencyContactName || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Relationship</Label>
              <p className="font-medium capitalize">{talent.emergencyContactRelationship || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <p className="font-medium">{talent.emergencyContactPhone || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium">{talent.emergencyContactEmail || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 2. CONTACT SECTION
// =====================================================

export function ContactSection({ talent, canEdit, onEdit }: SectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Information
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Communication Preferences */}
          {(talent.doNotContact || talent.doNotEmail || talent.doNotText) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <Lock className="w-4 h-4" />
                <span className="font-medium">Communication Restrictions</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {talent.doNotContact && <Badge variant="destructive">Do Not Contact</Badge>}
                {talent.doNotEmail && <Badge variant="destructive">Do Not Email</Badge>}
                {talent.doNotText && <Badge variant="destructive">Do Not Text</Badge>}
              </div>
            </div>
          )}

          {/* Email Addresses */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Email Addresses</Label>
            <div className="space-y-2">
              {talent.email && (
                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${talent.email}`} className="text-rust hover:underline flex-1">
                    {talent.email}
                  </a>
                  <Badge variant="secondary">Primary</Badge>
                </div>
              )}
              {talent.emailSecondary && (
                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${talent.emailSecondary}`} className="text-rust hover:underline flex-1">
                    {talent.emailSecondary}
                  </a>
                  <Badge variant="outline">Secondary</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Phone Numbers</Label>
            <div className="space-y-2">
              {talent.phone && (
                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${talent.phone}`} className="text-rust hover:underline flex-1">
                    {talent.phone}
                  </a>
                  <Badge variant="secondary">Mobile</Badge>
                </div>
              )}
              {talent.phoneHome && (
                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{talent.phoneHome}</span>
                  <Badge variant="outline">Home</Badge>
                </div>
              )}
              {talent.phoneWork && (
                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{talent.phoneWork}</span>
                  <Badge variant="outline">Work</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Social Links */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Online Profiles</Label>
            <div className="grid grid-cols-2 gap-3">
              {talent.linkedinUrl && (
                <a
                  href={talent.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">LinkedIn</span>
                </a>
              )}
              {talent.githubUrl && (
                <a
                  href={talent.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span className="text-sm">GitHub</span>
                </a>
              )}
              {talent.portfolioUrl && (
                <a
                  href={talent.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Link2 className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Portfolio</span>
                </a>
              )}
              {talent.personalWebsite && (
                <a
                  href={talent.personalWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Globe className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Contact Preference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Preferred Contact Method</Label>
              <p className="font-medium capitalize">{talent.preferredContactMethod || 'Email'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Contacted</Label>
              <p className="font-medium">
                {talent.lastContactedAt
                  ? format(new Date(talent.lastContactedAt), 'MMM d, yyyy')
                  : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 3. PROFESSIONAL SECTION
// =====================================================

export function ProfessionalSection({ talent, canEdit, onEdit }: SectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Professional Profile
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Headline */}
          <div>
            <Label className="text-xs text-muted-foreground">Professional Headline</Label>
            <p className="text-lg font-medium">{talent.professionalHeadline || 'No headline set'}</p>
          </div>

          {/* Summary */}
          <div>
            <Label className="text-xs text-muted-foreground">Professional Summary</Label>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {talent.professionalSummary || 'No summary provided'}
            </p>
          </div>

          <Separator />

          {/* Career Objectives */}
          <div>
            <Label className="text-xs text-muted-foreground">Career Objectives</Label>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {talent.careerObjectives || 'No career objectives specified'}
            </p>
          </div>

          <Separator />

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-2xl font-bold">{talent.candidateExperienceYears || 0}</p>
              <p className="text-xs text-muted-foreground">Years Experience</p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-2xl font-bold">{talent.candidateSkills?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Skills</p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-2xl font-bold">{talent.recruiterRating || '-'}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <p className="text-2xl font-bold">{talent.profileCompletenessScore || 0}%</p>
              <p className="text-xs text-muted-foreground">Profile Complete</p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="text-sm font-medium">Skills & Technologies</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {talent.candidateSkills?.length ? (
                talent.candidateSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed</p>
              )}
            </div>
          </div>

          {/* Tags & Categories */}
          {(talent.tags?.length || talent.categories?.length) && (
            <div className="grid grid-cols-2 gap-4">
              {talent.tags?.length && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {talent.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {talent.categories?.length && (
                <div>
                  <Label className="text-xs text-muted-foreground">Categories</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {talent.categories.map((cat, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 4. ADDRESSES SECTION
// =====================================================

interface Address {
  id: string;
  addressType: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  countryCode: string;
  isPrimary: boolean;
  isVerified: boolean;
}

export function AddressesSection({ talent: _talent, canEdit, addresses = [] }: SectionProps & { addresses?: Address[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Addresses
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No addresses on file</p>
              <p className="text-sm">Add current and permanent addresses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={address.isPrimary ? 'default' : 'outline'}>
                          {address.addressType}
                        </Badge>
                        {address.isPrimary && <Badge variant="secondary">Primary</Badge>}
                        {address.isVerified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{address.addressLine1}</p>
                      {address.addressLine2 && <p className="text-sm">{address.addressLine2}</p>}
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.stateProvince} {address.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.countryCode}</p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 5. WORK AUTHORIZATION SECTION
// =====================================================

interface WorkAuthorization {
  id: string;
  authorizationType: string;
  visaType?: string;
  status: string;
  issueDate?: string;
  expiryDate?: string;
  requiresSponsorship: boolean;
  i9Completed: boolean;
  eVerifyStatus?: string;
  isPrimary: boolean;
}

export function WorkAuthSection({ talent, canEdit, authorizations = [] }: SectionProps & { authorizations?: WorkAuthorization[] }) {
  const daysUntilExpiry = talent.candidateVisaExpiry
    ? differenceInDays(new Date(talent.candidateVisaExpiry), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Current Status Summary */}
      <Card className={cn(
        daysUntilExpiry !== null && daysUntilExpiry <= 90 && 'border-red-200 bg-red-50/50'
      )}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Current Work Authorization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Current Visa Type</Label>
              <p className="text-xl font-bold">{talent.candidateCurrentVisa || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Expiry Date</Label>
              <p className="font-medium">
                {talent.candidateVisaExpiry
                  ? format(new Date(talent.candidateVisaExpiry), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Days Remaining</Label>
              <p className={cn(
                'text-xl font-bold',
                daysUntilExpiry !== null && daysUntilExpiry <= 90 ? 'text-red-600' : 'text-green-600'
              )}>
                {daysUntilExpiry !== null ? daysUntilExpiry : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Badge className={cn(
                daysUntilExpiry !== null && daysUntilExpiry <= 0 ? 'bg-red-100 text-red-700' :
                daysUntilExpiry !== null && daysUntilExpiry <= 90 ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              )}>
                {daysUntilExpiry !== null && daysUntilExpiry <= 0 ? 'Expired' :
                 daysUntilExpiry !== null && daysUntilExpiry <= 90 ? 'Expiring Soon' : 'Valid'}
              </Badge>
            </div>
          </div>

          {daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry > 0 && (
            <div className="mt-4 p-3 bg-amber-100 rounded-lg flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Work authorization expires in {daysUntilExpiry} days - initiate renewal process
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authorization History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Authorization Records
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {authorizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No authorization records</p>
              <p className="text-sm">Add I-9, visa, and work permit information</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Visa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>I-9</TableHead>
                  <TableHead>E-Verify</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorizations.map((auth) => (
                  <TableRow key={auth.id}>
                    <TableCell className="font-medium">{auth.authorizationType}</TableCell>
                    <TableCell>{auth.visaType || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={auth.status === 'active' ? 'default' : 'secondary'}>
                        {auth.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {auth.expiryDate ? format(new Date(auth.expiryDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {auth.i9Completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>{auth.eVerifyStatus || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 6. EDUCATION SECTION
// =====================================================

interface Education {
  id: string;
  degreeType: string;
  degreeName: string;
  fieldOfStudy: string;
  institutionName: string;
  institutionCity?: string;
  institutionCountry?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  gpa?: number;
  honors?: string;
  isVerified: boolean;
}

export function EducationSection({ canEdit, education = [] }: SectionProps & { education?: Education[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Education
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {education.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No education records</p>
              <p className="text-sm">Add degrees, certifications, and training</p>
            </div>
          ) : (
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{edu.degreeName}</p>
                        {edu.isVerified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                      <p className="text-sm font-medium mt-1">{edu.institutionName}</p>
                      <p className="text-xs text-muted-foreground">
                        {edu.institutionCity && `${edu.institutionCity}, `}
                        {edu.institutionCountry}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>
                          {edu.startDate && format(new Date(edu.startDate), 'yyyy')} -
                          {edu.isCurrent ? ' Present' : edu.endDate && ` ${format(new Date(edu.endDate), 'yyyy')}`}
                        </span>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        {edu.honors && <Badge variant="outline">{edu.honors}</Badge>}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 7. EXPERIENCE SECTION
// =====================================================

interface WorkHistory {
  id: string;
  companyName: string;
  jobTitle: string;
  employmentType?: string;
  locationCity?: string;
  locationCountry?: string;
  isRemote: boolean;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  skillsUsed?: string[];
  isVerified: boolean;
}

export function ExperienceSection({ talent, canEdit, workHistory = [] }: SectionProps & { workHistory?: WorkHistory[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Work Experience
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            )}
          </div>
          <CardDescription>
            Total Experience: {talent.candidateExperienceYears || 0} years
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No work experience recorded</p>
              <p className="text-sm">Add employment history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workHistory.map((job, index) => (
                <div key={job.id} className="relative">
                  {index > 0 && <div className="absolute left-4 -top-4 h-4 w-0.5 bg-border" />}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{job.jobTitle}</p>
                            {job.isCurrent && <Badge>Current</Badge>}
                            {job.isVerified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{job.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.locationCity && `${job.locationCity}, `}
                            {job.locationCountry}
                            {job.isRemote && ' (Remote)'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(job.startDate), 'MMM yyyy')} -
                            {job.isCurrent ? ' Present' : job.endDate && ` ${format(new Date(job.endDate), 'MMM yyyy')}`}
                            {job.employmentType && ` • ${job.employmentType}`}
                          </p>
                          {job.description && (
                            <p className="text-sm mt-2 text-muted-foreground">{job.description}</p>
                          )}
                          {job.skillsUsed?.length && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.skillsUsed.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 8. CERTIFICATIONS SECTION
// =====================================================

interface Certification {
  id: string;
  certificationType: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  isLifetime: boolean;
  credentialId?: string;
  credentialUrl?: string;
  clearanceLevel?: string;
  isVerified: boolean;
}

export function CertificationsSection({ canEdit, certifications = [] }: SectionProps & { certifications?: Certification[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications & Licenses
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No certifications on file</p>
              <p className="text-sm">Add professional certifications and licenses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        cert.clearanceLevel ? 'bg-red-100' : 'bg-amber-100'
                      )}>
                        {cert.clearanceLevel ? (
                          <Shield className="w-5 h-5 text-red-600" />
                        ) : (
                          <Award className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cert.name}</p>
                          {cert.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {cert.issueDate && (
                            <span>Issued: {format(new Date(cert.issueDate), 'MMM yyyy')}</span>
                          )}
                          {!cert.isLifetime && cert.expiryDate && (
                            <span>• Expires: {format(new Date(cert.expiryDate), 'MMM yyyy')}</span>
                          )}
                          {cert.isLifetime && <Badge variant="outline">Lifetime</Badge>}
                        </div>
                        {cert.clearanceLevel && (
                          <Badge className="mt-2 bg-red-100 text-red-700">
                            Clearance: {cert.clearanceLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 9. REFERENCES SECTION
// =====================================================

interface Reference {
  id: string;
  referenceName: string;
  referenceTitle?: string;
  referenceCompany?: string;
  relationshipType: string;
  email?: string;
  phone?: string;
  status: string;
  rating?: number;
  feedbackSummary?: string;
}

export function ReferencesSection({ canEdit, references = [] }: SectionProps & { references?: Reference[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Professional References
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Reference
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {references.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No references on file</p>
              <p className="text-sm">Add professional references</p>
            </div>
          ) : (
            <div className="space-y-4">
              {references.map((ref) => (
                <div key={ref.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{ref.referenceName}</p>
                        <Badge variant={
                          ref.status === 'completed' ? 'default' :
                          ref.status === 'contacted' ? 'secondary' : 'outline'
                        }>
                          {ref.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ref.referenceTitle} at {ref.referenceCompany}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Relationship: {ref.relationshipType}
                      </p>
                      {ref.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'w-4 h-4',
                                star <= ref.rating! ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                              )}
                            />
                          ))}
                        </div>
                      )}
                      {ref.feedbackSummary && (
                        <p className="text-sm mt-2 italic text-muted-foreground">
                          &quot;{ref.feedbackSummary}&quot;
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Request Check
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 10. COMPLIANCE SECTION
// =====================================================

interface ComplianceDoc {
  id: string;
  documentType: string;
  documentName: string;
  status: string;
  requiredBy?: string;
  submittedAt?: string;
  approvedAt?: string;
  expiresAt?: string;
  requiresSignature: boolean;
  isSigned: boolean;
}

export function ComplianceSection({ canEdit, documents = [] }: SectionProps & { documents?: ComplianceDoc[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Compliance Documents
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Request Document
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No compliance documents</p>
              <p className="text-sm">Request and track required documents</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Required By</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doc.documentName}</p>
                        <p className="text-xs text-muted-foreground">{doc.documentType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        doc.status === 'approved' ? 'default' :
                        doc.status === 'pending' ? 'secondary' :
                        doc.status === 'expired' ? 'destructive' : 'outline'
                      }>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.requiredBy ? format(new Date(doc.requiredBy), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {doc.expiresAt ? format(new Date(doc.expiresAt), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {doc.requiresSignature ? (
                        doc.isSigned ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600" />
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 11. BACKGROUND CHECKS SECTION
// =====================================================

interface BackgroundCheck {
  id: string;
  provider: string;
  packageName: string;
  status: string;
  overallResult?: string;
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
  adjudicationStatus?: string;
}

export function BackgroundSection({ canEdit, checks = [] }: SectionProps & { checks?: BackgroundCheck[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="w-4 h-4" />
              Background Checks
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Initiate Check
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No background checks</p>
              <p className="text-sm">Initiate background verification</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checks.map((check) => (
                <div key={check.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{check.packageName}</p>
                        <Badge variant={
                          check.status === 'completed' ? 'default' :
                          check.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {check.status}
                        </Badge>
                        {check.overallResult && (
                          <Badge className={cn(
                            check.overallResult === 'clear' ? 'bg-green-100 text-green-700' :
                            check.overallResult === 'consider' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {check.overallResult}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Provider: {check.provider}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Requested: {format(new Date(check.requestedAt), 'MMM d, yyyy')}</span>
                        {check.completedAt && (
                          <span>Completed: {format(new Date(check.completedAt), 'MMM d, yyyy')}</span>
                        )}
                        {check.expiresAt && (
                          <span>Expires: {format(new Date(check.expiresAt), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                      {check.adjudicationStatus && (
                        <p className="text-sm mt-2">
                          Adjudication: <span className="font-medium">{check.adjudicationStatus}</span>
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="sm">
                        View Report
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 12. RESUMES SECTION
// =====================================================

interface Resume {
  id: string;
  version: number;
  isLatest: boolean;
  resumeType: string;
  title?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  aiSummary?: string;
  parsedSkills?: string[];
}

export function ResumesSection({ talent, canEdit, resumes = [] }: SectionProps & { resumes?: Resume[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resumes
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 && !talent.candidateResumeUrl ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No resumes uploaded</p>
              <p className="text-sm">Upload master and formatted resumes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Legacy resume URL */}
              {talent.candidateResumeUrl && resumes.length === 0 && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Resume</p>
                        <p className="text-xs text-muted-foreground">Legacy upload</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Resume versions */}
              {resumes.map((resume) => (
                <div key={resume.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-muted-foreground mt-1" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{resume.title || resume.fileName}</p>
                          {resume.isLatest && <Badge>Latest</Badge>}
                          <Badge variant="outline">{resume.resumeType}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Version {resume.version} • {(resume.fileSize / 1024).toFixed(1)} KB •
                          Uploaded {format(new Date(resume.uploadedAt), 'MMM d, yyyy')}
                        </p>
                        {resume.aiSummary && (
                          <p className="text-sm mt-2 text-muted-foreground">{resume.aiSummary}</p>
                        )}
                        {resume.parsedSkills?.length && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resume.parsedSkills.slice(0, 10).map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                            {resume.parsedSkills.length > 10 && (
                              <Badge variant="outline" className="text-xs">
                                +{resume.parsedSkills.length - 10} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 13. COMPENSATION SECTION
// =====================================================

export function CompensationSection({ talent, canEdit, onEdit }: SectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Compensation Preferences
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Rate */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">
                ${Number(talent.candidateHourlyRate || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Current Hourly Rate</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg text-center">
              <p className="text-2xl font-bold">
                ${Number(talent.minimumHourlyRate || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Minimum Hourly</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg text-center">
              <p className="text-2xl font-bold">
                ${Number(talent.desiredSalaryAnnual || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Desired Annual</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-lg text-center">
              <p className="text-2xl font-bold">
                ${Number(talent.minimumAnnualSalary || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Minimum Annual</p>
            </div>
          </div>

          <Separator />

          {/* Benefits Requirements */}
          <div>
            <Label className="text-sm font-medium">Required Benefits</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {talent.benefitsRequired?.length ? (
                talent.benefitsRequired.map((benefit, i) => (
                  <Badge key={i} variant="secondary">{benefit}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No specific benefits required</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {talent.compensationNotes && (
            <div>
              <Label className="text-sm font-medium">Compensation Notes</Label>
              <p className="text-sm text-muted-foreground mt-1">{talent.compensationNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// 14. SOURCE SECTION
// =====================================================

export function SourceSection({ talent, canEdit, onEdit }: SectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Source & Attribution
            </CardTitle>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Lead Source</Label>
              <p className="font-medium">{talent.leadSource || 'Unknown'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Source Detail</Label>
              <p className="font-medium">{talent.leadSourceDetail || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Marketing Status</Label>
              <Badge variant="outline">{talent.marketingStatus || 'Not Set'}</Badge>
            </div>
          </div>

          <Separator />

          {/* Hotlist Status */}
          <div className="p-4 bg-stone-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className={cn(
                  'w-6 h-6',
                  talent.isOnHotlist ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                )} />
                <div>
                  <p className="font-medium">
                    {talent.isOnHotlist ? 'On Hotlist' : 'Not on Hotlist'}
                  </p>
                  {talent.isOnHotlist && talent.hotlistAddedAt && (
                    <p className="text-xs text-muted-foreground">
                      Added {format(new Date(talent.hotlistAddedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
              {canEdit && (
                <Button variant={talent.isOnHotlist ? 'outline' : 'default'} size="sm">
                  {talent.isOnHotlist ? 'Remove from Hotlist' : 'Add to Hotlist'}
                </Button>
              )}
            </div>
            {talent.hotlistNotes && (
              <p className="text-sm text-muted-foreground mt-3">{talent.hotlistNotes}</p>
            )}
          </div>

          {/* Profile Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Created</Label>
              <p className="font-medium">
                {talent.createdAt ? format(new Date(talent.createdAt), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <p className="font-medium">
                {talent.updatedAt ? format(new Date(talent.updatedAt), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Contacted</Label>
              <p className="font-medium">
                {talent.lastContactedAt ? format(new Date(talent.lastContactedAt), 'MMM d, yyyy') : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// EXPORTS
// =====================================================

export const PROFILE_SECTIONS = [
  { id: 'personal', label: 'Personal', icon: User, component: PersonalSection },
  { id: 'contact', label: 'Contact', icon: Mail, component: ContactSection },
  { id: 'professional', label: 'Professional', icon: Briefcase, component: ProfessionalSection },
  { id: 'addresses', label: 'Addresses', icon: MapPin, component: AddressesSection },
  { id: 'workauth', label: 'Work Auth', icon: Shield, component: WorkAuthSection },
  { id: 'education', label: 'Education', icon: GraduationCap, component: EducationSection },
  { id: 'experience', label: 'Experience', icon: Building2, component: ExperienceSection },
  { id: 'certifications', label: 'Certifications', icon: Award, component: CertificationsSection },
  { id: 'references', label: 'References', icon: Users, component: ReferencesSection },
  { id: 'compliance', label: 'Compliance', icon: FileCheck, component: ComplianceSection },
  { id: 'background', label: 'Background', icon: Search, component: BackgroundSection },
  { id: 'resumes', label: 'Resumes', icon: FileText, component: ResumesSection },
  { id: 'compensation', label: 'Compensation', icon: DollarSign, component: CompensationSection },
  { id: 'source', label: 'Source', icon: Target, component: SourceSection },
] as const;

export default PROFILE_SECTIONS;
