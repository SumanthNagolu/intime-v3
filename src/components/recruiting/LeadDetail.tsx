'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, Building2, Mail, Phone, Calendar, CheckCircle, ArrowRight, Plus, MessageSquare, User, Send, Clock, Linkedin, FileText, Bell } from 'lucide-react';
import { Deal } from '../../types';
import { CommunicationLog } from '../shared/CommunicationLog';

export const LeadDetail: React.FC = () => {
  const { leadId } = useParams();
  const router = useRouter();
  const { leads, updateLead, addDeal } = useAppStore();
  const lead = leads.find(l => l.id === leadId);
  
  // Playground State
  const [activeTab, setActiveTab] = useState<'Email' | 'Task' | 'Log'>('Email');
  const [activityLog, setActivityLog] = useState([
      { id: '1', type: 'email', title: 'Intro Email Sent', content: "Checking in on Q4 hiring plans...", date: 'Today, 10:00 AM', author: 'You' },
      { id: '2', type: 'linkedin', title: 'Lead Created', content: "Imported from LinkedIn", date: '2 days ago', author: 'System' }
  ]);

  // Composer State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [logType, setLogType] = useState('Call');
  const [logNote, setLogNote] = useState('');

  if (!lead) return <div className="p-8 text-center text-stone-500">Lead not found. Check ID: {leadId}</div>;

  const handleConvertToDeal = () => {
      const newDeal: Deal = {
          id: `d${Date.now()}`,
          leadId: lead.id,
          company: lead.company,
          title: `New Deal - ${lead.company}`,
          value: lead.value || '$0',
          stage: 'Prospect',
          probability: 20,
          expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ownerId: 'current-user'
      };
      addDeal(newDeal);
      updateLead({ ...lead, status: 'converted' });
      router.push(`/employee/recruiting/deals/${newDeal.id}`);
  };

  const handleAddActivity = () => {
      let newActivity;
      const date = "Just now";

      if (activeTab === 'Email') {
          newActivity = { id: Date.now().toString(), type: 'email', subject: emailSubject, content: emailBody, date, author: 'You' };
          setEmailSubject('');
          setEmailBody('');
      } else if (activeTab === 'Task') {
          newActivity = { id: Date.now().toString(), type: 'note', subject: 'Task Created', content: `${taskName} (Due: ${taskDate})`, date, author: 'You' };
          setTaskName('');
          setTaskDate('');
      } else {
          newActivity = { id: Date.now().toString(), type: logType.toLowerCase(), subject: `${logType} Logged`, content: logNote, date, author: 'You' };
          setLogNote('');
      }

      setActivityLog([newActivity as any, ...activityLog]);
  };

  return (
    <div className="animate-fade-in">
      <Link href="/employee/recruiting/leads" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Leads
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Info Card */}
          <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-stone-100 z-0"></div>
                  <div className="relative z-10 text-center">
                      <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-stone-100">
                          <Building2 size={40} className="text-rust" />
                      </div>
                      <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">{lead.company}</h1>
                      <p className="text-stone-500 text-sm mb-6 flex items-center justify-center gap-2">
                          <User size={14} /> {lead.firstName} {lead.lastName}
                      </p>
                      
                      <div className="flex justify-center gap-2 mb-8">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              lead.status === 'warm' ? 'bg-orange-50 text-orange-600' : 
                              lead.status === 'converted' ? 'bg-green-50 text-green-600' :
                              'bg-stone-100 text-stone-500'
                          }`}>
                              {lead.status}
                          </span>
                          <span className="px-3 py-1 bg-stone-50 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-stone-100">
                              {lead.source}
                          </span>
                      </div>

                      <div className="space-y-4 text-left border-t border-stone-100 pt-6">
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <Mail size={16} className="text-stone-400" />
                              <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <Phone size={16} className="text-stone-400" />
                              <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <Calendar size={16} className="text-stone-400" />
                              <span>Last Activity: {lead.lastAction}</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Est. Value</h3>
                      <div className="p-2 bg-white/10 rounded-lg text-green-400"><CheckCircle size={16}/></div>
                  </div>
                  <div className="text-4xl font-serif font-bold mb-8">{lead.value}</div>
                  <button 
                    onClick={handleConvertToDeal}
                    disabled={lead.status === 'converted'}
                    className="w-full py-4 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {lead.status === 'converted' ? 'Converted' : 'Convert to Deal'} <ArrowRight size={14} />
                  </button>
              </div>
          </div>

          {/* Right: The Playground */}
          <div className="flex-1 space-y-6">
              
              {/* Activity Composer */}
              <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
                  <div className="flex border-b border-stone-100">
                      {[
                          { id: 'Email', icon: Mail },
                          { id: 'Task', icon: CheckCircle },
                          { id: 'Log', icon: FileText }
                      ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                                activeTab === tab.id 
                                ? 'bg-white text-charcoal border-b-2 border-rust' 
                                : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                            }`}
                          >
                              <tab.icon size={14} /> {tab.id}
                          </button>
                      ))}
                  </div>

                  <div className="p-6">
                      {activeTab === 'Email' && (
                          <div className="space-y-4 animate-fade-in">
                              <div className="flex gap-4">
                                  <input 
                                    className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                                    placeholder="Subject"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                  />
                                  <button className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-400 hover:text-charcoal hover:border-charcoal transition-colors">
                                      <Clock size={18} />
                                  </button>
                              </div>
                              <textarea 
                                className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                                placeholder="Write your email..."
                                value={emailBody}
                                onChange={e => setEmailBody(e.target.value)}
                              />
                              <div className="flex justify-between items-center">
                                  <div className="flex gap-2">
                                      <button className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest">Templates</button>
                                  </div>
                                  <button onClick={handleAddActivity} className="px-6 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2">
                                      Send Now <Send size={14} />
                                  </button>
                              </div>
                          </div>
                      )}

                      {activeTab === 'Task' && (
                          <div className="space-y-4 animate-fade-in">
                              <input 
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                                placeholder="Task Description (e.g. Follow up call)"
                                value={taskName}
                                onChange={e => setTaskName(e.target.value)}
                              />
                              <div className="flex gap-4">
                                  <div className="flex-1 flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                      <Calendar size={16} className="text-stone-400" />
                                      <input 
                                        type="date" 
                                        className="bg-transparent outline-none text-sm w-full text-charcoal"
                                        value={taskDate}
                                        onChange={e => setTaskDate(e.target.value)}
                                      />
                                  </div>
                                  <div className="flex-1 flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                      <User size={16} className="text-stone-400" />
                                      <select className="bg-transparent outline-none text-sm w-full text-charcoal">
                                          <option>Assign to Me</option>
                                          <option>Assign to Team</option>
                                      </select>
                                  </div>
                              </div>
                              <div className="flex justify-end">
                                  <button onClick={handleAddActivity} className="px-6 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2">
                                      Create Task <CheckCircle size={14} />
                                  </button>
                              </div>
                          </div>
                      )}

                      {activeTab === 'Log' && (
                          <div className="space-y-4 animate-fade-in">
                              <div className="flex gap-2">
                                  {['Call', 'Meeting', 'LinkedIn', 'Note'].map(type => (
                                      <button 
                                        key={type}
                                        onClick={() => setLogType(type)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${
                                            logType === type ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                                        }`}
                                      >
                                          {type}
                                      </button>
                                  ))}
                              </div>
                              <textarea 
                                className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                                placeholder={`Log details about this ${logType}...`}
                                value={logNote}
                                onChange={e => setLogNote(e.target.value)}
                              />
                              <div className="flex justify-end">
                                  <button onClick={handleAddActivity} className="px-6 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2">
                                      Save Log <FileText size={14} />
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Feed */}
              <CommunicationLog logs={activityLog as any} />
          </div>
      </div>
    </div>
  );
};
