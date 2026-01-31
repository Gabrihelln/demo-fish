
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
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onMouseDown={triggerPicker}
        className={`border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all ${type === 'date' ? 'cursor-pointer hover:border-blue-300' : ''}`}
      />
    </div>
  );
};

export const Select: React.FC<FieldProps> = ({ label, name, value, onChange, options = [], className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer hover:border-blue-300 transition-all"
    >
      <option value="">Selecione...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const TextArea: React.FC<FieldProps> = ({ label, name, value, onChange, placeholder, className = '' }) => (
  <div className={`flex flex-col space-y-1 ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none hover:border-blue-300 transition-all"
    />
  </div>
);
