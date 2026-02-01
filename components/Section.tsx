
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm mb-8 overflow-hidden">
    <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-50">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
    </div>
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  </div>
);
