'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Clock, AlertTriangle, CheckCircle, Briefcase, MapPin, DollarSign, Calendar, FileText, X, ChevronRight, Upload, Award, Filter, ArrowUpRight } from 'lucide-react';
import { Job } from '../../types';
import Link from 'next/link';

// --- TYPES & MOCK DATA ---

type ActivityStatus = 'Applied' | 'Submitted' | 'Screening' | 'Tech Interview' | 'Client Interview' | 'Offer' | 'Rejected';

interface JobActivity {
  id: string;
  role: string;
  company: string;
  location: string;
  status: ActivityStatus;
  date: string;
  manager: string; 
  notes?: string;
}

const MOCK_ACTIVITIES: JobActivity[] = [
  { id: '1', role: 'Senior Java Dev', company: 'FinTech Corp', location: 'Remote', status: 'Screening', date: 'Oct 14', manager: 'Sarah L.' },
  { id: '2', role: 'Guidewire Lead', company: 'InsurCo', location: 'Hartford, CT', status: 'Tech Interview', date: 'Oct 12', manager: 'David K.', notes: 'Focus on Gosu generics' },
  { id: '3', role: 'Integration Architect', company: 'Global Mutual', location: 'Chicago, IL', status: 'Applied', date: 'Oct 10', manager: 'Pending' },
  { id: '4', role: 'PolicyCenter Config', company: 'RapidSure', location: 'Remote', status: 'Rejected', date: 'Oct 08', manager: '-' },
  { id: '5', role: 'Billing Specialist', company: 'ABC Insurance', location: 'New York, NY', status: 'Submitted', date: 'Oct 05', manager: 'Pending Client Review' },
  { id: '6', role: 'Gosu Developer', company: 'TechFlow', location: 'Remote', status: 'Client Interview', date: 'Oct 01', manager: 'Mike R.' },
];

// --- MODALS ---

interface ApplicationModalProps {
  job: Job | null;
  onClose: () => void;
  onSubmit: () => void;
}

