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
import { CandidateIntakeStep7Authorization } from '@/components/recruiting/candidates/intake/CandidateIntakeStep7Authorization'
import { trpc } from '@/lib/trpc/client'
import { useCandidateWorkspace } from '../CandidateWorkspaceProvider'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CandidateWorkAuthEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CandidateWorkAuthEditDialog({
    open,
    onOpenChange,
}: CandidateWorkAuthEditDialogProps) {
    const { data: { candidate }, refreshData } = useCandidateWorkspace()
    const { formData, setFormData, resetForm } = useCreateCandidateStore()
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const updateCandidate = trpc.ats.candidates.update.useMutation({
        onSuccess: () => {
            toast.success('Work authorization updated')
            refreshData()
            onOpenChange(false)
        },
        onError: (err: any) => {
            toast.error('Failed to update: ' + err.message)
            setIsSubmitting(false)
        },
    })

    // Initialize store with candidate data
    React.useEffect(() => {
        if (open && candidate) {
            resetForm()
            setFormData({
                visaStatus: (candidate.visaStatus as any) || 'us_citizen',
                visaExpiryDate: candidate.visaExpiryDate || undefined,
                requiresSponsorship: false, // Need to map this if it exists in DB, assume false or check type
                availability: (candidate.availability as any) || '2_weeks',
                // Notice period days isn't in CandidateData directly as number, but 'noticePeriod' is string
                willingToRelocate: candidate.willingToRelocate,
                isRemoteOk: (candidate as any).isRemoteOk || false,
            })
        }
    }, [open, candidate, resetForm, setFormData])

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            await updateCandidate.mutateAsync({
                candidateId: candidate.id,
                visaStatus: formData.visaStatus,
                visaExpiryDate: formData.visaExpiryDate ? new Date(formData.visaExpiryDate) : undefined,
                requiresSponsorship: formData.requiresSponsorship,
                availability: formData.availability,
                willingToRelocate: formData.willingToRelocate,
                isRemoteOk: formData.isRemoteOk,
            })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Edit Work Authorization</DialogTitle>
                    <DialogDescription>
                        Update visa status, availability, and preferences.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <CandidateIntakeStep7Authorization />
                </ScrollArea>

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
