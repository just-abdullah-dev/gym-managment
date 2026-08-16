'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Calendar, UserCheck } from 'lucide-react';

export default function AttendancePage() {
  const supabase = createClient();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('Not authenticated');

      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single();
        
      if (gymError || !gymData) throw new Error('Gym not found');

      const { data, error: fetchError } = await supabase
        .from('attendance')
        .select(`
          *,
          members (
            full_name,
            member_number
          )
        `)
        .eq('gym_id', gymData.id)
        .eq('attendance_date', date)
        .order('check_in', { ascending: false });

      if (fetchError) throw fetchError;
      
      setAttendance(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load attendance');
    } finally {
      setIsLoading(false);
    }
  }, [date, supabase]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const changeDate = (days: number) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + days);
    setDate(currentDate.toISOString().split('T')[0]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const setToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Attendance</h1>
          <p className="text-white/50 text-xs tracking-wide uppercase">DAY-WISE CHECK IN RECORDS</p>
        </div>
        
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-sm p-1">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2 px-3 border-x border-white/10">
            <Calendar size={14} className="text-white/40" />
            <input 
              type="date" 
              value={date}
              onChange={handleDateChange}
              className="bg-transparent text-white text-sm font-light uppercase tracking-widest focus:outline-none appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          
          <button 
            onClick={() => changeDate(1)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
            disabled={date === new Date().toISOString().split('T')[0]}
          >
            <ChevronRight size={16} />
          </button>
          
          <div className="pl-1">
            <Button 
              variant="outline" 
              onClick={setToday}
              className="text-[9px] px-3 py-1.5 h-auto border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              disabled={date === new Date().toISOString().split('T')[0]}
            >
              TODAY
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 text-[10px] uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Check In</th>
                <th className="px-6 py-4 font-medium">Check Out</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80 font-light">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50 uppercase tracking-widest text-xs">
                    LOADING RECORDS...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-red-400 uppercase tracking-widest text-xs">
                    FAILED TO LOAD: {error}
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50 uppercase tracking-widest text-xs">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <UserCheck size={24} className="text-white/20" />
                      <p>NO ATTENDANCE RECORDS FOR THIS DATE.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendance.map((record) => {
                  let duration = '--';
                  if (record.check_in && record.check_out) {
                    const diffMs = new Date(record.check_out).getTime() - new Date(record.check_in).getTime();
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    duration = `${hours}h ${minutes}m`;
                  } else if (record.check_in) {
                    const diffMs = new Date().getTime() - new Date(record.check_in).getTime();
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    duration = `${hours}h ${minutes}m (Active)`;
                  }
                  
                  const isCheckedOut = !!record.check_out;

                  return (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{record.members?.full_name || 'Unknown'}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">{record.members?.member_number}</div>
                      </td>
                      <td className="px-6 py-4 font-medium tracking-wide text-white">
                        {formatTime(record.check_in)}
                      </td>
                      <td className="px-6 py-4 font-medium tracking-wide text-white/60">
                        {formatTime(record.check_out)}
                      </td>
                      <td className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/50">
                        {duration}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-semibold border ${
                          isCheckedOut 
                            ? 'bg-white/5 text-white/40 border-white/10' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                          {isCheckedOut ? 'COMPLETED' : 'IN FACILITY'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
