/**
 * Typing Indicator Component
 * ACAD-020
 *
 * Shows animated dots when AI is typing
 */

'use client';

import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start mb-6">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      <Card className="p-4 bg-card border">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
        </div>
      </Card>
    </div>
  );
}
