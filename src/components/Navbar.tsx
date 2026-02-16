'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Mic, Map, Menu, X, Cpu, ChevronDown, List, Layers, Sparkles, LogOut, FileText, Bell, Briefcase, Users, Globe, TrendingUp, LayoutDashboard, Search, Clock, Activity, Plus, DollarSign, UserPlus, Network, BarChart3, GraduationCap, Settings, Award, Rocket, Megaphone, Plane, CheckCircle, Building2, Download, ShieldCheck, Target, Lock, Terminal, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Role } from '@/lib/types';

// Navigation structures based on 4 Parent Categories
const ROLE_NAV: Record<Role, { title: string; icon: any; items: { label: string; path: string; icon: any }[] }[]> = {
  // --- 1. ACADEMY (Student) ---
  student: [
    {
      title: "The Path",
      icon: Map,
      items: [
        { label: "Dashboard", path: "/academy/dashboard", icon: Map },
        { label: "Modules", path: "/academy/modules", icon: Layers },
      ]
    },
    {
      title: "The AI",
      icon: Sparkles,
      items: [
        { label: "Guidewire Guru", path: "/academy/assistant", icon: Sparkles },
      ]
    },
    {
      title: "Interview Prep",
      icon: Mic,
      items: [
        { label: "Interview Assist", path: "/academy/dojo", icon: Mic },
      ]
    },
    {
      title: "Portfolio",
      icon: Award,
      items: [
        { label: "Blueprint", path: "/academy/blueprint", icon: FileText },
        { label: "Profile", path: "/academy/profile", icon: User },
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

  // 4. Academy Coordinator (Formerly Training Specialist)
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

  // Force student nav on academy routes regardless of persisted role
  const isAcademyRoute = pathname.startsWith('/academy');
  const effectiveRole = isAcademyRoute ? 'student' : activeRole;

  // Is Internal Employee?
  const isInternal = !['student', 'client', 'consultant'].includes(effectiveRole);

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

  const activeNavStructure = ROLE_NAV[effectiveRole] || [];

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-stone-900/5 rounded-3xl lg:rounded-full px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl w-full pointer-events-auto transition-all duration-500">
        
        <div className="w-full lg:w-auto flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0 relative" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="absolute inset-0 bg-rust/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-11 h-11 bg-gradient-to-br from-charcoal to-stone-800 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-rust/20 transition-all duration-500 relative z-10">
                  <span className="font-serif font-bold italic text-xl text-rust">I</span>
              </div>
              <div className="flex flex-col relative z-10">
                  <span className="font-serif font-bold text-charcoal text-lg leading-none tracking-tight">InTime</span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-rust font-bold mt-1">Solutions</span>
              </div>
            </Link>

            {/* Role Switcher (Desktop) - Internal Only */}
            {!isPublic && isInternal && (
                <div className="relative hidden lg:block">
                    <button 
                        onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        {getRoleLabel(effectiveRole)}
                        <ChevronDown size={12} />
                    </button>

                    {isRoleSwitcherOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-fade-in">
                            <div className="p-2 bg-stone-50 border-b border-stone-100 text-[10px] font-bold uppercase tracking-widest text-stone-400">Switch Context</div>
                            <div className="max-h-80 overflow-y-auto">
                                {INTERNAL_ROLES.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => handleRoleSwitch(r)}
                                        className={cn(
                                            "w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide hover:bg-stone-50 transition-colors border-b border-stone-50",
                                            effectiveRole === r ? "text-rust bg-rust/5" : "text-stone-500"
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
                className="lg:hidden p-2 text-stone-500 hover:text-charcoal"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
        
        {/* Main Links (Desktop) */}
        {!isPublic && activeNavStructure.length > 0 && (
          <ul className="hidden lg:flex items-center gap-2">
            {activeNavStructure.map((group) => (
              group.items.length === 1 ? (
                /* Single item: render as direct link, no dropdown */
                <li key={group.title}>
                  <Link
                    href={group.items[0].path}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                      isActive(group.items[0].path) ? 'text-charcoal bg-stone-100' : 'text-stone-400 hover:text-charcoal hover:bg-stone-50'
                    )}
                  >
                    {group.title}
                  </Link>
                </li>
              ) : (
                /* Multiple items: render as dropdown */
                <li
                    key={group.title}
                    className="relative group/dropdown"
                    onMouseEnter={() => setActiveDropdown(group.title)}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                        isGroupActive(group.items) ? 'text-charcoal bg-stone-100' : 'text-stone-400 hover:text-charcoal hover:bg-stone-50'
                    )}>
                        {group.title}
                        <ChevronDown size={12} className={cn("transition-transform duration-300", activeDropdown === group.title && 'rotate-180')} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 pt-4 w-52 transition-all duration-300 transform origin-top",
                        activeDropdown === group.title ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                    )}>
                        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-2 overflow-hidden">
                            {group.items.map(item => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                                        isActive(item.path) ? 'bg-rust/5 text-rust' : 'text-stone-500 hover:bg-stone-50 hover:text-charcoal'
                                    )}
                                >
                                    <item.icon size={16} className={isActive(item.path) ? "stroke-[2.5px]" : ""} />
                                    <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </li>
              )
            ))}
          </ul>
        )}

        {/* Mobile Menu */}
        {!isPublic && (
          <div className={cn("lg:hidden flex-col w-full pb-6 border-b border-stone-100 space-y-6 mt-4", isMobileMenuOpen ? 'flex' : 'hidden')}>
              {isInternal && (
                  <div className="p-2 bg-stone-50 rounded-xl mb-4">
                     <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-2">Switch View</p>
                     <div className="grid grid-cols-2 gap-2">
                        {INTERNAL_ROLES.map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRoleSwitch(r)}
                                className={cn(
                                    "text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide",
                                    activeRole === r ? "bg-white text-rust shadow-sm" : "text-stone-500"
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
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300 mb-3 pl-2">{group.title}</div>
                      <div className="space-y-2">
                          {group.items.map(item => (
                               <Link 
                                  key={item.path}
                                  href={item.path} 
                                  className={cn(
                                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                                      isActive(item.path) ? 'bg-rust/5 text-rust' : 'text-stone-500 hover:bg-stone-50'
                                  )}
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
        )}

        {/* Status / Profile / Notifications */}
        <div className={cn("lg:flex items-center justify-center lg:justify-end w-full lg:w-auto gap-5 shrink-0 lg:pl-5 lg:border-l border-stone-100", isMobileMenuOpen ? 'flex' : 'hidden')}>
           {!isPublic ? (
             <>
               {/* Notifications */}
               <div className="relative">
                   <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="relative p-2 text-stone-400 hover:text-charcoal transition-colors"
                   >
                       <Bell size={20} />
                       <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                   </button>

                   {isNotificationsOpen && (
                       <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-fade-in">
                           <div className="p-4 border-b border-stone-50 flex justify-between items-center">
                               <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Notifications</span>
                               <button className="text-[10px] font-bold text-rust hover:underline">Mark all read</button>
                           </div>
                           <div className="max-h-80 overflow-y-auto">
                               {[
                                   { text: "New job order from TechFlow", time: "10m ago", type: "info" },
                                   { text: "Pod A placed candidate! 🎉", time: "5 hours ago", type: "celebration" },
                               ].map((note, i) => (
                                   <div key={i} className="p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors flex gap-3">
                                       <div className={cn(
                                           "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                           note.type === 'celebration' ? 'bg-purple-500' : 'bg-blue-500'
                                       )}></div>
                                       <div>
                                           <p className="text-sm font-medium text-charcoal leading-tight">{note.text}</p>
                                           <p className="text--[10px] text-stone-400 mt-1">{note.time}</p>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}
               </div>

               <div className="text-right hidden md:block">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-0.5">
                      {isInternal ? 'Internal User' : effectiveRole === 'student' ? 'Student' : 'Partner'}
                  </div>
                  <div className="text-sm font-serif font-bold text-charcoal">
                      {effectiveRole === 'student' ? 'Priya Sharma' : isInternal ? getRoleLabel(effectiveRole) : 'Guest User'}
                  </div>
               </div>
               
               <div className="relative group">
                 <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative group cursor-pointer outline-none"
                 >
                   <div className="absolute inset-0 bg-rust blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                   <div className="relative w-11 h-11 rounded-full bg-rust text-white border-2 border-white shadow-lg flex items-center justify-center font-serif font-bold italic text-lg transition-transform group-hover:scale-105">
                     {(effectiveRole as string).charAt(0).toUpperCase()}
                   </div>
                 </button>

                 {/* Profile Dropdown */}
                 {isProfileOpen && (
                   <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 z-50 animate-fade-in">
                      <div className="p-4 border-b border-stone-50 mb-2">
                          <p className="text-sm font-bold text-charcoal">
                              {effectiveRole === 'student' ? 'Priya Sharma' : 'User Profile'}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5 capitalize">
                              {getRoleLabel(effectiveRole)}
                          </p>
                      </div>
                      
                      <div className="space-y-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-stone-500 hover:text-red-500 transition-colors mt-2 border-t border-stone-50 group">
                              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all"><LogOut size={14} /></div>
                              <span className="text-xs font-bold uppercase tracking-wide">Logout</span>
                          </button>
                      </div>
                   </div>
                 )}
               </div>
             </>
           ) : (
             !isLoginPage && (
                 <Link href="/login" className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg">
                    Sign In
                 </Link>
             )
           )}
        </div>
      </div>
    </nav>
  );
};
