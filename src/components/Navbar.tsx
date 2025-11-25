'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Mic, Map, Menu, X, Cpu, ChevronDown, List, Layers, Sparkles, LogOut, FileText, Bell, Briefcase, Users, Globe, TrendingUp, LayoutDashboard, Search, Clock, Activity, Plus, DollarSign, UserPlus, Network, BarChart3, GraduationCap, Settings, Award, Rocket, Megaphone, Plane, CheckCircle, Building2, Download, ShieldCheck, Target, Lock, Terminal, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Role } from '@/lib/types';
import { Button } from '@/components/ui/button';

// Navigation structures based on 4 Parent Categories
const ROLE_NAV: Record<Role, { title: string; icon: any; items: { label: string; path: string; icon: any }[] }[]> = {
  // --- 1. ACADEMY (Student) ---
  student: [
    {
      title: "The Path",
      icon: Map,
      items: [
        { label: "Your Journey", path: "/academy/dashboard", icon: Map },
        { label: "Your Curriculum", path: "/academy/modules", icon: List }
      ]
    },
    {
      title: "The Plan",
      icon: Layers,
      items: [
        { label: "Your Persona", path: "/academy/identity", icon: User },
        { label: "Your Blueprint", path: "/academy/blueprint", icon: FileText }
      ]
    },
    {
      title: "The AI",
      icon: Sparkles,
      items: [
        { label: "Your Dojo", path: "/academy/dojo", icon: Mic },
        { label: "Your Guru", path: "/academy/assistant", icon: Cpu }
      ]
    }
  ],

  // --- 2. CLIENT PORTAL (External Client) ---
  client: [
      {
          title: "My Hiring",
          icon: Briefcase,
          items: [
              { label: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
              { label: "Active Reqs", path: "/client/jobs", icon: List },
              { label: "Pipeline", path: "/client/pipeline", icon: Users },
          ]
      }
  ],

  // --- 3. TALENT PORTAL (External Consultant) ---
  consultant: [
      {
          title: "My Bench",
          icon: User,
          items: [
              { label: "Dashboard", path: "/talent/dashboard", icon: LayoutDashboard },
              { label: "Job Matches", path: "/talent/jobs", icon: Briefcase },
              { label: "My Profile", path: "/talent/profile", icon: User },
          ]
      }
  ],

  // --- 4. EMPLOYEE / HR (Internal Roles) ---

  // 1. Bench Sales
  bench_manager: [
      {
          title: "Bench Ops",
          icon: Users,
          items: [
              { label: "Console", path: "/employee/bench/dashboard", icon: LayoutDashboard },
              { label: "Talent", path: "/employee/bench/talent", icon: User },
              { label: "Leads", path: "/employee/bench/leads", icon: Target },
              { label: "Deals", path: "/employee/bench/deals", icon: DollarSign },
              { label: "Jobs", path: "/employee/bench/jobs", icon: Briefcase },
              { label: "Pipeline", path: "/employee/bench/pipeline", icon: List }
          ]
      },
      {
          title: "Shared Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users },
              { label: "Job Board", path: "/employee/shared/jobs", icon: Briefcase },
              { label: "Combined View", path: "/employee/shared/combined", icon: Layers }
          ]
      }
  ],

  // 2. Recruiter
  recruiter: [
      {
          title: "Recruiting Ops",
          icon: Briefcase,
          items: [
              { label: "Console", path: "/employee/recruiting/dashboard", icon: LayoutDashboard },
              { label: "Leads", path: "/employee/recruiting/leads", icon: Target },
              { label: "Deals", path: "/employee/recruiting/deals", icon: DollarSign },
              { label: "Jobs", path: "/employee/recruiting/jobs", icon: Briefcase },
              { label: "Pipeline", path: "/employee/recruiting/pipeline", icon: List },
          ]
      },
      {
          title: "Shared Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users },
              { label: "Job Board", path: "/employee/shared/jobs", icon: Briefcase },
              { label: "Combined View", path: "/employee/shared/combined", icon: Layers }
          ]
      }
  ],

  // 3. Sales Specialist (TA)
  ta_specialist: [
      {
          title: "Sales Ops",
          icon: UserPlus,
          items: [
              { label: "Console", path: "/employee/ta/dashboard", icon: LayoutDashboard },
              { label: "Campaigns", path: "/employee/ta/campaigns", icon: Megaphone },
              { label: "Leads", path: "/employee/ta/leads", icon: Target },
              { label: "Deals", path: "/employee/ta/deals", icon: DollarSign },
          ]
      },
      {
          title: "Shared Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users },
              { label: "Job Board", path: "/employee/shared/jobs", icon: Briefcase }
          ]
      }
  ],

  // 4. Academy Coordinator
  academy_admin: [
      {
          title: "Training Ops",
          icon: GraduationCap,
          items: [
              { label: "Instructor Dash", path: "/employee/academy/admin/dashboard", icon: LayoutDashboard },
              { label: "Certificates", path: "/employee/academy/admin/certificates", icon: Award },
              { label: "Course Builder", path: "/employee/academy/admin/courses", icon: Layers },
          ]
      },
      {
          title: "Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users }
          ]
      }
  ],

  // 5. Immigration
  cross_border_specialist: [
      {
          title: "Mobility",
          icon: Plane,
          items: [
              { label: "Dashboard", path: "/employee/immigration/dashboard", icon: LayoutDashboard },
          ]
      },
      {
          title: "Intel",
          icon: Globe,
          items: [
              { label: "Unified Talent", path: "/employee/shared/talent", icon: Users }
          ]
      }
  ],

  // 6. HR Manager
  hr_admin: [
    {
      title: "Workforce",
      icon: Users,
      items: [
        { label: "Dashboard", path: "/employee/hr/dashboard", icon: LayoutDashboard },
        { label: "Directory", path: "/employee/hr/people", icon: Users },
        { label: "Org Structure", path: "/employee/hr/org", icon: Network }
      ]
    },
    {
      title: "Ops",
      icon: Briefcase,
      items: [
        { label: "Time", path: "/employee/hr/time", icon: Clock },
        { label: "Payroll", path: "/employee/hr/payroll", icon: DollarSign },
        { label: "Docs", path: "/employee/hr/documents", icon: FileText }
      ]
    },
    {
      title: "Growth",
      icon: TrendingUp,
      items: [
        { label: "Performance", path: "/employee/hr/performance", icon: Activity },
        { label: "L&D", path: "/employee/hr/learning", icon: GraduationCap },
        { label: "Hiring", path: "/employee/hr/recruitment", icon: UserPlus },
      ]
    }
  ],

  // 7. Admin
  admin: [
      {
          title: "Control",
          icon: ShieldCheck,
          items: [
              { label: "Mission Control", path: "/employee/admin/dashboard", icon: Activity },
              { label: "User Management", path: "/employee/admin/users", icon: Users },
              { label: "Permissions", path: "/employee/admin/permissions", icon: Lock },
              { label: "Course Content", path: "/employee/admin/courses", icon: BookOpen },
          ]
      },
      {
          title: "System",
          icon: Terminal,
          items: [
              { label: "Audit Logs", path: "/employee/admin/audit", icon: FileText },
              { label: "Configuration", path: "/employee/admin/settings", icon: Settings }
          ]
      }
  ],

  // 8. CEO
  ceo: [
      {
          title: "Strategy",
          icon: Activity,
          items: [
              { label: "Executive Dash", path: "/employee/ceo/dashboard", icon: LayoutDashboard },
              { label: "Financials", path: "/employee/ceo/financials", icon: TrendingUp },
              { label: "Strategic Plan", path: "/employee/ceo/strategy", icon: Map }
          ]
      },
      {
          title: "Intel",
          icon: Globe,
          items: [
              { label: "Shared Job Board", path: "/employee/shared/jobs", icon: Briefcase },
              { label: "Combined View", path: "/employee/shared/combined", icon: Layers }
          ]
      }
  ],
};

