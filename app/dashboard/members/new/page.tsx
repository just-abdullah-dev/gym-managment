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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const gender = formData.get('gender') as 'MALE' | 'FEMALE';
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const joinDate = formData.get('joinDate') as string;
    const status = formData.get('status') as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    const notes = formData.get('notes') as string;
    const profileImageFile = formData.get('profileImageFile') as File | null;
    
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

    let profileImageUrl: string | null = null;

    if (profileImageFile && profileImageFile.size > 0) {
      const fileExt = profileImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, profileImageFile);

      if (uploadError) {
        setError(`Failed to upload image: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
        
      profileImageUrl = publicUrl;
    }

    const memberNumber = `M-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: newMember, error: insertError } = await supabase
      .from('members')
      .insert({
        gym_id: gym.id,
        member_number: memberNumber,
        full_name: fullName,
        phone: phone || null,
        gender: gender,
        date_of_birth: dateOfBirth || null,
        join_date: joinDate || new Date().toISOString().split('T')[0],
        status: status || 'ACTIVE',
        notes: notes || null,
        profile_image_url: profileImageUrl,
      })
      .select('id')
      .single();

    if (insertError || !newMember) {
      console.error(insertError);
      setError(`Failed to create member: ${insertError?.message || 'Unknown error'}`);
      setIsSubmitting(false);
    } else {
      router.push(`/dashboard/members/${newMember.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members" className="p-2 text-white/50 hover:text-white bg-black/40 rounded-sm border border-white/10 hover:border-white/30 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Register Entity</h1>
          <p className="text-white/50 text-xs tracking-wide uppercase">ADD NEW PARTICIPANT TO SYSTEM</p>
        </div>
      </div>

      <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md p-6">
        {error && (
          <div className="mb-6 p-4 rounded-sm bg-red-500/10 border border-red-500/30 flex gap-3 text-red-200 backdrop-blur-md">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <span className="text-xs uppercase tracking-widest font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-sm border border-white/20 flex items-center justify-center bg-black/40 overflow-hidden relative group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-white/30 text-[9px] uppercase tracking-widest text-center">No Image</div>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2 w-full mt-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Profile Image</label>
              <input 
                type="file"
                name="profileImageFile"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 file:mr-4 file:py-1.5 file:px-4 file:rounded-none file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
              />
              <p className="text-[10px] uppercase tracking-wider text-white/40">Leave blank to use default. Max size: 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <Input 
              label="Full Name *" 
              name="fullName" 
              placeholder="e.g. John Doe" 
              required 
            />
            <Input 
              label="Phone Number" 
              name="phone" 
              placeholder="e.g. +1 234 567 890" 
            />
            
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Gender *</label>
              <select 
                name="gender" 
                required
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
              >
                <option value="">SELECT GENDER</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>

            <Input 
              label="Date of Birth" 
              name="dateOfBirth" 
              type="date"
            />

            <Input 
              label="Join Date *" 
              name="joinDate" 
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Status *</label>
              <select 
                name="status" 
                required
                defaultValue="ACTIVE"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            


            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Notes</label>
              <textarea 
                name="notes" 
                rows={3}
                placeholder="EMERGENCY CONTACT INFO, MEDICAL NOTES, ETC."
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 placeholder-white/30 tracking-widest transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
            <Link href="/dashboard/members">
              <Button type="button" variant="outline">CANCEL</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'REGISTERING...' : 'INITIALIZE RECORD'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
