'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAVIGATION = {
  solutions: {
    label: 'Solutions',
    href: '/solutions',
    items: [
      {
        label: 'Staffing',
        href: '/solutions/staffing',
        submenu: [
          { label: 'Contract Staffing', href: '/solutions/staffing#contract' },
          { label: 'Contract-to-Hire', href: '/solutions/staffing#contract-to-hire' },
          { label: 'Direct Placement', href: '/solutions/staffing#direct-placement' },
        ],
      },
      {
        label: 'Consulting',
        href: '/consulting',
        submenu: [
          { label: 'Our Competencies', href: '/consulting/competencies' },
          { label: 'Our Services', href: '/consulting/services' },
        ],
      },
      { label: 'Cross-Border Solutions', href: '/solutions/cross-border' },
      { label: 'Training & Development', href: '/solutions/training' },
    ],
  },
  industries: {
    label: 'Industries',
    href: '/industries',
    items: [
      { label: 'Information Technology', href: '/industries/information-technology' },
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Engineering', href: '/industries/engineering' },
      { label: 'Manufacturing', href: '/industries/manufacturing' },
      { label: 'Financial & Accounting', href: '/industries/financial-accounting' },
      { label: 'AI/ML & Data', href: '/industries/ai-ml-data' },
      { label: 'Legal', href: '/industries/legal' },
      { label: 'Warehouse & Distribution', href: '/industries/warehouse-distribution' },
      { label: 'Logistics', href: '/industries/logistics' },
      { label: 'Hospitality', href: '/industries/hospitality' },
      { label: 'Human Resources', href: '/industries/human-resources' },
      { label: 'Telecom/Technology', href: '/industries/telecom-technology' },
      { label: 'Automobile', href: '/industries/automobile' },
      { label: 'Retail', href: '/industries/retail' },
      { label: 'Government & Public Sector', href: '/industries/government-public-sector' },
    ],
  },
  careers: {
    label: 'Careers',
    href: '/careers',
    items: [
      { label: 'Join Our Team', href: '/careers/join-our-team' },
      { label: 'Open Positions', href: '/careers/open-positions' },
      { label: 'Available Talent', href: '/careers/available-talent' },
    ],
  },
  resources: { label: 'Resources', href: '/resources' },
  academy: { label: 'Academy', href: '/academy' },
};

const NavDropdown: React.FC<{
  label: string;
  href: string;
  items: { label: string; href: string; submenu?: { label: string; href: string }[] }[];
  scrollable?: boolean;
}> = ({ label, href, items, scrollable }) => {
  return (
    <div className="relative group">
      <Link
        href={href}
        className="flex items-center gap-1 text-charcoal-800 hover:text-forest-600 font-bold transition-colors text-sm uppercase tracking-wider"
      >
        <span>{label}</span>
        <ChevronDown size={16} className="transition-transform group-hover:rotate-180" />
      </Link>
      <div
        className={cn(
          'absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-3 border border-charcoal-100/50 z-50',
          scrollable && 'max-h-[70vh] overflow-y-auto'
        )}
      >
        {items.map((item) =>
          item.submenu ? (
            <div key={item.href} className="relative group/sub">
              <Link
                href={item.href}
                className="flex items-center justify-between px-5 py-2.5 text-sm text-charcoal-600 hover:bg-forest-50 hover:text-forest-700 transition-colors"
              >
                <span className="font-medium">{item.label}</span>
                <ChevronDown size={14} className="-rotate-90" />
              </Link>
              <div className="absolute left-full top-0 ml-1 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 py-3 border border-charcoal-100/50 z-50">
                {item.submenu.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="block px-5 py-2.5 text-sm text-charcoal-600 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="block px-5 py-2.5 text-sm text-charcoal-600 hover:bg-forest-50 hover:text-forest-700 transition-colors"
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export const MarketingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getSecondWord = () => {
    if (pathname.startsWith('/academy')) return 'Academy';
    if (pathname.startsWith('/resources')) return 'Resources';
    if (pathname.startsWith('/careers')) return 'Careers';
    if (pathname.startsWith('/industries')) return 'Industries';
    if (pathname.startsWith('/solutions')) return 'Solutions';
    if (pathname.startsWith('/consulting')) return 'Consulting';
    if (pathname.startsWith('/company')) return 'Company';
    if (pathname.startsWith('/contact')) return 'Contact';
    return 'Solutions';
  };

  return (
    <nav className="bg-white border-b border-charcoal-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-heading font-bold italic text-xl text-gold-400">I</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-heading font-bold text-forest-600">InTime</span>
              <span className="text-2xl font-heading font-medium text-gold-500 ml-1">{getSecondWord()}</span>
            </div>
          </Link>

          <div className="flex-1" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <NavDropdown
              label={NAVIGATION.solutions.label}
              href={NAVIGATION.solutions.href}
              items={NAVIGATION.solutions.items}
            />
            <NavDropdown
              label={NAVIGATION.industries.label}
              href={NAVIGATION.industries.href}
              items={NAVIGATION.industries.items}
              scrollable
            />
            <NavDropdown
              label={NAVIGATION.careers.label}
              href={NAVIGATION.careers.href}
              items={NAVIGATION.careers.items}
            />
            <Link
              href={NAVIGATION.resources.href}
              className="text-charcoal-800 hover:text-forest-600 font-bold transition-colors text-sm uppercase tracking-wider"
            >
              {NAVIGATION.resources.label}
            </Link>
            <Link
              href={NAVIGATION.academy.href}
              className="text-charcoal-800 hover:text-forest-600 font-bold transition-colors text-sm uppercase tracking-wider"
            >
              {NAVIGATION.academy.label}
            </Link>

            <Link
              href="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold text-xs uppercase tracking-widest shadow-sm hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-charcoal-600 hover:bg-charcoal-50"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-charcoal-100 animate-in slide-in-from-top">
          <div className="container mx-auto px-6 py-6 space-y-4">
            <Link
              href="/solutions/staffing"
              className="block text-charcoal-800 hover:text-forest-600 font-bold py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              IT Staffing
            </Link>
            <Link
              href="/consulting"
              className="block text-charcoal-800 hover:text-forest-600 font-bold py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Consulting
            </Link>
            <Link
              href="/solutions/cross-border"
              className="block text-charcoal-800 hover:text-forest-600 font-bold py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cross-Border Solutions
            </Link>
            <Link
              href="/academy"
              className="block text-charcoal-800 hover:text-forest-600 font-bold py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Academy
            </Link>

            <div className="pt-4 border-t border-charcoal-100">
              <Link
                href="/login"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold text-sm uppercase tracking-widest"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MarketingNavbar;
