'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function CorporateNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const NAV_ITEMS = [
    {
      label: 'Solutions',
      href: '/solutions',
      children: [
        { label: 'Staffing', href: '/solutions/it-staffing' },
        { label: 'Consulting', href: '/consulting' },
        { label: 'Cross-Border Solutions', href: '/solutions/cross-border' },
        { label: 'Training & Development', href: '/solutions/training' },
      ]
    },
    {
      label: 'Industries',
      href: '/industries',
      children: [
        { label: 'Information Technology', href: '/industries/technology' },
        { label: 'Healthcare', href: '/industries/healthcare' },
        { label: 'Engineering', href: '/industries/engineering' },
        { label: 'Manufacturing & Production', href: '/industries/manufacturing' },
        { label: 'Financial & Accounting', href: '/industries/finance' },
        { label: 'AI/ML & Data', href: '/industries/ai-data' },
        { label: 'Talent', href: '/industries/talent' },
        { label: 'Legal', href: '/industries/legal' },
        { label: 'Warehouse & Distribution', href: '/industries/warehouse' },
        { label: 'Logistics', href: '/industries/logistics' },
        { label: 'Hospitality', href: '/industries/hospitality' },
        { label: 'Human Resources', href: '/industries/hr' },
        { label: 'Telecom / Technology', href: '/industries/telecom' },
      ]
    },
    {
      label: 'Careers',
      href: '/careers',
      children: [
        { label: 'Join Our Team', href: '/careers/join-team' },
        { label: 'Open Positions', href: '/careers/open-positions' },
        { label: 'Available Talent', href: '/careers/available-talent' },
      ]
    },
    {
      label: 'Resources',
      href: '/resources',
      children: [
        { label: 'Blog', href: '/resources/blog' },
        { label: 'Case Studies', href: '/resources/case-studies' },
        { label: 'Whitepapers', href: '/resources/whitepapers' },
      ]
    },
    {
      label: 'Academy',
      href: '/academy',
      isSpecial: true,
    }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-[#F5F3EF]" onMouseLeave={() => setActiveDropdown(null)}>
      <div className="container mx-auto px-6 h-24 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="h-12 w-12 bg-black flex items-center justify-center text-white transition-transform group-hover:rotate-3">
            <span className="font-serif font-bold italic text-2xl">I</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-xl text-black leading-none tracking-tight">InTime</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold mt-1">Solutions</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <div 
              key={item.label} 
              className="relative group"
              onMouseEnter={() => setActiveDropdown(item.label)}
            >
              <Link 
                href={item.href} 
                className={cn(
                  "text-sm font-bold uppercase tracking-widest py-8 inline-block transition-colors flex items-center gap-1",
                  item.isSpecial ? "hover:text-[#C87941]" : "hover:text-[#C87941]"
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="w-3 h-3" />}
                {item.isSpecial && <span className="bg-[#C87941] text-white text-[9px] px-1.5 py-0.5 rounded-none ml-1">NEW</span>}
              </Link>

              {/* Mega Menu Dropdown */}
              {item.children && activeDropdown === item.label && (
                <div className="absolute top-full left-0 w-72 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] py-4 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className={cn("flex flex-col", item.children.length > 6 ? "max-h-[60vh] overflow-y-auto" : "")}>
                    {item.children.map((child) => (
                      <Link 
                        key={child.label}
                        href={child.href}
                        className="px-6 py-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 font-medium transition-colors block"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sign In / CTA */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/auth/login" className="text-sm font-bold uppercase tracking-widest hover:text-[#C87941]">
            Sign In
          </Link>
          <Link href="/contact">
            <button className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#C87941] transition-colors flex items-center gap-2">
              Start Project
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-black z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#F5F3EF] z-40 pt-32 px-6 overflow-y-auto">
          <div className="flex flex-col gap-6 pb-12">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="border-b border-gray-200 pb-4">
                <Link 
                  href={item.href}
                  className="text-xl font-bold uppercase tracking-widest block mb-4"
                  onClick={() => !item.children && setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 flex flex-col gap-3 border-l-2 border-gray-200">
                    {item.children.map((child) => (
                      <Link 
                        key={child.label}
                        href={child.href}
                        className="text-sm text-gray-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-4 mt-4">
              <Link href="/auth/login" className="text-xl font-bold uppercase tracking-widest text-center py-4 border-2 border-black" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-[#C87941] transition-colors">
                  Start Project
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
