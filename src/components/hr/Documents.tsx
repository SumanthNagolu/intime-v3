'use client';


import React, { useState } from 'react';
import { FileText, Download, Search, Shield, Upload, Users, Eye, X, CheckCircle } from 'lucide-react';

const DocPreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; docName: string }> = ({ isOpen, onClose, docName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in bg-charcoal/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h3 className="font-bold text-charcoal">{docName}</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-charcoal"/></button>
                </div>
                <div className="flex-1 bg-stone-100 flex items-center justify-center p-12">
                    <div className="bg-white shadow-lg w-[60%] h-full p-12 flex flex-col">
                        <div className="w-full h-4 bg-stone-200 mb-4"></div>
                        <div className="w-[80%] h-4 bg-stone-200 mb-8"></div>
                        <div className="space-y-2">
                            <div className="w-full h-2 bg-stone-100"></div>
                            <div className="w-full h-2 bg-stone-100"></div>
                            <div className="w-full h-2 bg-stone-100"></div>
                            <div className="w-[60%] h-2 bg-stone-100"></div>
                        </div>
                        <div className="mt-auto text-center text-stone-400 text-sm italic">Preview Mode</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const DocumentUploadModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'upload' | 'success'>('upload');

    if (!isOpen) return null;

    const handleUpload = () => {
        setStep('success');
        setTimeout(() => {
            setStep('upload');
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal"><X size={24}/></button>
                
                {step === 'upload' ? (
                    <>
                        <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Upload Document</h2>
                        <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center bg-stone-50 hover:border-rust hover:bg-rust/5 transition-all cursor-pointer">
                            <Upload size={32} className="mx-auto text-stone-400 mb-2" />
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Drag & Drop or Click</p>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Document Name</label>
                                <input className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust" placeholder="e.g. Updated Handbook" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Category</label>
                                <select className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust">
                                    <option>Templates & Forms</option>
                                    <option>Policies & Handbooks</option>
                                    <option>Employee Files</option>
                                </select>
                            </div>
                            <button onClick={handleUpload} className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust shadow-lg transition-all">
                                Save File
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal">Upload Complete</h3>
                        <p className="text-stone-500 text-sm mt-2">Document has been added to the repository.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export const Documents: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Templates');
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="animate-fade-in pt-4">
      <DocPreviewModal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} docName={previewDoc || ''} />
      <DocumentUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Operations</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Documents</h1>
        <p className="text-stone-500 mt-2">Centralized repository for policies, templates, and employee files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
              <button 
                onClick={() => setActiveCategory('Templates')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeCategory === 'Templates' ? 'bg-charcoal text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                  <FileText size={18} /> Templates & Forms
              </button>
              <button 
                onClick={() => setActiveCategory('Policies')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeCategory === 'Policies' ? 'bg-charcoal text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                  <Shield size={18} /> Policies & Handbooks
              </button>
              <button 
                onClick={() => setActiveCategory('Employee Files')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${activeCategory === 'Employee Files' ? 'bg-charcoal text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                  <Users size={18} /> Employee Files
              </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex-1 max-w-md">
                      <Search size={18} className="text-stone-400 ml-2" />
                      <input placeholder="Search documents..." className="bg-transparent outline-none text-sm w-full" />
                  </div>
                  <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="px-6 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2"
                  >
                      <Upload size={16} /> Upload
                  </button>
              </div>

              <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-stone-50 text-xs font-bold uppercase tracking-widest text-stone-400">
                          <tr>
                              <th className="p-6">Name</th>
                              <th className="p-6">Category</th>
                              <th className="p-6">Last Updated</th>
                              <th className="p-6 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                          {activeCategory === 'Templates' && [
                              { name: 'Offer Letter Template - FTE.docx', category: 'Recruiting', date: 'Sep 15, 2024', size: '150 KB' },
                              { name: 'Contractor Agreement v3.pdf', category: 'Legal', date: 'Aug 20, 2024', size: '1.1 MB' },
                              { name: 'Termination Notice.docx', category: 'HR', date: 'Jan 10, 2024', size: '45 KB' },
                              { name: 'Performance Review Form.pdf', category: 'HR', date: 'Oct 05, 2024', size: '200 KB' },
                              { name: 'Direct Deposit Authorization.pdf', category: 'Payroll', date: 'Mar 12, 2024', size: '100 KB' }
                          ].map((doc, i) => (
                              <DocumentRow key={i} doc={doc} onPreview={() => setPreviewDoc(doc.name)} />
                          ))}

                          {activeCategory === 'Policies' && [
                              { name: 'Employee Handbook 2024.pdf', category: 'General', date: 'Oct 1, 2024', size: '2.4 MB' },
                              { name: 'Remote Work Policy.pdf', category: 'HR', date: 'Jan 10, 2024', size: '500 KB' },
                              { name: 'Expense Reimbursement Policy.pdf', category: 'Finance', date: 'Feb 12, 2024', size: '800 KB' },
                              { name: 'Code of Conduct.pdf', category: 'Legal', date: 'Jan 01, 2024', size: '1.5 MB' },
                          ].map((doc, i) => (
                              <DocumentRow key={i} doc={doc} onPreview={() => setPreviewDoc(doc.name)} />
                          ))}

                          {activeCategory === 'Employee Files' && [
                              { name: 'Signed_Offer_David_Kim.pdf', category: 'David Kim', date: 'Mar 01, 2023', size: '1.2 MB' },
                              { name: 'NDA_Sarah_Lao.pdf', category: 'Sarah Lao', date: 'Jun 12, 2023', size: '800 KB' },
                              { name: 'W4_James_Wilson.pdf', category: 'James Wilson', date: 'Aug 01, 2023', size: '150 KB' },
                          ].map((doc, i) => (
                              <DocumentRow key={i} doc={doc} onPreview={() => setPreviewDoc(doc.name)} />
                          ))}
                      </tbody>
                  </table>
                  {activeCategory === 'Employee Files' && (
                      <div className="p-8 text-center text-stone-400 italic border-t border-stone-100">
                          Use the search bar to find files for specific employees.
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

interface DocumentItem {
  name: string;
  size: string;
  category: string;
  date: string;
}

const DocumentRow: React.FC<{ doc: DocumentItem; onPreview: () => void }> = ({ doc, onPreview }) => (
    <tr className="hover:bg-stone-50 transition-colors group cursor-pointer" onClick={onPreview}>
        <td className="p-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500">
                    <FileText size={20} />
                </div>
                <div>
                    <div className="font-bold text-charcoal text-sm">{doc.name}</div>
                    <div className="text-xs text-stone-400">{doc.size}</div>
                </div>
            </div>
        </td>
        <td className="p-6">
            <span className="px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {doc.category}
            </span>
        </td>
        <td className="p-6 text-sm text-stone-600 font-medium">{doc.date}</td>
        <td className="p-6 text-right">
            <button className="p-2 text-stone-300 hover:text-charcoal transition-colors mr-2" onClick={(e) => { e.stopPropagation(); onPreview(); }}>
                <Eye size={18} />
            </button>
            <button className="p-2 text-stone-300 hover:text-charcoal transition-colors">
                <Download size={18} />
            </button>
        </td>
    </tr>
);
