
import React from 'react';
import { Mail, Phone, MessageSquare, Calendar, User, FileText, Clock } from 'lucide-react';

export interface LogEntry {
  id: string;
  type: 'email' | 'call' | 'note' | 'linkedin' | 'meeting';
  subject?: string;
  content: string;
  date: string;
  author: string;
}

interface CommunicationLogProps {
  logs: LogEntry[];
}

export const CommunicationLog: React.FC<CommunicationLogProps> = ({ logs }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
      <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Communication Log</h3>
      <div className="space-y-6 relative">
        <div className="absolute left-4 top-4 bottom-4 w-px bg-stone-100"></div>
        {logs.length === 0 ? (
            <p className="text-stone-400 text-sm italic pl-10">No activity recorded yet.</p>
        ) : (
            logs.map((log) => (
            <div key={log.id} className="relative pl-10 group">
                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${
                    log.type === 'email' ? 'bg-blue-50 text-blue-600' :
                    log.type === 'call' ? 'bg-green-50 text-green-600' :
                    log.type === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                    log.type === 'meeting' ? 'bg-purple-50 text-purple-600' :
                    'bg-stone-100 text-stone-500'
                }`}>
                    {log.type === 'email' && <Mail size={14} />}
                    {log.type === 'call' && <Phone size={14} />}
                    {log.type === 'linkedin' && <MessageSquare size={14} />}
                    {log.type === 'meeting' && <Calendar size={14} />}
                    {log.type === 'note' && <FileText size={14} />}
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-charcoal uppercase tracking-wide">{log.subject || log.type}</span>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1"><Clock size={10}/> {log.date}</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{log.content}</p>
                    <div className="mt-3 pt-3 border-t border-stone-200/50 text-[10px] text-stone-400 font-medium flex items-center gap-1">
                        <User size={10} /> By {log.author}
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};
