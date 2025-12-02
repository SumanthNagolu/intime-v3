'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AccordionSection {
  id: string;
  title: string;
  subtitle?: string;
  count?: number;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface AccordionLayoutProps {
  sections: AccordionSection[];
  /** Allow multiple sections to be open */
  allowMultiple?: boolean;
  /** Default open sections */
  defaultOpen?: string[];
  className?: string;
}

/**
 * Collapsible accordion sections layout
 * Uses Collapsible component for consistent behavior
 */
export function AccordionLayout({
  sections,
  allowMultiple = true,
  defaultOpen = [],
  className,
}: AccordionLayoutProps) {
  const [openSections, setOpenSections] = useState<string[]>(defaultOpen);

  const toggleSection = (id: string) => {
    if (allowMultiple) {
      setOpenSections((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    } else {
      setOpenSections((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {sections.map((section) => {
        const isOpen = openSections.includes(section.id);
        return (
          <Collapsible
            key={section.id}
            open={isOpen}
            onOpenChange={() => toggleSection(section.id)}
          >
            <div className="border rounded-lg px-4">
              <CollapsibleTrigger className="w-full flex items-center justify-between py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{section.title}</span>
                      {section.count !== undefined && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {section.count}
                        </Badge>
                      )}
                    </div>
                    {section.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-4">
                {section.content}
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
