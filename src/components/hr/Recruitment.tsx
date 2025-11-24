'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { UserPlus, Search, Filter, ChevronRight, CheckCircle, Clock, Calendar, MoreHorizontal, Briefcase, MapPin, DollarSign, Users, Zap, Mail, X, Play, FileText, Brain, MessageSquare, Video, Star, Phone, Check } from 'lucide-react';
import Link from 'next/link';

export const Recruitment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Requisitions' | 'Candidates' | 'Screening' | 'Onboarding'>('Requisitions');
  const { employees } = useAppStore();
  
  // Modal States
  const [showCreateReqModal, setShowCreateReqModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedOnboarding, setSelectedOnboarding] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Mock Data Updates (Simulated)
  const [requisitions, setRequisitions] = useState([
      { id: 'REQ-101', title: 'Senior Recruiter', pod: 'Recruiting Pod B', status: 'Open', posted: '2 days ago', applicants: 12, description: 'Leading the recruitment efforts for our enterprise clients.', type: 'Full-time', department: 'Recruiting' },
      { id: 'REQ-102', title: 'Bench Sales Lead', pod: 'Sales Pod 2', status: 'Draft', posted: '-', applicants: 0, description: 'Driving bench sales and consultant placements.', type: 'Full-time', department: 'Sales' },
      { id: 'REQ-103', title: 'HR Generalist', pod: 'HR & Ops', status: 'Hold', posted: '1 week ago', applicants: 45, description: 'General HR duties and employee relations.', type: 'Contract', department: 'HR' },
  ]);

  const handleCreateRequisition = (newReq: any) => {
      setRequisitions([...requisitions, { ...newReq, id: `REQ-${100 + requisitions.length + 1}`, status: 'Open', posted: 'Just now', applicants: 0 }]);
      setShowCreateReqModal(false);
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Intelligence</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Talent Acquisition</h1>
        <p className="text-stone-500 mt-2">Manage internal hiring for InTime Org expansion.</p>
      </div>

       {/* Tabs */}
       <div className="flex gap-6 border-b border-stone-100 mb-8">
          {['Requisitions', 'Candidates', 'Screening', 'Onboarding'].map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                     activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                 }`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Requisitions' && (
        <RequisitionsView 
            reqs={requisitions} 
            onCreate={() => setShowCreateReqModal(true)} 
            onSelect={(req) => setSelectedReq(req)} 
        />
      )}
      {activeTab === 'Candidates' && (
        <CandidatesView onSelect={(c) => setSelectedCandidate(c)} />
      )}
      {activeTab === 'Screening' && (
        <ScreeningView 
            onSelect={(c) => setSelectedCandidate(c)} 
            onSchedule={(c) => { setSelectedCandidate(c); setShowScheduleModal(true); }} 
        />
      )}
      {activeTab === 'Onboarding' && (
        <OnboardingView 
            employees={employees} 
            onSelect={(e) => setSelectedOnboarding(e)} 
        />
      )}

      {/* Modals */}
      {showCreateReqModal && (
        <CreateRequisitionModal 
            onClose={() => setShowCreateReqModal(false)} 
            onSubmit={handleCreateRequisition} 
        />
      )}

      {selectedReq && (
        <RequisitionDetailModal 
            req={selectedReq} 
            onClose={() => setSelectedReq(null)} 
        />
      )}

      {selectedCandidate && !showScheduleModal && (
        <CandidateDetailModal 
            candidate={selectedCandidate} 
            onClose={() => setSelectedCandidate(null)}
            onSchedule={() => setShowScheduleModal(true)}
        />
      )}

      {showScheduleModal && selectedCandidate && (
        <ScheduleInterviewModal 
            candidate={selectedCandidate} 
            onClose={() => setShowScheduleModal(false)}
            onConfirm={() => { setShowScheduleModal(false); setSelectedCandidate(null); }}
        />
      )}

      {selectedOnboarding && (
        <OnboardingDetailModal 
            employee={selectedOnboarding} 
            onClose={() => setSelectedOnboarding(null)} 
        />
      )}
    </div>
  );
};

// --- Views ---

const RequisitionsView: React.FC<{ reqs: any[], onCreate: () => void, onSelect: (req: any) => void }> = ({ reqs, onCreate, onSelect }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-stone-200 shadow-sm w-96">
                    <Search size={18} className="text-stone-400 ml-2" />
                    <input placeholder="Search requisitions..." className="bg-transparent outline-none text-sm w-full" />
                </div>
                <button onClick={onCreate} className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
                    <UserPlus size={16} /> Create Requisition
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reqs.map(req => (
                    <div key={req.id} onClick={() => onSelect(req)} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group cursor-pointer relative">
                         <div className="absolute top-6 right-6">
                             <MoreHorizontal size={20} className="text-stone-300 hover:text-charcoal" />
                         </div>
                         <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">{req.id}</div>
                         <h3 className="text-xl font-serif font-bold text-charcoal mb-1 group-hover:text-rust transition-colors">{req.title}</h3>
                         <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-6">
                             <Briefcase size={12} /> {req.pod}
                         </div>

                         <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                             <div>
                                 <div className="text-2xl font-bold text-charcoal">{req.applicants}</div>
                                 <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Applicants</div>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                 req.status === 'Open' ? 'bg-green-50 text-green-700' : 
                                 req.status === 'Hold' ? 'bg-yellow-50 text-yellow-700' :
                                 'bg-stone-100 text-stone-500'
                             }`}>
                                 {req.status}
                             </span>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const CandidatesView: React.FC<{ onSelect: (c: any) => void }> = ({ onSelect }) => {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden">
             <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                 <h3 className="font-serif text-xl font-bold text-charcoal">Active Pipeline</h3>
                 <div className="flex gap-2">
                     <button className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold uppercase hover:bg-stone-50">Filter</button>
                     <button className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold uppercase hover:bg-stone-50">Sort</button>
                 </div>
             </div>
             <table className="w-full text-left">
                 <thead className="bg-stone-50 text-xs font-bold uppercase tracking-widest text-stone-400">
                     <tr>
                         <th className="p-6">Candidate</th>
                         <th className="p-6">Applying For</th>
                         <th className="p-6">Stage</th>
                         <th className="p-6">Score</th>
                         <th className="p-6 text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-stone-100">
                     {[
                         { name: 'Alex River', role: 'Senior Recruiter', stage: 'Interview', score: 92, email: 'alex.r@example.com' },
                         { name: 'Jordan Lee', role: 'Bench Sales', stage: 'Screening', score: 85, email: 'jordan.l@example.com' },
                         { name: 'Casey Smith', role: 'HR Generalist', stage: 'Offer', score: 98, email: 'casey.s@example.com' },
                     ].map((c, i) => (
                         <tr key={i} onClick={() => onSelect(c)} className="hover:bg-stone-50 transition-colors cursor-pointer">
                             <td className="p-6">
                                 <div className="font-bold text-charcoal">{c.name}</div>
                                 <div className="text-xs text-stone-400">{c.email}</div>
                             </td>
                             <td className="p-6 text-sm text-stone-600">{c.role}</td>
                             <td className="p-6">
                                 <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                     {c.stage}
                                 </span>
                             </td>
                             <td className="p-6 font-bold text-charcoal">{c.score}%</td>
                             <td className="p-6 text-right">
                                 <button className="text-xs font-bold text-rust uppercase hover:underline">View Profile</button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
    )
}

const ScreeningView: React.FC<{ onSelect: (c: any) => void, onSchedule: (c: any) => void }> = ({ onSelect, onSchedule }) => {
    const candidates = [
        { id: 1, name: "Sarah Jenkins", role: "Senior Recruiter", score: 94, status: "Passed", date: "2h ago", comm: 95, skill: 92, growth: 96, email: 'sarah.j@example.com' },
        { id: 2, name: "Michael Chen", role: "Bench Sales Lead", score: 88, status: "Reviewing", date: "5h ago", comm: 85, skill: 90, growth: 89, email: 'michael.c@example.com' },
        { id: 3, name: "Jessica Wu", role: "Senior Recruiter", score: 72, status: "Failed", date: "1d ago", comm: 70, skill: 75, growth: 71, email: 'jessica.w@example.com' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-rust/5 border border-rust/20 p-6 rounded-[2rem]">
                    <div className="text-rust font-bold text-xs uppercase tracking-widest mb-2">Action Required</div>
                    <div className="text-3xl font-serif font-bold text-charcoal mb-1">5</div>
                    <div className="text-sm text-stone-500">Candidates awaiting review</div>
                 </div>
                 <div className="bg-white border border-stone-200 p-6 rounded-[2rem]">
                    <div className="text-stone-400 font-bold text-xs uppercase tracking-widest mb-2">Avg. AI Score</div>
                    <div className="text-3xl font-serif font-bold text-charcoal mb-1">86%</div>
                    <div className="text-sm text-stone-500">Across all roles</div>
                 </div>
                 <div className="bg-white border border-stone-200 p-6 rounded-[2rem]">
                    <div className="text-stone-400 font-bold text-xs uppercase tracking-widest mb-2">Pass Rate</div>
                    <div className="text-3xl font-serif font-bold text-charcoal mb-1">42%</div>
                    <div className="text-sm text-stone-500">Strict filtering enabled</div>
                 </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden">
                <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-serif text-xl font-bold text-charcoal">AI Screening Results</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold uppercase hover:bg-stone-50">Filter</button>
                    </div>
                </div>
                <div className="divide-y divide-stone-100">
                    {candidates.map(c => (
                        <div key={c.id} className="p-6 hover:bg-stone-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => onSelect(c)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                    c.score >= 90 ? 'bg-green-100 text-green-700' : c.score >= 80 ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-500'
                                }`}>
                                    {c.score}
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal text-lg">{c.name}</div>
                                    <div className="text-xs text-stone-500">{c.role} • {c.date}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-8">
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-stone-100 rounded-md text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1" title={`Communication: ${c.comm}`}>
                                        <MessageSquare size={12} /> {c.comm}
                                    </div>
                                    <div className="px-3 py-1 bg-stone-100 rounded-md text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1" title={`Technical Skills: ${c.skill}`}>
                                        <Brain size={12} /> {c.skill}
                                    </div>
                                    <div className="px-3 py-1 bg-stone-100 rounded-md text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1" title={`Growth Mindset: ${c.growth}`}>
                                        <Zap size={12} /> {c.growth}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onSelect(c); }} className="px-4 py-2 bg-charcoal text-white text-xs font-bold uppercase rounded-full hover:bg-rust transition-colors">
                                        View Report
                                    </button>
                                    {c.status === 'Passed' && (
                                        <button onClick={(e) => { e.stopPropagation(); onSchedule(c); }} className="px-4 py-2 border-2 border-charcoal text-charcoal text-xs font-bold uppercase rounded-full hover:bg-stone-50">
                                            Schedule Interview
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const OnboardingView: React.FC<{ employees: any[], onSelect: (e: any) => void }> = ({ employees, onSelect }) => {
    const onboardingEmployees = employees.filter(e => e.status === 'Onboarding');
    
    return (
        <div className="space-y-8">
             {onboardingEmployees.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200">
                     <Users size={48} className="mx-auto text-stone-300 mb-4" />
                     <p className="text-stone-500">No active onboarding workflows.</p>
                 </div>
             ) : (
                 onboardingEmployees.map(e => (
                     <div key={e.id} onClick={() => onSelect(e)} className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm animate-slide-up cursor-pointer hover:border-rust/30 transition-all">
                         <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-4">
                                 <div className="w-16 h-16 bg-rust text-white rounded-full flex items-center justify-center text-2xl font-serif font-bold">
                                     {e.firstName.charAt(0)}
                                 </div>
                                 <div>
                                     <h3 className="text-xl font-bold text-charcoal">{e.firstName} {e.lastName}</h3>
                                     <p className="text-sm text-stone-500">{e.role} • {e.department}</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Start Date</div>
                                 <div className="font-bold text-charcoal">{e.startDate}</div>
                             </div>
                         </div>
                         
                         <div className="w-full bg-stone-100 h-2 rounded-full mb-4 overflow-hidden">
                             <div className="bg-green-500 h-full rounded-full" style={{ width: '45%' }}></div>
                         </div>
                         <div className="flex justify-between text-xs text-stone-500 font-bold uppercase tracking-widest">
                             <span>Onboarding Progress</span>
                             <span>45% Complete</span>
                         </div>
                     </div>
                 ))
             )}
        </div>
    )
}

// --- Modals ---

const CreateRequisitionModal: React.FC<{ onClose: () => void, onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({
        title: '',
        department: '',
        type: 'Full-time'
    });

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <div className="mb-8">
                    <h2 className="text-3xl font-serif font-bold text-charcoal">Create Requisition</h2>
                    <p className="text-stone-500 mt-2">Define the role, expectations, and screening process.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                         <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Role Details</label>
                            <input 
                                placeholder="Job Title" 
                                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust mb-4"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="Department / Pod" 
                                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                    value={form.department}
                                    onChange={e => setForm({...form, department: e.target.value})}
                                />
                                <select 
                                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                                    value={form.type}
                                    onChange={e => setForm({...form, type: e.target.value})}
                                >
                                    <option>Full-time</option>
                                    <option>Contract</option>
                                </select>
                            </div>
                         </div>

                         <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Responsibilities & Expectations</label>
                            <textarea placeholder="Key responsibilities..." className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust h-32 mb-4"></textarea>
                            <textarea placeholder="Performance targets (30/60/90 days)..." className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust h-32"></textarea>
                         </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-rust uppercase tracking-widest mb-2">AI Screening Configuration</label>
                            <div className="bg-rust/5 border border-rust/20 p-6 rounded-xl space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-charcoal block mb-2">Intro Content</label>
                                    <div className="flex gap-2 mb-2">
                                        <button className="flex-1 py-2 bg-white border border-rust/30 text-rust font-bold text-xs uppercase rounded-lg">Upload Demo Video</button>
                                        <button className="flex-1 py-2 bg-white border border-rust/30 text-rust font-bold text-xs uppercase rounded-lg">Write Intro</button>
                                    </div>
                                    <textarea placeholder="Intro text displayed to candidate..." className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm h-20"></textarea>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-charcoal block mb-2">Assessment Parameters</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-200">
                                            <input type="checkbox" defaultChecked className="accent-rust" />
                                            <span className="text-sm font-medium">Communication (Listening, Speaking, Writing)</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-200">
                                            <input type="checkbox" defaultChecked className="accent-rust" />
                                            <span className="text-sm font-medium">Technical Skills (Role-based)</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-200">
                                            <input type="checkbox" defaultChecked className="accent-rust" />
                                            <span className="text-sm font-medium">Growth Indicators (Curiosity, Articulation)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Recruitment Process</label>
                            <div className="space-y-2 text-sm text-stone-600">
                                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold">1</div>
                                    <span>AI Screening & Grading</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold">2</div>
                                    <span>Decision Maker Interview (HR/CEO)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 border-t border-stone-100 pt-6">
                    <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-stone-500 hover:bg-stone-50">Cancel</button>
                    <button onClick={() => onSubmit({ title: form.title, department: form.department, type: form.type, pod: form.department })} className="px-8 py-3 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust transition-colors shadow-lg">Publish Requisition</button>
                </div>
            </div>
        </div>
    )
}

const RequisitionDetailModal: React.FC<{ req: any, onClose: () => void }> = ({ req, onClose }) => {
    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <div className="mb-6">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">{req.id}</div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">{req.title}</h2>
                    <p className="text-stone-500 mt-1">{req.pod} • {req.type}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                        <div className="text-2xl font-bold text-charcoal">{req.applicants}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Applicants</div>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                        <div className="text-2xl font-bold text-charcoal">{req.status}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Status</div>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-center">
                        <div className="text-2xl font-bold text-charcoal">AI</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Screening Active</div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-charcoal mb-2">Description</h3>
                    <p className="text-stone-600 leading-relaxed text-sm">{req.description || "No description provided."}</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust transition-colors">Edit Requisition</button>
                    <button onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Close</button>
                </div>
            </div>
        </div>
    )
}

const CandidateDetailModal: React.FC<{ candidate: any, onClose: () => void, onSchedule: () => void }> = ({ candidate, onClose, onSchedule }) => {
    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-start gap-6 mb-8">
                     <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center text-3xl font-serif font-bold text-stone-400">
                         {candidate.name.charAt(0)}
                     </div>
                     <div>
                         <h2 className="text-3xl font-serif font-bold text-charcoal">{candidate.name}</h2>
                         <p className="text-stone-500 mt-1">{candidate.role} • {candidate.email}</p>
                         <div className="flex gap-2 mt-3">
                             <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{candidate.status}</span>
                             {candidate.score && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">AI Score: {candidate.score}%</span>}
                         </div>
                     </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                                <Brain size={18} className="text-rust" /> AI Assessment
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-stone-500">Communication</span>
                                        <span className="font-bold text-charcoal">{candidate.comm || 85}%</span>
                                    </div>
                                    <div className="w-full bg-stone-200 h-2 rounded-full"><div className="bg-rust h-full rounded-full" style={{ width: `${candidate.comm || 85}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-stone-500">Technical Skills</span>
                                        <span className="font-bold text-charcoal">{candidate.skill || 80}%</span>
                                    </div>
                                    <div className="w-full bg-stone-200 h-2 rounded-full"><div className="bg-blue-600 h-full rounded-full" style={{ width: `${candidate.skill || 80}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-stone-500">Growth Mindset</span>
                                        <span className="font-bold text-charcoal">{candidate.growth || 75}%</span>
                                    </div>
                                    <div className="w-full bg-stone-200 h-2 rounded-full"><div className="bg-green-600 h-full rounded-full" style={{ width: `${candidate.growth || 75}%` }}></div></div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-charcoal mb-2">Resume / Attachments</h3>
                            <div className="p-4 border border-stone-200 rounded-xl flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-rust" size={20} />
                                    <div>
                                        <div className="text-sm font-bold text-charcoal">Resume.pdf</div>
                                        <div className="text-xs text-stone-400">Added 2 days ago</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-stone-300" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                         <h3 className="font-bold text-charcoal mb-4">Screening Transcript (AI Summary)</h3>
                         <div className="space-y-4 text-sm text-stone-600">
                             <p>"Candidate demonstrated strong understanding of the core technical requirements. Articulated past experience clearly."</p>
                             <p>"Showed high curiosity about company culture and growth opportunities. Communication was clear and concise."</p>
                             <div className="p-3 bg-white rounded-lg border border-stone-200 mt-4">
                                 <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Key Strength</div>
                                 <div className="font-bold text-charcoal">Strategic Thinking & Articulation</div>
                             </div>
                         </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-stone-100">
                    <button onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Close</button>
                    {candidate.status === 'Passed' && (
                        <button onClick={onSchedule} className="px-6 py-3 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
                            <Calendar size={16} /> Schedule Interview
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const ScheduleInterviewModal: React.FC<{ candidate: any, onClose: () => void, onConfirm: () => void }> = ({ candidate, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <div className="mb-6">
                    <h2 className="text-2xl font-serif font-bold text-charcoal">Schedule Interview</h2>
                    <p className="text-stone-500 mt-1">Decision Maker Round with HR/CEO</p>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-charcoal border border-stone-200">
                        {candidate.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-charcoal">{candidate.name}</div>
                        <div className="text-xs text-stone-500">For: {candidate.role}</div>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Interviewer</label>
                        <select className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rust">
                            <option>CEO (Decision Maker)</option>
                            <option>HR Manager</option>
                            <option>Head of Recruitment</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Date</label>
                            <input type="date" className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rust" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Time</label>
                            <input type="time" className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rust" />
                        </div>
                    </div>
                    <div>
                         <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 cursor-pointer">
                             <input type="checkbox" defaultChecked className="accent-rust" />
                             <span className="text-sm font-medium">Send calendar invite to candidate</span>
                         </label>
                    </div>
                </div>

                <button onClick={onConfirm} className="w-full py-4 bg-rust text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust-dark transition-colors shadow-lg">
                    Confirm Schedule
                </button>
            </div>
        </div>
    )
}

const OnboardingDetailModal: React.FC<{ employee: any, onClose: () => void }> = ({ employee, onClose }) => {
    const CheckItem: React.FC<{ text: string; isCompleted: boolean }> = ({ text, isCompleted }) => (
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${isCompleted ? 'bg-green-50 border-green-100' : 'bg-stone-50 border-stone-100'}`}>
            {isCompleted ? <CheckCircle size={16} className="text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-stone-300" />}
            <span className={`text-sm font-medium ${isCompleted ? 'text-green-800' : 'text-stone-500'}`}>{text}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-6 mb-8">
                     <div className="w-20 h-20 bg-rust text-white rounded-full flex items-center justify-center text-3xl font-serif font-bold">
                         {employee.firstName.charAt(0)}
                     </div>
                     <div>
                         <h2 className="text-3xl font-serif font-bold text-charcoal">{employee.firstName} {employee.lastName}</h2>
                         <p className="text-stone-500 mt-1">{employee.role} • {employee.department}</p>
                     </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-6">
                         <div>
                             <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Pre-Start Tasks</h4>
                             <div className="space-y-2">
                                 {[
                                     { task: 'Send offer letter -> DocuSign', status: 'completed' },
                                     { task: 'Complete background check', status: 'completed' },
                                     { task: 'Order IT equipment', status: 'completed' },
                                     { task: 'Set up accounts (email, Slack, etc.)', status: 'completed' },
                                 ].map((t, i) => (
                                     <CheckItem key={i} text={t.task} isCompleted={true} />
                                 ))}
                             </div>
                         </div>
                         <div>
                             <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Day 1 Tasks</h4>
                             <div className="space-y-2">
                                 {[
                                     { task: 'Orientation meeting', status: 'pending' },
                                     { task: 'IT equipment setup', status: 'pending' },
                                     { task: 'Meet the team', status: 'pending' },
                                 ].map((t, i) => (
                                     <CheckItem key={i} text={t.task} isCompleted={false} />
                                 ))}
                             </div>
                         </div>
                     </div>

                     <div className="space-y-6">
                         <div>
                             <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Week 1 & Beyond</h4>
                             <div className="space-y-2">
                                 {[
                                     { task: 'Complete benefits enrollment', status: 'pending' },
                                     { task: 'Compliance training', status: 'pending' },
                                     { task: 'Goal setting with manager', status: 'pending' },
                                     { task: '30-day check-in survey', status: 'pending' },
                                 ].map((t, i) => (
                                     <CheckItem key={i} text={t.task} isCompleted={false} />
                                 ))}
                             </div>
                         </div>

                         <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                             <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-widest mb-2">
                                 <Zap size={14} /> Automation Triggers
                             </div>
                             <div className="space-y-2 text-xs text-blue-700">
                                 <div className="flex items-center gap-2"><Mail size={12}/> "Benefits enrollment opens tomorrow" (Scheduled: 2 days before start)</div>
                                 <div className="flex items-center gap-2"><Mail size={12}/> "Welcome & Login Credentials" (Scheduled: Day 1)</div>
                                 <div className="flex items-center gap-2"><Mail size={12}/> "How's your first week?" (Scheduled: Day 7)</div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    )
}
