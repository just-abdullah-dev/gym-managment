'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewMemberPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const gender = formData.get('gender') as string;
    
    // In a real app we'd fetch the user's gym_id or get it from server actions,
    // assuming they own exactly one gym for now.
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      setError('You must be logged in to do this.');
      setIsSubmitting(false);
      return;
    }

    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.user.id)
      .limit(1)
      .single();

    if (gymError || !gym) {
      setError('Could not identify your gym. Please ensure gym is setup.');
      setIsSubmitting(false);
      return;
    }

    const memberNumber = `M-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error: insertError } = await supabase
      .from('members')
      .insert({
        gym_id: gym.id,
        member_number: memberNumber,
        full_name: fullName,
        phone: phone || null,
        gender: gender,
      });

    if (insertError) {
      console.error(insertError);
      setError(`Failed to create member: ${insertError.message}`);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard/members');
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members" className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-lg border shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Member</h1>
          <p className="text-gray-500 mt-1">Add a new participant to the gym system.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3 text-red-800 text-sm">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input 
              label="Full Name" 
              name="fullName" 
              placeholder="e.g. John Doe" 
              required 
            />
            <Input 
              label="Phone Number" 
              name="phone" 
              placeholder="e.g. +1 234 567 890" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select 
              name="gender" 
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/dashboard/members">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
