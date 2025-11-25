'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, Mail, Phone, MapPin, Building2, Calendar, DollarSign, Award, Clock, FileText, Download, UserPlus, UserMinus, TrendingUp, Laptop, Smartphone, Key, X, Plus, Target, Upload, Edit2, Save } from 'lucide-react';
import { OffboardingModal } from './OffboardingModal';
import { TransferModal } from './TransferModal';

// --- MODALS ---

const AddReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; employeeName: string }> = ({ isOpen, onClose, employeeName }) => {
    const [rating, setRating] = useState('3');
    const [period, setPeriod] = useState('Q4 2025');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Add Performance Review</h2>
                <p className="text-stone-500 mb-4 text-sm">For: {employeeName}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Review Period</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-charcoal" value={period} onChange={e => setPeriod(e.target.value)}>
                            <option>Q4 2025</option>
                            <option>Q3 2025</option>
                            <option>Annual 2025</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Overall Rating (1-5)</label>
                        <input type="number" min="1" max="5" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-charcoal" value={rating} onChange={e => setRating(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Manager Comments</label>
                        <textarea className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-xl resize-none text-sm" placeholder="Strengths, weaknesses..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                </div>

                <button onClick={() => { alert("Review Added"); onClose(); }} className="w-full mt-8 py-4 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust shadow-lg transition-all">
                    Submit Review
                </button>
            </div>
        </div>
    )
}

const GoalDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; goal: any }> = ({ isOpen, onClose, goal }) => {
    if (!isOpen || !goal) return null;
    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                <div className="mb-6">
                    <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Goal Details</div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal">{goal.title}</h2>
                </div>
                <div className="space-y-4 bg-stone-50 p-6 rounded-xl border border-stone-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Target:</span>
                        <span className="font-bold text-charcoal">{goal.target}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Current:</span>
                        <span className="font-bold text-charcoal">{goal.current}</span>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-green-500" style={{ width: `${(goal.currentVal / goal.targetVal) * 100}%` }}></div>
                    </div>
                </div>
                <button onClick={onClose} className="w-full mt-6 py-3 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200">Close</button>
            </div>
        </div>
    )
}

const DocumentUploadModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Upload Document</h2>
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center bg-stone-50 hover:border-rust hover:bg-rust/5 transition-all cursor-pointer">
                    <Upload size={32} className="mx-auto text-stone-400 mb-2" />
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Drag & Drop or Click</p>
                </div>
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Document Name</label>
                        <input className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm" placeholder="e.g. Updated Contract" />
                    </div>
                    <button onClick={() => { alert("Uploaded"); onClose(); }} className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust shadow-lg transition-all">
                        Save File
                    </button>
                </div>
            </div>
        </div>
    )
}

