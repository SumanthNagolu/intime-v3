'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Briefcase,
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronRight,
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
const ceoSections: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Console', href: '/employee/ceo/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'strategic',
    label: 'Strategic',
    items: [
      { id: 'bi', label: 'Business Intelligence', href: '/employee/ceo/bi', icon: BarChart3 },
      { id: 'initiatives', label: 'Initiatives', href: '/employee/ceo/initiatives', icon: Target },
      { id: 'portfolio', label: 'Portfolio', href: '/employee/ceo/portfolio', icon: Briefcase },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Executive Reports', href: '/employee/ceo/reports', icon: FileText },
      { id: 'benchmarking', label: 'Benchmarking', href: '/employee/ceo/benchmarking', icon: TrendingUp },
    ],
  },
];

interface CEOLayoutProps {
  children: React.ReactNode;
}

export const CEOLayout: React.FC<CEOLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Sidebar section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['main', 'strategic', 'reports'])
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
          <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-1">Executive</div>
          <h2 className="text-xl font-serif font-bold text-charcoal">CEO Workspace</h2>
        </div>

        <nav className="p-4 space-y-2">
          {ceoSections.map((section) => (
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
