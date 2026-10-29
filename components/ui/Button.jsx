import { forwardRef } from 'react';

export const Button = forwardRef(({ className = '', variant = 'primary', size = 'md', disabled = false, fullWidth = false, children, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none';
  const variants = {
    primary: 'bg-cyan-500 text-brand-navy shadow-cyan hover:bg-cyan-400 hover:shadow-cyan/50 active:scale-95',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-95',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5 active:scale-95',
    outline: 'border border-white/30 text-slate-200 hover:bg-white/10 hover:border-cyan-500 hover:text-cyan-400 active:scale-95',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';