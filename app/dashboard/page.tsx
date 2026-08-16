'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { processQRScan, CheckInResult } from './actions';
import { CheckCircle2, XCircle, Loader2, UserCheck, Users, AlertTriangle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();
  
  const [metrics, setMetrics] = useState({
    checkedInToday: 0,
    activeMembers: 0,
    violations: 0
  });
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const { data: gymData } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single();
        
      if (!gymData) return;
      
      const today = new Date().toISOString().split('T')[0];

      // 1. Fetch checked in today
      const { count: checkedInCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymData.id)
        .eq('attendance_date', today);
        
      // 2. Fetch active members
      const { count: activeCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymData.id)
        .eq('status', 'ACTIVE');
        
      // 3. Fetch unresolved violations
      const { count: violationCount } = await supabase
        .from('violations')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymData.id)
        .eq('fine_status', 'UNPAID');
        
      setMetrics({
        checkedInToday: checkedInCount || 0,
        activeMembers: activeCount || 0,
        violations: violationCount || 0
      });
      
      // 4. Fetch recent check-ins
      const { data: recent } = await supabase
        .from('attendance')
        .select(`
          id,
          check_in,
          members (
            full_name,
            member_number
          )
        `)
        .eq('gym_id', gymData.id)
        .eq('attendance_date', today)
        .order('check_in', { ascending: false })
        .limit(5);
        
      if (recent) setRecentCheckIns(recent);
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await processQRScan(decodedText.trim());
      setResult(res);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: 'An unexpected error occurred during processing.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Check In</h1>
        <p className="text-white/50 text-xs tracking-wide">FACILITY ACCESS CONTROL & OVERVIEW</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Check-in Module */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-light text-white/80 tracking-widest uppercase mb-2">Scanner Interface</h2>
            
            <QRScanner onScanSuccess={handleScanSuccess} />

            {/* Result Display */}
            {isProcessing && (
              <div className="p-4 rounded-sm border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center gap-3 text-white/70">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-xs uppercase tracking-widest">Processing...</span>
              </div>
            )}

            {!isProcessing && result && (
              <div className={`p-4 rounded-sm border flex items-start gap-3 backdrop-blur-md ${
                result.success 
                  ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
                ) : (
                  <XCircle className="shrink-0 mt-0.5" size={20} />
                )}
                
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest font-semibold mb-1">
                    {result.success ? 'Access Granted' : 'Access Denied'}
                  </span>
                  <span className="text-xs opacity-80 font-light">{result.message}</span>
                  {result.member && (
                    <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded-sm text-xs space-y-2 font-light">
                      <p><span className="font-medium text-white/60 uppercase tracking-widest text-[9px] mr-2">Entity:</span> {result.member.full_name}</p>
                      <p><span className="font-medium text-white/60 uppercase tracking-widest text-[9px] mr-2">ID Code:</span> {result.member.member_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-light text-white/80 tracking-widest uppercase mb-2">Recent Access (Today)</h2>
            <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md overflow-hidden">
              {recentCheckIns.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs tracking-widest uppercase">No check-ins yet today.</div>
              ) : (
                <table className="w-full text-left whitespace-nowrap">
                  <tbody className="divide-y divide-white/5 text-white/80 font-light text-sm">
                    {recentCheckIns.map((record) => (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{record.members?.full_name}</div>
                          <div className="text-[10px] uppercase tracking-widest text-white/40">{record.members?.member_number}</div>
                        </td>
                        <td className="px-6 py-4 font-medium tracking-wide text-white text-right">
                          {formatTime(record.check_in)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metrics */}
        <div className="space-y-4">
          <h2 className="text-xs font-light text-white/80 tracking-widest uppercase mb-2">Live Metrics</h2>
          
          <div className="bg-black/20 p-5 rounded-sm border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium">Checked In Today</span>
              <span className="text-3xl font-light text-white tracking-widest">{metrics.checkedInToday}</span>
            </div>
            <UserCheck size={32} className="text-white/20" />
          </div>

          <div className="bg-black/20 p-5 rounded-sm border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium">Active Members</span>
              <span className="text-3xl font-light text-white tracking-widest">{metrics.activeMembers}</span>
            </div>
            <Users size={32} className="text-white/20" />
          </div>
          
          <div className="bg-black/20 p-5 rounded-sm border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium">Pending Violations</span>
              <span className="text-3xl font-light text-white tracking-widest">{metrics.violations}</span>
            </div>
            <AlertTriangle size={32} className="text-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
