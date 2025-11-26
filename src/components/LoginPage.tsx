'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Briefcase, 
  Layout, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  Globe, 
  Users, 
  Building2, 
  ChevronRight, 
  X, 
  GraduationCap, 
  Settings, 
  Plane,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Role } from '@/lib/types';

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const { setActiveRole } = useAppStore();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The 3 External Portals
  const externalPortals = [
    { 
      id: 'academy', 
      name: 'Training Academy', 
      icon: GraduationCap, 
      role: 'student' as Role, 
      desc: 'Transform Your Career', 
      features: ['50+ Professional Courses', 'Industry Certifications', 'Career Coaching'],
      accentColor: 'bg-gold-500',
      gradientFrom: 'from-gold-400',
      gradientTo: 'to-amber-500',
      iconBg: 'bg-gold-500/20',
      iconColor: 'text-gold-400',
      hoverBorder: 'hover:border-gold-500/40',
      hoverGlow: 'hover:shadow-[0_0_40px_rgba(201,169,97,0.15)]'
    },
    { 
      id: 'client', 
      name: 'Client Portal', 
      icon: Building2, 
      role: 'client' as Role, 
      desc: 'Hire Pre-Vetted Talent', 
      features: ['Access Talent Pipeline', 'Direct Hiring', 'Submission Tracking'],
      accentColor: 'bg-amber-500',
      gradientFrom: 'from-amber-400',
      gradientTo: 'to-amber-600',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      hoverBorder: 'hover:border-amber-500/40',
      hoverGlow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]'
    },
    { 
      id: 'talent', 
      name: 'Talent Portal', 
      icon: Briefcase, 
      role: 'consultant' as Role, 
      desc: 'Consultant Workspace', 
      features: ['Job Opportunities', 'Profile Management', 'Application Status'],
      accentColor: 'bg-slate-400',
      gradientFrom: 'from-slate-300',
      gradientTo: 'to-slate-500',
      iconBg: 'bg-slate-400/20',
      iconColor: 'text-slate-300',
      hoverBorder: 'hover:border-slate-400/40',
      hoverGlow: 'hover:shadow-[0_0_40px_rgba(148,163,184,0.15)]'
    },
  ];

  // The Internal Employee Roles
  const internalRoles: { id: string; label: string; role: Role; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'bench', label: 'Bench Sales', role: 'bench_manager', icon: Layout },
    { id: 'recruiter', label: 'Recruiter', role: 'recruiter', icon: Users },
    { id: 'sales', label: 'Sales Specialist', role: 'ta_specialist', icon: Globe },
    { id: 'training', label: 'Training Specialist', role: 'academy_admin', icon: GraduationCap },
    { id: 'imm', label: 'Immigration', role: 'cross_border_specialist', icon: Plane },
    { id: 'hr', label: 'HR Manager', role: 'hr_admin', icon: ShieldCheck },
    { id: 'admin', label: 'Admin', role: 'admin', icon: Settings },
    { id: 'ceo', label: 'CEO', role: 'ceo', icon: Lock },
  ];

  // Navigate to the appropriate auth page for each portal
  const handlePortalSelect = (portalType: 'academy' | 'client' | 'talent' | 'employee') => {
    setLoadingRole(portalType);
    setTimeout(() => {
      router.push(`/auth/${portalType}`);
    }, 400);
  };

  // Legacy handleLogin for demo purposes (employee roles direct access)
  const handleLogin = (role: Role, path?: string) => {
    setLoadingRole(role);
    setTimeout(() => {
      setActiveRole(role);
      if (path) {
        router.push(path);
      } else {
        switch(role) {
          case 'student': router.push('/academy/dashboard'); break;
          case 'client': router.push('/client/portal'); break;
          case 'consultant': router.push('/talent/portal'); break;
          case 'bench_manager': router.push('/employee/bench/dashboard'); break;
          case 'recruiter': router.push('/employee/recruiting/dashboard'); break;
          case 'ta_specialist': router.push('/employee/ta/dashboard'); break;
          case 'academy_admin': router.push('/employee/academy/admin/dashboard'); break;
          case 'cross_border_specialist': router.push('/employee/immigration/dashboard'); break;
          case 'hr_admin': router.push('/employee/hr/dashboard'); break;
          case 'admin': router.push('/employee/admin/dashboard'); break;
          case 'ceo': router.push('/employee/ceo/dashboard'); break;
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex flex-col relative overflow-hidden">
      {/* ============================================
          SOPHISTICATED BACKGROUND
          Elegant dark theme with gold accents
          ============================================ */}
      <div className="absolute inset-0">
        {/* Base gradient - deep charcoal with warmth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0F] via-[#141418] to-[#0D0D0F]" />
        
        {/* Primary gold ambient glow - top right */}
        <div 
          className="absolute top-0 right-0 w-[70%] h-[60%] rounded-bl-[60%]"
          style={{
            background: 'radial-gradient(ellipse at 85% 15%, rgba(201, 169, 97, 0.12) 0%, transparent 50%)',
          }}
        />
        
        {/* Secondary warm glow - bottom left */}
        <div 
          className="absolute bottom-0 left-0 w-[60%] h-[50%] rounded-tr-[70%]"
          style={{
            background: 'radial-gradient(ellipse at 10% 90%, rgba(212, 175, 55, 0.08) 0%, transparent 45%)',
          }}
        />
        
        {/* Subtle center accent */}
        <div 
          className="absolute top-[35%] left-[40%] w-[35%] h-[35%]"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(201, 169, 97, 0.04) 0%, transparent 60%)',
          }}
        />
        
        {/* Geometric accents - gold circles */}
        <div 
          className="absolute top-[6%] right-[5%] w-[300px] h-[300px] border border-gold-500/8 rounded-full"
          style={{ transform: 'rotate(-12deg)' }}
        />
        <div 
          className="absolute top-[10%] right-[8%] w-[180px] h-[180px] border border-gold-400/5 rounded-full"
        />
        <div 
          className="absolute bottom-[12%] left-[3%] w-[200px] h-[200px] border border-gold-500/6 rounded-full"
        />
        <div 
          className="absolute top-[50%] right-[10%] w-[80px] h-[80px] border border-amber-500/8"
          style={{ transform: 'rotate(45deg)' }}
        />
        
        {/* Film grain texture for authenticity */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center px-6 lg:px-12 py-12">
        
        {/* Back Navigation */}
        <Link 
          href="/" 
          className="group inline-flex items-center gap-2 text-charcoal-500 hover:text-gold-400 font-bold uppercase tracking-[0.15em] text-[11px] transition-all duration-300 mb-12 w-fit"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Home
        </Link>
        
        {/* Header Section */}
        <div className={`text-center mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Logo Mark with glow */}
          <div className="relative inline-block mb-10">
            <div className="absolute -inset-2 bg-gold-500/20 blur-xl rounded-2xl" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 rounded-xl shadow-premium">
              <span className="font-heading font-bold text-4xl text-charcoal-900 italic">I</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="mb-6">
            <span className="block text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[1.1] tracking-tight">
              Welcome to
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-[1.1] tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
                InTime
              </span>
            </span>
          </h1>
          <p className="text-charcoal-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Select your portal to access the unified staffing ecosystem
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
          
          {/* External Portals */}
          {externalPortals.map((portal, index) => (
            <button 
              key={portal.id}
              onClick={() => handlePortalSelect(portal.id as 'academy' | 'client' | 'talent')}
              disabled={loadingRole !== null}
              className={`group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 
                ${portal.hoverBorder} ${portal.hoverGlow} hover:bg-white/[0.06] hover:-translate-y-2 
                transition-all duration-500 text-left overflow-hidden
                ${loadingRole === portal.id ? 'ring-2 ring-gold-500/50' : ''}
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ 
                transitionDelay: mounted ? `${150 + index * 100}ms` : '0ms'
              }}
            >
              {/* Left accent bar */}
              <div className={`absolute top-0 left-0 w-1 h-full ${portal.accentColor}`} />
              
              {/* Card content */}
              <div className="p-8">
                {/* Icon */}
                <div className={`w-14 h-14 ${portal.iconBg} rounded-xl flex items-center justify-center ${portal.iconColor} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  {loadingRole === portal.id ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <portal.icon size={26} />
                  )}
                </div>
                
                {/* Content */}
                <h3 className="font-heading font-bold text-white text-xl mb-2 group-hover:text-gold-400 transition-colors duration-300">
                  {portal.name}
                </h3>
                <p className="text-charcoal-400 text-sm mb-6 leading-relaxed">
                  {portal.desc}
                </p>
                
                {/* Features list */}
                <div className="space-y-2 mb-6">
                  {portal.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-charcoal-500 text-xs">
                      <CheckCircle2 size={12} className={portal.iconColor} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Arrow indicator */}
                <div className="flex items-center gap-2 text-charcoal-500 group-hover:text-gold-400 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Enter Portal</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            </button>
          ))}

          {/* Internal Portal Card */}
          <button 
            onClick={() => handlePortalSelect('employee')}
            disabled={loadingRole !== null}
            className={`group relative bg-gradient-to-br from-charcoal-800/80 to-charcoal-900/60 backdrop-blur-sm rounded-2xl border border-gold-500/20 
              hover:border-gold-500/40 hover:shadow-[0_0_50px_rgba(201,169,97,0.12)] hover:-translate-y-2 
              transition-all duration-500 text-left overflow-hidden
              ${loadingRole === 'employee' ? 'ring-2 ring-gold-500/50' : ''}
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ 
              transitionDelay: mounted ? `${150 + 3 * 100}ms` : '0ms'
            }}
          >
            {/* Left accent bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold-400 to-amber-500" />
            
            {/* Background icon watermark */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <ShieldCheck size={120} />
            </div>
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 to-gold-500/0 group-hover:from-gold-500/5 group-hover:to-transparent transition-all duration-500 rounded-2xl" />

            {/* Card content */}
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-14 h-14 bg-gold-500/20 rounded-xl flex items-center justify-center text-gold-400 mb-6 transition-transform duration-300 group-hover:scale-110">
                {loadingRole === 'employee' ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck size={26} />
                )}
              </div>
              
              {/* Content */}
              <h3 className="font-heading font-bold text-white text-xl mb-2 group-hover:text-gold-400 transition-colors duration-300">
                InTime OS
              </h3>
              <p className="text-charcoal-400 text-sm mb-6 leading-relaxed">
                Internal Operations Hub
              </p>
              
              {/* Features list */}
              <div className="space-y-2 mb-6">
                {['Bench Sales Management', 'Recruiting Dashboard', 'Cross-Border Operations'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-charcoal-500 text-xs">
                    <CheckCircle2 size={12} className="text-gold-500/70" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* SSO Badge */}
              <div className="flex items-center gap-2 text-gold-500 group-hover:text-gold-400 transition-colors duration-300">
                <Lock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure SSO Access</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className={`mt-20 text-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent" />
            <div className="flex items-center gap-2 text-charcoal-600">
              <ShieldCheck size={14} className="text-gold-500/60" />
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium">
                Enterprise Grade Security
              </p>
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent" />
          </div>
          <p className="text-charcoal-700 text-[10px] mt-4 tracking-wide font-mono">
            v3.2.0 • SOC 2 Type II Compliant
          </p>
        </div>
      </div>

      {/* ============================================
          EMPLOYEE SUB-MENU MODAL
          Refined design matching premium theme
          ============================================ */}
      {showEmployeeMenu && (
        <div 
          className="fixed inset-0 bg-[#0D0D0F]/95 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => setShowEmployeeMenu(false)}
        >
          {/* Modal content */}
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-premium-lg relative overflow-hidden animate-scale-in" 
            onClick={e => e.stopPropagation()}
          >
            {/* Top accent bar - gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400" />
            
            <div className="p-10 md:p-12">
              {/* Close button */}
              <button 
                onClick={() => setShowEmployeeMenu(false)} 
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-charcoal-50 flex items-center justify-center text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-100 transition-all duration-200"
              >
                <X size={20} />
              </button>
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-px bg-gold-500" />
                <span className="text-gold-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Secure Access
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-charcoal-900 mb-2">
                Internal Login
              </h2>
              <p className="text-charcoal-500 mb-10 text-lg font-light">
                Select your role to access the Employee Portal
              </p>

              {/* Role Grid */}
              <div className="grid grid-cols-2 gap-4">
                {internalRoles.map((role, index) => (
                  <button
                    key={role.id}
                    onClick={() => handleLogin(role.role)}
                    disabled={loadingRole !== null}
                    className={`group relative flex items-center gap-4 p-4 rounded-xl border border-charcoal-100 
                      hover:border-gold-500/40 hover:bg-gold-50/50 hover:shadow-elevation-sm
                      transition-all duration-300 text-left overflow-hidden
                      ${loadingRole === role.role ? 'ring-2 ring-gold-500 bg-gold-50' : ''}`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {/* Left accent bar on hover */}
                    <div className="absolute top-0 left-0 w-0 h-full bg-gold-500 group-hover:w-1 transition-all duration-300" />
                    
                    <div className="w-11 h-11 bg-charcoal-50 rounded-xl flex items-center justify-center text-charcoal-400 group-hover:bg-gold-100 group-hover:text-gold-700 transition-all duration-300 shrink-0">
                      {loadingRole === role.role ? (
                        <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <role.icon size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-charcoal-900 text-sm group-hover:text-gold-700 transition-colors truncate">
                        {role.label}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-charcoal-400">
                        Employee Portal
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-charcoal-300 group-hover:text-gold-500 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                  </button>
                ))}
              </div>
              
              {/* Security footer */}
              <div className="mt-8 pt-6 border-t border-charcoal-100 flex items-center justify-center gap-3 text-charcoal-400">
                <ShieldCheck size={14} className="text-gold-500" />
                <span className="text-[10px] font-medium tracking-widest uppercase">
                  Protected by Enterprise SSO
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
