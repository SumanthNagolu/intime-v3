'use client';

import React, { useState } from 'react';
import { BLUEPRINT_ITEMS } from '@/lib/academy/constants';
import { Check, Clock, Database, Download, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function BlueprintView() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Simulate PDF generation delay
    setTimeout(() => {
      setIsExporting(false);
      alert("Blueprint_v1.2.pdf downloaded successfully.");
    }, 2000);
  };

  return (
    <div className="animate-fade-in pt-4 pb-12">
      <div className="mb-10 flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">System of Record</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">The Blueprint</h1>
            <p className="text-stone-500">Your 60-page "Experience Document" built in real-time.</p>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-3xl font-serif font-bold text-charcoal">12/60</div>
            <div className="text-xs uppercase tracking-widest text-stone-400">Pages Generated</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Document Visualization */}
        <div className="w-full lg:w-1/3 shrink-0">
            <div className="bg-white border border-stone-200 shadow-2xl shadow-stone-200 p-8 min-h-[600px] relative rotate-1 hover:rotate-0 transition-transform duration-500 group">
                {/* Binder Rings */}
                <div className="absolute -left-4 top-12 w-8 h-8 rounded-full bg-stone-300 border-4 border-white shadow-md"></div>
                <div className="absolute -left-4 top-1/2 w-8 h-8 rounded-full bg-stone-300 border-4 border-white shadow-md"></div>
                <div className="absolute -left-4 bottom-12 w-8 h-8 rounded-full bg-stone-300 border-4 border-white shadow-md"></div>
                
                <div className="text-center mt-20 mb-12">
                    <div className="w-20 h-20 bg-rust text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-serif font-bold shadow-lg shadow-rust/20 group-hover:scale-110 transition-transform">IS</div>
                    <h2 className="font-serif text-3xl font-bold text-charcoal uppercase tracking-widest leading-snug">Technical<br/>Implementation<br/>Log</h2>
                    <p className="mt-4 text-stone-500 font-mono text-sm">CONFIDENTIAL - DO NOT DISTRIBUTE</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold border-b border-stone-100 pb-2">
                        <span>PROJECT</span>
                        <span>TECHFLOW MIGRATION</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold border-b border-stone-100 pb-2">
                        <span>ROLE</span>
                        <span>LEAD DEVELOPER</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold border-b border-stone-100 pb-2">
                        <span>DURATION</span>
                        <span>8 WEEKS</span>
                    </div>
                </div>
                
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-charcoal text-white px-8 py-3 rounded-full text-xs font-bold hover:bg-rust transition-all shadow-lg hover:shadow-rust/30 flex items-center justify-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {isExporting ? "Generating PDF..." : "Export PDF"}
                    </button>
                </div>
            </div>
        </div>

        {/* User Stories List */}
        <div className="flex-1 space-y-6">
            {BLUEPRINT_ITEMS.map(item => (
                <div key={item.id} className="group bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-md text-xs font-bold font-mono ${
                                item.status === 'completed' ? 'bg-forest/10 text-forest' : 'bg-yellow-50 text-yellow-600'
                            }`}>
                                {item.id}
                            </div>
                            <h3 className="font-serif font-bold text-lg text-charcoal group-hover:text-rust transition-colors">{item.title}</h3>
                        </div>
                        {item.status === 'completed' ? (
                            <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center shadow-md shadow-forest/20">
                                <Check size={16} />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                                <Clock size={16} />
                            </div>
                        )}
                    </div>
                    
                    <p className="text-stone-600 mb-6 text-sm leading-relaxed">
                        <span className="font-bold text-xs uppercase text-stone-400 mr-2">User Story:</span>
                        {item.description}
                    </p>

                    <div className="bg-stone-50 p-4 rounded-xl flex flex-wrap gap-4 items-center">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                            <Database size={12} /> Artifacts:
                        </div>
                        {item.deliverables.map(del => (
                            <span key={del} className="text-xs font-medium text-charcoal bg-white px-3 py-1 rounded border border-stone-200">
                                {del}
                            </span>
                        ))}
                    </div>
                </div>
            ))}

            <Link href="/academy/modules" className="block p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center text-stone-400 hover:border-rust/50 hover:text-rust hover:bg-rust/5 transition-all cursor-pointer group">
                <div className="w-12 h-12 mx-auto bg-stone-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Lock size={20} />
                </div>
                <p className="font-serif font-bold text-lg">+ 12 More Stories Pending Labs</p>
                <p className="text-xs mt-2">Complete Module 3 to unlock "Rating Engine" stories.</p>
            </Link>
        </div>

      </div>
    </div>
  );
};