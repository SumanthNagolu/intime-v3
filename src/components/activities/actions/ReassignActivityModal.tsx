/**
 * Reassign Activity Modal
 *
 * Modal for reassigning an activity to a different user.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Mock team members - in real app, this would come from a query
const MOCK_TEAM_MEMBERS = [
  { id: 'user_1', name: 'John Smith', email: 'john@company.com', avatarUrl: '', role: 'Recruiter' },
  { id: 'user_2', name: 'Sarah Johnson', email: 'sarah@company.com', avatarUrl: '', role: 'Senior Recruiter' },
  { id: 'user_3', name: 'Mike Chen', email: 'mike@company.com', avatarUrl: '', role: 'Recruiter' },
  { id: 'user_4', name: 'Emily Davis', email: 'emily@company.com', avatarUrl: '', role: 'Team Lead' },
  { id: 'user_5', name: 'Alex Wilson', email: 'alex@company.com', avatarUrl: '', role: 'Recruiter' },
];

export interface ReassignActivityModalProps {
  /** Whether modal is open */
  open: boolean;

  /** Open change handler */
  onOpenChange: (open: boolean) => void;

  /** Activity ID */
  activityId: string;

  /** Activity subject for display */
  subject?: string;

  /** Current assignee name */
  currentAssignee?: string;

  /** Callback on reassign */
  onReassign: (newAssigneeId: string, reason: string, notify: boolean) => void;
}

export function ReassignActivityModal({
  open,
  onOpenChange,
  activityId,
  subject,
  currentAssignee,
  onReassign,
}: ReassignActivityModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter team members based on search
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_TEAM_MEMBERS;

    const query = searchQuery.toLowerCase();
    return MOCK_TEAM_MEMBERS.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Selected user details
  const selectedUser = useMemo(() => {
    return MOCK_TEAM_MEMBERS.find(m => m.id === selectedUserId);
  }, [selectedUserId]);

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedUserId(null);
      setReason('');
      setNotifyUser(true);
    }
  }, [open]);

  const handleReassign = async () => {
    if (!selectedUserId || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onReassign(selectedUserId, reason, notifyUser);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const canSubmit = selectedUserId && reason.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Reassign Activity
          </DialogTitle>
          {subject && (
            <DialogDescription className="text-base font-medium text-foreground">
              {subject}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Assignee */}
          {currentAssignee && (
            <div className="text-sm text-muted-foreground">
              Currently assigned to: <span className="font-medium text-foreground">{currentAssignee}</span>
            </div>
          )}

          {/* User Search */}
          <div className="space-y-2">
            <Label>Assign to *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* User List */}
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-2 space-y-1">
              {filteredMembers.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No team members found
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedUserId(member.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-md text-left',
                      'transition-colors hover:bg-muted',
                      selectedUserId === member.id && 'bg-primary/10 border border-primary'
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.role} · {member.email}
                      </p>
                    </div>
                    {selectedUserId === member.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Selected User Confirmation */}
          {selectedUser && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatarUrl} />
                <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-blue-900">{selectedUser.name}</p>
                <p className="text-xs text-blue-700">{selectedUser.role}</p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reassignment *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this activity being reassigned?"
              rows={2}
              required
            />
          </div>

          {/* Notify Option */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="notifyUser"
              checked={notifyUser}
              onCheckedChange={(checked) => setNotifyUser(checked as boolean)}
            />
            <Label htmlFor="notifyUser" className="cursor-pointer">
              Notify {selectedUser?.name || 'the new assignee'} via email
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReassign}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Reassigning...' : 'Reassign Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReassignActivityModal;
