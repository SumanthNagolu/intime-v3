'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

// Submenu component with hover intent
const NavSubmenu: React.FC<{
  item: { label: string; href: string; submenu?: { label: string; href: string }[] };
}> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  if (!item.submenu) {
    return (
      <Link
        href={item.href}
        className="block px-5 py-2.5 text-sm text-charcoal-600 hover:bg-forest-50 hover:text-forest-700 transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        className="flex items-center justify-between px-5 py-2.5 text-sm text-charcoal-600 hover:bg-forest-50 hover:text-forest-700 transition-colors"
      >
        <span className="font-medium">{item.label}</span>
        <ChevronDown size={14} className="-rotate-90" />
      </Link>
      <div
        className={cn(
          'absolute left-full top-0 ml-1 w-56 bg-white rounded-xl shadow-xl py-3 border border-charcoal-100/50 z-50 transition-all duration-200',
          isOpen 
            ? 'opacity-100 visible translate-x-0' 
            : 'opacity-0 invisible -translate-x-2 pointer-events-none'
        )}
      >
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
  );
};

// Main dropdown with hover intent (delays for better UX)
const NavDropdown: React.FC<{
  label: string;
  href: string;
  items: { label: string; href: string; submenu?: { label: string; href: string }[] }[];
  scrollable?: boolean;
}> = ({ label, href, items, scrollable }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Small delay before opening (50ms) - prevents accidental triggers
    timeoutRef.current = setTimeout(() => setIsOpen(true), 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Grace period before closing (200ms) - gives user time to move to dropdown
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  }, []);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className={cn(
          'flex items-center gap-1 font-bold transition-colors text-sm uppercase tracking-wider',
          isOpen ? 'text-forest-600' : 'text-charcoal-800 hover:text-forest-600'
        )}
      >
        <span>{label}</span>
        <ChevronDown 
          size={16} 
          className={cn(
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </Link>
      <div
        className={cn(
          'absolute top-full left-0 pt-3 w-72 z-50 transition-all duration-200',
          isOpen 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible -translate-y-2 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'bg-white rounded-xl shadow-xl py-3 border border-charcoal-100/50',
            scrollable && 'max-h-[70vh] overflow-y-auto'
          )}
        >
          {items.map((item) => (
            <NavSubmenu key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const MarketingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check auth state on mount and listen for changes
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

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

            {/* Auth Button - Sign In or User Menu */}
            {isLoading ? (
              <div className="w-24 h-10 bg-charcoal-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-forest-50 hover:bg-forest-100 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-forest-500 to-forest-700 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-charcoal-600 transition-transform',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* User Dropdown Menu */}
                <div
                  className={cn(
                    'absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
                    userMenuOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  )}
                >
                  <div className="px-4 py-3 border-b border-charcoal-100">
                    <p className="text-sm font-semibold text-charcoal-900 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-600 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    Go to Portal
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold text-xs uppercase tracking-widest shadow-sm hover:shadow-lg transition-all"
              >
                Sign In
              </Link>
            )}
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
              {user ? (
                <div className="space-y-3">
                  <div className="text-sm text-charcoal-500 px-1">
                    Signed in as <span className="font-semibold text-charcoal-700">{user.email}</span>
                  </div>
                  <Link
                    href="/login"
                    className="block w-full text-center px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Portal
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-full font-bold text-sm uppercase tracking-widest transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold text-sm uppercase tracking-widest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MarketingNavbar;
