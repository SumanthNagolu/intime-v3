'use client';


import React, { useState } from 'react';
import { Target, Star, Users, ArrowUpRight, MessageSquare, CheckCircle, Plus, Calendar, X, Edit2, MoreHorizontal, AlertCircle, FileText } from 'lucide-react';

// --- MODALS ---

const LaunchCycleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'setup' | 'confirm'>('setup');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                {step === 'setup' ? (
                    <>
                        <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Launch Review Cycle</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Cycle Name</label>
                                <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-bold" placeholder="e.g. Q1 2026 Performance Review" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Start Date</label>
                                    <input type="date" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">End Date</label>
                                    <input type="date" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Participants</label>
                                <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl">
                                    <option>All Employees</option>
                                    <option>Department Only</option>
                                    <option>Managers Only</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                            <button onClick={() => setStep('confirm')} className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust shadow-lg">Next Step</button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal">Cycle Launched</h3>
                        <p className="text-stone-500 text-sm mt-2 mb-6">Notifications have been sent to 47 employees.</p>
                        <button onClick={onClose} className="px-8 py-3 bg-stone-100 text-stone-600 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-stone-200">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CycleDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; cycle: any }> = ({ isOpen, onClose, cycle }) => {
    if (!isOpen || !cycle) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                <div className="mb-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 ${cycle.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{cycle.status}</span>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">{cycle.name}</h2>
                    <p className="text-stone-500 text-sm mt-1">{cycle.dates}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                        <div className="text-2xl font-bold text-charcoal">{cycle.completion}%</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest">Completion</div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                        <div className="text-2xl font-bold text-charcoal">32</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest">Submitted</div>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                        <div className="text-2xl font-bold text-charcoal">15</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest">Pending</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4">Department Breakdown</h3>
                    <div className="space-y-3">
                        {['Engineering', 'Recruiting', 'Sales', 'HR', 'Product'].map((dept, i) => (
                            <div key={dept} className="flex items-center justify-between p-3 border-b border-stone-100">
                                <span className="text-sm font-bold text-charcoal">{dept}</span>
                                <div className="flex items-center gap-4 w-1/2">
                                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rust" style={{ width: `${85 - (i * 10)}%` }}></div>
                                    </div>
                                    <span className="text-xs text-stone-500 w-8 text-right">{85 - (i * 10)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GoalDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; goal: any }> = ({ isOpen, onClose, goal }) => {
    if (!isOpen || !goal) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                <div className="mb-6">
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Goal Details</div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal">{goal.title}</h2>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-stone-500">Status</span>
                            <span className={`font-bold ${goal.status === 'On Track' ? 'text-green-600' : 'text-yellow-600'}`}>{goal.status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-stone-500">Progress</span>
                            <span className="font-bold text-charcoal">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 rounded-full overflow-hidden mt-2">
                            <div className={`h-full ${goal.status === 'On Track' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${goal.progress}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Key Results</h4>
                        <ul className="space-y-2 text-sm text-stone-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                <span>Hire 5 Senior Engineers</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-stone-300 shrink-0 mt-0.5" />
                                <span>Launch new onboarding portal</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeedbackTemplateModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[2rem] p-8 shadow-2xl relative max-h-[80vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24} /></button>
                
                <div className="mb-8">
                    <h2 className="text-2xl font-serif font-bold text-charcoal">Feedback Templates</h2>
                    <p className="text-stone-500">Standardize review questions across departments.</p>
                </div>

                <div className="space-y-4">
                    {['360 Peer Review', 'Manager Downward Review', 'Self Assessment', 'Project Retrospective'].map((template, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 group hover:border-rust/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-400 border border-stone-200">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal">{template}</div>
                                    <div className="text-xs text-stone-500">5 Questions • Last updated 2 weeks ago</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold hover:text-charcoal">Edit</button>
                                <button className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold hover:bg-rust">Use</button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button className="w-full mt-6 py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Create New Template
                </button>
            </div>
        </div>
    );
};

export const PerformanceReviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Cycles' | 'Goals' | 'Feedback'>('Cycles');

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Growth</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Performance Management</h1>
        <p className="text-stone-500 mt-2">Manage review cycles, goal setting, and calibration.</p>
      </div>

       {/* Tabs */}
       <div className="flex gap-6 border-b border-stone-100 mb-8">
          {['Cycles', 'Goals', 'Feedback'].map(tab => (
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

      {activeTab === 'Cycles' && <ReviewCyclesView />}
      {activeTab === 'Goals' && <CompanyGoalsView />}
      {activeTab === 'Feedback' && <FeedbackAdminView />}
    </div>
  );
};

const ReviewCyclesView: React.FC = () => {
    const [isLaunchOpen, setIsLaunchOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<any>(null);

    const cycles = [
        { id: 1, name: 'Q4 2025 Performance Review', status: 'Active', dates: 'Dec 1 - Dec 31, 2025', completion: 68 },
        { id: 2, name: 'Q3 2025 Performance Review', status: 'Closed', dates: 'Sep 1 - Sep 30, 2025', completion: 100 },
        { id: 3, name: 'Annual 2024 Review', status: 'Archived', dates: 'Jan 1 - Jan 31, 2025', completion: 98 },
    ];

    return (
        <div className="space-y-8">
            <LaunchCycleModal isOpen={isLaunchOpen} onClose={() => setIsLaunchOpen(false)} />
            <CycleDetailModal isOpen={!!selectedCycle} onClose={() => setSelectedCycle(null)} cycle={selectedCycle} />

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-charcoal">Review Cycles</h3>
                <button 
                    onClick={() => setIsLaunchOpen(true)}
                    className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2"
                >
                    <Plus size={14} /> Launch New Cycle
                </button>
            </div>

            <div className="space-y-6">
                {cycles.map((cycle) => (
                    <div 
                        key={cycle.id} 
                        onClick={() => setSelectedCycle(cycle)}
                        className={`p-8 rounded-[2rem] border border-stone-200 shadow-lg relative overflow-hidden cursor-pointer group hover:border-rust/30 transition-all ${cycle.status === 'Active' ? 'bg-white' : 'bg-stone-50 opacity-90'}`}
                    >
                        {cycle.status === 'Active' && <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>}
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-charcoal text-lg group-hover:text-rust transition-colors">{cycle.name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        cycle.status === 'Active' ? 'bg-green-50 text-green-700' : 
                                        cycle.status === 'Closed' ? 'bg-blue-50 text-blue-700' :
                                        'bg-stone-200 text-stone-500'
                                    }`}>{cycle.status}</span>
                                </div>
                                <p className="text-stone-500 text-sm">{cycle.dates}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-charcoal">{cycle.completion}%</div>
                                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Completion</div>
                            </div>
                        </div>
                        
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-6">
                            <div className={`h-full rounded-full ${cycle.status === 'Active' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${cycle.completion}%` }}></div>
                        </div>

                        {cycle.status === 'Active' && (
                            <div className="grid grid-cols-3 gap-4 border-t border-stone-100 pt-6">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-charcoal">32/47</div>
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Reviews Done</div>
                                </div>
                                <div className="text-center border-l border-stone-100">
                                    <div className="text-lg font-bold text-charcoal">15</div>
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pending Manager</div>
                                </div>
                                <div className="text-center border-l border-stone-100">
                                    <div className="text-lg font-bold text-charcoal">Dec 20</div>
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Calibration Deadline</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CompanyGoalsView: React.FC = () => {
    const [selectedGoal, setSelectedGoal] = useState<any>(null);

    const goals = [
        { id: 1, title: 'Expand Engineering Team', status: 'On Track', progress: 85, owner: 'CTO' },
        { id: 2, title: 'Launch Academy Cohort 3', status: 'At Risk', progress: 40, owner: 'Head of Academy' },
        { id: 3, title: 'Increase Revenue by 20%', status: 'On Track', progress: 92, owner: 'CEO' },
        { id: 4, title: 'Reduce Churn to <5%', status: 'Off Track', progress: 20, owner: 'Head of People' },
    ];

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
            <GoalDetailModal isOpen={!!selectedGoal} onClose={() => setSelectedGoal(null)} goal={selectedGoal} />
            
            <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Company-Wide OKRs</h3>
            <div className="space-y-6">
                {goals.map((goal) => (
                    <div 
                        key={goal.id} 
                        onClick={() => setSelectedGoal(goal)}
                        className="p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-rust/50 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${goal.status === 'On Track' ? 'bg-green-100 text-green-700' : goal.status === 'At Risk' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    <Target size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-charcoal">{goal.title}</h4>
                                    <p className="text-xs text-stone-500">Owner: {goal.owner}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold ${goal.status === 'On Track' ? 'text-green-600' : goal.status === 'At Risk' ? 'text-yellow-600' : 'text-red-600'}`}>
                                {goal.status}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-stone-400">
                                <span>Progress</span>
                                <span>{goal.progress}%</span>
                            </div>
                            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div className={`h-full ${goal.status === 'On Track' ? 'bg-green-500' : goal.status === 'At Risk' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${goal.progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FeedbackAdminView: React.FC = () => {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const feedbackRequests = [
        { id: 1, from: 'Sarah Lao', to: 'David Kim', type: 'Peer Review', status: 'Pending', date: '2 days ago' },
        { id: 2, from: 'James Wilson', to: 'Elena Rodriguez', type: 'Upward Review', status: 'Completed', date: '1 week ago' },
        { id: 3, from: 'Marcus Johnson', to: 'David Kim', type: 'Peer Review', status: 'Pending', date: 'Yesterday' },
        { id: 4, from: 'Alice Wong', to: 'Evan Wright', type: 'Project Feedback', status: 'Completed', date: '3 days ago' },
        { id: 5, from: 'Bob Smith', to: 'James Wilson', type: 'Peer Review', status: 'Pending', date: 'Today' },
    ];

    return (
        <div className="space-y-8">
            <FeedbackTemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-charcoal">Feedback Management</h3>
                <button 
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-50 hover:border-charcoal transition-all"
                >
                    Manage Templates
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-lg overflow-hidden">
                <div className="p-8 border-b border-stone-100 flex gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center flex-1">
                        <div className="text-2xl font-bold text-blue-700">12</div>
                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Pending Requests</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center flex-1">
                        <div className="text-2xl font-bold text-green-700">45</div>
                        <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Completed (Q4)</div>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Reviewer</th>
                            <th className="p-6">Recipient</th>
                            <th className="p-6">Type</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Sent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {feedbackRequests.map(req => (
                            <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-6 font-bold text-charcoal">{req.from}</td>
                                <td className="p-6 text-stone-600">{req.to}</td>
                                <td className="p-6 text-stone-500">{req.type}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                        req.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                    }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="p-6 text-right text-stone-400 font-mono text-xs">{req.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="p-4 text-center border-t border-stone-100">
                    <button className="text-xs font-bold text-rust uppercase tracking-widest hover:underline">View All Requests</button>
                </div>
            </div>
        </div>
    );
};
