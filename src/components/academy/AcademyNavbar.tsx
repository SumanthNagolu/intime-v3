'use client';

/**
 * Academy Navbar - Exact copy from academy prototype
 * Floating pill navigation with dropdown menus
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, FileText, Mic, Map, Menu, X, Cpu, ChevronDown, List, Layers, Sparkles } from 'lucide-react';

const NAV_STRUCTURE = [
  {
    title: "The Path",
    icon: Map,
    items: [
      { label: "Our Journey", path: "/students/dashboard", icon: Map },
      { label: "Full Curriculum", path: "/students/courses", icon: List }
    ]
  },
  {
    title: "The Plan",
    icon: Layers,
    items: [
      { label: "Your Identity", path: "/students/identity", icon: User },
      { label: "The Blueprint", path: "/students/blueprint", icon: FileText }
    ]
  },
  {
    title: "The AI",
    icon: Sparkles,
    items: [
      { label: "The Dojo", path: "/students/dojo", icon: Mic },
      { label: "AI Guru", path: "/students/ai-mentor", icon: Cpu }
    ]
  }
];

export function AcademyNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;
  const isGroupActive = (items: { path: string }[]) => items.some(item => isActive(item.path));

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-stone-900/5 rounded-3xl lg:rounded-full px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-6xl w-full pointer-events-auto transition-all duration-500">

        <div className="w-full lg:w-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/students/dashboard" className="flex items-center gap-3 group shrink-0 relative" onClick={() => setIsMobileMenuOpen(false)}>
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-rust/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="w-11 h-11 bg-gradient-to-br from-charcoal to-stone-800 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-rust/20 transition-all duration-500 relative z-10">
              <span className="font-serif font-bold italic text-xl text-rust">I</span>
            </div>
            <div className="flex flex-col relative z-10">
              <span className="font-serif font-bold text-charcoal text-lg leading-none tracking-tight">InTime</span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-rust font-bold mt-1">Solutions</span>
            </div>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-stone-500 hover:text-charcoal"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Main Links (Desktop) */}
        <ul className="hidden lg:flex items-center gap-2">
          {NAV_STRUCTURE.map((group) => (
            <li
              key={group.title}
              className="relative group/dropdown"
              onMouseEnter={() => setActiveDropdown(group.title)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isGroupActive(group.items) ? 'text-charcoal bg-stone-100' : 'text-stone-400 hover:text-charcoal hover:bg-stone-50'}`}>
                {group.title}
                <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === group.title ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 w-48 transition-all duration-300 transform origin-top ${activeDropdown === group.title ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-2 overflow-hidden">
                  {group.items.map(item => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(item.path) ? 'bg-rust/5 text-rust' : 'text-stone-500 hover:bg-stone-50 hover:text-charcoal'}`}
                    >
                      <item.icon size={16} className={isActive(item.path) ? "stroke-[2.5px]" : ""} />
                      <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:hidden flex-col w-full pb-6 border-b border-stone-100 space-y-6 mt-4`}>
          {NAV_STRUCTURE.map((group) => (
            <div key={group.title}>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300 mb-3 pl-2">{group.title}</div>
              <div className="space-y-2">
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive(item.path) ? 'bg-rust/5 text-rust' : 'text-stone-500 hover:bg-stone-50'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex items-center justify-center lg:justify-end w-full lg:w-auto gap-5 shrink-0 lg:pl-5 lg:border-l border-stone-100`}>
          <div className="text-right">
            <div className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-0.5">Active Persona</div>
            <div className="text-sm font-serif font-bold text-charcoal">Sr. Developer</div>
          </div>
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-rust blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-11 h-11 rounded-full bg-rust text-white border-2 border-white shadow-lg flex items-center justify-center font-serif font-bold italic text-lg">
              P
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-forest border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}
