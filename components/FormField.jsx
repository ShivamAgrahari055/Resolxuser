import { useId } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export function FormField({ id, name, label, type = 'text', value, onChange, error, required = false, helper, as: Component = 'input', ...props }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = fieldId + '-error';
  const hasError = !!error;

  const inputClass = 'w-full rounded-xl border px-4 py-3 text-sm transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 outline-none bg-white/5 border-white/10 text-white placeholder-slate-500';
  const errorBorder = 'border-red-500/50 focus-visible:ring-red-500';
  const normalBorder = 'hover:border-white/30';
  const finalClass = hasError ? errorBorder : normalBorder;

  return (
    <div className="mb-5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-cyan-400 ml-1" aria-hidden="true">*</span>}
      </label>
      <Component
        id={fieldId}
        className={inputClass + ' ' + finalClass}
        {...(Component === 'input' ? {
          type: type,
          value: value,
          onChange: onChange,
          name: name,
          required: required,
          'aria-invalid': hasError || undefined,
          'aria-required': required,
          'aria-describedby': hasError ? errorId : undefined,
        } : { ...props, name: name, value: value, onChange: onChange })}
        {...props}
      />
      {hasError && (
        <p id={errorId} role="alert" className="mt-2 flex items-center gap-2 text-xs text-red-400 font-medium animate-fade-in">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      {!hasError && helper && (
        <p className="mt-2 text-xs text-slate-500">{helper}</p>
      )}
    </div>
  );
}

export function ValidationMessage({ message }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-2 text-xs text-red-400 font-medium animate-fade-in" role="alert">
      <AlertTriangle size={14} />
      {message}
    </p>
  );
}
