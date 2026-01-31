
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
    <div className="border-b border-slate-100 px-6 py-3 bg-slate-50/50">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{title}</h3>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  </div>
);
