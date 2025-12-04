'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Megaphone,
  Target,
  DollarSign,
  Briefcase,
  GraduationCap,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

// Navigation section and item types
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

// Navigation configuration
const taSections: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Console', href: '/employee/ta/dashboard', icon: LayoutDashboard },
      { id: 'activities', label: 'Activities', href: '/employee/ta/activities', icon: CheckSquare },
      { id: 'analytics', label: 'Analytics', href: '/employee/ta/analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'outreach',
    label: 'Outreach',
    items: [
      { id: 'campaigns', label: 'Campaigns', href: '/employee/ta/campaigns', icon: Megaphone },
      { id: 'leads', label: 'Leads', href: '/employee/ta/leads', icon: Target },
      { id: 'deals', label: 'Deals', href: '/employee/ta/deals', icon: DollarSign },
    ],
  },
  {
    id: 'training',
    label: 'Training',
    items: [
      { id: 'internal-jobs', label: 'Internal Jobs', href: '/employee/ta/internal-jobs', icon: Briefcase },
      { id: 'training', label: 'Training Programs', href: '/employee/ta/training', icon: GraduationCap },
    ],
  },
];

interface TALayoutProps {
  children: React.ReactNode;
}

export const TALayout: React.FC<TALayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Sidebar section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['main', 'outreach', 'training'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isActiveExact = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-stone-200 bg-white flex-shrink-0">
        <div className="p-6 border-b border-stone-200">
          <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-1">Talent Acquisition</div>
          <h2 className="text-xl font-serif font-bold text-charcoal">TA Workspace</h2>
        </div>

        <nav className="p-4 space-y-2">
          {taSections.map((section) => (
            <div key={section.id}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-charcoal transition-colors"
              >
                <span>{section.label}</span>
                {expandedSections.has(section.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>

              {/* Section Items */}
              {expandedSections.has(section.id) && (
                <div className="ml-2 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveExact(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-rust/10 text-rust font-medium border-l-2 border-rust'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-charcoal'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};
