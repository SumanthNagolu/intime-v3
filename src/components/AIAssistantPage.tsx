'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, MessageSquare, Terminal, Code, Cpu, Loader2, Trash2 } from 'lucide-react';
import { generateCollaboratorResponse } from '@/services/geminiService';
import { ChatSession, ChatMessage } from '@/lib/types';
import { useAppStore } from '@/lib/store';

export const AIAssistantPage: React.FC = () => {
  const { hasKey, checkKey } = useAppStore();
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
        id: '1',
        title: 'Module 3: Entity Debugging',
        lastModified: new Date(),
        messages: [
            { id: '1', role: 'model', content: "Hey! I'm ready to pair program. I see you're working on the Vehicle entity extension. Run into any issues with the column definitions?", timestamp: new Date() }
        ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages, isThinking]);

  const handleCreateSession = () => {
      const newSession: ChatSession = {
          id: Date.now().toString(),
          title: 'New Discussion',
          lastModified: new Date(),
          messages: [{ id: 'init', role: 'model', content: "New context started. What module or ticket are we working on?", timestamp: new Date() }]
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      if (activeSessionId === id && newSessions.length > 0) {
          setActiveSessionId(newSessions[0].id);
      }
  };

  const handleSend = async () => {
      if (!inputValue.trim()) return;
      
      const win = window as any;
      if (!hasKey) {
          if (win.aistudio?.openSelectKey) await win.aistudio.openSelectKey();
          checkKey();
          return;
      }

      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: inputValue,
          timestamp: new Date()
      };

      // Optimistic update
      const updatedSession = { 
          ...activeSession, 
          messages: [...activeSession.messages, userMsg],
          lastModified: new Date()
      };
      
      setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
      setInputValue('');
      setIsThinking(true);

      try {
          const history = updatedSession.messages.map(m => ({ role: m.role, content: m.content }));
          const aiResponse = await generateCollaboratorResponse(history, userMsg.content);
          
          const aiMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: aiResponse,
              timestamp: new Date()
          };

          setSessions(prev => prev.map(s => {
              if (s.id === activeSessionId) {
                  // Update title if it's the first user message
                  const title = s.messages.length <= 1 ? userMsg.content.slice(0, 30) + "..." : s.title;
                  return { ...s, messages: [...s.messages, aiMsg], title };
              }
              return s;
          }));
      } catch (err) {
          console.error(err);
      } finally {
          setIsThinking(false);
      }
  };

  return (
    <div className="animate-fade-in pt-4 h-[calc(100vh-120px)] flex gap-6">
       {/* Sidebar */}
       <div className="w-80 bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-100 flex flex-col overflow-hidden shrink-0">
           <div className="p-6 border-b border-stone-100">
               <button 
                 onClick={handleCreateSession}
                 className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-rust transition-colors"
               >
                   <Plus size={16} /> New Thread
               </button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {sessions.map(session => (
                   <div 
                     key={session.id}
                     onClick={() => setActiveSessionId(session.id)}
                     className={`group p-4 rounded-xl cursor-pointer transition-all border ${activeSessionId === session.id ? 'bg-stone-50 border-stone-200 shadow-inner' : 'bg-transparent border-transparent hover:bg-white hover:border-stone-100'}`}
                   >
                       <div className="flex justify-between items-start mb-1">
                           <h4 className={`font-serif font-bold text-sm truncate pr-2 ${activeSessionId === session.id ? 'text-charcoal' : 'text-stone-500'}`}>{session.title}</h4>
                           <button onClick={(e) => handleDeleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-opacity">
                               <Trash2 size={14} />
                           </button>
                       </div>
                       <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                           {session.lastModified.toLocaleDateString()}
                       </p>
                   </div>
               ))}
           </div>
       </div>

       {/* Main Chat Area */}
       <div className="flex-1 bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-100 flex flex-col overflow-hidden bg-noise relative">
           
           {/* Header */}
           <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white/50 backdrop-blur-sm z-10">
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-rust/10 text-rust flex items-center justify-center">
                       <Cpu size={20} />
                   </div>
                   <div>
                       <h2 className="font-serif font-bold text-charcoal">AI Fellow Developer</h2>
                       <div className="flex items-center gap-2 text-xs text-stone-500">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                           Online • Context: Guidewire PC 10
                       </div>
                   </div>
               </div>
               {!hasKey && (
                   <div className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                       API Key Required
                   </div>
               )}
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
               {activeSession.messages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-3xl rounded-2xl p-6 ${
                           msg.role === 'user' 
                           ? 'bg-stone-100 text-charcoal rounded-tr-none' 
                           : 'bg-white border border-stone-200 shadow-sm rounded-tl-none'
                       }`}>
                           <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] uppercase tracking-widest font-bold">
                               {msg.role === 'user' ? <UserIcon /> : <BotIcon />}
                               {msg.role === 'user' ? 'You' : 'Fellow Dev'}
                           </div>
                           <div className="prose prose-stone text-sm leading-relaxed font-serif whitespace-pre-wrap">
                               {msg.content}
                           </div>
                       </div>
                   </div>
               ))}
               
               {isThinking && (
                   <div className="flex justify-start">
                       <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-6 shadow-sm flex items-center gap-3">
                           <Loader2 size={18} className="animate-spin text-rust" />
                           <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Reviewing Code...</span>
                       </div>
                   </div>
               )}
               <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-6 bg-white border-t border-stone-100 z-10">
               <div className="relative">
                   <textarea
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     placeholder="Ask for a code review, architectural advice, or debugging help..."
                     className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-6 pr-16 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rust/20 focus:border-rust transition-all resize-none h-20"
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             handleSend();
                         }
                     }}
                   />
                   <button 
                     onClick={handleSend}
                     disabled={!inputValue.trim() || isThinking}
                     className="absolute right-3 top-3 bottom-3 w-14 bg-charcoal text-white rounded-xl flex items-center justify-center hover:bg-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                   >
                       <Send size={18} />
                   </button>
               </div>
               <div className="flex gap-4 mt-3 pl-2">
                   <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-charcoal transition-colors">
                       <Code size={12} /> Insert Snippet
                   </button>
                   <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-charcoal transition-colors">
                       <Terminal size={12} /> Paste Error Log
                   </button>
               </div>
           </div>
       </div>
    </div>
  );
};

const UserIcon = () => (
    <div className="w-4 h-4 bg-stone-300 rounded-full"></div>
);

const BotIcon = () => (
    <div className="w-4 h-4 bg-rust rounded-full"></div>
);