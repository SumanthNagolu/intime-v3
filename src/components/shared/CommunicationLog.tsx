/**
 * Communication Log Component (Stub)
 * 
 * TODO: Implement full communication log with metadata-driven approach
 * For now, this is a placeholder to prevent build errors.
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface CommunicationLogProps {
  entityId?: string;
  entityType?: string;
}

export function CommunicationLog({ entityId, entityType }: CommunicationLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Communication Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Communication history for {entityType || 'entity'} {entityId ? `#${entityId.slice(0, 8)}` : ''}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          (Use Activity Timeline component for full functionality)
        </p>
      </CardContent>
    </Card>
  );
}

