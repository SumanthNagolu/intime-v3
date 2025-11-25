'use client';


import React, { useState, useEffect } from 'react';
import { Search, User, Briefcase, Building2, ArrowRight, Command, X, DollarSign, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export const GlobalCommand: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { candidates, jobs, leads, accounts } = useAppStore();

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredLeads = leads.filter(l => l.company.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  const handleNavigate = (path: string) => {
      setIsOpen(false);
      setQuery('');
      router.push(path);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-fade-in flex flex-col max-h-[70vh]">
        <div className="flex items-center border-b border-stone-100 px-4 py-4">
            <Search size={20} className="text-stone-400 mr-3" />
            <input 
                autoFocus
                className="flex-1 text-lg outline-none placeholder-stone-400 text-charcoal bg-transparent"
                placeholder="Search candidates, jobs, leads, or commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex gap-2">
                <span className="text-[10px] font-bold text-stone-400 border border-stone-200 rounded px-2 py-1">ESC</span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
            {query === '' && (
                <div className="p-2">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-2">Quick Navigation</div>
                    <CommandItem icon={Briefcase} label="Go to Recruiting Dashboard" onClick={() => handleNavigate('/employee/recruiting/dashboard')} />
                    <CommandItem icon={User} label="Go to Bench Roster" onClick={() => handleNavigate('/employee/bench/talent')} />
                    <CommandItem icon={DollarSign} label="Go to Sales Campaigns" onClick={() => handleNavigate('/employee/ta/campaigns')} />
                </div>
            )}

            {query !== '' && (
                <div className="space-y-4 p-2">
                    {filteredCandidates.length > 0 && (
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 px-2">Candidates</div>
                            {filteredCandidates.map(c => (
                                <CommandItem 
                                    key={c.id} 
                                    icon={User} 
                                    label={c.name} 
                                    subLabel={c.role} 
                                    onClick={() => handleNavigate(c.type === 'internal_bench' ? `/employee/bench/talent/${c.id}` : `/employee/recruiting/candidate/${c.id}`)} 
                                />
                            ))}
                        </div>
                    )}

                    {filteredJobs.length > 0 && (
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 px-2">Jobs</div>
                            {filteredJobs.map(j => (
                                <CommandItem 
                                    key={j.id} 
                                    icon={Briefcase} 
                                    label={j.title} 
                                    subLabel={j.client} 
                                    onClick={() => handleNavigate(`/employee/recruiting/jobs/${j.id}`)} 
                                />
                            ))}
                        </div>
                    )}

                    {filteredLeads.length > 0 && (
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 px-2">Leads</div>
                            {filteredLeads.map(l => (
                                <CommandItem 
                                    key={l.id} 
                                    icon={Building2} 
                                    label={l.company} 
                                    subLabel={l.contact} 
                                    onClick={() => handleNavigate(`/employee/recruiting/leads/${l.id}`)} 
                                />
                            ))}
                        </div>
                    )}

                    {filteredCandidates.length === 0 && filteredJobs.length === 0 && filteredLeads.length === 0 && (
                        <div className="p-8 text-center text-stone-400">
                            <Search size={32} className="mx-auto mb-2 opacity-20" />
                            <p>No results found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        <div className="bg-stone-50 p-2 border-t border-stone-100 flex justify-between px-4 py-3">
            <span className="text-[10px] text-stone-400"><strong>Tip:</strong> Search 'Senior' to find developers</span>
            <span className="text-[10px] text-stone-400">InTime OS v3.2</span>
        </div>
      </div>
    </div>
  );
};

const CommandItem: React.FC<{ icon: any, label: string, subLabel?: string, onClick: () => void }> = ({ icon: Icon, label, subLabel, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 transition-colors text-left group"
    >
        <div className="w-8 h-8 rounded-md bg-stone-200 flex items-center justify-center text-stone-500 group-hover:bg-charcoal group-hover:text-white transition-colors">
            <Icon size={16} />
        </div>
        <div>
            <div className="text-sm font-bold text-charcoal">{label}</div>
            {subLabel && <div className="text-xs text-stone-500">{subLabel}</div>}
        </div>
        <ArrowRight size={14} className="ml-auto text-stone-300 group-hover:text-charcoal" />
    </button>
);
