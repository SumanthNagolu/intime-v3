/**
 * Privacy Toggle Component
 * ACAD-017
 *
 * Allows users to opt in/out of public leaderboards
 */

'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Info } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

interface PrivacyToggleProps {
  initialVisible?: boolean;
}

export function PrivacyToggle({ initialVisible = true }: PrivacyToggleProps) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const { toast } = useToast();

  const updateVisibilityMutation = trpc.leaderboards.updateVisibility.useMutation({
    onSuccess: () => {
      toast({
        title: 'Privacy settings updated',
        description: isVisible
          ? 'You are now visible on leaderboards'
          : 'You have been hidden from leaderboards',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update privacy settings',
        description: error.message,
        variant: 'destructive',
      });
      // Revert the toggle on error
      setIsVisible(!isVisible);
    },
  });

  const handleToggle = (visible: boolean) => {
    setIsVisible(visible);
    updateVisibilityMutation.mutate({ visible });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isVisible ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
          Leaderboard Privacy
        </CardTitle>
        <CardDescription>
          Control whether you appear on public leaderboards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="leaderboard-visibility" className="text-base">
              Show me on leaderboards
            </Label>
            <p className="text-sm text-muted-foreground">
              {isVisible
                ? 'You are visible on all leaderboards'
                : 'You are hidden from all leaderboards'}
            </p>
          </div>
          <Switch
            id="leaderboard-visibility"
            checked={isVisible}
            onCheckedChange={handleToggle}
            disabled={updateVisibilityMutation.isLoading}
          />
        </div>

        {/* Informational Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {isVisible ? (
              <>
                Your name, avatar, and XP will be visible to other students on
                leaderboards. This helps create a competitive and motivating
                learning environment.
              </>
            ) : (
              <>
                You can still see your own rank and compete, but other students
                won&apos;t see you on the leaderboards. Your progress is still
                tracked internally.
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* What's Visible */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">
            {isVisible ? "What others can see:" : "What's hidden:"}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              {isVisible ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              Your full name
            </li>
            <li className="flex items-center gap-2">
              {isVisible ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              Your avatar
            </li>
            <li className="flex items-center gap-2">
              {isVisible ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              Your XP and rank
            </li>
            <li className="flex items-center gap-2">
              {isVisible ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              Your badges and achievements
            </li>
          </ul>
        </div>

        {/* Note about internal tracking */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <strong>Note:</strong> Regardless of this setting, your progress,
          XP, and achievements are always tracked and visible to instructors
          and administrators for educational purposes.
        </div>
      </CardContent>
    </Card>
  );
}
