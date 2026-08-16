'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('AUTHENTICATION FAILED');
      setIsLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh(); // Refresh to apply proxy session state correctly
    }
  };

  return (
    <>
      <div className="mb-10">
        <h2 className="text-2xl font-light text-white tracking-wide mb-2">System Access</h2>
        <p className="text-white/50 text-sm font-light tracking-wide">Enter credentials to proceed</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 flex gap-3 text-red-200 backdrop-blur-md rounded-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest font-semibold">{error}</span>
            <span className="text-xs mt-1 text-red-300/80">Invalid email or password.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Email Designation</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-none px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-black/40 transition-all font-light text-sm"
            placeholder="manager@facility.com"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
           <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Security Key</label>
            <Link 
              href="/forgot-password" 
              className="text-[10px] uppercase tracking-[0.1em] text-white/40 hover:text-white transition-colors"
            >
              Reset
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-none px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-black/40 transition-all font-light text-sm tracking-[0.2em]"
            placeholder="••••••••••••"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-6 w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 py-4 px-6 text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
        >
          <span>{isLoading ? 'Authenticating...' : 'Initialize Session'}</span>
          {!isLoading && <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>
    </>
  );
}
