
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
  const triggerPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    if (type === 'date') {
      const input = e.currentTarget;
      try {
        if (typeof (input as any).showPicker === 'function') {
          (input as any).showPicker();
        }
      } catch (err) {
        console.warn("Picker error:", err);
      }
    }
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onMouseDown={triggerPicker}
        className={`bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all ${type === 'date' ? 'cursor-pointer' : ''}`}
      />
    </div>
  );
};

export const Select: React.FC<FieldProps> = ({ label, name, value, onChange, options = [], className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all cursor-pointer"
    >
      <option value="">Selecione...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const TextArea: React.FC<FieldProps> = ({ label, name, value, onChange, placeholder, className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all resize-none"
    />
  </div>
);
