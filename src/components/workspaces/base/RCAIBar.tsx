/**
 * RCAIBar Component
 *
 * Displays RCAI ownership assignments for an entity
 * Allows editing assignments if user has permission
 */

'use client';

import React, { useState } from 'react';
import { Users, Pencil, Plus, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useRCAI, type RCAIOwner } from '../hooks/useRCAI';
import type { RCAIEntityTypeType, RCAIRoleType, RCAIPermissionType } from '@/lib/db/schema/workspace';

// Entity types supported by the tRPC router
// Note: 'candidate' and 'talent' map to other entity types
export type SupportedEntityType =
  | 'campaign'
  | 'lead'
  | 'deal'
  | 'account'
  | 'job'
  | 'job_order'
  | 'submission'
  | 'contact'
  | 'external_job';

// Map RCAIEntityType to SupportedEntityType
function mapEntityType(entityType: RCAIEntityTypeType): SupportedEntityType {
  // Map candidate/talent to contact (they're stored as contacts)
  if (entityType === 'candidate' || entityType === 'talent') {
    return 'contact';
  }
  return entityType as SupportedEntityType;
}

// =====================================================
// CONSTANTS
// =====================================================

const ROLE_CONFIG = {
  responsible: {
    label: 'R',
    fullLabel: 'Responsible',
    description: 'Does the work',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  accountable: {
    label: 'A',
    fullLabel: 'Accountable',
    description: 'Approves/owns outcome',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  consulted: {
    label: 'C',
    fullLabel: 'Consulted',
    description: 'Provides input',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  informed: {
    label: 'I',
    fullLabel: 'Informed',
    description: 'Kept updated',
    color: 'bg-stone-100 text-stone-600 border-stone-200',
  },
} as const;

// =====================================================
// TYPES
// =====================================================

interface RCAIBarProps {
  entityType: RCAIEntityTypeType;
  entityId: string;
  canEdit?: boolean;
  compact?: boolean;
  className?: string;
}

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: RCAIEntityTypeType;
  entityId: string;
  currentOwners: RCAIOwner[];
  onAssign: (
    userId: string,
    role: RCAIRoleType,
    options?: { permission?: RCAIPermissionType; notes?: string }
  ) => Promise<void>;
}

// =====================================================
// COMPONENTS
// =====================================================

function OwnerBadge({
  owner,
  onRemove,
  canEdit,
}: {
  owner: RCAIOwner;
  onRemove?: () => void;
  canEdit?: boolean;
}) {
  const config = ROLE_CONFIG[owner.role];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1 rounded-md border transition-colors',
              config.color,
              'hover:opacity-80'
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                config.color
              )}
            >
              {config.label}
            </div>
            <Avatar className="h-5 w-5">
              <AvatarImage src={owner.avatarUrl} />
              <AvatarFallback className="text-[10px]">
                {owner.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium max-w-[100px] truncate">
              {owner.userName}
            </span>
            {owner.permission === 'edit' && (
              <Pencil className="w-3 h-3 opacity-60" />
            )}
            {canEdit && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs">
            <p className="font-semibold">{owner.userName}</p>
            <p className="text-muted-foreground">
              {config.fullLabel} ({owner.permission})
            </p>
            {owner.notes && (
              <p className="mt-1 text-muted-foreground italic">{owner.notes}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AssignDialog({
  open,
  onOpenChange,
  entityType,
  _entityId,
  currentOwners,
  onAssign,
}: AssignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<RCAIRoleType>('consulted');
  const [isAssigning, setIsAssigning] = useState(false);

  // TODO: Replace with actual user search/select component
  // For now, this is a placeholder
  const handleAssign = async () => {
    if (!selectedUserId) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedUserId, selectedRole, {});
      onOpenChange(false);
      setSelectedUserId('');
      setSelectedRole('consulted');
    } catch (error) {
      console.error('Failed to assign owner:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Owner</DialogTitle>
          <DialogDescription>
            Add a team member to this {entityType.replace('_', ' ')}&apos;s RCAI ownership.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Selection - TODO: Replace with proper user search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">User</label>
            <input
              type="text"
              placeholder="Enter user ID (temp - use user search)"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as RCAIRoleType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold', config.color)}>
                        {config.label}
                      </span>
                      <span>{config.fullLabel}</span>
                      <span className="text-muted-foreground text-xs">- {config.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Owners */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Current Owners</label>
            <div className="flex flex-wrap gap-2">
              {currentOwners.map((owner) => (
                <Badge key={owner.id} variant="outline" className={ROLE_CONFIG[owner.role].color}>
                  {ROLE_CONFIG[owner.role].label}: {owner.userName}
                </Badge>
              ))}
              {currentOwners.length === 0 && (
                <span className="text-sm text-muted-foreground">No owners assigned</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || isAssigning}>
            {isAssigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function RCAIBar({
  entityType,
  entityId,
  canEdit = false,
  compact = false,
  className,
}: RCAIBarProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Map the entity type to a supported type for the tRPC router
  const mappedEntityType = mapEntityType(entityType);

  const {
    owners,
    isLoading,
    assignOwner,
    removeOwner,
  } = useRCAI(mappedEntityType, entityId);

  // Group owners by role
  const ownersByRole = {
    accountable: owners.filter((o) => o.role === 'accountable'),
    responsible: owners.filter((o) => o.role === 'responsible'),
    consulted: owners.filter((o) => o.role === 'consulted'),
    informed: owners.filter((o) => o.role === 'informed'),
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-4 px-6 py-3 bg-stone-50 border-b border-stone-200', className)}>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
          Owners:
        </span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-5 bg-stone-200 rounded animate-pulse" />
          <div className="w-20 h-5 bg-stone-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{owners.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="space-y-1">
                {owners.map((owner) => (
                  <div key={owner.id} className="flex items-center gap-2 text-xs">
                    <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold', ROLE_CONFIG[owner.role].color)}>
                      {ROLE_CONFIG[owner.role].label}
                    </span>
                    <span>{owner.userName}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-4 px-6 py-3 bg-stone-50 border-b border-stone-200',
          className
        )}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
          Owners:
        </span>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Show owners in RACI order */}
          {(['accountable', 'responsible', 'consulted', 'informed'] as const).map((role) =>
            ownersByRole[role].map((owner) => (
              <OwnerBadge
                key={owner.id}
                owner={owner}
                canEdit={canEdit}
                onRemove={canEdit ? () => removeOwner(owner.userId) : undefined}
              />
            ))
          )}

          {owners.length === 0 && (
            <span className="text-xs text-muted-foreground">No owners assigned</span>
          )}
        </div>

        {canEdit && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAssignDialog(true)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Owner
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-rust">
                  Edit Assignments
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">RCAI Assignments</h4>
                  <p className="text-xs text-muted-foreground">
                    <strong>R</strong>esponsible - Does the work |{' '}
                    <strong>A</strong>ccountable - Approves/owns |{' '}
                    <strong>C</strong>onsulted - Provides input |{' '}
                    <strong>I</strong>nformed - Kept updated
                  </p>
                  <div className="space-y-2">
                    {owners.map((owner) => (
                      <div key={owner.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={owner.avatarUrl} />
                            <AvatarFallback className="text-[10px]">
                              {owner.userName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{owner.userName}</span>
                        </div>
                        <Select
                          value={owner.role}
                          onValueChange={async (role) => {
                            await assignOwner(owner.userId, role as RCAIRoleType);
                          }}
                        >
                          <SelectTrigger className="w-[120px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                              <SelectItem key={role} value={role} className="text-xs">
                                {config.fullLabel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <AssignDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        entityType={entityType}
        entityId={entityId}
        currentOwners={owners}
        onAssign={assignOwner}
      />
    </>
  );
}

export default RCAIBar;
