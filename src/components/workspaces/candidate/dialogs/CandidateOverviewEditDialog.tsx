'use client'

import * as React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCreateCandidateStore } from '@/stores/create-candidate-store'
import { CandidateIntakeStep2BasicInfo } from '@/components/recruiting/candidates/intake/CandidateIntakeStep2BasicInfo'
import { CandidateIntakeStep3Professional } from '@/components/recruiting/candidates/intake/CandidateIntakeStep3Professional'
import { trpc } from '@/lib/trpc/client'
import { useCandidateWorkspace } from '../CandidateWorkspaceProvider'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CandidateOverviewEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CandidateOverviewEditDialog({
    open,
    onOpenChange,
}: CandidateOverviewEditDialogProps) {
    const { data: { candidate, skills }, refreshData } = useCandidateWorkspace()
    const { formData, setFormData, resetForm } = useCreateCandidateStore()
    const [activeTab, setActiveTab] = React.useState('basic')
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const updateCandidate = trpc.ats.candidates.update.useMutation({
        onSuccess: () => {
            toast.success('Candidate profile updated')
            refreshData()
            onOpenChange(false)
        },
        onError: (err: any) => {
            toast.error('Failed to update candidate: ' + err.message)
            setIsSubmitting(false)
        },
    })

    // Initialize store with candidate data when dialog opens
    React.useEffect(() => {
        if (open && candidate) {
            resetForm() // Clear any existing draft

            // Map CandidateData to CandidateIntakeFormData
            setFormData({
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                email: candidate.email || '',
                phone: (candidate.phone || '') as any,
                linkedinProfile: candidate.linkedinUrl || '',
                // Location
                location: candidate.location || '',
                locationCity: candidate.city || undefined,
                locationState: candidate.state || undefined,
                locationCountry: candidate.country || undefined,

                // Professional
                professionalHeadline: candidate.headline || '',
                professionalSummary: candidate.status !== 'sourced' ? (candidate as any).professionalSummary || '' : '',
                experienceYears: candidate.yearsExperience || 0,
                employmentTypes: [],
                workModes: [],
            })
        }
    }, [open, candidate, resetForm, setFormData])

    const handleSave = async () => {
        setIsSubmitting(true)

        // Basic Validation
        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.error('Please fill in required fields (Name, Email)')
            setActiveTab('basic')
            setIsSubmitting(false)
            return
        }

        try {
            await updateCandidate.mutateAsync({
                candidateId: candidate.id,
                // Basic
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                linkedinUrl: formData.linkedinProfile,
                // Location
                location: formData.location,
                locationCity: formData.locationCity,
                locationState: formData.locationState,
                locationCountry: formData.locationCountry,

                // Professional
                professionalHeadline: formData.professionalHeadline,
                professionalSummary: formData.professionalSummary,
                experienceYears: formData.experienceYears,

                // Note: Employment types and work modes would be mapped here if available in inputs
            })
        } catch (error) {
            // Error handled by mutation callbacks
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Edit Candidate Profile</DialogTitle>
                    <DialogDescription>
                        Update basic information and professional details.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b">
                        <TabsList>
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="professional">Professional</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <TabsContent value="basic" className="mt-0 space-y-4">
                            <CandidateIntakeStep2BasicInfo />
                        </TabsContent>

                        <TabsContent value="professional" className="mt-0 space-y-4">
                            <CandidateIntakeStep3Professional />
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <DialogFooter className="p-6 border-t bg-muted/20">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
