'use client';


import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Calendar, DollarSign, FileText, Receipt, MessageSquare, CheckSquare, Eye } from 'lucide-react';
import { ApprovalRequest } from '../../types';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ApprovalRequest | null;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

// Simple File Preview Component
const FilePreview: React.FC<{ isOpen: boolean; onClose: () => void; title: string; type: 'document' | 'receipt' }> = ({ isOpen, onClose, title, type }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in bg-charcoal/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl h-[70vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-bold text-charcoal">{title}</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-charcoal"/></button>
                </div>
                <div className="flex-1 bg-stone-200 flex items-center justify-center p-8">
                    <div className="bg-white w-full h-full shadow-lg flex flex-col items-center justify-center text-stone-300 border border-stone-300">
                        {type === 'document' ? <FileText size={64} className="mb-4"/> : <Receipt size={64} className="mb-4"/>}
                        <p className="font-serif text-xl text-stone-400">Preview Unavailable in Demo</p>
                        <p className="text-xs mt-2">{title}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, request, onApprove, onDeny }) => {
  const [step, setStep] = useState<'review' | 'deny_reason' | 'message' | 'success'>('review');
  const [denyReason, setDenyReason] = useState('');
  const [moreInfoMessage, setMoreInfoMessage] = useState('');
  const [previewFile, setPreviewFile] = useState<{title: string, type: 'document' | 'receipt'} | null>(null);

  if (!isOpen || !request) return null;

  const handleApprove = () => {
      onApprove(request.id);
      setStep('success');
      setTimeout(() => {
          onClose();
          setStep('review'); // Reset
      }, 1500);
  };

  const handleDenySubmit = () => {
      onDeny(request.id);
      onClose();
      setStep('review');
  };

  const handleRequestInfoSubmit = () => {
      // In real app, send message API
      alert(`Message sent to ${request.employeeName}: ${moreInfoMessage}`);
      onClose();
      setStep('review');
  };

  const renderContent = () => {
      switch(request.type) {
          case 'Time Off':
              return (
                  <div className="space-y-6">
                      {/* Employee Info */}
                      <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                          <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center font-bold text-charcoal text-lg">
                              {request.employeeName.charAt(0)}
                          </div>
                          <div>
                              <div className="font-bold text-charcoal">{request.employeeName}</div>
                              <div className="text-xs text-stone-500">Software Engineer</div>
                          </div>
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-2 gap-6">
                          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Dates</div>
                              <div className="text-lg font-bold text-charcoal flex items-center gap-2">
                                  <Calendar size={18} className="text-rust" />
                                  {request.details.start} - {request.details.end}
                              </div>
                              <div className="text-xs text-stone-500 mt-1">{request.details.days} Days Total</div>
                          </div>
                          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">PTO Balance</div>
                              <div className="text-lg font-bold text-charcoal">12 Days</div>
                              <div className="text-xs text-green-600 font-bold mt-1">Sufficient Available</div>
                          </div>
                      </div>
                      
                      <div>
                          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Reason</h4>
                          <p className="text-sm text-stone-600 italic bg-stone-50 p-3 rounded-lg border border-stone-100">&quot;{request.details.reason}&quot;</p>
                      </div>

                      {/* Conflict Check */}
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-start">
                          <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                              <h4 className="font-bold text-yellow-800 text-sm">Team Conflict Check</h4>
                              <p className="text-xs text-yellow-700 mt-1">
                                  ⚠️ Warning: 2 other team members (Sarah, Mike) are out during this period.
                              </p>
                          </div>
                      </div>
                  </div>
              );
          case 'Commission':
              return (
                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-bold text-charcoal">
                                  {request.employeeName.charAt(0)}
                              </div>
                              <div>
                                  <div className="font-bold text-charcoal">{request.employeeName}</div>
                                  <div className="text-xs text-stone-500">Recruiting Pod A</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Commission Amount</div>
                              <div className="text-xl font-serif font-bold text-green-600">{request.details.amount}</div>
                          </div>
                      </div>

                      <div className="p-4 border border-stone-200 rounded-xl bg-white shadow-sm">
                          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Related Placement</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                  <div className="text-stone-500 text-xs">Candidate</div>
                                  <div className="font-bold text-charcoal">{request.details.placement}</div>
                              </div>
                              <div>
                                  <div className="text-stone-500 text-xs">Client</div>
                                  <div className="font-bold text-charcoal">{request.details.client}</div>
                              </div>
                              <div>
                                  <div className="text-stone-500 text-xs">Position</div>
                                  <div className="font-bold text-charcoal">Guidewire Developer</div>
                              </div>
                              <div>
                                  <div className="text-stone-500 text-xs">Start Date</div>
                                  <div className="font-bold text-charcoal">Jan 15, 2026</div>
                              </div>
                          </div>
                      </div>

                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Calculation</h4>
                          <div className="flex justify-between items-center text-sm font-mono">
                              <span>{request.details.dealValue} (Contract) × 2% (Rate)</span>
                              <span className="font-bold">= {request.details.amount}</span>
                          </div>
                      </div>

                      <div 
                        onClick={() => setPreviewFile({title: 'Offer Letter & Signed Contract', type: 'document'})}
                        className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors group"
                      >
                          <FileText size={14} /> 
                          <span className="underline">View Offer Letter & Signed Contract</span>
                          <Eye size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                  </div>
              );
          case 'Expense':
              return (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-200">
                          <div>
                              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Reimbursement</div>
                              <div className="text-2xl font-bold text-charcoal">{request.details.amount}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs text-stone-500">{request.details.items} Items</div>
                              <div className="text-xs font-bold text-charcoal">{request.details.category}</div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Itemized Expenses</h4>
                          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                              <div className="grid grid-cols-12 gap-2 p-2 bg-stone-50 border-b border-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                                  <div className="col-span-2">Date</div>
                                  <div className="col-span-3">Category</div>
                                  <div className="col-span-4">Description</div>
                                  <div className="col-span-2 text-right">Amount</div>
                                  <div className="col-span-1"></div>
                              </div>
                              
                              {/* Item 1 */}
                              <div className="grid grid-cols-12 gap-2 p-3 border-b border-stone-100 text-sm items-center">
                                  <div className="col-span-2 text-stone-500">Nov 10</div>
                                  <div className="col-span-3">Travel</div>
                                  <div className="col-span-4 text-stone-600">Uber to client site</div>
                                  <div className="col-span-2 text-right font-mono">$45.00</div>
                                  <div className="col-span-1 text-center text-blue-600 text-xs cursor-pointer hover:underline" onClick={() => setPreviewFile({title: 'Uber Receipt', type: 'receipt'})}>[View]</div>
                              </div>

                              {/* Item 2 - Warning */}
                              <div className="grid grid-cols-12 gap-2 p-3 border-b border-stone-100 text-sm items-center bg-yellow-50/50">
                                  <div className="col-span-2 text-stone-500">Nov 10</div>
                                  <div className="col-span-3">Meals</div>
                                  <div className="col-span-4 text-stone-600">Lunch with candidate</div>
                                  <div className="col-span-2 text-right font-mono">$78.50</div>
                                  <div className="col-span-1 text-center text-blue-600 text-xs cursor-pointer hover:underline" onClick={() => setPreviewFile({title: 'Lunch Receipt', type: 'receipt'})}>[View]</div>
                              </div>

                              {/* Item 3 */}
                              <div className="grid grid-cols-12 gap-2 p-3 text-sm items-center">
                                  <div className="col-span-2 text-stone-500">Nov 12</div>
                                  <div className="col-span-3">Software</div>
                                  <div className="col-span-4 text-stone-600">LinkedIn Recruiter</div>
                                  <div className="col-span-2 text-right font-mono">$161.00</div>
                                  <div className="col-span-1 text-center text-blue-600 text-xs cursor-pointer hover:underline" onClick={() => setPreviewFile({title: 'LinkedIn Invoice', type: 'receipt'})}>[View]</div>
                              </div>
                          </div>
                      </div>

                      {/* Policy Check */}
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-start">
                          <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                          <div>
                              <h4 className="font-bold text-yellow-800 text-sm">Policy Compliance Check</h4>
                              <p className="text-xs text-yellow-700 mt-1">
                                  ⚠️ Meal expense ($78.50) exceeds $50.00 policy limit per person.
                              </p>
                          </div>
                      </div>
                  </div>
              );
      }
  };

  return (
    <>
    <FilePreview 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        title={previewFile?.title || ''} 
        type={previewFile?.type || 'document'} 
    />

    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {step === 'success' ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-charcoal">Approved!</h3>
                    <p className="text-stone-500 mt-2">Notification sent to {request.employeeName}.</p>
                </div>
            ) : step === 'deny_reason' ? (
                <div className="flex flex-col h-full">
                    <div className="mb-6">
                        <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Reason for Denial</h3>
                        <p className="text-stone-500 text-sm">This will be sent to the employee via email.</p>
                    </div>
                    <textarea 
                        className="flex-1 w-full p-4 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-rust text-sm mb-6"
                        placeholder="e.g. Policy violation, insufficient balance, missing receipt..."
                        value={denyReason}
                        onChange={(e) => setDenyReason(e.target.value)}
                    />
                    <div className="flex gap-4 mt-auto">
                        <button onClick={() => setStep('review')} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Cancel</button>
                        <button onClick={handleDenySubmit} disabled={!denyReason} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg disabled:opacity-50">Confirm Denial</button>
                    </div>
                </div>
            ) : step === 'message' ? (
                <div className="flex flex-col h-full">
                    <div className="mb-6">
                        <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Request More Info</h3>
                        <p className="text-stone-500 text-sm">Send a direct message to {request.employeeName}.</p>
                    </div>
                    <textarea 
                        className="flex-1 w-full p-4 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-rust text-sm mb-6"
                        placeholder="e.g. Please attach the itemized receipt for the lunch..."
                        value={moreInfoMessage}
                        onChange={(e) => setMoreInfoMessage(e.target.value)}
                    />
                    <div className="flex gap-4 mt-auto">
                        <button onClick={() => setStep('review')} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Cancel</button>
                        <button onClick={handleRequestInfoSubmit} disabled={!moreInfoMessage} className="flex-1 py-3 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rust shadow-lg disabled:opacity-50">Send Message</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-8 pb-6 border-b border-stone-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                                {request.type === 'Time Off' && <Calendar size={20}/>}
                                {request.type === 'Commission' && <DollarSign size={20}/>}
                                {request.type === 'Expense' && <Receipt size={20}/>}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{request.type} Request</div>
                                <h2 className="text-xl font-serif font-bold text-charcoal">{request.employeeName}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-stone-400 hover:text-charcoal rounded-full hover:bg-stone-100">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        {renderContent()}
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <button 
                                onClick={() => setStep('message')} 
                                className="py-3 border border-stone-200 text-stone-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-charcoal hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={16} /> Request Info
                            </button>
                            {request.type === 'Expense' ? (
                                <button onClick={handleApprove} className="py-3 border border-stone-200 text-stone-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-charcoal hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                                    <CheckSquare size={16} /> Approve Partial
                                </button>
                            ) : (
                                <div></div> 
                            )}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep('deny_reason')} className="px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                <XCircle size={16} /> Deny
                            </button>
                            <button onClick={handleApprove} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 shadow-lg transition-all flex items-center justify-center gap-2">
                                {request.type === 'Expense' ? 'Approve All' : 'Approve'} <CheckCircle size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
    </>
  );
};
