import React from 'react';
import { Dumbbell } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-black relative selection:bg-white selection:text-black font-sans">
      {/* Immersive Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2000&auto=format&fit=crop')" }} 
      />
      
      {/* Sophisticated Dark Overlays */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[4px] z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-0" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col w-full min-h-screen items-center justify-center p-6 lg:p-12">
        
        {/* Brand Header */}
        <div className="absolute top-8 left-8 flex items-center gap-4 text-white/90 mix-blend-difference">
          <Dumbbell className="text-white" size={24} strokeWidth={1.5} />
          <span className="text-sm font-medium tracking-[0.3em] uppercase">GymSync</span>
        </div>

        {/* Glassmorphic Form Container */}
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 lg:p-12 shadow-2xl rounded-sm">
          {children}
        </div>
        
        {/* Footer info */}
        <div className="absolute bottom-8 text-white/30 text-[10px] uppercase tracking-[0.2em] font-light">
          Secured Core // Ver 2.0.4
        </div>
      </div>
    </div>
  );
}
