'use client';


import React, { useState } from 'react';
import { X, TrendingUp, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  currentRole: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, employeeName, currentRole }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
      newRole: '',
      newDept: '',
      newManager: '',
      newSalary: '',
      effectiveDate: '',
      reason: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSuccess(true);
      setTimeout(() => {
          setIsSuccess(false);
          onClose();
      }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24} /></button>
            
            {isSuccess ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-charcoal">Transfer Complete!</h3>
                    <p className="text-stone-500 mt-2">Employee profile and permissions updated.</p>
                </div>
            ) : (
                <>
                    <div className="mb-8 border-b border-stone-100 pb-6">
                        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <TrendingUp size={14} /> Career Mobility
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-charcoal">Transfer / Promote</h2>
                        <p className="text-stone-500 mt-1">{employeeName} • <span className="font-bold">{currentRole}</span></p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">New Role Title</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.newRole} onChange={e => setFormData({...formData, newRole: e.target.value})} placeholder="e.g. Senior Recruiter" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">New Department</label>
                                <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.newDept} onChange={e => setFormData({...formData, newDept: e.target.value})}>
                                    <option value="">Select...</option>
                                    <option>Recruiting</option>
                                    <option>Bench Sales</option>
                                    <option>HR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">New Manager</label>
                                <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.newManager} onChange={e => setFormData({...formData, newManager: e.target.value})}>
                                    <option value="">Select...</option>
                                    <option>David Kim</option>
                                    <option>Elena Rodriguez</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">New Salary</label>
                                <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="$0.00" value={formData.newSalary} onChange={e => setFormData({...formData, newSalary: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Effective Date</label>
                                <input type="date" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Reason / Notes</label>
                            <textarea className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-rust" placeholder="Justification for transfer..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                        </div>

                        <div className="mt-8 pt-6 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                            <button type="submit" className="px-8 py-4 bg-charcoal text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2">
                                Submit Transfer <ArrowRight size={16} />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    </div>
  );
};
