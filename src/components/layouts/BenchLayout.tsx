'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Flame,
  FileImage,
  ClipboardList,
  Building2,
  Handshake,
  DollarSign,
  Globe,
  CheckSquare,
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
const benchSections: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Console', href: '/employee/bench/dashboard', icon: LayoutDashboard },
      { id: 'activities', label: 'Activities', href: '/employee/bench/activities', icon: CheckSquare },
    ],
  },
  {
    id: 'consultants',
    label: 'Consultants',
    items: [
      { id: 'talent', label: 'Talent Pool', href: '/employee/bench/talent', icon: Users },
      { id: 'hotlists', label: 'Hotlists', href: '/employee/bench/hotlists', icon: Flame },
      { id: 'marketing', label: 'Marketing Profiles', href: '/employee/bench/marketing', icon: FileImage },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'job-orders', label: 'Job Orders', href: '/employee/bench/job-orders', icon: ClipboardList },
      { id: 'vendors', label: 'Vendors', href: '/employee/bench/vendors', icon: Building2 },
      { id: 'placements', label: 'Placements', href: '/employee/bench/placements', icon: Handshake },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      { id: 'commission', label: 'Commission', href: '/employee/bench/commission', icon: DollarSign },
      { id: 'immigration', label: 'Immigration', href: '/employee/bench/immigration', icon: Globe },
    ],
  },
];

interface BenchLayoutProps {
  children: React.ReactNode;
}

export const BenchLayout: React.FC<BenchLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Sidebar section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['main', 'consultants', 'operations', 'finance'])
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
          <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-1">Bench Sales</div>
          <h2 className="text-xl font-serif font-bold text-charcoal">Bench Workspace</h2>
        </div>

        <nav className="p-4 space-y-2">
          {benchSections.map((section) => (
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
