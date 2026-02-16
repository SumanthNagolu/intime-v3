'use client';

import { Wifi, Globe, Clock, Terminal } from 'lucide-react';

export const SystemBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-charcoal text-white/70 z-[60] flex items-center justify-between px-6 text-[10px] font-mono uppercase tracking-widest border-b border-white/10">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2 text-white">
          <Terminal size={10} /> INTIME_OS_V4.2
        </span>
        <span className="hidden md:inline text-stone-400">
          STATUS: <span className="text-green-500">OPERATIONAL</span>
        </span>
        <span className="hidden md:inline text-rust">LATENCY: 12ms</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          <Globe size={10} /> US-EAST-1
        </span>
        <span className="flex items-center gap-2">
          <Wifi size={10} /> ENCRYPTED
        </span>
        <span className="text-white font-bold">
          <Clock size={10} className="inline mr-1" />
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
        </span>
      </div>
    </div>
  );
};
