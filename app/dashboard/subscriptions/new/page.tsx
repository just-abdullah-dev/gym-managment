'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSubscriptionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('members')
        .select('id, full_name, member_number')
        .order('full_name', { ascending: true });
      if (data) setMembers(data);
    };
    fetchMembers();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const memberId = formData.get('memberId') as string;
    const planName = formData.get('planName') as string;
    const price = parseFloat(formData.get('price') as string);
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const paymentStatus = formData.get('paymentStatus') as 'PAID' | 'PARTIAL' | 'UNPAID';
    const status = formData.get('status') as 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      setError('You must be logged in to do this.');
      setIsSubmitting(false);
      return;
    }

    const { data: gym } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.user.id)
      .limit(1)
      .single();

    if (!gym) {
      setError('Could not identify your gym.');
      setIsSubmitting(false);
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        gym_id: gym.id,
        member_id: memberId,
        plan_name: planName,
        price: price,
        start_date: startDate,
        end_date: endDate,
        payment_status: paymentStatus || 'UNPAID',
        status: status || 'ACTIVE',
      });

    if (insertError) {
      console.error(insertError);
      setError(`Failed to create subscription: ${insertError.message}`);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard/subscriptions');
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subscriptions" className="p-2 text-white/50 hover:text-white bg-black/40 rounded-sm border border-white/10 hover:border-white/30 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">New Subscription</h1>
          <p className="text-white/50 text-xs tracking-wide uppercase">ASSIGN PLAN TO ENTITY</p>
        </div>
      </div>

      <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md p-6">
        {error && (
          <div className="mb-6 p-4 rounded-sm bg-red-500/10 border border-red-500/30 flex gap-3 text-red-200 backdrop-blur-md">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <span className="text-xs uppercase tracking-widest font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Member *</label>
              <select 
                name="memberId" 
                required
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
              >
                <option value="">SELECT A MEMBER</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name} ({m.member_number})</option>
                ))}
              </select>
            </div>

            <Input 
              label="Plan Name *" 
              name="planName" 
              placeholder="e.g. Monthly Gold" 
              required 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="Price *" 
                name="price" 
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required 
              />
              
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Payment Status *</label>
                <select 
                  name="paymentStatus" 
                  required
                  defaultValue="PAID"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
                >
                  <option value="PAID">PAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="UNPAID">UNPAID</option>
                </select>
              </div>

              <Input 
                label="Start Date *" 
                name="startDate" 
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />

              <Input 
                label="End Date *" 
                name="endDate" 
                type="date"
                required
              />

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Subscription Status *</label>
                <select 
                  name="status" 
                  required
                  defaultValue="ACTIVE"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
            <Link href="/dashboard/subscriptions">
              <Button type="button" variant="outline">CANCEL</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'INITIALIZING...' : 'CREATE RECORD'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
