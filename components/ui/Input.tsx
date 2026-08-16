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
          <label className="text-sm font-medium text-gray-900" htmlFor={props.id || props.name}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-gray-400 flex items-center justify-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full px-3 py-2.5 text-sm text-gray-900 bg-white border rounded-lg outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
              icon ? 'pl-10' : ''
            } ${trailingIcon ? 'pr-10' : ''} ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
            }`}
            id={props.id || props.name}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-3 text-gray-400 flex items-center justify-center cursor-pointer hover:text-gray-600 transition-colors">
              {trailingIcon}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-red-600 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
