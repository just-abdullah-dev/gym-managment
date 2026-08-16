import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, trailingIcon, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1" htmlFor={props.id || props.name}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-4 text-white/40 flex items-center justify-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-3 text-sm font-light text-white bg-black/20 border rounded-none outline-none transition-all placeholder:text-white/20 disabled:bg-black/40 disabled:text-white/40 disabled:cursor-not-allowed ${
              icon ? 'pl-12' : ''
            } ${trailingIcon ? 'pr-12' : ''} ${
              error
                ? 'border-red-500/50 focus:border-red-500 focus:bg-black/40'
                : 'border-white/10 focus:border-white/50 focus:bg-black/40'
            }`}
            id={props.id || props.name}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-4 text-white/40 flex items-center justify-center cursor-pointer hover:text-white transition-colors">
              {trailingIcon}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-red-400 uppercase tracking-widest font-semibold mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
