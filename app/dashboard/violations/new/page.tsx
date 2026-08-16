'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewViolationPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [memberId, setMemberId] = useState('');
  const [type, setType] = useState('Equipment Misuse');
  const [description, setDescription] = useState('');
  const [fineAmount, setFineAmount] = useState('0');

  useEffect(() => {
    async function loadMembers() {
      const { data } = await supabase.from('members').select('id, full_name, member_number').order('full_name');
      if (data) setMembers(data);
    }
    loadMembers();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('Not authenticated');

      // First get the gym_id for this user
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single();

      if (gymError || !gymData) throw new Error('Gym not found');

      const { error: insertError } = await supabase
        .from('violations')
        .insert({
          gym_id: gymData.id,
          member_id: memberId,
          type,
          description,
          fine_amount: parseFloat(fineAmount) || 0,
          created_by: userData.user.id
        });

      if (insertError) throw insertError;

      router.push('/dashboard/violations');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to record violation');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/violations" className="p-2 text-white/50 hover:text-white bg-black/40 rounded-sm border border-white/10 hover:border-white/30 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Record Violation</h1>
          <p className="text-white/50 text-xs tracking-wide uppercase">LOG DISCIPLINARY ISSUE OR FINE</p>
        </div>
      </div>

      <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md p-6">
        {error && (
          <div className="mb-6 p-4 rounded-sm bg-red-500/10 border border-red-500/30 flex gap-3 text-red-200 backdrop-blur-md text-xs uppercase tracking-widest font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Select Member</label>
            <select 
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            >
              <option value="" disabled>SELECT A MEMBER...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_number})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Violation Type</label>
            <select 
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="Equipment Misuse">EQUIPMENT MISUSE</option>
              <option value="Disruptive Behavior">DISRUPTIVE BEHAVIOR</option>
              <option value="Unauthorized Entry">UNAUTHORIZED ENTRY</option>
              <option value="Property Damage">PROPERTY DAMAGE</option>
              <option value="Late Payment">LATE PAYMENT</option>
              <option value="Other">OTHER</option>
            </select>
          </div>

          <Input
            label="Fine Amount ($)"
            type="number"
            min="0"
            step="0.01"
            value={fineAmount}
            onChange={(e) => setFineAmount(e.target.value)}
            placeholder="0.00"
          />

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Description</label>
            <textarea 
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 placeholder-white/30 tracking-widest transition-colors"
              rows={4}
              placeholder="PROVIDE DETAILS ABOUT THE INCIDENT..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
            <Link href="/dashboard/violations">
              <Button type="button" variant="outline">CANCEL</Button>
            </Link>
            <Button type="submit" className="gap-2" disabled={isLoading || !memberId}>
              <Save size={16} />
              {isLoading ? 'SAVING...' : 'RECORD VIOLATION'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
