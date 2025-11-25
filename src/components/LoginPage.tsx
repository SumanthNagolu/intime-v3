'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Layout, Lock, ArrowLeft, ShieldCheck, Globe, Users, Building2, ChevronRight, X, GraduationCap, Settings, Plane } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Role } from '@/lib/types';

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const { setActiveRole } = useAppStore();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false);

  // The 3 External Portals
  const externalPortals = [
    { id: 'academy', name: 'Academy', icon: User, role: 'student' as Role, desc: 'Student Learning Portal', color: 'text-rust', bgHover: 'hover:bg-rust/5' },
    { id: 'client', name: 'Client Portal', icon: Building2, role: 'client' as Role, desc: 'Hire Pre-Vetted Talent', color: 'text-blue-600', bgHover: 'hover:bg-blue-50' },
    { id: 'talent', name: 'Talent Portal', icon: Briefcase, role: 'consultant' as Role, desc: 'Consultant Workspace', color: 'text-purple-600', bgHover: 'hover:bg-purple-50' },
  ];

  // The Internal Employee Roles
  // Order: Bench sales, Recruiter, Sales specialist, Training specialist, Immigration, HR manager, Admin, CEO
  const internalRoles: { id: string; label: string; role: Role; icon: any }[] = [
      { id: 'bench', label: 'Bench Sales', role: 'bench_manager', icon: Layout },
      { id: 'recruiter', label: 'Recruiter', role: 'recruiter', icon: Users },
      { id: 'sales', label: 'Sales Specialist', role: 'ta_specialist', icon: Globe },
      { id: 'training', label: 'Training Specialist', role: 'academy_admin', icon: GraduationCap },
      { id: 'imm', label: 'Immigration', role: 'cross_border_specialist', icon: Plane },
      { id: 'hr', label: 'HR Manager', role: 'hr_admin', icon: ShieldCheck },
      { id: 'admin', label: 'Admin', role: 'admin', icon: Settings },
      { id: 'ceo', label: 'CEO', role: 'ceo', icon: Lock },
  ];

  const handleLogin = (role: Role, path?: string) => {
    setLoadingRole(role);
    // Simulate API call authentication delay
    setTimeout(() => {
      setActiveRole(role);
      if (path) {
          router.push(path);
      } else {
          // Routing Logic
          switch(role) {
              // External
              case 'student': router.push('/academy/dashboard'); break;
              case 'client': router.push('/client/portal'); break;
              case 'consultant': router.push('/talent/portal'); break;
              
              // Internal (All under /employee)
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
    <div className="min-h-screen bg-ivory flex flex-col p-4 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-50 z-0 pointer-events-none"></div>
       <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-rust/5 rounded-full blur-3xl pointer-events-none"></div>
       <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-charcoal/5 rounded-full blur-3xl pointer-events-none"></div>

       <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center">
          
          <div className="mb-12">
             <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-colors mb-8">
                <ArrowLeft size={16} /> Back to Home
             </Link>
             
             <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-charcoal to-stone-800 text-white rounded-2xl shadow-xl mb-6 font-serif font-bold text-4xl italic">
                    I
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">Welcome to InTime</h1>
                <p className="text-stone-500 text-lg max-w-2xl mx-auto">
                    Unified Ecosystem Login. Select your portal to continue.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
              
              {/* 1. Academy (Student) */}
              {externalPortals.map(portal => (
                  <button 
                    key={portal.id}
                    onClick={() => handleLogin(portal.role)}
                    disabled={loadingRole !== null}
                    className={`bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg hover:shadow-2xl hover:border-rust/30 hover:-translate-y-1 transition-all group text-left relative overflow-hidden ${loadingRole === portal.role ? 'ring-2 ring-rust' : ''} ${portal.bgHover}`}
                  >
                      <div className={`w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center ${portal.color} group-hover:bg-white group-hover:shadow-md transition-all mb-6 relative z-10`}>
                          {loadingRole === portal.role ? (
                              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                              <portal.icon size={28} />
                          )}
                      </div>
                      
                      <h3 className="font-serif font-bold text-charcoal text-xl mb-2 relative z-10 group-hover:text-rust transition-colors">{portal.name}</h3>
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest relative z-10">{portal.desc}</p>
                  </button>
              ))}

              {/* 4. In-Time OS (Internal) */}
              <button 
                onClick={() => setShowEmployeeMenu(true)}
                className="bg-charcoal text-white p-8 rounded-[2rem] border border-stone-800 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldCheck size={80} />
                  </div>

                  <div className="w-14 h-14 bg-stone-700 rounded-2xl flex items-center justify-center text-white mb-6 relative z-10">
                      <ShieldCheck size={28} />
                  </div>
                  
                  <h3 className="font-serif font-bold text-white text-xl mb-2 relative z-10">In-Time OS</h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest relative z-10">Internal Operations</p>
                  
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-rust uppercase tracking-widest relative z-10">
                      Secure SSO <Lock size={12} />
                  </div>
              </button>
          </div>

          <div className="mt-16 text-center pb-8">
              <p className="text-stone-400 text-sm">
                  Protected by Enterprise SSO. <span className="text-stone-300">v3.2.0</span>
              </p>
          </div>
       </div>

       {/* Employee Sub-Menu Modal */}
       {showEmployeeMenu && (
           <div className="fixed inset-0 bg-charcoal/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowEmployeeMenu(false)}>
               <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-12 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                   <button onClick={() => setShowEmployeeMenu(false)} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal transition-colors">
                       <X size={24} />
                   </button>
                   
                   <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Internal Login</h2>
                   <p className="text-stone-500 mb-8">Select your role to access the Employee Portal.</p>

                   <div className="grid grid-cols-2 gap-4">
                       {internalRoles.map(role => (
                           <button
                               key={role.id}
                               onClick={() => handleLogin(role.role)}
                               className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:border-rust hover:bg-rust/5 transition-all group text-left"
                           >
                               <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 group-hover:bg-white group-hover:text-rust shadow-sm transition-colors">
                                   <role.icon size={18} />
                               </div>
                               <div>
                                   <div className="font-bold text-charcoal text-sm group-hover:text-rust transition-colors">{role.label}</div>
                                   <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Employee</div>
                               </div>
                               <ChevronRight size={16} className="ml-auto text-stone-300 group-hover:text-rust" />
                           </button>
                       ))}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