const AddAssetModal: React.FC<{ isOpen: boolean; onClose: () => void; onAssign: (asset: any) => void }> = ({ isOpen, onClose, onAssign }) => {
    const [type, setType] = useState('Laptop');
    const [model, setModel] = useState('');
    const [serial, setSerial] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAssign({ type, model, serial, status: 'Assigned', icon: type === 'Laptop' ? Laptop : type === 'Phone' ? Smartphone : Key });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Assign Asset</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Type</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" value={type} onChange={e => setType(e.target.value)}>
                            <option>Laptop</option>
                            <option>Phone</option>
                            <option>Access Card</option>
                            <option>Monitor</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Model / Name</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. MacBook Pro" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Serial Number</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" value={serial} onChange={e => setSerial(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full mt-4 py-3 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust shadow-lg">Assign</button>
                </form>
            </div>
        </div>
    )
}

export const EmployeeProfile: React.FC = () => {
  const { employeeId } = useParams();
  const { employees, updateEmployee } = useAppStore();
  const employee = employees.find(e => e.id === employeeId);
  
  const [isOffboardingOpen, setIsOffboardingOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDocUploadOpen, setIsDocUploadOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Personal' | 'Assets'>('Overview');
  const [isEditing, setIsEditing] = useState(false);

  // Local State for Edit Mode
  const [editData, setEditData] = useState<any>(employee || {});
  const [assets, setAssets] = useState([
      { type: 'Laptop', model: 'MacBook Pro 16"', serial: 'C02TG0...', status: 'Assigned', icon: Laptop },
      { type: 'Phone', model: 'iPhone 15 Pro', serial: 'F19GL...', status: 'Assigned', icon: Smartphone },
      { type: 'Access', model: 'Office Badge', serial: '#4921', status: 'Active', icon: Key },
  ]);

  if (!employee) return <div className="p-8 text-center">Employee not found</div>;

  const handleSave = () => {
      updateEmployee(editData);
      setIsEditing(false);
  };

  const handleAddAsset = (newAsset: any) => {
      setAssets([...assets, newAsset]);
  };

  const goals = [
      { id: 1, title: 'Sprint Goal: Q4 Hires', target: '4 Placements', targetVal: 4, current: '2 Placements', currentVal: 2 },
      { id: 2, title: 'Client Outreach', target: '50 Contacts', targetVal: 50, current: '45 Contacts', currentVal: 45 }
  ];

  return (
    <div className="animate-fade-in pt-4">
      <OffboardingModal 
        isOpen={isOffboardingOpen} 
        onClose={() => setIsOffboardingOpen(false)} 
        employeeName={`${employee.firstName} ${employee.lastName}`} 
        employeeId={employee.id}
      />
      
      <TransferModal 
        isOpen={isTransferOpen} 
        onClose={() => setIsTransferOpen(false)} 
        employeeName={`${employee.firstName} ${employee.lastName}`}
        currentRole={employee.role}
      />

      <AddReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        employeeName={`${employee.firstName} ${employee.lastName}`}
      />

      <GoalDetailModal 
        isOpen={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
      />

      <DocumentUploadModal 
        isOpen={isDocUploadOpen}
        onClose={() => setIsDocUploadOpen(false)}
      />

      <AddAssetModal 
        isOpen={isAddAssetOpen} 
        onClose={() => setIsAddAssetOpen(false)}
        onAssign={handleAddAsset}
      />

      <Link href="/employee/hr/people" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: ID Card */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-stone-100 z-0"></div>
                  <div className="relative z-10">
                      <div className="w-32 h-32 mx-auto rounded-full bg-charcoal text-white flex items-center justify-center text-4xl font-serif font-bold mb-4 border-4 border-white shadow-xl">
                          {employee.firstName.charAt(0)}
                      </div>
                      <h1 className="text-3xl font-serif font-bold text-charcoal mb-1">{employee.firstName} {employee.lastName}</h1>
                      <p className="text-stone-500 font-medium mb-4">{employee.role}</p>
                      
                      <div className="flex justify-center gap-2 mb-8">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              employee.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                              {employee.status}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                              {employee.department}
                          </span>
                      </div>

                      <div className="space-y-4 text-left border-t border-stone-100 pt-6">
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400"><Mail size={14}/></div>
                              <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400"><Phone size={14}/></div>
                              <span>{employee.phone || '+1 (555) 012-3456'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400"><MapPin size={14}/></div>
                              <span>{employee.location}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Management Actions */}
              <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-200">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Management Actions</h3>
                  <div className="space-y-3">
                      <button 
                        onClick={() => setIsTransferOpen(true)}
                        className="w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-charcoal hover:border-rust hover:text-rust transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                          <TrendingUp size={14} /> Transfer / Promote
                      </button>
                      <button 
                        onClick={() => setIsOffboardingOpen(true)}
                        className="w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                          <UserMinus size={14} /> Initiate Offboarding
                      </button>
                  </div>
              </div>
          </div>

          {/* Right Column: Details Tabs */}
          <div className="lg:col-span-8">
              <div className="flex gap-4 border-b border-stone-200 mb-8">
                  {['Overview', 'Personal', 'Assets'].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'}`}
                      >
                          {tab} Info
                      </button>
                  ))}
              </div>

              <div className="space-y-8">
                  {activeTab === 'Overview' && (
                      <>
                        {/* Stats / Overview */}
                        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-xl font-bold text-charcoal">Employment Details</h3>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-stone-400 hover:text-charcoal">Cancel</button>
                                        <button onClick={handleSave} className="text-xs font-bold text-rust hover:text-green-600 flex items-center gap-1"><Save size={12}/> Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-rust hover:underline flex items-center gap-1"><Edit2 size={12}/> Edit</button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                    <div className="text-stone-400 mb-2"><Calendar size={18}/></div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Start Date</div>
                                    {isEditing ? <input type="date" value={editData.startDate} onChange={e => setEditData({...editData, startDate: e.target.value})} className="w-full bg-white border border-stone-200 rounded p-1 text-sm"/> : <div className="font-bold text-charcoal">{employee.startDate}</div>}
                                </div>
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                    <div className="text-stone-400 mb-2"><DollarSign size={18}/></div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Compensation</div>
                                    {isEditing ? <input value={editData.salary} onChange={e => setEditData({...editData, salary: e.target.value})} className="w-full bg-white border border-stone-200 rounded p-1 text-sm"/> : <div className="font-bold text-charcoal">{employee.salary}</div>}
                                </div>
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                    <div className="text-stone-400 mb-2"><Building2 size={18}/></div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Manager</div>
                                    {isEditing ? <input value={editData.manager} onChange={e => setEditData({...editData, manager: e.target.value})} className="w-full bg-white border border-stone-200 rounded p-1 text-sm"/> : <div className="font-bold text-charcoal">{employee.manager}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Performance / Goals */}
                        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-xl font-bold text-charcoal">Performance</h3>
                                <button onClick={() => setIsReviewOpen(true)} className="text-xs font-bold text-rust uppercase tracking-widest hover:underline flex items-center gap-1">
                                    <Plus size={12} /> Add Review
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {goals.map(goal => (
                                    <div key={goal.id} onClick={() => setSelectedGoal(goal)} className="flex items-center justify-between p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                                <Target size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-charcoal text-sm group-hover:text-rust transition-colors">{goal.title}</div>
                                                <div className="text-xs text-stone-500">Target: {goal.target} • Current: {goal.current}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-charcoal">{Math.round((goal.currentVal / goal.targetVal) * 100)}%</div>
                                            <div className="h-1 w-16 bg-stone-100 rounded-full overflow-hidden mt-1">
                                                <div className="h-full bg-green-500" style={{ width: `${(goal.currentVal / goal.targetVal) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-xl font-bold text-charcoal">Documents</h3>
                                <button onClick={() => setIsDocUploadOpen(true)} className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest flex items-center gap-1">
                                    <Upload size={12} /> Upload
                                </button>
                            </div>
                            <div className="space-y-2">
                                {['Employment Contract.pdf', 'Offer Letter - Signed.pdf', 'NDA_2024.pdf'].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <FileText size={16} className="text-stone-400" />
                                            <span className="text-sm font-medium text-charcoal">{doc}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-stone-300 hover:text-rust" title="Download"><Download size={14}/></button>
                                            <button className="text-stone-300 hover:text-charcoal" title="Edit"><Edit2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </>
                  )}

                  {activeTab === 'Personal' && (
                      <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-lg space-y-8 animate-slide-up">
                           <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-xl font-bold text-charcoal">Personal Details</h3>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-stone-400 hover:text-charcoal">Cancel</button>
                                        <button onClick={handleSave} className="text-xs font-bold text-rust hover:text-green-600 flex items-center gap-1"><Save size={12}/> Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-rust hover:underline flex items-center gap-1"><Edit2 size={12}/> Edit</button>
                                )}
                            </div>
                          <div>
                              <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Contact Information</h3>
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-xs font-bold text-stone-400 mb-1">Home Address</label>
                                      {isEditing ? <input className="w-full p-2 border rounded bg-stone-50" defaultValue="123 Tech Lane, Austin, TX 78701" /> : <div className="p-3 bg-stone-50 rounded-lg text-sm text-charcoal font-medium">123 Tech Lane, Austin, TX 78701</div>}
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-stone-400 mb-1">Personal Email</label>
                                      {isEditing ? <input className="w-full p-2 border rounded bg-stone-50" defaultValue="alex.personal@gmail.com" /> : <div className="p-3 bg-stone-50 rounded-lg text-sm text-charcoal font-medium">alex.personal@gmail.com</div>}
                                  </div>
                              </div>
                          </div>
                          <div>
                              <h3 className="font-bold text-charcoal text-sm uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Emergency Contact</h3>
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-xs font-bold text-stone-400 mb-1">Name</label>
                                      {isEditing ? <input className="w-full p-2 border rounded bg-stone-50" defaultValue="Maria Rivera" /> : <div className="p-3 bg-stone-50 rounded-lg text-sm text-charcoal font-medium">Maria Rivera</div>}
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-stone-400 mb-1">Relationship</label>
                                      {isEditing ? <input className="w-full p-2 border rounded bg-stone-50" defaultValue="Spouse" /> : <div className="p-3 bg-stone-50 rounded-lg text-sm text-charcoal font-medium">Spouse</div>}
                                  </div>
                                  <div className="col-span-2">
                                      <label className="block text-xs font-bold text-stone-400 mb-1">Phone</label>
                                      {isEditing ? <input className="w-full p-2 border rounded bg-stone-50" defaultValue="+1 (555) 999-8888" /> : <div className="p-3 bg-stone-50 rounded-lg text-sm text-charcoal font-medium">+1 (555) 999-8888</div>}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'Assets' && (
                      <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-lg animate-slide-up">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-serif text-xl font-bold text-charcoal">Assigned Equipment</h3>
                              <button onClick={() => setIsAddAssetOpen(true)} className="text-xs font-bold text-rust uppercase tracking-widest hover:underline">+ Assign Asset</button>
                          </div>
                          <div className="space-y-4">
                              {assets.map((asset, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-stone-500 shadow-sm">
                                              <asset.icon size={20} />
                                          </div>
                                          <div>
                                              <div className="font-bold text-charcoal text-sm">{asset.type}</div>
                                              <div className="text-xs text-stone-500">{asset.model}</div>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-xs font-mono text-stone-400 mb-1">{asset.serial}</div>
                                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{asset.status}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
