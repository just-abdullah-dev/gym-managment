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
      variantClasses = 'bg-white text-black hover:bg-gray-200 uppercase tracking-[0.2em] font-semibold text-xs rounded-sm';
    } else if (variant === 'secondary') {
      variantClasses = 'bg-black/20 border border-white/10 text-white hover:bg-black/40 hover:border-white/20 uppercase tracking-[0.2em] font-medium text-xs rounded-sm backdrop-blur-md';
    } else if (variant === 'outline') {
      variantClasses = 'bg-transparent border border-white/20 text-white hover:bg-white/10 uppercase tracking-[0.2em] font-medium text-xs rounded-sm';
    }
    
    const baseClasses = 'inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed group';
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
