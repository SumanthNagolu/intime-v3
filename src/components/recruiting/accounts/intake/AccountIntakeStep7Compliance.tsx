'use client'

import { useCreateAccountStore } from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ShieldCheck, FileCheck, Stethoscope, Award, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AccountIntakeStep7Compliance() {
  const { formData, setFormData } = useCreateAccountStore()
  const { compliance } = formData

  const updateCompliance = (section: keyof typeof compliance, data: any) => {
    setFormData({
      compliance: {
        ...compliance,
        [section]: {
          ...compliance[section as keyof typeof compliance],
          ...data
        }
      }
    })
  }

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
              <p className="text-xs text-charcoal-500">Standard business liability coverage</p>
            </div>
            <Switch
              checked={compliance.insurance.generalLiability}
              onCheckedChange={(checked) => updateCompliance('insurance', { generalLiability: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-charcoal-200 bg-white">
            <div className="space-y-0.5">
              <Label className="text-base">Professional Liability</Label>
              <p className="text-xs text-charcoal-500">Errors & Omissions (E&O)</p>
            </div>
            <Switch
              checked={compliance.insurance.professionalLiability}
              onCheckedChange={(checked) => updateCompliance('insurance', { professionalLiability: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-charcoal-200 bg-white">
            <div className="space-y-0.5">
              <Label className="text-base">Workers Compensation</Label>
              <p className="text-xs text-charcoal-500">Statutory employee coverage</p>
            </div>
            <Switch
              checked={compliance.insurance.workersComp}
              onCheckedChange={(checked) => updateCompliance('insurance', { workersComp: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-charcoal-200 bg-white">
            <div className="space-y-0.5">
              <Label className="text-base">Cyber Liability</Label>
              <p className="text-xs text-charcoal-500">Data breach and security coverage</p>
            </div>
            <Switch
              checked={compliance.insurance.cyberLiability}
              onCheckedChange={(checked) => updateCompliance('insurance', { cyberLiability: checked })}
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
                <Label className="text-base font-semibold">Require Background Checks</Label>
                <p className="text-sm text-charcoal-500">Consultants must pass screening before start</p>
              </div>
              <Switch
                checked={compliance.backgroundCheck.required}
                onCheckedChange={(checked) => updateCompliance('backgroundCheck', { required: checked })}
              />
           </div>

           {compliance.backgroundCheck.required && (
             <div className="pt-4 border-t border-charcoal-100 animate-fade-in">
               <Label className="mb-2 block">Screening Level</Label>
               <Select
                  value={compliance.backgroundCheck.level}
                  onValueChange={(v) => updateCompliance('backgroundCheck', { level: v })}
               >
                 <SelectTrigger className="w-full md:w-1/2">
                   <SelectValue placeholder="Select level" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="standard">Standard (Criminal + Employment)</SelectItem>
                   <SelectItem value="enhanced">Enhanced (Includes Credit + Education)</SelectItem>
                   <SelectItem value="comprehensive">Comprehensive (Full deep dive)</SelectItem>
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
              <Label className="text-base font-semibold">Require Drug Screening</Label>
              <p className="text-sm text-charcoal-500">Pre-employment drug testing required</p>
            </div>
            <Switch
              checked={compliance.drugTest.required}
              onCheckedChange={(checked) => updateCompliance('drugTest', { required: checked })}
            />
         </div>
      </Section>

      <Section
        icon={Award}
        title="Certifications & Clearances"
        subtitle="Specific industry requirements"
      >
        <div className="p-6 bg-white border border-charcoal-200 rounded-2xl">
           <Label className="mb-2 block">Required Certifications (Comma separated)</Label>
           <Input 
             placeholder="e.g., CISSP, PMP, Top Secret Clearance"
             value={compliance.certifications.join(', ')}
             onChange={(e) => {
               const certs = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
               setFormData({
                  compliance: {
                    ...compliance,
                    certifications: certs
                  }
               })
             }}
           />
           <p className="text-xs text-charcoal-500 mt-2">
             List any mandatory certifications or security clearances required for all consultants.
           </p>
        </div>
      </Section>
    </div>
  )
}

