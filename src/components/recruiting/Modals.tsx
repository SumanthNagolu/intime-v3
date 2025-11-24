'use client';


import React, { useState } from 'react';
import { X, Building2, GraduationCap, User, CheckCircle } from 'lucide-react';
import { Lead, Deal, Account, Candidate } from '../../types';

export const CreateLeadModal: React.FC<{ onClose: () => void, onSave: (lead: Lead) => void }> = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        company: '',
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        value: '',
        source: 'Cold Outreach'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Lead = {
            id: `l${Date.now()}`,
            ...form,
            contact: `${form.firstName} ${form.lastName}`, // Legacy compatibility
            status: 'new',
            lastAction: 'Created just now'
        };
        onSave(newLead);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Add New Lead</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Company Name</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">First Name</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Last Name</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Job Title</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Email</label>
                            <input type="email" required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Phone</label>
                            <input type="tel" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Est. Deal Value</label>
                        <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="$0" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg">Create Lead</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const CreateDealModal: React.FC<{ leads: any[], onClose: () => void, onSave: (deal: Deal) => void }> = ({ leads, onClose, onSave }) => {
    const [form, setForm] = useState({
        title: '',
        leadId: '',
        value: '',
        expectedClose: '',
        probability: 20
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedLead = leads.find(l => l.id === form.leadId);
        const newDeal: Deal = {
            id: `d${Date.now()}`,
            ...form,
            company: selectedLead ? selectedLead.company : 'Unknown',
            stage: 'Prospect',
            ownerId: 'current-user'
        };
        onSave(newDeal);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Start New Deal</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Deal Title</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="e.g. Q4 Staffing Contract" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Related Lead</label>
                        <select required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.leadId} onChange={e => setForm({...form, leadId: e.target.value})}>
                            <option value="">Select Lead...</option>
                            {leads.map(l => <option key={l.id} value={l.id}>{l.company} - {l.contact}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Value ($)</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="$0" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Close Date</label>
                            <input required type="date" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.expectedClose} onChange={e => setForm({...form, expectedClose: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg">Create Pipeline Deal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const CreateAccountModal: React.FC<{ onClose: () => void, onSave: (account: Account) => void }> = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        name: '',
        industry: '',
        type: 'Direct Client'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: Account = {
            id: `a${Date.now()}`,
            ...form,
            status: 'Prospect',
            accountManagerId: 'current-user',
            responsiveness: 'Medium',
            preference: 'Quality',
            pocs: [],
            type: form.type as any
        };
        onSave(newAccount);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Add Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Account Name</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Industry</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Type</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                            <option>Direct Client</option>
                            <option>Implementation Partner</option>
                            <option>MSP/VMS</option>
                        </select>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg">Save Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ConvertOutcomeProps {
    deal: Deal;
    onClose: () => void;
    onConvert: (type: 'account' | 'bench' | 'academy', data: any) => void;
    prefillData?: { name: string, email?: string };
}

export const ConvertOutcomeModal: React.FC<ConvertOutcomeProps> = ({ deal, onClose, onConvert, prefillData }) => {
    const [selectedPath, setSelectedPath] = useState<'account' | 'bench' | 'academy'>('account');
    
    // Form States
    const [accountName, setAccountName] = useState(deal.company);
    const [candidateName, setCandidateName] = useState(prefillData?.name || '');
    const [startCohort, setStartCohort] = useState('Nov 2025');

    const handleExecute = () => {
        if (selectedPath === 'account') {
            onConvert('account', { name: accountName });
        } else if (selectedPath === 'bench') {
            onConvert('bench', { name: candidateName });
        } else {
            onConvert('academy', { name: candidateName, cohort: startCohort });
        }
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-8">
                    <div className="text-green-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">Deal Won</div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">Convert Outcome</h2>
                    <p className="text-stone-500 mt-2">Where should this relationship go next?</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button 
                        onClick={() => setSelectedPath('account')}
                        className={`p-6 rounded-2xl border-2 text-center transition-all group ${selectedPath === 'account' ? 'border-charcoal bg-stone-50' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedPath === 'account' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <Building2 size={20} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Client Account</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Recruiting</div>
                    </button>

                    <button 
                        onClick={() => setSelectedPath('bench')}
                        className={`p-6 rounded-2xl border-2 text-center transition-all group ${selectedPath === 'bench' ? 'border-rust bg-rust/5' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedPath === 'bench' ? 'bg-rust text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <User size={20} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Bench Consultant</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Staffing</div>
                    </button>

                    <button 
                        onClick={() => setSelectedPath('academy')}
                        className={`p-6 rounded-2xl border-2 text-center transition-all group ${selectedPath === 'academy' ? 'border-blue-600 bg-blue-50' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedPath === 'academy' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <GraduationCap size={20} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Academy Student</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Training</div>
                    </button>
                </div>

                <div className="flex-1 bg-stone-50 rounded-2xl p-6 mb-8 border border-stone-100">
                    {selectedPath === 'account' && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">New Account Name</label>
                            <input 
                                value={accountName} 
                                onChange={(e) => setAccountName(e.target.value)}
                                className="w-full p-4 bg-white border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-charcoal"
                            />
                            <p className="text-xs text-stone-500 mt-3">Will be added to CRM as an Active Account with 'Direct Client' status.</p>
                        </div>
                    )}

                    {selectedPath === 'bench' && (
                        <div className="animate-fade-in space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Consultant Name</label>
                                <input 
                                    value={candidateName} 
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    className="w-full p-4 bg-white border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-rust"
                                />
                            </div>
                            <p className="text-xs text-stone-500">Candidate will be onboarded to Internal Bench and visible in Talent Board.</p>
                        </div>
                    )}

                    {selectedPath === 'academy' && (
                        <div className="animate-fade-in space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Student Name</label>
                                <input 
                                    value={candidateName} 
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    className="w-full p-4 bg-white border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Assign to Cohort</label>
                                <select 
                                    value={startCohort}
                                    onChange={(e) => setStartCohort(e.target.value)}
                                    className="w-full p-4 bg-white border border-stone-200 rounded-xl font-medium text-charcoal focus:outline-none focus:border-blue-600"
                                >
                                    <option>Nov 2025</option>
                                    <option>Jan 2026</option>
                                    <option>Self-Paced</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleExecute}
                    className="w-full py-4 bg-green-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <CheckCircle size={18} /> Confirm Conversion
                </button>
            </div>
        </div>
    );
};
