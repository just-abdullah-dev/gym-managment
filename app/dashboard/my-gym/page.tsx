'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Save, Building2, CheckCircle, Clock, Trash2, Plus } from 'lucide-react';

export default function MyGymPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'SCHEDULE'>('DETAILS');

  const [gymId, setGymId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Schedule State
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: '1',
    gender: 'MIXED',
    start_time: '06:00',
    end_time: '22:00',
    is_active: true
  });

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchGym = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        const { data: gym } = await supabase
          .from('gyms')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (gym) {
          setGymId(gym.id);
          setName(gym.name);
          setPhone(gym.phone || '');
          setAddress(gym.address || '');
          setExistingLogoUrl(gym.logo_url || null);
          
          // Fetch schedules
          fetchSchedules(gym.id);
        }
      }
      setIsLoading(false);
    };

    fetchGym();
  }, [supabase]);

  const fetchSchedules = async (gId: string) => {
    setScheduleLoading(true);
    const { data, error: fetchErr } = await supabase
      .from('gym_schedules')
      .select('*')
      .eq('gym_id', gId)
      .order('day_of_week', { ascending: true });
      
    if (data) setSchedules(data);
    setScheduleLoading(false);
  };

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const logoFile = formData.get('logoFile') as File | null;
    
    let updatedLogoUrl = existingLogoUrl;

    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `gym-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, logoFile);

      if (uploadError) {
        setError(`Failed to upload logo: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
        
      updatedLogoUrl = publicUrl;
    }

    if (gymId) {
      const { error: updateError } = await supabase
        .from('gyms')
        .update({
          name,
          phone: phone || null,
          address: address || null,
          logo_url: updatedLogoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', gymId);

      if (updateError) {
        setError(`Failed to update gym: ${updateError.message}`);
      } else {
        setSuccessMessage('Gym details updated successfully!');
        setExistingLogoUrl(updatedLogoUrl);
      }
    } else {
      const { data: newGym, error: insertError } = await supabase
        .from('gyms')
        .insert({
          owner_id: userId,
          name,
          phone: phone || null,
          address: address || null,
          logo_url: updatedLogoUrl,
        })
        .select('id')
        .single();

      if (insertError || !newGym) {
        setError(`Failed to set up gym: ${insertError?.message}`);
      } else {
        setSuccessMessage('Gym set up successfully!');
        setGymId(newGym.id);
        setExistingLogoUrl(updatedLogoUrl);
      }
    }

    setIsSubmitting(false);
    router.refresh();
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    
    setError(null);
    setSuccessMessage(null);
    
    const { data, error: insertError } = await supabase
      .from('gym_schedules')
      .insert({
        gym_id: gymId,
        day_of_week: parseInt(newSchedule.day_of_week),
        gender: newSchedule.gender as "MALE" | "FEMALE" | "MIXED",
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        is_active: newSchedule.is_active
      })
      .select()
      .single();

    if (insertError) {
      setError(`Failed to add schedule: ${insertError.message}`);
    } else {
      setSuccessMessage('Schedule added successfully.');
      setSchedules([...schedules, data].sort((a, b) => a.day_of_week - b.day_of_week));
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    setError(null);
    setSuccessMessage(null);
    
    const { error: deleteError } = await supabase
      .from('gym_schedules')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(`Failed to delete schedule: ${deleteError.message}`);
    } else {
      setSuccessMessage('Schedule deleted.');
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-white/50 text-xs tracking-widest uppercase">LOADING FACILITY PARAMETERS...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-black/40 text-white/70 rounded-sm border border-white/10">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">
              {gymId ? 'Manage Entity' : 'Initialize Entity'}
            </h1>
            <p className="text-white/50 text-xs tracking-wide uppercase">
              {gymId ? 'UPDATE FACILITY PARAMETERS.' : 'PROVIDE SYSTEM DETAILS.'}
            </p>
          </div>
        </div>
      </div>

      {gymId && (
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`px-6 py-3 text-xs tracking-widest uppercase font-semibold transition-colors border-b-2 ${
              activeTab === 'DETAILS'
                ? 'border-white text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Facility Details
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-6 py-3 text-xs tracking-widest uppercase font-semibold transition-colors border-b-2 ${
              activeTab === 'SCHEDULE'
                ? 'border-white text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Operating Schedule
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-sm bg-red-500/10 border border-red-500/30 flex gap-3 text-red-200 backdrop-blur-md">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span className="text-xs uppercase tracking-widest font-semibold">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-sm bg-green-500/10 border border-green-500/30 flex gap-3 text-green-200 backdrop-blur-md">
          <CheckCircle className="shrink-0 mt-0.5" size={16} />
          <span className="text-xs uppercase tracking-widest font-semibold">{successMessage}</span>
        </div>
      )}

      {activeTab === 'DETAILS' ? (
        <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md p-6">
          <form onSubmit={handleDetailsSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0">
                <div className="w-32 h-32 rounded-sm border border-white/20 flex items-center justify-center bg-black/40 overflow-hidden">
                  {existingLogoUrl ? (
                    <img src={existingLogoUrl} alt="Gym Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={32} className="text-white/20" />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-2 w-full mt-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">Facility Logo</label>
                <input 
                  type="file"
                  name="logoFile"
                  accept="image/*"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 file:mr-4 file:py-1.5 file:px-4 file:rounded-none file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                />
                <p className="text-[10px] uppercase tracking-wider text-white/40">MAX SIZE: 2MB. RECOMMENDED 1:1 ASPECT RATIO.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div className="md:col-span-2">
                <Input 
                  label="Gym Name *" 
                  name="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.G. IRON FORGE FITNESS" 
                  required 
                />
              </div>
              
              <Input 
                label="Contact Phone" 
                name="phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="E.G. +1 234 567 890" 
              />
              
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Address</label>
                <textarea 
                  name="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="FULL ADDRESS OF THE FACILITY"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 placeholder-white/30 tracking-widest transition-colors"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save size={16} />
                {isSubmitting ? 'SAVING...' : (gymId ? 'UPDATE DETAILS' : 'INITIALIZE GYM')}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md p-6">
            <h2 className="text-sm font-light text-white tracking-widest uppercase mb-4">Add Operating Hours</h2>
            <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Day</label>
                <select
                  value={newSchedule.day_of_week}
                  onChange={(e) => setNewSchedule({...newSchedule, day_of_week: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Type</label>
                <select
                  value={newSchedule.gender}
                  onChange={(e) => setNewSchedule({...newSchedule, gender: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer"
                >
                  <option value="MIXED">MIXED</option>
                  <option value="MALE">MALE ONLY</option>
                  <option value="FEMALE">FEMALE ONLY</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-sm text-xs text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              <div className="h-full">
                <Button type="submit" className="w-full h-[42px] gap-2 border-white/10 text-white hover:bg-white/10">
                  <Plus size={14} /> ADD
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <Clock size={16} className="text-white/50" />
              <h2 className="text-sm font-light text-white tracking-widest uppercase">Current Schedule</h2>
            </div>
            
            {scheduleLoading ? (
              <div className="p-8 text-center text-white/50 text-xs tracking-widest uppercase">LOADING SCHEDULES...</div>
            ) : schedules.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-xs tracking-widest uppercase">NO SCHEDULES ADDED YET.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-white/5 text-white/50 text-[10px] uppercase tracking-widest border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 font-medium">Day</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Hours</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80 font-light text-sm">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 uppercase tracking-widest">{DAYS[schedule.day_of_week]}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-sm text-[9px] uppercase tracking-widest font-semibold border ${
                            schedule.gender === 'MIXED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            schedule.gender === 'MALE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-pink-500/10 text-pink-400 border-pink-500/20'
                          }`}>
                            {schedule.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 tracking-widest">
                          {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
