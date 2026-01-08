'use client'

import { useState } from 'react'
import { useCreateAccountStore } from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  FileCheck,
  Stethoscope,
  Award,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Common certifications for quick add
const COMMON_CERTIFICATIONS = [
  { value: 'cissp', label: 'CISSP', category: 'Security' },
  { value: 'cism', label: 'CISM', category: 'Security' },
  { value: 'cisa', label: 'CISA', category: 'Security' },
  { value: 'pmp', label: 'PMP', category: 'Project Management' },
  { value: 'aws_sa', label: 'AWS Solutions Architect', category: 'Cloud' },
  { value: 'aws_dev', label: 'AWS Developer', category: 'Cloud' },
  { value: 'azure_admin', label: 'Azure Administrator', category: 'Cloud' },
  { value: 'gcp_ace', label: 'GCP Associate Cloud Engineer', category: 'Cloud' },
  { value: 'comptia_sec', label: 'CompTIA Security+', category: 'Security' },
  { value: 'ccna', label: 'Cisco CCNA', category: 'Networking' },
  { value: 'top_secret', label: 'Top Secret Clearance', category: 'Clearance' },
  { value: 'secret', label: 'Secret Clearance', category: 'Clearance' },
  { value: 'public_trust', label: 'Public Trust', category: 'Clearance' },
]

