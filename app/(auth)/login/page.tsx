'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(`Invalid Credentials\n${authError.message}`);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh(); // Refresh to apply middleware session state correctly
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3 text-red-800">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Authentication Failed</span>
            <span className="text-sm mt-1 text-red-700 whitespace-pre-line">
              {error}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="manager@facility.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <div className="flex justify-between items-center absolute -top-7 right-0 w-full">
            <span className="invisible">Password</span> {/* For spacing alignment if needed */}
            <Link 
              href="/forgot-password" 
              className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailingIcon={
              showPassword ? (
                <EyeOff size={18} onClick={() => setShowPassword(false)} />
              ) : (
                <Eye size={18} onClick={() => setShowPassword(true)} />
              )
            }
            required
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me for 30 days
          </label>
        </div>

        <Button type="submit" fullWidth className="mt-2" disabled={isLoading}>
          {isLoading ? 'Logging in...' : (
            <>
              Login <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Need help accessing your account?{' '}
        <Link href="#" className="font-medium text-brand-primary hover:text-brand-primary-hover">
          Contact Support
        </Link>
      </div>

    </>
  );
}
