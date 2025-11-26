'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Terminal, Code, Cpu, Loader2, Trash2, TrendingUp, X, FileCode, AlertTriangle } from 'lucide-react';
import { generateCollaboratorResponse } from '@/services/geminiService';
import { ChatSession, ChatMessage } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useAcademyStore, useBiometric } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './academy/BiometricBackground';
import { cn } from '@/lib/utils';

// Supported languages for code snippets
const LANGUAGES = [
  { id: 'gosu', label: 'Gosu' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'sql', label: 'SQL' },
  { id: 'xml', label: 'XML' },
  { id: 'json', label: 'JSON' },
  { id: 'other', label: 'Other' },
];

export const AIAssistantPage: React.FC = () => {
  const { hasKey, checkKey } = useAppStore();
  const { streakDays } = useAcademyStore();
  const { state, theme, statusMessage } = useBiometric();
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

  // Modal state for code snippet and error log insertion
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [errorLog, setErrorLog] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('gosu');
  const [codeContext, setCodeContext] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Calculate total messages
  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);

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

    const win = window as unknown as { aistudio?: { openSelectKey?: () => Promise<void> } };
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

  // Handle inserting code snippet into the chat
  const handleInsertCode = () => {
    if (!codeSnippet.trim()) return;

    const langLabel = LANGUAGES.find(l => l.id === selectedLanguage)?.label || selectedLanguage;
    const contextText = codeContext.trim() ? `\n\nContext: ${codeContext}` : '';
    const formattedMessage = `Please review this ${langLabel} code:${contextText}\n\n\`\`\`${selectedLanguage}\n${codeSnippet}\n\`\`\``;

    setInputValue(formattedMessage);
    setShowCodeModal(false);
    setCodeSnippet('');
    setCodeContext('');
    setSelectedLanguage('gosu');
  };

  // Handle inserting error log into the chat
  const handleInsertErrorLog = () => {
    if (!errorLog.trim()) return;

    const formattedMessage = `I'm encountering this error. Can you help me debug it?\n\n\`\`\`\n${errorLog}\n\`\`\``;

    setInputValue(formattedMessage);
    setShowErrorModal(false);
    setErrorLog('');
  };

  return (
    <div className="animate-fade-in pt-4 pb-12">

      {/* ============================================
          HERO HEADER - Mission Control Style
          ============================================ */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b-2 border-charcoal-100">
        <div>
          {/* Biometric Status */}
          <div className="mb-4">
            <BiometricStatusIndicator state={state} statusMessage={statusMessage} />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-heading font-black text-charcoal-900 mb-4 tracking-tight leading-none">
            AI<br />Assistant
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;Your AI pair programmer for code reviews and debugging.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Sessions - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {sessions.length}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Active Threads
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{totalMessages} messages</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Context</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-heading font-bold text-charcoal-900">
                    Guidewire PC 10
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-charcoal-100">
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Streak Days</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-charcoal-700">
                    {streakDays}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-body">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CHAT INTERFACE
          ============================================ */}
      <div className="flex gap-6 h-[calc(100vh-380px)] min-h-[500px]">
        {/* Sidebar */}
        <div className="w-72 bg-white rounded-2xl border-2 border-charcoal-100 shadow-elevation-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-charcoal-100">
            <button
              onClick={handleCreateSession}
              className="w-full flex items-center justify-center gap-2 bg-charcoal-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-charcoal-800 transition-colors font-body"
            >
              <Plus size={16} /> New Thread
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all border-2 ${activeSessionId === session.id ? 'bg-charcoal-50 border-charcoal-200' : 'bg-transparent border-transparent hover:bg-charcoal-50 hover:border-charcoal-100'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-heading font-bold text-sm truncate pr-2 ${activeSessionId === session.id ? 'text-charcoal-900' : 'text-charcoal-500'}`}>{session.title}</h4>
                  <button onClick={(e) => handleDeleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 text-charcoal-300 hover:text-red-400 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-charcoal-400 uppercase tracking-widest font-body font-bold">
                  {session.lastModified.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white rounded-2xl border-2 border-charcoal-100 shadow-elevation-sm flex flex-col overflow-hidden relative">

          {/* Header */}
          <div className="p-6 border-b border-charcoal-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
                }}
              >
                <Cpu size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-charcoal-900">AI Fellow Developer</h2>
                <div className="flex items-center gap-2 text-xs text-charcoal-500 font-body">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online • Context: Guidewire PC 10
                </div>
              </div>
            </div>
            {!hasKey && (
              <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 font-body">
                API Key Required
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
            {activeSession.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-2xl p-6 ${msg.role === 'user'
                    ? 'bg-charcoal-100 text-charcoal-900 rounded-tr-none'
                    : 'bg-white border-2 border-charcoal-100 shadow-elevation-sm rounded-tl-none'
                  }`}>
                  <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-widest font-bold font-body text-charcoal-400">
                    {msg.role === 'user' ? <UserIcon /> : <BotIcon theme={theme} />}
                    {msg.role === 'user' ? 'You' : 'Fellow Dev'}
                  </div>
                  <div className="text-sm leading-relaxed font-body whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-charcoal-100 rounded-2xl rounded-tl-none p-6 shadow-elevation-sm flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-charcoal-600" />
                  <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest font-body">Reviewing Code...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-charcoal-100 z-10">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask for a code review, architectural advice, or debugging help..."
                className="w-full bg-charcoal-50 border-2 border-charcoal-100 rounded-2xl pl-6 pr-16 py-4 text-sm focus:outline-none focus:border-charcoal-900 transition-all resize-none h-20 font-body"
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
                className="absolute right-3 top-3 bottom-3 w-14 bg-charcoal-900 text-white rounded-xl flex items-center justify-center hover:bg-charcoal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-elevation-sm"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="flex gap-4 mt-3 pl-2">
              <button
                onClick={() => setShowCodeModal(true)}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-charcoal-400 hover:text-charcoal-700 transition-colors font-body"
              >
                <Code size={12} /> Insert Snippet
              </button>
              <button
                onClick={() => setShowErrorModal(true)}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-charcoal-400 hover:text-charcoal-700 transition-colors font-body"
              >
                <Terminal size={12} /> Paste Error Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          CODE SNIPPET MODAL
          ============================================ */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-elevation-lg border-2 border-charcoal-100 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-charcoal-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
                  }}
                >
                  <FileCode size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-charcoal-900">Insert Code Snippet</h3>
                  <p className="text-xs text-charcoal-500 font-body">Paste your code for review or debugging</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setCodeSnippet('');
                  setCodeContext('');
                }}
                className="text-charcoal-400 hover:text-charcoal-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Language Selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 mb-2 block font-body">
                  Language
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold font-body transition-all",
                        selectedLanguage === lang.id
                          ? "bg-charcoal-900 text-white"
                          : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 mb-2 block font-body">
                  Context (Optional)
                </label>
                <input
                  type="text"
                  value={codeContext}
                  onChange={(e) => setCodeContext(e.target.value)}
                  placeholder="e.g., Entity extension for PolicyLine, Module 3 Lab..."
                  className="w-full bg-charcoal-50 border-2 border-charcoal-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-charcoal-900 transition-all font-body"
                />
              </div>

              {/* Code Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 mb-2 block font-body">
                  Code Snippet
                </label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full bg-charcoal-50 border-2 border-charcoal-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-charcoal-900 transition-all resize-none h-48 font-mono"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-charcoal-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setCodeSnippet('');
                  setCodeContext('');
                }}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-charcoal-600 hover:text-charcoal-900 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertCode}
                disabled={!codeSnippet.trim()}
                className="px-6 py-3 bg-charcoal-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-charcoal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                Insert & Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          ERROR LOG MODAL
          ============================================ */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-elevation-lg border-2 border-charcoal-100 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-charcoal-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-charcoal-900">Paste Error Log</h3>
                  <p className="text-xs text-charcoal-500 font-body">Share your error for debugging assistance</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorLog('');
                }}
                className="text-charcoal-400 hover:text-charcoal-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 mb-2 block font-body">
                Error Log / Stack Trace
              </label>
              <textarea
                value={errorLog}
                onChange={(e) => setErrorLog(e.target.value)}
                placeholder="Paste your error message, exception, or stack trace here..."
                className="w-full bg-charcoal-50 border-2 border-charcoal-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-charcoal-900 transition-all resize-none h-64 font-mono"
              />
              <p className="mt-2 text-xs text-charcoal-400 font-body">
                Tip: Include the full stack trace for better debugging assistance.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-charcoal-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorLog('');
                }}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-charcoal-600 hover:text-charcoal-900 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertErrorLog}
                disabled={!errorLog.trim()}
                className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserIcon = () => (
  <div className="w-4 h-4 bg-charcoal-400 rounded-full"></div>
);

const BotIcon = ({ theme }: { theme: { gradientFrom: string; gradientTo: string } }) => (
  <div
    className="w-4 h-4 rounded-full"
    style={{
      background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
    }}
  ></div>
);