// Defined order for internal role switcher
const INTERNAL_ROLES: Role[] = [
    'bench_manager',
    'recruiter',
    'ta_specialist',
    'academy_admin',
    'cross_border_specialist',
    'hr_admin',
    'admin',
    'ceo'
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, setActiveRole } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const isPublic = pathname === '/' || pathname === '/academy' || pathname === '/clients' || pathname === '/login' || pathname.startsWith('/verify-certificate');
  const isLoginPage = pathname === '/login';

  const isActive = (path: string) => pathname === path;
  const isGroupActive = (items: { path: string }[]) => items.some(item => isActive(item.path));

  // Is Internal Employee?
  const isInternal = !['student', 'client', 'consultant'].includes(activeRole);

  const handleLogout = () => {
      router.push('/');
      setIsProfileOpen(false);
  };

  const handleRoleSwitch = (role: Role) => {
      setActiveRole(role);
      setIsRoleSwitcherOpen(false);
      // Simple routing switch
      if(role === 'student') router.push('/academy/dashboard');
      else if(role === 'client') router.push('/client/portal');
      else if(role === 'consultant') router.push('/talent/portal');
      else if(role === 'bench_manager') router.push('/employee/bench/dashboard');
      else if(role === 'recruiter') router.push('/employee/recruiting/dashboard');
      else if(role === 'ta_specialist') router.push('/employee/ta/dashboard');
      else if(role === 'academy_admin') router.push('/employee/academy/admin/dashboard');
      else if(role === 'cross_border_specialist') router.push('/employee/immigration/dashboard');
      else if(role === 'hr_admin') router.push('/employee/hr/dashboard');
      else if(role === 'admin') router.push('/employee/admin/dashboard');
      else if(role === 'ceo') router.push('/employee/ceo/dashboard');
  };

  const getRoleLabel = (role: Role) => {
      if (role === 'bench_manager') return 'Bench Sales';
      if (role === 'recruiter') return 'Recruiter';
      if (role === 'ta_specialist') return 'Sales Specialist';
      if (role === 'academy_admin') return 'Academy Coordinator';
      if (role === 'cross_border_specialist') return 'Immigration';
      if (role === 'hr_admin') return 'HR Manager';
      if (role === 'admin') return 'System Admin';
      if (role === 'ceo') return 'CEO';

      // External
      if (role === 'student') return 'Student';
      if (role === 'client') return 'Client';
      if (role === 'consultant') return 'Talent';

      return (role as string).toUpperCase();
  };

  const activeNavStructure = ROLE_NAV[activeRole] || [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Premium Glass Navigation Bar */}
      <div className="container-premium py-6 pointer-events-auto">
        <div className="glass-strong shadow-premium rounded-2xl px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-6">

          <div className="w-full lg:w-auto flex items-center justify-between gap-6">
              {/* Premium Logo */}
              <Link href="/" className="flex items-center gap-3 group shrink-0 relative" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="absolute inset-0 bg-gradient-gold blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 rounded-full"></div>
                <div className="w-12 h-12 bg-gradient-forest rounded-xl flex items-center justify-center text-white shadow-elevation-md group-hover:shadow-elevation-lg transition-all duration-300 relative z-10 group-hover:scale-105">
                    <span className="font-heading font-black text-2xl gradient-text-gold">I</span>
                </div>
                <div className="flex flex-col relative z-10">
                    <span className="font-heading font-bold text-charcoal-900 text-xl leading-none tracking-tight">InTime</span>
                    <span className="text-caption text-gold-600 mt-0.5">Solutions</span>
                </div>
              </Link>

              {/* Premium Role Switcher (Desktop) - Internal Only */}
              {!isPublic && isInternal && (
                  <div className="relative hidden lg:block">
                      <button
                          onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal-100/50 hover:bg-charcoal-100 text-charcoal-700 hover:text-charcoal-900 text-caption transition-all duration-300 border border-charcoal-200/50"
                      >
                          {getRoleLabel(activeRole)}
                          <ChevronDown size={14} className={cn("transition-transform duration-300", isRoleSwitcherOpen && 'rotate-180')} />
                      </button>

                      {isRoleSwitcherOpen && (
                          <div className="absolute top-full left-0 mt-3 w-64 glass-strong rounded-xl shadow-premium border border-charcoal-100 overflow-hidden z-50 animate-slide-down">
                              <div className="p-3 border-b border-charcoal-100/50">
                                  <p className="text-caption text-charcoal-500">Switch Context</p>
                              </div>
                              <div className="max-h-96 overflow-y-auto scrollbar-premium p-2">
                                  {INTERNAL_ROLES.map((r) => (
                                      <button
                                          key={r}
                                          onClick={() => handleRoleSwitch(r)}
                                          className={cn(
                                              "w-full text-left px-4 py-3 text-caption rounded-lg transition-all duration-300 mb-1",
                                              activeRole === r
                                                ? "bg-gradient-gold text-charcoal-900 shadow-elevation-sm font-bold"
                                                : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900"
                                          )}
                                      >
                                          {getRoleLabel(r)}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              <button
                  className="lg:hidden p-2 text-charcoal-600 hover:text-forest-600 transition-colors rounded-lg hover:bg-charcoal-50"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>

          {/* Premium Main Links (Desktop) */}
          {!isPublic && activeNavStructure.length > 0 && (
            <ul className="hidden lg:flex items-center gap-1">
              {activeNavStructure.map((group) => (
                <li
                    key={group.title}
                    className="relative group/dropdown"
                    onMouseEnter={() => setActiveDropdown(group.title)}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-lg text-caption transition-all duration-300",
                        isGroupActive(group.items)
                          ? 'text-forest-700 bg-forest-50 font-bold shadow-elevation-xs'
                          : 'text-charcoal-600 hover:text-forest-600 hover:bg-forest-50/50'
                    )}>
                        {group.title}
                        <ChevronDown size={14} className={cn("transition-transform duration-300", activeDropdown === group.title && 'rotate-180')} />
                    </button>

                    {/* Premium Dropdown Menu */}
                    <div className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56 transition-all duration-300 transform origin-top",
                        activeDropdown === group.title ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
                    )}>
                        <div className="glass-strong rounded-xl shadow-premium border border-charcoal-100 p-2 overflow-hidden">
                            {group.items.map(item => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                        isActive(item.path)
                                          ? 'bg-gradient-gold text-charcoal-900 shadow-elevation-sm font-bold'
                                          : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-forest-600'
                                    )}
                                >
                                    <item.icon size={18} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                                    <span className="text-caption">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </li>
              ))}
            </ul>
          )}

          {/* Premium Mobile Menu */}
          {!isPublic && (
            <div className={cn("lg:hidden flex-col w-full pb-4 space-y-4 mt-2", isMobileMenuOpen ? 'flex' : 'hidden')}>
                {isInternal && (
                    <div className="p-3 bg-charcoal-50/50 rounded-xl border border-charcoal-100/50">
                       <p className="text-caption text-charcoal-500 mb-3 px-2">Switch View</p>
                       <div className="grid grid-cols-2 gap-2">
                          {INTERNAL_ROLES.map((r) => (
                              <button
                                  key={r}
                                  onClick={() => handleRoleSwitch(r)}
                                  className={cn(
                                      "text-left px-3 py-2.5 rounded-lg text-caption transition-all duration-300",
                                      activeRole === r
                                        ? "bg-gradient-gold text-charcoal-900 shadow-elevation-sm font-bold"
                                        : "text-charcoal-600 hover:bg-white"
                                  )}
                              >
                                  {getRoleLabel(r)}
                              </button>
                          ))}
                       </div>
                    </div>
                )}

                {activeNavStructure.map((group) => (
                    <div key={group.title}>
                        <div className="text-caption text-charcoal-400 mb-3 px-2">{group.title}</div>
                        <div className="space-y-1">
                            {group.items.map(item => (
                                 <Link
                                    key={item.path}
                                    href={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                        isActive(item.path)
                                          ? 'bg-gradient-gold text-charcoal-900 shadow-elevation-sm font-bold'
                                          : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-forest-600'
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                                    <span className="text-caption">{item.label}</span>
                                  </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          )}

          {/* Premium Status / Profile / Notifications */}
          <div className={cn("lg:flex items-center justify-center lg:justify-end w-full lg:w-auto gap-4 shrink-0 lg:pl-6 lg:border-l border-charcoal-100/50", isMobileMenuOpen ? 'flex' : 'hidden')}>
             {!isPublic ? (
               <>
                 {/* Premium Notifications */}
                 <div className="relative">
                     <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2.5 text-charcoal-500 hover:text-forest-600 transition-all duration-300 rounded-lg hover:bg-forest-50"
                     >
                         <Bell size={20} strokeWidth={2} />
                         <div className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full border-2 border-white animate-pulse-slow"></div>
                     </button>

                     {isNotificationsOpen && (
                         <div className="absolute top-full right-0 mt-3 w-80 glass-strong rounded-xl shadow-premium border border-charcoal-100 overflow-hidden z-50 animate-slide-down">
                             <div className="p-4 border-b border-charcoal-100/50 flex justify-between items-center">
                                 <span className="text-caption text-charcoal-500">Notifications</span>
                                 <button className="text-caption text-gold-600 hover:text-gold-700 font-bold hover:underline">Mark all read</button>
                             </div>
                             <div className="max-h-96 overflow-y-auto scrollbar-premium">
                                 {[
                                     { text: "New job order from TechFlow", time: "10m ago", type: "info" },
                                     { text: "Pod A placed candidate! 🎉", time: "5 hours ago", type: "celebration" },
                                 ].map((note, i) => (
                                     <div key={i} className="p-4 border-b border-charcoal-50 hover:bg-charcoal-50/50 transition-colors flex gap-3 cursor-pointer">
                                         <div className={cn(
                                             "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                             note.type === 'celebration' ? 'bg-gold-500' : 'bg-forest-500'
                                         )}></div>
                                         <div>
                                             <p className="text-body-sm font-medium text-charcoal-800 leading-tight">{note.text}</p>
                                             <p className="text-caption text-charcoal-400 mt-1">{note.time}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>

                 <div className="text-right hidden md:block">
                    <div className="text-caption text-charcoal-400">
                        {isInternal ? 'Internal User' : activeRole === 'student' ? 'Student' : 'Partner'}
                    </div>
                    <div className="text-body-sm font-heading font-bold text-charcoal-900">
                        {activeRole === 'student' ? 'Priya Sharma' : isInternal ? getRoleLabel(activeRole) : 'Guest User'}
                    </div>
                 </div>

                 <div className="relative group">
                   <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="relative group cursor-pointer outline-none"
                   >
                     <div className="absolute inset-0 bg-gradient-gold blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300 rounded-full"></div>
                     <div className="relative w-11 h-11 rounded-full bg-gradient-gold text-charcoal-900 border-2 border-gold-200 shadow-elevation-md flex items-center justify-center font-heading font-black text-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-elevation-lg">
                       {(activeRole as string).charAt(0).toUpperCase()}
                     </div>
                   </button>

                   {/* Premium Profile Dropdown */}
                   {isProfileOpen && (
                     <div className="absolute top-full right-0 mt-3 w-72 glass-strong rounded-xl shadow-premium border border-charcoal-100 overflow-hidden z-50 animate-slide-down">
                        <div className="p-5 border-b border-charcoal-100/50">
                            <p className="text-body font-bold text-charcoal-900">
                                {activeRole === 'student' ? 'Priya Sharma' : 'User Profile'}
                            </p>
                            <p className="text-caption text-charcoal-500 mt-1">
                                {getRoleLabel(activeRole)}
                            </p>
                        </div>

                        <div className="p-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error-50 text-charcoal-600 hover:text-error-600 transition-all duration-300 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-charcoal-50 flex items-center justify-center group-hover:bg-error-100 transition-all duration-300">
                                  <LogOut size={16} strokeWidth={2} />
                                </div>
                                <span className="text-caption font-bold">Logout</span>
                            </button>
                        </div>
                     </div>
                   )}
                 </div>
               </>
             ) : (
               !isLoginPage && (
                   <Button variant="default" size="lg" asChild>
                     <Link href="/login">Sign In</Link>
                   </Button>
               )
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};