export function AccountIntakeStep6Compliance() {
  const { formData, setFormData } = useCreateAccountStore()
  const { compliance } = formData
  const [isAddingCert, setIsAddingCert] = useState(false)
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null)
  const [newCertName, setNewCertName] = useState('')

  const updateCompliance = (section: keyof typeof compliance, data: object) => {
    setFormData({
      compliance: {
        ...compliance,
        [section]: {
          ...compliance[section as keyof typeof compliance],
          ...data,
        },
      },
    })
  }

  const addCertification = (cert: string) => {
    if (!cert.trim()) return
    const newCerts = [...compliance.certifications, cert.trim()]
    setFormData({
      compliance: {
        ...compliance,
        certifications: newCerts,
      },
    })
    setNewCertName('')
    setIsAddingCert(false)
  }

  const removeCertification = (index: number) => {
    const newCerts = compliance.certifications.filter((_, i) => i !== index)
    setFormData({
      compliance: {
        ...compliance,
        certifications: newCerts,
      },
    })
  }

  const updateCertification = (index: number, newValue: string) => {
    const newCerts = [...compliance.certifications]
    newCerts[index] = newValue
    setFormData({
      compliance: {
        ...compliance,
        certifications: newCerts,
      },
    })
    setEditingCertIndex(null)
  }

  const handleClose = () => {
    setIsAddingCert(false)
    setEditingCertIndex(null)
    setNewCertName('')
  }

  const isPanelOpen = isAddingCert || editingCertIndex !== null

  return (
    <div className="space-y-10">
      <Section
        icon={ShieldCheck}
        title="Insurance Requirements"
        subtitle="Required coverage types"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-charcoal-200 bg-white">
            <div className="space-y-0.5">
              <Label className="text-base">General Liability</Label>
              <p className="text-xs text-charcoal-500">
                Standard business liability coverage
              </p>
            </div>
            <Switch
              checked={compliance.insurance.generalLiability}
              onCheckedChange={(checked) =>
                updateCompliance('insurance', { generalLiability: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-charcoal-200 bg-white">
            <div className="space-y-0.5">
              <Label className="text-base">Professional Liability</Label>
              <p className="text-xs text-charcoal-500">Errors & Omissions (E&O)</p>
            </div>
            <Switch
              checked={compliance.insurance.professionalLiability}
              onCheckedChange={(checked) =>
                updateCompliance('insurance', { professionalLiability: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-charcoal-200 bg-white">
            <div className="space-y-0.5">
              <Label className="text-base">Workers Compensation</Label>
              <p className="text-xs text-charcoal-500">
                Statutory employee coverage
              </p>
            </div>
            <Switch
              checked={compliance.insurance.workersComp}
              onCheckedChange={(checked) =>
                updateCompliance('insurance', { workersComp: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-charcoal-200 bg-white">
            <div className="space-y-0.5">
              <Label className="text-base">Cyber Liability</Label>
              <p className="text-xs text-charcoal-500">
                Data breach and security coverage
              </p>
            </div>
            <Switch
              checked={compliance.insurance.cyberLiability}
              onCheckedChange={(checked) =>
                updateCompliance('insurance', { cyberLiability: checked })
              }
            />
          </div>
        </div>
      </Section>

      <Section
        icon={FileCheck}
        title="Background Checks"
        subtitle="Screening requirements for consultants"
      >
        <div className="p-6 bg-white border border-charcoal-200 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">
                Require Background Checks
              </Label>
              <p className="text-sm text-charcoal-500">
                Consultants must pass screening before start
              </p>
            </div>
            <Switch
              checked={compliance.backgroundCheck.required}
              onCheckedChange={(checked) =>
                updateCompliance('backgroundCheck', { required: checked })
              }
            />
          </div>

          {compliance.backgroundCheck.required && (
            <div className="pt-4 border-t border-charcoal-100 animate-fade-in">
              <Label className="mb-2 block">Screening Level</Label>
              <Select
                value={compliance.backgroundCheck.level}
                onValueChange={(v) =>
                  updateCompliance('backgroundCheck', { level: v })
                }
              >
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    Standard (Criminal + Employment)
                  </SelectItem>
                  <SelectItem value="enhanced">
                    Enhanced (Includes Credit + Education)
                  </SelectItem>
                  <SelectItem value="comprehensive">
                    Comprehensive (Full deep dive)
                  </SelectItem>
                  <SelectItem value="government">Government Clearance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Section>

      <Section
        icon={Stethoscope}
        title="Drug Testing"
        subtitle="Substance screening requirements"
      >
        <div className="flex items-center justify-between p-6 bg-white border border-charcoal-200 rounded-2xl">
          <div className="space-y-0.5">
            <Label className="text-base font-semibold">
              Require Drug Screening
            </Label>
            <p className="text-sm text-charcoal-500">
              Pre-employment drug testing required
            </p>
          </div>
          <Switch
            checked={compliance.drugTest.required}
            onCheckedChange={(checked) =>
              updateCompliance('drugTest', { required: checked })
            }
          />
        </div>
      </Section>

      <Section
        icon={Award}
        title="Certifications & Clearances"
        subtitle="Specific industry requirements for all consultants"
      >
        <div className="flex flex-col gap-4">
          {/* List View */}
          <div className="w-full transition-all duration-300">
            {/* Add Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCert(true)}
              className="mb-4 w-full border-dashed"
              disabled={isPanelOpen}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>

            {/* Table */}
            {compliance.certifications.length > 0 ? (
              <div className="border border-charcoal-200 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-charcoal-50/50">
                      <TableHead className="font-semibold text-charcoal-700">
                        Certification / Clearance
                      </TableHead>
                      <TableHead className="font-semibold text-charcoal-700 w-24">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compliance.certifications.map((cert, index) => (
                      <TableRow
                        key={index}
                        className={cn(
                          'group hover:bg-charcoal-50/50 cursor-pointer transition-colors',
                          editingCertIndex === index && 'bg-gold-50'
                        )}
                        onClick={() => {
                          setEditingCertIndex(index)
                          setNewCertName(cert)
                          setIsAddingCert(false)
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-charcoal-400" />
                            <span className="font-medium text-charcoal-700">
                              {cert}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-charcoal-400 hover:text-charcoal-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingCertIndex(index)
                                setNewCertName(cert)
                                setIsAddingCert(false)
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-charcoal-400 hover:text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeCertification(index)
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-charcoal-50/50 rounded-xl border border-dashed border-charcoal-200">
                <Award className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                <p className="text-sm text-charcoal-500 mb-1 font-medium">
                  No certifications required yet
                </p>
                <p className="text-xs text-charcoal-400">
                  Add required certifications or security clearances
                </p>
              </div>
            )}
          </div>

          {/* Inline Detail Panel - Full Width Bottom */}
          {isPanelOpen && (
            <div className="w-full border border-charcoal-200 rounded-xl bg-white animate-in slide-in-from-bottom duration-300">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-charcoal-200 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-900">
                    {isAddingCert ? 'Add Certification' : 'Edit Certification'}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Certification Name</Label>
                  <Input
                    placeholder="e.g., CISSP, PMP, Top Secret"
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    className="h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCertName.trim()) {
                        if (isAddingCert) {
                          addCertification(newCertName)
                        } else if (editingCertIndex !== null) {
                          updateCertification(editingCertIndex, newCertName)
                        }
                      }
                    }}
                  />
                </div>

                {isAddingCert && (
                  <div className="space-y-2">
                    <Label className="text-xs text-charcoal-500">
                      Quick Add Common Certifications
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_CERTIFICATIONS.filter(
                        (c) => !compliance.certifications.includes(c.label)
                      )
                        .slice(0, 8)
                        .map((cert) => (
                          <button
                            key={cert.value}
                            type="button"
                            onClick={() => addCertification(cert.label)}
                            className="text-xs px-2 py-1 rounded-md bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200 transition-colors"
                          >
                            + {cert.label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-charcoal-200 flex-shrink-0">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (isAddingCert) {
                      addCertification(newCertName)
                    } else if (editingCertIndex !== null) {
                      updateCertification(editingCertIndex, newCertName)
                    }
                  }}
                  disabled={!newCertName.trim()}
                  className="bg-gold-500 hover:bg-gold-600 text-white border-none"
                >
                  {isAddingCert ? 'Add' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}


