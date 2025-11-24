'use client';


import React, { useState } from 'react';
import { X, UserMinus, Calendar, CheckCircle, FileText, Lock, Mail, ArrowRight, MessageSquare } from 'lucide-react';

interface OffboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
}

export const OffboardingModal: React.FC<OffboardingModalProps> = ({ isOpen, onClose, employeeName, employeeId }) => {
  const [step, setStep] = useState<'init' | 'checklist' | 'exit_interview' | 'finalize'>('init');
  const [tasks, setTasks] = useState([
      { id: 1, task: 'Schedule exit interview', owner: 'HR', status: 'pending' },
      { id: 2, task: 'Revoke system access (Email, Slack, CRM)', owner: 'IT/Admin', status: 'pending' },
      { id: 3, task: 'Collect IT equipment (Laptop, Badge)', owner: 'IT', status: 'pending' },
      { id: 4, task: 'Process final paycheck (Include PTO)', owner: 'HR/Payroll', status: 'pending' },
      { id: 5, task: 'COBRA benefits notification', owner: 'HR', status: 'pending' },
      { id: 6, task: 'Knowledge transfer to team', owner: 'Manager', status: 'pending' },
      { id: 7, task: 'Remove from comms channels', owner: 'IT', status: 'pending' },
  ]);

  const [exitForm, setExitForm] = useState({
      reason: '',
      likes: '',
      improvements: '',
      recommend: 'Yes',
      feedback: ''
  });

  if (!isOpen) return null;

  const toggleTask = (id: number) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const allTasksComplete = tasks.every(t => t.status === 'completed');

  const handleStart = () => {
      setStep('checklist');
  };

  const handleFinalize = () => {
      // In real app, API call here
      alert(`Offboarding finalized for ${employeeName}. Status set to Inactive.`);
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24} /></button>
            
            <div className="mb-8 border-b border-stone-100 pb-6">
                <div className="text-red-600 font-bold text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <UserMinus size={14} /> Offboarding Protocol
                </div>
                <h2 className="text-3xl font-serif font-bold text-charcoal">{employeeName}</h2>
                <p className="text-stone-500 text-sm mt-1">ID: {employeeId}</p>
            </div>

            {/* Stepper */}
            <div className="flex gap-2 mb-6">
                {['init', 'checklist', 'exit_interview'].map(s => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                        ['init', 'checklist', 'exit_interview'].indexOf(step) >= ['init', 'checklist', 'exit_interview'].indexOf(s) 
                        ? 'bg-charcoal' : 'bg-stone-100'
                    }`}></div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                
                {/* STEP 1: INIT */}
                {step === 'init' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Last Working Day</label>
                                <input type="date" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-500 text-charcoal font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Reason for Leaving</label>
                                <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-500">
                                    <option>Resignation (Voluntary)</option>
                                    <option>Termination (Involuntary)</option>
                                    <option>Retirement</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Notes</label>
                            <textarea className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-red-500" placeholder="Additional context..." />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                            <input type="checkbox" defaultChecked className="accent-red-600 w-4 h-4" />
                            <label className="text-sm font-bold text-stone-600">Schedule Exit Interview automatically</label>
                        </div>
                    </div>
                )}

                {/* STEP 2: CHECKLIST */}
                {step === 'checklist' && (
                    <div className="space-y-4 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest">Termination Checklist</h3>
                            <span className="text-xs text-stone-400">{tasks.filter(t => t.status === 'completed').length}/{tasks.length} Complete</span>
                        </div>
                        
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300'}`}>
                                        {task.status === 'completed' && <CheckCircle size={14} />}
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${task.status === 'completed' ? 'text-stone-400 line-through' : 'text-charcoal'}`}>{task.task}</div>
                                        <div className="text-xs text-stone-400 uppercase tracking-widest">Owner: {task.owner}</div>
                                    </div>
                                </div>
                                {task.status === 'pending' && (
                                    <button onClick={() => toggleTask(task.id)} className="px-4 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors">
                                        Complete
                                    </button>
                                )}
                            </div>
                        ))}

                        <div className="pt-4 text-center">
                            <button onClick={() => setStep('exit_interview')} className="text-xs font-bold text-charcoal hover:text-rust uppercase tracking-widest flex items-center gap-1 justify-center">
                                Conduct Exit Interview <MessageSquare size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: EXIT INTERVIEW */}
                {step === 'exit_interview' && (
                    <div className="space-y-6 animate-slide-up">
                        <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4">Exit Interview Form</h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Why are you leaving?</label>
                            <textarea className="w-full h-20 p-3 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-charcoal text-sm" 
                                value={exitForm.reason} onChange={e => setExitForm({...exitForm, reason: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">What did you like about working here?</label>
                            <textarea className="w-full h-20 p-3 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-charcoal text-sm" 
                                value={exitForm.likes} onChange={e => setExitForm({...exitForm, likes: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">What could we improve?</label>
                            <textarea className="w-full h-20 p-3 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-charcoal text-sm" 
                                value={exitForm.improvements} onChange={e => setExitForm({...exitForm, improvements: e.target.value})} />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Would you recommend us?</label>
                            <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm" value={exitForm.recommend} onChange={e => setExitForm({...exitForm, recommend: e.target.value})}>
                                <option>Yes</option>
                                <option>No</option>
                                <option>Maybe</option>
                            </select>
                        </div>

                        <button onClick={() => setStep('checklist')} className="w-full py-3 bg-stone-100 text-stone-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-stone-200">
                            Save & Return to Checklist
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end gap-4">
                {step === 'init' ? (
                    <button onClick={handleStart} className="px-10 py-4 bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-700 shadow-lg flex items-center gap-2">
                        Start Offboarding <ArrowRight size={16} />
                    </button>
                ) : step === 'checklist' ? (
                    <>
                        <button className="px-6 py-4 border border-stone-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-50 text-stone-500">
                            Save Progress
                        </button>
                        <button 
                            onClick={handleFinalize} 
                            disabled={!allTasksComplete} 
                            className="px-8 py-4 bg-charcoal text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-rust shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                        >
                            Finalize Offboarding <Lock size={16} />
                        </button>
                    </>
                ) : (
                    <div></div> // Spacer for other steps if needed
                )}
            </div>
        </div>
    </div>
  );
};
