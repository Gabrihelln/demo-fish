
import React from 'react';

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'date' | 'email' | 'number' | 'tel';
  options?: string[];
  placeholder?: string;
  className?: string;
}

export const Input: React.FC<FieldProps> = ({ label, name, value, onChange, type = 'text', placeholder, className = '' }) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${type === 'date' ? 'cursor-pointer' : ''}`}
      />
    </div>
  );
};

export const Select: React.FC<FieldProps> = ({ label, name, value, onChange, options = [], className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all cursor-pointer appearance-none"
    >
      <option value="">Selecione...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const TextArea: React.FC<FieldProps> = ({ label, name, value, onChange, placeholder, className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all resize-none"
    />
  </div>
);
