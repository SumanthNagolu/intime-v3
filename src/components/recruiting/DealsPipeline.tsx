'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import Link from 'next/link';
import { MoreHorizontal, DollarSign, Search, Filter, ArrowUpRight, GripVertical } from 'lucide-react';
import { Deal } from '../../types';

const STAGES: Deal['stage'][] = ['Prospect', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export const DealsPipeline: React.FC = () => {
  const { deals, updateDeal } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
      setDraggedDealId(dealId);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, stage: Deal['stage']) => {
      e.preventDefault();
      if (draggedDealId) {
          const deal = deals.find(d => d.id === draggedDealId);
          if (deal && deal.stage !== stage) {
              updateDeal({ ...deal, stage });
          }
          setDraggedDealId(null);
      }
  };

  // Filter logic
  const filteredDeals = deals.filter(d => 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in h-[calc(100vh-200px)] flex flex-col">
      
      {/* Controls */}
      <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm w-96">
              <Search size={18} className="text-stone-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search pipeline..." 
                className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="text-sm text-stone-500 font-bold">
              Total Pipeline Value: <span className="text-charcoal">$780,000</span>
          </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max px-1">
              {STAGES.map(stage => {
                  const stageDeals = filteredDeals.filter(d => d.stage === stage);
                  const stageValue = stageDeals.reduce((acc, d) => acc + parseInt(d.value.replace(/[^0-9]/g, '') || '0'), 0);
                  
                  return (
                      <div 
                        key={stage} 
                        className="w-80 flex flex-col bg-stone-50/50 rounded-2xl border border-stone-200/50 h-full"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage)}
                      >
                          {/* Column Header */}
                          <div className="p-4 border-b border-stone-200 bg-stone-50 rounded-t-2xl">
                              <div className="flex justify-between items-center mb-1">
                                  <h3 className="font-bold text-charcoal text-sm uppercase tracking-wide">{stage}</h3>
                                  <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-stone-400 border border-stone-100">{stageDeals.length}</span>
                              </div>
                              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                  ${stageValue.toLocaleString()}
                              </div>
                          </div>

                          {/* Drop Zone / List */}
                          <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide">
                              {stageDeals.map(deal => (
                                  <div
                                    key={deal.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, deal.id)}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:border-rust/50 cursor-grab active:cursor-grabbing group transition-all"
                                  >
                                      <div className="flex justify-between items-start mb-3">
                                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">{deal.company}</div>
                                          <Link href={`/employee/recruiting/deals/${deal.id}`} className="text-stone-300 hover:text-charcoal">
                                              <MoreHorizontal size={16} />
                                          </Link>
                                      </div>
                                      <h4 className="font-serif font-bold text-charcoal text-sm mb-3 leading-tight">{deal.title}</h4>
                                      
                                      <div className="flex justify-between items-center">
                                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{deal.value}</span>
                                          <div className="flex items-center gap-1 text-[10px] text-stone-400 font-bold">
                                              {deal.probability}% <div className={`w-1.5 h-1.5 rounded-full ${deal.probability > 75 ? 'bg-green-500' : deal.probability > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                              {stageDeals.length === 0 && (
                                  <div className="h-full flex items-center justify-center border-2 border-dashed border-stone-200 rounded-xl opacity-50 min-h-[100px]">
                                      <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">Drop Here</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};