const JobApplicationModal: React.FC<ApplicationModalProps> = ({ job, onClose, onSubmit }) => {
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-left">
        <div className="p-8 border-b border-stone-100 flex justify-between items-start bg-stone-50">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-bold uppercase tracking-widest text-stone-500">{job.client}</span>
             </div>
             <h2 className="text-2xl font-serif font-bold text-charcoal">{job.title}</h2>
             <div className="flex gap-4 mt-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                <span className="flex items-center gap-1"><DollarSign size={12} /> {job.rate}</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {step === 'review' ? (
            <div className="space-y-8">
               <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                     <CheckCircle size={16} className="text-purple-600" />
                     <span className="text-xs font-bold uppercase tracking-widest text-purple-800">Profile Auto-Populated</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-serif font-bold text-charcoal shadow-sm">VP</div>
                     <div>
                        <div className="font-bold text-charcoal">Vikram Patel</div>
                        <div className="text-xs text-stone-500">vikram@example.com • +1 (555) 012-3456</div>
                     </div>
                     <div className="ml-auto">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-sm cursor-pointer hover:border-purple-500 transition-colors">
                           <FileText size={14} className="text-purple-600" />
                           <span className="text-xs font-bold text-stone-600">Resume_v4.pdf</span>
                           <Upload size={12} className="text-stone-300 ml-2" />
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest border-b border-stone-100 pb-2 mb-4">Role Description</h3>
                  <div className="prose prose-stone text-sm leading-relaxed text-stone-600">
                    <p>We are seeking a highly skilled {job.title} to join our team. The ideal candidate will have extensive experience with Guidewire InsuranceSuite, specifically focusing on configuration and integration.</p>
                    <p><strong>Key Responsibilities:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Configure PolicyCenter according to business requirements.</li>
                      <li>Develop Gosu classes and enhancements.</li>
                      <li>Participate in sprint planning and daily stand-ups.</li>
                    </ul>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle size={40} />
               </div>
               <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Application Submitted!</h3>
               <p className="text-stone-500 max-w-xs mx-auto mb-8">Your profile has been sent to the hiring manager at {job.client}. You can track this in your Activity Log.</p>
               <button onClick={onSubmit} className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
                 Close
               </button>
            </div>
          )}
        </div>

        {step === 'review' && (
          <div className="p-6 border-t border-stone-100 bg-white flex justify-between items-center sticky bottom-0">
             <div className="text-xs text-stone-400">
                <span className="font-bold text-charcoal">Availability:</span> Immediate
             </div>
             <div className="flex gap-4">
                <button onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">
                   Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  {!isSubmitting && <ChevronRight size={14} />}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

type HistoryTab = 'All' | 'Applications' | 'Submissions' | 'Interviews';

const ActivityHistoryModal: React.FC<{ isOpen: boolean; onClose: () => void; initialTab?: HistoryTab }> = ({ isOpen, onClose, initialTab = 'All' }) => {
    const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);
    
    React.useEffect(() => {
        if(isOpen) setActiveTab(initialTab);
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const getFilteredData = () => {
        switch(activeTab) {
            case 'Applications': return MOCK_ACTIVITIES.filter(a => a.status === 'Applied');
            case 'Submissions': return MOCK_ACTIVITIES.filter(a => a.status === 'Submitted');
            case 'Interviews': return MOCK_ACTIVITIES.filter(a => ['Screening', 'Tech Interview', 'Client Interview', 'Offer'].includes(a.status));
            default: return MOCK_ACTIVITIES;
        }
    };

    const filteredData = getFilteredData();

    const counts = {
        All: MOCK_ACTIVITIES.length,
        Applications: MOCK_ACTIVITIES.filter(a => a.status === 'Applied').length,
        Submissions: MOCK_ACTIVITIES.filter(a => a.status === 'Submitted').length,
        Interviews: MOCK_ACTIVITIES.filter(a => ['Screening', 'Tech Interview', 'Client Interview', 'Offer'].includes(a.status)).length
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                
                <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div>
                        <div className="text-purple-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">My Activity</div>
                        <h2 className="text-3xl font-serif font-bold text-charcoal">History Log</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 pt-4 border-b border-stone-100 flex gap-6 overflow-x-auto">
                    {(['All', 'Applications', 'Submissions', 'Interviews'] as HistoryTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-stone-400 hover:text-charcoal'
                            }`}
                        >
                            {tab}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                                {counts[tab]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
                    {filteredData.length > 0 ? (
                        <div className="space-y-4">
                            {filteredData.map(activity => (
                                <div key={activity.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">{activity.company}</div>
                                            <h3 className="font-bold text-charcoal text-lg group-hover:text-purple-600 transition-colors">{activity.role}</h3>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                            activity.status === 'Offer' ? 'bg-green-100 text-green-700' :
                                            activity.status === 'Rejected' ? 'bg-red-50 text-red-500' :
                                            activity.status === 'Submitted' ? 'bg-blue-50 text-blue-600' :
                                            activity.status.includes('Interview') ? 'bg-purple-50 text-purple-600' :
                                            'bg-stone-100 text-stone-500'
                                        }`}>
                                            {activity.status}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4 text-xs text-stone-500 mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {activity.date}</span>
                                        <span className="flex items-center gap-1"><MapPin size={12}/> {activity.location}</span>
                                        <span className="flex items-center gap-1"><Award size={12}/> Manager: {activity.manager}</span>
                                    </div>

                                    {activity.notes && (
                                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700 italic">
                                            " {activity.notes} "
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
                                        <button className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest flex items-center gap-1">
                                            View Details <ArrowUpRight size={12}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-stone-400">
                            <Filter size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No records found in this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD ---

export const TalentDashboard: React.FC = () => {
  const { jobs } = useAppStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyInitialTab, setHistoryInitialTab] = useState<HistoryTab>('All');

  const openHistory = (tab: HistoryTab) => {
      setHistoryInitialTab(tab);
      setHistoryModalOpen(true);
  };
  
  const metrics = {
     daysOnBench: 12,
     jobsApplied: MOCK_ACTIVITIES.filter(a => a.status === 'Applied').length,
     interviews: MOCK_ACTIVITIES.filter(a => ['Screening', 'Tech Interview', 'Client Interview', 'Offer'].includes(a.status)).length
  };

  const recentActivity = MOCK_ACTIVITIES.slice(0, 5);

  return (
    <div className="animate-fade-in pt-4 relative">
      
      {selectedJob && (
        <JobApplicationModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          onSubmit={() => setSelectedJob(null)}
        />
      )}

      <ActivityHistoryModal 
         isOpen={historyModalOpen} 
         onClose={() => setHistoryModalOpen(false)} 
         initialTab={historyInitialTab} 
      />

      <div className="mb-10 flex justify-between items-end border-b border-stone-200 pb-6">
        <div>
            <div className="text-purple-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">Talent Portal</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Consultant Workspace</h1>
        </div>
        <div className="flex gap-4 items-end">
             <div className="text-right">
                 <div className="flex items-center justify-end gap-2 text-green-600 mb-1">
                     <span className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                     </span>
                     <span className="text-xs font-bold uppercase tracking-widest">Active & Available</span>
                 </div>
                 <div className="text-xs text-stone-400">Profile Visibility: Public</div>
             </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                       <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Days on Bench</div>
                       <Clock size={16} className="text-red-400" />
                   </div>
                   <div className="text-5xl font-serif font-bold text-charcoal mb-2">{metrics.daysOnBench}</div>
                   <div className="flex items-center gap-2">
                       <div className="h-1.5 flex-1 bg-stone-100 rounded-full overflow-hidden">
                           <div className="h-full bg-red-400 w-1/3"></div>
                       </div>
                       <span className="text-[10px] font-bold text-red-400 uppercase">Priority High</span>
                   </div>
               </div>
          </div>

          <div 
             onClick={() => openHistory('Applications')}
             className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg relative overflow-hidden group cursor-pointer hover:border-purple-300 transition-all"
          >
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                       <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-blue-600 transition-colors">Jobs Applied</div>
                       <FileText size={16} className="text-blue-400" />
                   </div>
                   <div className="text-5xl font-serif font-bold text-charcoal mb-2">{metrics.jobsApplied}</div>
                   <div className="flex justify-between items-center text-xs text-stone-500">
                       <span>+3 new matches today</span>
                       <span className="font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">View List &rarr;</span>
                   </div>
               </div>
          </div>

          <div 
             onClick={() => openHistory('Interviews')}
             className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg relative overflow-hidden group cursor-pointer hover:border-purple-300 transition-all"
          >
               <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                       <div className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-green-600 transition-colors">Interviews</div>
                       <Award size={16} className="text-green-500" />
                   </div>
                   <div className="text-5xl font-serif font-bold text-charcoal mb-2">{metrics.interviews}</div>
                   <div className="flex justify-between items-center text-xs text-stone-500">
                       <span>2 Clients requesting 2nd rounds</span>
                       <span className="font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">View List &rarr;</span>
                   </div>
               </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Job Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif font-bold text-charcoal">Recommended Jobs</h3>
                  <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">Sort by:</span>
                      <select className="bg-transparent text-xs font-bold text-charcoal uppercase tracking-widest border-none focus:ring-0 cursor-pointer">
                          <option>Best Match</option>
                          <option>Newest</option>
                          <option>Highest Rate</option>
                      </select>
                  </div>
              </div>

              {jobs.map(job => (
                  <div key={job.id} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:border-purple-200 hover:shadow-xl transition-all group relative">
                      <div className="absolute top-8 right-8 text-right">
                          <div className="text-2xl font-serif font-bold text-charcoal">94%</div>
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Skill Match</div>
                      </div>

                      <div className="pr-20">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">{job.client}</div>
                             <span className="text-stone-300">•</span>
                             <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide bg-stone-100 px-2 py-0.5 rounded">Vendor Tier 1</div>
                          </div>
                          <h4 className="text-2xl font-bold text-charcoal font-serif mb-4">{job.title}</h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-6 text-sm text-stone-500 mb-8">
                          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                              <MapPin size={14} /> {job.location}
                          </div>
                          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                              <DollarSign size={14} /> {job.rate}
                          </div>
                          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                              <Clock size={14} /> Posted 2 days ago
                          </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-100 pt-6">
                          <div className="flex gap-2">
                              {['PolicyCenter', 'Gosu', 'Integration'].map(skill => (
                                  <span key={skill} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border border-stone-200 px-2 py-1 rounded">
                                      {skill}
                                  </span>
                              ))}
                          </div>
                          <button 
                            onClick={() => setSelectedJob(job)}
                            className="px-8 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg flex items-center gap-2"
                          >
                              Easy Apply <ChevronRight size={14} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>

          {/* Right Column: Profile & Readiness (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
              
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                      <Calendar size={18} className="text-purple-600" /> Deployment Readiness
                  </h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-stone-50">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Availability</span>
                          <span className="text-sm font-bold text-green-600">Immediate</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-stone-50">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Visa Status</span>
                          <span className="text-sm font-bold text-charcoal">H-1B (Valid 2026)</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-stone-50">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Relocation</span>
                          <span className="text-sm font-bold text-charcoal">Open (US Wide)</span>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-lg font-bold text-charcoal">Activity Feed</h3>
                      <button 
                        onClick={() => openHistory('All')}
                        className="text-[10px] font-bold text-stone-400 hover:text-purple-600 uppercase tracking-widest transition-colors"
                      >
                          View Full History
                      </button>
                  </div>
                  
                  <div className="space-y-1">
                      {recentActivity.map((app, i) => (
                          <div key={i} className="py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors -mx-4 px-4 rounded-lg cursor-pointer group">
                              <div className="flex justify-between items-start mb-1">
                                  <div className="font-bold text-charcoal text-sm group-hover:text-purple-600 transition-colors">{app.role}</div>
                                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      app.status.includes('Interview') ? 'bg-purple-50 text-purple-700' :
                                      app.status === 'Rejected' ? 'bg-red-50 text-red-500' :
                                      'bg-blue-50 text-blue-600'
                                  }`}>
                                      {app.status}
                                  </div>
                              </div>
                              <div className="flex justify-between items-center text-xs text-stone-500">
                                  <span>{app.company}</span>
                                  <span>{app.date}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden bg-noise">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="font-serif text-xl font-bold mb-6 relative z-10">Profile Strength</h3>
                  
                  <div className="space-y-6 relative z-10">
                      <div>
                          <div className="flex justify-between text-xs uppercase tracking-widest text-stone-400 mb-2">
                              Completion
                              <span className="text-white">85%</span>
                          </div>
                          <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-600 w-[85%] rounded-full"></div>
                          </div>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                              <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                              <div>
                                  <p className="font-bold text-sm text-white">Resume Update Recommended</p>
                                  <p className="text-xs text-stone-400 mt-1">Your last update was 45 days ago. Fresh resumes get 3x more views.</p>
                              </div>
                          </div>
                      </div>
                      
                      <button className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all flex items-center justify-center gap-2">
                          <Upload size={14} /> Upload New PDF
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
