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
        className="block px-5 py-2.5 text-xs uppercase tracking-widest text-charcoal-600 hover:bg-charcoal-50 hover:text-forest-700 transition-colors font-medium border-l-2 border-transparent hover:border-gold-500"
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
        className="flex items-center justify-between px-5 py-2.5 text-xs uppercase tracking-widest text-charcoal-600 hover:bg-charcoal-50 hover:text-forest-700 transition-colors font-medium border-l-2 border-transparent hover:border-gold-500"
      >
        <span>{item.label}</span>
        <ChevronDown size={14} className="-rotate-90 text-charcoal-400" />
      </Link>
      <div
        className={cn(
          'absolute left-full top-0 ml-0 w-64 bg-white border border-charcoal-200 shadow-sharp z-50 transition-all duration-200',
          isOpen 
            ? 'opacity-100 visible translate-x-0' 
            : 'opacity-0 invisible -translate-x-2 pointer-events-none'
        )}
      >
        {item.submenu.map((sub) => (
          <Link
            key={sub.href}
            href={sub.href}
            className="block px-5 py-3 text-xs uppercase tracking-widest text-charcoal-600 hover:bg-charcoal-50 hover:text-forest-700 transition-colors border-l-2 border-transparent hover:border-gold-500"
          >
            {sub.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main dropdown with hover intent
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
    timeoutRef.current = setTimeout(() => setIsOpen(true), 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  }, []);

  return (
    <div 
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className={cn(
          'flex items-center gap-1 font-bold transition-colors text-xs uppercase tracking-[0.15em] h-full border-b-2',
          isOpen ? 'text-forest-600 border-gold-500' : 'text-charcoal-800 border-transparent hover:text-forest-600'
        )}
      >
        <span>{label}</span>
        <ChevronDown 
          size={14} 
          className={cn(
            'transition-transform duration-200 opacity-50',
            isOpen && 'rotate-180'
          )} 
        />
      </Link>
      <div
        className={cn(
          'absolute top-full left-0 w-72 z-50 transition-all duration-200',
          isOpen 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible -translate-y-2 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'bg-white border border-charcoal-200 shadow-sharp',
            scrollable && 'max-h-[70vh] overflow-y-auto scrollbar-premium'
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    <nav className="bg-white/95 backdrop-blur-sm border-b border-charcoal-100 sticky top-0 z-50 shadow-sm bg-noise">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center h-20">
          {/* Logo - Geometric & Sharp */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-charcoal-900 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 border border-gold-500/30"></div>
              <span className="font-heading font-black italic text-2xl text-white">I</span>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-gold-500"></div>
            </div>
            <div className="flex flex-col justify-center h-10">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-heading font-bold text-charcoal-900 tracking-tight leading-none">INTIME</span>
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-none"></span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-charcoal-500 leading-none mt-1 group-hover:text-gold-600 transition-colors">
                {getSecondWord()}
              </span>
            </div>
          </Link>

          <div className="flex-1" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10 h-full">
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
              className="text-charcoal-800 hover:text-forest-600 font-bold transition-colors text-xs uppercase tracking-[0.15em] h-full flex items-center border-b-2 border-transparent hover:border-gold-500"
            >
              {NAVIGATION.resources.label}
            </Link>
            <Link
              href={NAVIGATION.academy.href}
              className="text-charcoal-800 hover:text-forest-600 font-bold transition-colors text-xs uppercase tracking-[0.15em] h-full flex items-center border-b-2 border-transparent hover:border-gold-500"
            >
              {NAVIGATION.academy.label}
            </Link>

            {/* Separator */}
            <div className="w-px h-8 bg-charcoal-200 mx-2" />

            {/* Auth Button */}
            {isLoading ? (
              <div className="w-24 h-9 bg-charcoal-100 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 transition-colors group"
                >
                  <div className="w-6 h-6 bg-charcoal-900 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-charcoal-600 transition-transform group-hover:text-gold-600',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* User Dropdown */}
                <div
                  className={cn(
                    'absolute right-0 top-full mt-2 w-64 bg-white border border-charcoal-200 shadow-sharp z-50 transition-all duration-200',
                    userMenuOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  )}
                >
                  <div className="px-5 py-4 border-b border-charcoal-100 bg-charcoal-50">
                    <p className="text-xs font-mono text-charcoal-500 uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-charcoal-900 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-5 py-3 text-xs uppercase tracking-widest text-charcoal-600 hover:bg-charcoal-50 hover:text-forest-700 transition-colors border-l-2 border-transparent hover:border-gold-500"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    Portal Access
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-5 py-3 text-xs uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors border-l-2 border-transparent hover:border-red-500"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 bg-charcoal-900 text-white hover:bg-black font-bold text-xs uppercase tracking-[0.2em] shadow-elevation-sm hover:shadow-sharp transition-all border border-transparent hover:border-gold-500"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-none text-charcoal-600 hover:bg-charcoal-50 border border-transparent hover:border-charcoal-200 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-charcoal-100 animate-in slide-in-from-top absolute w-full left-0 shadow-xl h-[calc(100vh-80px)] overflow-y-auto">
          <div className="container mx-auto px-6 py-8 space-y-6">
            <Link
              href="/solutions/staffing"
              className="block text-charcoal-900 hover:text-forest-600 font-heading font-bold text-2xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              IT Staffing
            </Link>
            <Link
              href="/consulting"
              className="block text-charcoal-900 hover:text-forest-600 font-heading font-bold text-2xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Consulting
            </Link>
            <Link
              href="/solutions/cross-border"
              className="block text-charcoal-900 hover:text-forest-600 font-heading font-bold text-2xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cross-Border
            </Link>
            <Link
              href="/academy"
              className="block text-charcoal-900 hover:text-forest-600 font-heading font-bold text-2xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Academy
            </Link>

            <div className="pt-8 border-t border-charcoal-100">
              {user ? (
                <div className="space-y-4">
                  <div className="text-xs font-mono text-charcoal-500 uppercase tracking-wider">
                    Account: <span className="font-bold text-charcoal-900">{user.email}</span>
                  </div>
                  <Link
                    href="/login"
                    className="block w-full text-center px-6 py-4 bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm uppercase tracking-widest transition-colors shadow-sharp hover:translate-y-[-2px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Portal
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-6 py-4 border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 font-bold text-sm uppercase tracking-widest transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-6 py-4 bg-charcoal-900 text-white hover:bg-black font-bold text-sm uppercase tracking-[0.2em] shadow-sharp hover:translate-y-[-2px] transition-all"
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
