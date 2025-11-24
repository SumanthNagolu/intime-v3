'use client';


import React, { useState } from 'react';
import { X, User, CheckCircle, ArrowRight, Users } from 'lucide-react';

interface HandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'candidate' | 'account';
  entityName: string;
  onSubmit: (toRole: string, note: string) => void;
}

export const HandoffModal: React.FC<HandoffModalProps> = ({ isOpen, onClose, type, entityName, onSubmit }) => {
  const [selectedRole, setSelectedRole] = useState<'recruiter' | 'bench'>('recruiter');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
          <X size={24} />
        </button>

        <div className="mb-8">
            <div className="text-purple-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">Handoff Protocol</div>
            <h2 className="text-3xl font-serif font-bold text-charcoal">Transfer Ownership</h2>
            <p className="text-stone-500 mt-2">Handing off <strong className="text-charcoal">{entityName}</strong> to another pod.</p>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Select Recipient</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setSelectedRole('recruiter')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedRole === 'recruiter' ? 'border-rust bg-rust/5' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${selectedRole === 'recruiter' ? 'bg-rust text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <Users size={18} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Recruiting Pod</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Active Pipeline</div>
                    </button>

                    <button 
                        onClick={() => setSelectedRole('bench')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedRole === 'bench' ? 'border-blue-600 bg-blue-50' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${selectedRole === 'bench' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <User size={18} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Bench Sales</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Available Talent</div>
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Handoff Notes</label>
                <textarea 
                    className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-charcoal resize-none text-sm"
                    placeholder="Context for the next owner (e.g. salary expectations, specific constraints)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Cancel</button>
            <button 
                onClick={() => onSubmit(selectedRole, note)}
                className="px-8 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center gap-2"
            >
                Confirm Transfer <ArrowRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};
