import React from 'react';
import { Hammer, Sparkles, Construction } from 'lucide-react';

interface ComingSoonPlaceholderProps {
  moduleName: string;
}

export function ComingSoonPlaceholder({ moduleName }: ComingSoonPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500/20 to-teal-400/20 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
          <Construction size={40} className="text-teal-500 opacity-80" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 animate-pulse">
          <Sparkles size={14} className="text-teal-400" />
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        {moduleName} — Coming Soon
      </h2>
      <p className="text-[15px] font-medium text-slate-500 max-w-md leading-relaxed">
        We're actively building the {moduleName} module. The design and functionality will be available in a future update!
      </p>
      
      <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <Hammer size={14} className="text-slate-400" />
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Under Construction</span>
      </div>
    </div>
  );
}
