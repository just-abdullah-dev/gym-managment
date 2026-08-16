'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setEmail(data.user.email);
      }
    }
    loadUser();
  }, [supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Password updated successfully.");
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Account Settings</h1>
        <p className="text-white/50 text-xs tracking-wide uppercase">MANAGE CREDENTIALS AND PREFERENCES</p>
      </div>

      <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <User size={18} className="text-white/50" />
            <h2 className="text-sm font-light text-white tracking-widest uppercase">Profile Information</h2>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-6">YOUR CURRENT LOGIN EMAIL ADDRESS.</p>
          
          <div className="max-w-md">
            <Input
              label="Email Address"
              type="email"
              value={email}
              disabled
              className="bg-black/40 border border-white/10 text-white/50 cursor-not-allowed font-light"
            />
            <p className="text-[10px] uppercase tracking-widest text-white/30 mt-3">
              NOTE: CONTACT SUPPORT IF YOU NEED TO CHANGE YOUR REGISTERED EMAIL ADDRESS.
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={18} className="text-white/50" />
            <h2 className="text-sm font-light text-white tracking-widest uppercase">Update Password</h2>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-6">ENSURE YOUR ACCOUNT IS USING A LONG, RANDOM PASSWORD.</p>
          
          {error && (
            <div className="mb-6 p-4 rounded-sm bg-red-500/10 border border-red-500/30 flex gap-3 text-red-200">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span className="text-[10px] uppercase tracking-widest font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-sm bg-green-500/10 border border-green-500/30 flex gap-3 text-green-200">
              <CheckCircle className="shrink-0 mt-0.5" size={16} />
              <span className="text-[10px] uppercase tracking-widest font-semibold">{success}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <div className="pt-2">
              <Button type="submit" className="gap-2" disabled={isLoading || !newPassword}>
                <Save size={16} />
                {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
