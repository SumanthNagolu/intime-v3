'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckSquare, Square, Copy, Send, Filter, RefreshCcw } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const HotlistBuilder: React.FC = () => {
  const { bench } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [viewMode, setViewMode] = useState<'select' | 'preview'>('select');

  const toggleSelect = (id: string) => {
      if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
      else setSelectedIds(prev => [...prev, id]);
  };

  const generateHotlist = () => {
      const selectedConsultants = bench.filter(b => selectedIds.includes(b.id));
      const today = new Date().toLocaleDateString();
      
      // Simulate HTML generation for email
      let html = `Subject: Hotlist: Senior Guidewire Resources Available Immediately - ${today}\n\n`;
      html += `Hi Partners,\n\nPlease see our updated list of available consultants for immediate deployment:\n\n`;
      
      selectedConsultants.forEach(c => {
          html += `• ${c.name} | ${c.role} | ${c.experience} | ${c.location} | ${c.visaStatus}\n`;
          html += `  Skills: ${c.skills.slice(0,4).join(', ')}\n\n`;
      });
      
      html += `Full profiles attached. Let me know if you have requisitions.\n\nBest,\nInTime Bench Sales`;
      
      setGeneratedHtml(html);
      setViewMode('preview');
  };

  return (
    <div className="animate-fade-in pt-4 max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="mb-8 flex justify-between items-center border-b border-stone-200 pb-6 shrink-0">
            <div className="flex items-center gap-4">
                <Link href="/employee/bench/dashboard" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-charcoal">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-charcoal">Hotlist Generator</h1>
                    <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mt-1">
                        Daily Marketing Engine
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-stone-100 rounded-lg text-xs font-bold text-stone-500 uppercase tracking-widest hover:text-charcoal flex items-center gap-2">
                    <RefreshCcw size={14} /> Reset
                </button>
                {viewMode === 'select' && (
                    <button 
                        onClick={generateHotlist} 
                        disabled={selectedIds.length === 0}
                        className="px-6 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all disabled:opacity-50"
                    >
                        Generate Hotlist ({selectedIds.length})
                    </button>
                )}
            </div>
        </div>

        <div className="flex-1 flex gap-8 overflow-hidden">
            {/* Selection List */}
            <div className={`flex-1 bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col ${viewMode === 'preview' ? 'hidden lg:flex' : ''}`}>
                <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                    <h3 className="font-bold text-charcoal text-sm">Select Consultants</h3>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{bench.length} Available</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {bench.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => toggleSelect(c.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${selectedIds.includes(c.id) ? 'bg-rust/5 border-rust' : 'bg-white border-stone-100 hover:border-stone-300'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`text-stone-300 ${selectedIds.includes(c.id) ? 'text-rust' : 'group-hover:text-stone-400'}`}>
                                    {selectedIds.includes(c.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal text-sm">{c.name}</div>
                                    <div className="text-xs text-stone-500">{c.role} • {c.location}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${c.visaStatus === 'H-1B' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-500'}`}>
                                    {c.visaStatus}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview / Output */}
            {viewMode === 'preview' ? (
                <div className="flex-1 bg-stone-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Send size={16} /> Email Preview</h3>
                        <button onClick={() => setViewMode('select')} className="text-xs font-bold text-stone-400 hover:text-white uppercase tracking-widest">Edit Selection</button>
                    </div>
                    <div className="flex-1 p-8 font-mono text-sm text-stone-300 whitespace-pre-wrap overflow-y-auto">
                        {generatedHtml}
                    </div>
                    <div className="p-6 border-t border-white/10 flex gap-4">
                        <button className="flex-1 py-4 bg-white text-charcoal rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-200 flex items-center justify-center gap-2">
                            <Copy size={16} /> Copy to Clipboard
                        </button>
                        <button className="flex-1 py-4 bg-rust text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#B8421E] flex items-center justify-center gap-2">
                            <Send size={16} /> Send via Outlook
                        </button>
                    </div>
                </div>
            ) : (
                <div className="hidden lg:flex flex-1 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200 items-center justify-center text-stone-400 text-center p-12">
                    <div>
                        <Filter size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="font-serif text-xl font-bold text-stone-500 mb-2">Build Your List</h3>
                        <p className="text-sm max-w-xs mx-auto">Select consultants from the left to generate a formatted marketing blast for vendors.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
