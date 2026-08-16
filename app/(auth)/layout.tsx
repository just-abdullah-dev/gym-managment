import React from 'react';
import { Dumbbell } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-brand-bg">
      {/* Left Pane (Image Background) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/90"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-3">
            <Dumbbell className="text-white" size={32} />
            <span className="text-2xl font-bold tracking-tight">GymSync</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Active Precision.</h1>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Empower your staff, streamline operations, and elevate the
              member experience with the industry's most disciplined
              management platform.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Pane (Form Area) */}
      <div className="flex flex-col w-full lg:w-1/2 p-8 lg:p-12 justify-center bg-brand-card">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex flex-col items-center mb-8 lg:hidden mt-8">
          <div className="bg-brand-primary rounded-lg p-3 flex items-center justify-center mb-4 shadow-md shadow-brand-primary/20">
            <Dumbbell size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-brand-primary tracking-tight">GymSync</span>
        </div>
        
        <div className="w-full max-w-md mx-auto flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
