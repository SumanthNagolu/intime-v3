'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Briefcase, Users, Send, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NavSection } from '@/lib/navigation';

interface MobileNavProps {
  sections: NavSection[];
  className?: string;
}

// Bottom tab bar items (primary navigation)
const bottomTabs = [
  { id: 'home', label: 'Home', icon: Home, href: '/employee/workspace' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/employee/workspace/jobs' },
  { id: 'talent', label: 'Talent', icon: Users, href: '/employee/workspace/candidates' },
  { id: 'submissions', label: 'Submissions', icon: Send, href: '/employee/workspace/submissions' },
  { id: 'accounts', label: 'Accounts', icon: Building2, href: '/employee/workspace/accounts' },
];

/**
 * Mobile navigation with bottom tab bar and hamburger menu
 * Shown only on screens < 768px
 */
export function MobileNav({ sections, className }: MobileNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white border-t border-border',
          'md:hidden',
          className
        )}
      >
        <div className="flex items-center justify-around h-16">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'w-full h-full',
                  'text-xs transition-colors',
                  isActive
                    ? 'text-rust'
                    : 'text-muted-foreground'
                )}
              >
                <Icon size={20} className="mb-1" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
          {/* Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center',
                  'w-full h-full',
                  'text-xs text-muted-foreground'
                )}
              >
                <Menu size={20} className="mb-1" />
                <span>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex items-center justify-between h-14 px-4 border-b">
                <span className="font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-56px)]">
                <div className="p-4 space-y-6">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <div className="px-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {section.label}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg',
                                'transition-colors',
                                isActive
                                  ? 'bg-rust/10 text-rust'
                                  : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <Icon size={18} />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
