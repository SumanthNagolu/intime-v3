/**
 * ConfirmDeleteModal Component
 *
 * Confirmation dialog for destructive delete operations.
 */

'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  requireConfirmation?: boolean;
  confirmationText?: string;
  isDeleting?: boolean;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'This action cannot be undone. This will permanently delete this item and all associated data.',
  itemName,
  requireConfirmation = false,
  confirmationText = 'delete',
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  const [confirmInput, setConfirmInput] = useState('');

  const isConfirmed = !requireConfirmation || confirmInput.toLowerCase() === confirmationText.toLowerCase();

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    await onConfirm();
    setConfirmInput('');
    onClose();
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmInput('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Item Name */}
          {itemName && (
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                Item to delete
              </p>
              <p className="font-medium text-charcoal">{itemName}</p>
            </div>
          )}

          {/* Confirmation Input */}
          {requireConfirmation && (
            <div className="space-y-2">
              <p className="text-sm text-stone-600">
                To confirm, type <span className="font-mono font-bold text-destructive">{confirmationText}</span> below:
              </p>
              <Input
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Type "${confirmationText}" to confirm`}
                className={cn(
                  'font-mono',
                  confirmInput && !isConfirmed && 'border-destructive focus-visible:ring-destructive'
                )}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteModal;
