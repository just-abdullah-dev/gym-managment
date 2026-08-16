import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', fullWidth, children, icon, ...props }, ref) => {
    
    let variantClasses = '';
    if (variant === 'primary') {
      variantClasses = 'bg-brand-primary text-white hover:bg-brand-primary-hover active:translate-y-0 hover:-translate-y-[1px]';
    } else if (variant === 'secondary') {
      variantClasses = 'bg-gray-200 text-gray-900 hover:bg-gray-300';
    } else if (variant === 'outline') {
      variantClasses = 'bg-transparent border border-gray-300 text-gray-900 hover:bg-gray-50';
    }
    
    const baseClasses = 'inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-4 py-2.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${widthClass} ${className}`.trim()}
        {...props}
      >
        {children}
        {icon && <span className="flex items-center">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
