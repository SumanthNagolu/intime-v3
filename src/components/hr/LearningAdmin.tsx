'use client';


import React, { useState } from 'react';
import { CheckCircle, Clock, BookOpen, X, Calendar } from 'lucide-react';
import { MOCK_MODULES } from '@/lib/constants';
import { useAppStore } from '../../lib/store';

const MetricDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; type: 'completion' | 'learners' | 'certs' }> = ({ isOpen, onClose, title, type }) => {
    if (!isOpen) return null;

    const data = type === 'completion' 
        ? [ { name: 'Module 1', val: '100%' }, { name: 'Module 2', val: '95%' }, { name: 'Module 3', val: '70%' } ]
        : type === 'learners'
        ? [ { name: 'Sarah Lao', val: 'Active' }, { name: 'James Wilson', val: 'Active' }, { name: 'David Kim', val: 'Idle' } ]
        : [ { name: 'Sarah Lao', val: 'Certified (PC 10)' }, { name: 'Mike Ross', val: 'Certified (BC 10)' } ];

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                <div className="mb-6">
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Deep Dive</div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal">{title}</h2>
                </div>
                <div className="space-y-3">
                    {data.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                            <span className="font-bold text-charcoal text-sm">{item.name}</span>
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{item.val}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <button onClick={onClose} className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest">Close</button>
                </div>
            </div>
        </div>
    );
};

export const LearningAdmin: React.FC = () => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [detailModal, setDetailModal] = useState<{ title: string, type: 'completion' | 'learners' | 'certs' } | null>(null);

  return (
    <div className="animate-fade-in pt-4">
      <MetricDetailModal 
        isOpen={!!detailModal} 
        onClose={() => setDetailModal(null)} 
        title={detailModal?.title || ''} 
        type={detailModal?.type || 'completion'} 
      />

      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Growth</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Learning & Development</h1>
        <p className="text-stone-500 mt-2">Monitor training compliance and assign coursework.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div 
            onClick={() => setDetailModal({ title: 'Course Completion Details', type: 'completion' })}
            className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg cursor-pointer group hover:border-green-200 transition-all"
          >
               <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-hover:text-green-600">Completion Rate</div>
               <div className="text-5xl font-serif font-bold text-charcoal mb-4">87%</div>
               <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 w-[87%]"></div>
               </div>
          </div>
          <div 
            onClick={() => setDetailModal({ title: 'Active Learner List', type: 'learners' })}
            className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg cursor-pointer group hover:border-blue-200 transition-all"
          >
               <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-hover:text-blue-600">Active Learners</div>
               <div className="text-5xl font-serif font-bold text-charcoal mb-4">12</div>
               <p className="text-xs text-stone-500">Employees enrolled in at least 1 course.</p>
          </div>
          <div 
            onClick={() => setDetailModal({ title: 'Recent Certifications', type: 'certs' })}
            className="bg-charcoal text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden bg-noise cursor-pointer hover:scale-[1.02] transition-transform"
          >
               <div className="relative z-10">
                   <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Certifications Issued</div>
                   <div className="text-5xl font-serif font-bold mb-4">5</div>
                   <p className="text-xs text-stone-400">This Quarter</p>
               </div>
          </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-lg p-8">
          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Course Catalog</h3>
          <div className="space-y-4">
              {MOCK_MODULES.map(module => (
                  <div key={module.id} className="flex items-center justify-between p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-rust/30 transition-all group">
                       <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-charcoal shadow-sm font-serif font-bold text-xl border border-stone-100">
                               {module.id}
                           </div>
                           <div>
                               <h4 className="font-bold text-charcoal text-lg group-hover:text-rust transition-colors">{module.title}</h4>
                               <p className="text-sm text-stone-500">{module.description?.substring(0, 100)}...</p>
                               <div className="flex items-center gap-4 mt-2">
                                   <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                       <Clock size={10} /> {module.week}
                                   </span>
                                   <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                       <BookOpen size={10} /> {module.lessons.length} Lessons
                                   </span>
                               </div>
                           </div>
                       </div>
                       <div className="text-right">
                           <button 
                             onClick={() => { setSelectedModuleId(module.id); setAssignModalOpen(true); }}
                             className="px-6 py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white hover:border-rust transition-all shadow-sm"
                           >
                               Assign to Employee
                           </button>
                       </div>
                  </div>
              ))}
          </div>
      </div>

      <AssignCourseModal 
        isOpen={assignModalOpen} 
        onClose={() => setAssignModalOpen(false)} 
        moduleId={selectedModuleId}
      />
    </div>
  );
};

const AssignCourseModal: React.FC<{ isOpen: boolean; onClose: () => void; moduleId: number | null }> = ({ isOpen, onClose, moduleId }) => {
    const { employees } = useAppStore();
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [step, setStep] = useState<'select' | 'success'>('select');

    if (!isOpen || !moduleId) return null;

    const module = MOCK_MODULES.find(m => m.id === moduleId);

    const handleToggle = (id: string) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(prev => prev.filter(e => e !== id));
        } else {
            setSelectedEmployees(prev => [...prev, id]);
        }
    };

    const handleAssign = () => {
        // In a real app, this would call an API
        setTimeout(() => {
            setStep('success');
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                
                {step === 'select' ? (
                    <>
                        <div className="mb-8 border-b border-stone-100 pb-6">
                            <div className="text-rust font-bold text-xs uppercase tracking-widest mb-1">Assign Course</div>
                            <h2 className="text-3xl font-serif font-bold text-charcoal">{module?.title}</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Select Employees</label>
                                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl p-2 space-y-1 bg-stone-50">
                                    {employees.map(emp => (
                                        <div 
                                            key={emp.id} 
                                            onClick={() => handleToggle(emp.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedEmployees.includes(emp.id) ? 'bg-white shadow-sm border border-rust/30' : 'hover:bg-white'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedEmployees.includes(emp.id) ? 'bg-rust border-rust text-white' : 'border-stone-300 bg-white'}`}>
                                                {selectedEmployees.includes(emp.id) && <CheckCircle size={12} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-charcoal">{emp.firstName} {emp.lastName}</div>
                                                <div className="text-xs text-stone-500">{emp.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Target Start Date</label>
                                    <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                        <Calendar size={16} className="text-stone-400" />
                                        <input 
                                            type="date" 
                                            className="bg-transparent outline-none text-sm font-bold text-charcoal w-full" 
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Target End Date</label>
                                    <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                        <Calendar size={16} className="text-stone-400" />
                                        <input 
                                            type="date" 
                                            className="bg-transparent outline-none text-sm font-bold text-charcoal w-full" 
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={onClose} className="flex-1 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                            <button 
                                onClick={handleAssign}
                                disabled={selectedEmployees.length === 0 || !startDate || !endDate}
                                className="flex-1 py-4 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign ({selectedEmployees.length})
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Assignment Complete</h3>
                        <p className="text-stone-500 mb-8">
                            {selectedEmployees.length} employees have been enrolled in <strong>{module?.title}</strong>. 
                            Deadlines set from {startDate} to {endDate}.
                        </p>
                        <button onClick={onClose} className="px-8 py-3 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
